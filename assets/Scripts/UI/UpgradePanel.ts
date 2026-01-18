import { _decorator, Collider, Color, Component, Eventify, EventTouch, Input, input, Label, Node, PhysicsSystem, Sprite, Tween, tween, UIOpacity, Vec3, view } from 'cc';
import { Audio } from '../Audio/Audio';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { UIAnimationHelper } from '../Helpers/UIAnimationHelper';
import { Cameras } from '../Level/Cameras';
import { Resources } from '../Level/Resources';
import { WeaponTier } from '../Level/Weapon';
const { ccclass, property } = _decorator;

@ccclass('UpgradePanel')
export class UpgradePanel extends Eventify(Component) {
    public readonly UPGRADE_CLICKED = 'upgrade-clicked';

    @property(Node)
    private panelNode: Node = null;
    @property(Node)
    private needNode: Node = null;
    @property(Sprite)
    private upgradeIcon: Sprite = null;
    @property(Label)
    private needText: Label = null;
    @property(Collider)
    private collider: Collider = null;
    @property({ type: WeaponTier })
    private tierRequired: WeaponTier = WeaponTier.Basic;
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;
    @property
    private needCount: number = 100;
    @property
    private fadeDuration: number = 0.15;

    private physicsWorld = PhysicsSystem.instance;
    private panelNodeInitialScale: Vec3 = null;
    private needNodeInitialScale: Vec3 = null;
    private needNodeInitialRotation: number = 0;
    private upgradeIconInitialColor: Color = null;

    public get neededCount(): number {
        return this.needCount;
    }

    public show(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        if (this.collider) {
            this.collider.enabled = true;
        }
        UIAnimationHelper.showUI(this.uiOpacity, this.fadeDuration);
    }

    public hide(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        if (this.collider) {
            this.collider.enabled = false;
        }
        UIAnimationHelper.hideUI(this.uiOpacity, this.fadeDuration);
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

    protected start(): void {
        if (this.uiOpacity) {
            this.uiOpacity.opacity = 0;
            this.uiOpacity.node.setScale(Vec3.ZERO);
        }

        if (this.panelNode) {
            this.panelNodeInitialScale = this.panelNode.scale.clone();
        }

        if (this.needNode) {
            this.needNodeInitialScale = this.needNode.scale.clone();
            this.needNodeInitialRotation = this.needNode.eulerAngles.z;
        }

        if (this.upgradeIcon) {
            this.upgradeIconInitialColor = this.upgradeIcon.color.clone();
        }

        if (this.needText) {
            this.needText.string = this.needCount.toString();
        }
    }

    private onUpgradeButtonClicked(): void {
        const resources = ServiceAllocator.get(Resources);
        if (!resources) {
            console.warn('Resources service not found');
            return;
        }

        let success = false;
        switch (this.tierRequired) {
            case WeaponTier.Standard:
                success = resources.removeWood(this.needCount);
                break;
            case WeaponTier.Elite:
                success = resources.removeIron(this.needCount);
                break;
        }

        if (success) {
            this.flashIconGreen();
            this.emit(this.UPGRADE_CLICKED);
        } else {
            this.flashIconRed();
        }
    }

    private flashIconRed(): void {
        this.flashIcon(Color.RED);
        this.shakeNeedNode();
        Audio.instance.playSound('wrong');
    }

    private flashIconGreen(): void {
        this.flashIcon(Color.GREEN);
        Audio.instance.playSound('upgrade');
    }

    private flashIcon(color: Color): void {
        if (!this.upgradeIcon) {
            return;
        }

        const sprite = this.upgradeIcon;
        const node = this.panelNode;
        const originalColor = this.upgradeIconInitialColor || sprite.color.clone();
        const originalScale = this.panelNodeInitialScale || node.scale.clone();
        const targetScale = new Vec3(originalScale.x * 1.12, originalScale.y * 1.12, originalScale.z);

        Tween.stopAllByTarget(node);
        node.setScale(originalScale);
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
        const originalRotation = this.needNodeInitialRotation;
        const originalScale = this.needNodeInitialScale || node.scale.clone();
        const targetScale = new Vec3(originalScale.x * 1.12, originalScale.y * 1.12, originalScale.z);

        Tween.stopAllByTarget(node);
        node.setScale(originalScale);
        node.setRotationFromEuler(0, 0, originalRotation);

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


