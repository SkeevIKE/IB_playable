import { _decorator, CapsuleCollider, Component, ICollisionEvent, isValid, physics, RigidBody, Vec2 } from 'cc';
import { CharacterAnimation } from './CharacterAnimation';
import { IDamageable, isDamageable } from './Interfaces/IDamageable';
import { Loadout } from './Loadout';
import { Movement } from './Movement';
import { WeaponTier } from './Weapon';


const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(RigidBody)
    private rigidBody: RigidBody | null = null;
    @property(CharacterAnimation)
    private characterAnimation: CharacterAnimation = null;
    @property(Loadout)
    public loadout: Loadout | null = null;
    @property
    private speed: number = 10.0;
    @property
    private rotationSpeed: number = 10.0;

    private movement: Movement = null;
    private capsuleCollider: CapsuleCollider = null;
    private target: (Component & IDamageable) | null = null;

    private lastOffset: Vec2 = null;
    private isMoving: boolean = false;
    private isAttacking: boolean = false;

    protected start(): void {
        this.capsuleCollider = this.getComponent(CapsuleCollider);
        if (this.capsuleCollider) {
            this.capsuleCollider.on('onTriggerEnter', this.onTriggerEnter, this);
            this.capsuleCollider.on('onTriggerExit', this.onTriggerExit, this);
        } else {
            console.error('No CapsuleCollider found on Player');
        }

        this.movement = new Movement(this.rigidBody, this.speed, this.rotationSpeed);
        this.setWeapon(WeaponTier.Basic);
    }

    protected onDestroy(): void {
        if (this.capsuleCollider) {
            this.capsuleCollider.off('onTriggerEnter', this.onTriggerEnter, this);
            this.capsuleCollider.off('onTriggerExit', this.onTriggerExit, this);
        }

        this.unschedule(this.attackTarget);
    }

    protected update(dt: number): void {
        if (this.isMoving) {
            this.movement.moveForward(this.lastOffset);
            this.movement.rotate(this.lastOffset);
            return;
        }

        if (this.isAttacking && this.isTargetValid()) {
            this.movement.rotateTowards(this.target.node.worldPosition, dt);
        }
    }

    public move(touchOffset: Vec2, cameraAngle: number = 0): void {
        if (!this.lastOffset) {
            this.lastOffset = new Vec2();
        }

        this.lastOffset.set(touchOffset);
        this.movement.setCameraAngle(cameraAngle);
        this.isMoving = true;
        this.stopAttacking();
        this.characterAnimation.startMoving(touchOffset.length());
    }

    public stopMoving(): void {
        if (!this.lastOffset) {
            this.lastOffset = new Vec2();
        }

        this.lastOffset.set(0, 0);
        this.isMoving = false;
        this.characterAnimation.stopMoving();
        this.startAttacking();
    }

    public setWeapon(weaponTier: WeaponTier): void {
        this.loadout?.equipWeapon(weaponTier);
    }

    private onTriggerEnter(event: ICollisionEvent): void {
        const otherCollider = event.otherCollider as physics.Collider;
        if (!otherCollider)
            return;

        const damageables = otherCollider.node.getComponents(Component).filter(isDamageable);
        for (const damageable of damageables) {
            this.target = damageable;
        }

        if (!this.isMoving) {
            this.startAttacking();
        }
    }

    private onTriggerExit(event: ICollisionEvent): void {
        const otherCollider = event.otherCollider as physics.Collider;
        if (!otherCollider)
            return;

        const interactables = otherCollider.node.getComponents(Component).filter(isDamageable);
        for (const interactable of interactables) {
            if (interactable === this.target) {
                this.target = null;
                this.stopAttacking();
            }
        }
    }

    private startAttacking(): void {
        if (!this.isTargetValid() || this.isAttacking) {
            return;
        }

        this.characterAnimation.startAttack();
        this.characterAnimation.on(this.characterAnimation.ATTACK_ANIMATION_EVENT, this.attackTarget);
        this.isAttacking = true;
    }

    private stopAttacking(): void {
        if (!this.isAttacking) {
            return;
        }

        this.characterAnimation.off(this.characterAnimation.ATTACK_ANIMATION_EVENT, this.attackTarget);
        this.characterAnimation.stopMoving();
        this.isAttacking = false;
    }

    private attackTarget = (): void => {
        if (this.isTargetValid() && this.loadout) {
            this.loadout.attack(this.target);
            if (!this.isTargetValid()) {
                this.stopAttacking();
            }
        } else {
            this.target = null;
            this.stopAttacking();
        }
    }

    private isTargetValid(): boolean {
        return this.target !== null && isValid(this.target) && isValid(this.target.node) && this.target.isActive();
    }
}