import { _decorator, Collider, Color, Component, EventTouch, Input, input, Node, PhysicsSystem, Sprite, Tween, tween, Vec3, view } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { Cameras } from '../Level/Cameras';
import { Resources } from '../Level/Resources';
import { WeaponTier } from '../Level/Weapon';
const { ccclass, property } = _decorator;

@ccclass('UpgradePanel')
export class UpgradePanel extends Component {
    @property(Node)
    private panelNode: Node = null;
    @property(Node)
    private needNode: Node = null;
    @property(Sprite)
    private upgradeIcon: Sprite = null;
    @property(Collider)
    private collider: Collider = null;
    @property({ type: WeaponTier })
    private tierRequired: WeaponTier = WeaponTier.Basic;
    @property
    private needCount: number = 100;

    private physicsWorld = PhysicsSystem.instance;


    public show(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public hide(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    }

    public onTouchStart(event: EventTouch) {
        let scaleX = view.getScaleX()
        let scaleY = view.getScaleY()
        const camera = ServiceAllocator.get(Cameras)?.getMainCamera;
        const position = event.getUILocation();
        const ray = camera.screenPointToRay(position.x * scaleX, position.y * scaleY);

        const hit = this.physicsWorld.raycast(ray);
        if (hit) {
            const results = this.physicsWorld.raycastResults;
            for (const result of results) {
                const collider = result.collider;
                if (collider) {
                    if (collider === this.collider) {
                        this.onUpgradeButtonClicked();
                        break;
                    }
                }
            }
        }
    }

    private onUpgradeButtonClicked(): void {
        const resources = ServiceAllocator.get(Resources);
        if (!resources) {
            console.warn('Resources service not found');
            return;
        }

        switch (this.tierRequired) {
            case WeaponTier.Standard:
                const isWoodEnough = resources.getWood() >= this.needCount;
                if (isWoodEnough) {
                    resources.removeWood(this.needCount);
                    this.flashIconGreen();
                } else {
                    this.flashIconRed();
                }
                break;
            case WeaponTier.Elite:
                const isIronEnough = resources.getIron() >= this.needCount;
                if (isIronEnough) {
                    resources.removeIron(this.needCount);
                    this.flashIconGreen();
                } else {
                    this.flashIconRed();
                }
        }
    }

    private flashIconRed(): void {
        this.flashIcon(Color.RED);
        this.shakeNeedNode();
    }

    private flashIconGreen(): void {
        this.flashIcon(Color.GREEN);
    }

    private flashIcon(color: Color): void {
        if (!this.upgradeIcon) {
            return;
        }

        const sprite = this.upgradeIcon;
        const node = this.panelNode;
        const originalColor = sprite.color.clone();
        const originalScale = node.scale.clone();
        const targetScale = new Vec3(originalScale.x * 1.12, originalScale.y * 1.12, originalScale.z);

        Tween.stopAllByTarget(node);
        sprite.color = color;

        tween(node)
            .to(0.08, { scale: targetScale })
            .to(0.08, { scale: originalScale })
            .call(() => {
                sprite.color = originalColor;
            })
            .start();
    }

    private shakeNeedNode(): void {
        if (!this.needNode) {
            return;
        }

        const node = this.needNode;
        const originalRotation = node.eulerAngles.z;
        const originalScale = node.scale.clone();
        const targetScale = new Vec3(originalScale.x * 1.12, originalScale.y * 1.12, originalScale.z);

        Tween.stopAllByTarget(node);

        tween(node)
            .to(0.08, { scale: targetScale })
            .to(0.04, { eulerAngles: new Vec3(0, 0, originalRotation + 10) })
            .to(0.04, { eulerAngles: new Vec3(0, 0, originalRotation - 10) })
            .to(0.04, { eulerAngles: new Vec3(0, 0, originalRotation + 7) })
            .to(0.04, { eulerAngles: new Vec3(0, 0, originalRotation) })
            .to(0.08, { scale: originalScale })
            .start();
    }
}


