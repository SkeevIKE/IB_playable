import { _decorator, Component, Sprite, SpriteFrame, tween, Vec3 } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { Cameras } from '../Level/Cameras';
import { Resources } from '../Level/Resources';
import { WeaponTier } from '../Level/Weapon';
const { ccclass, property } = _decorator;

@ccclass('IconResource')
export class IconResource extends Component {			
    @property(SpriteFrame)
    private woodIconAsset: SpriteFrame = null;
    @property(SpriteFrame)
    private ironIconAsset: SpriteFrame = null;
    @property(Sprite)
    private iconSprite: Sprite = null;
	@property
	private flyDelay: number = 0.1;
	@property
	private distanceFromCamera: number = 5;
	@property
	private floorY: number = 0;
	@property
	private spillRadius: number = 1.2;
	@property
	private spillUpHeight: number = 1.2;

    private returneFunction: Function;

    public set setReturnFunction(func: Function) {
        this.returneFunction = func;
    }	

	public show(count: number, start: Vec3, tier: WeaponTier): void {       
        this.node.active = true;
		this.node.setWorldPosition(start);
		this.node.setScale(0, 0, 0);

        const mainCamera = ServiceAllocator.get(Cameras)?.getMainCamera;
        const uiCamera = ServiceAllocator.get(Cameras)?.getUICamera;
		const targetUi = this.getTargetByTier(tier);
		const screenPos = new Vec3();
		uiCamera.worldToScreen(targetUi, screenPos);
		const ray = mainCamera.screenPointToRay(screenPos.x, screenPos.y);
		const targetWorld = new Vec3();
		Vec3.scaleAndAdd(targetWorld, ray.o, ray.d, this.distanceFromCamera);

		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * this.spillRadius;
		const offsetX = Math.cos(angle) * radius;
		const offsetZ = Math.sin(angle) * radius;
		const impact = new Vec3(start.x + offsetX, this.floorY, start.z + offsetZ);
		const dropControl = new Vec3(start.x + offsetX * 0.5, start.y + this.spillUpHeight, start.z + offsetZ * 0.5);

		const t1 = { t: 0 };
		const t2 = { t: 0 };

		tween(this.node).to(0.15, { scale: new Vec3(1, 1, 1) }).start();

		tween(t1)
			.to(0.35, { t: 1 }, {
				onUpdate: () => {
					const p = this.quadraticBezier(start, dropControl, impact, t1.t);
					this.node.setWorldPosition(p);
				}
			})
			.call(() => {
				tween(t2)
					.delay(this.flyDelay)
					.to(0.5, { t: 1 }, {
						onUpdate: () => {
							const p = new Vec3();
							Vec3.lerp(p, impact, targetWorld, t2.t);
							this.node.setWorldPosition(p);
						}
						})
						.call(() => {
							const res = ServiceAllocator.get(Resources);
							if (tier === WeaponTier.Basic) {
								res.addWood(count);
							} else {
								res.addIron(count);
							}
							this.returneFunction?.();
						})
						.start();
			})
			.start();
	}

	private quadraticBezier(p0: Vec3, c: Vec3, p1: Vec3, t: number): Vec3 {
		const u = 1 - t;
		const x = u * u * p0.x + 2 * u * t * c.x + t * t * p1.x;
		const y = u * u * p0.y + 2 * u * t * c.y + t * t * p1.y;
		const z = u * u * p0.z + 2 * u * t * c.z + t * t * p1.z;
		return new Vec3(x, y, z);
	}

	private getTargetByTier(tier: WeaponTier): Vec3 {
		const res = ServiceAllocator.get(Resources);
		if (tier === WeaponTier.Basic) {
            this.iconSprite.spriteFrame = this.woodIconAsset;
			return res.getWoodPosition();
		}
        this.iconSprite.spriteFrame = this.ironIconAsset;
		return res.getIronPosition();
	}
}


