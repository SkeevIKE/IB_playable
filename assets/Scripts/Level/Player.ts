import { _decorator, Component, CylinderCollider, ICollisionEvent, physics, RigidBody, Vec2 } from 'cc';
import { isUIElement } from '../Interfaces/IUIElement';
import { CharacterAnimation } from './CharacterAnimation';
import { CraftBench } from './CraftBench';
import { Loadout } from './Loadout';
import { Movement } from './Movement';
import { Targets } from './TargetManager';
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
    @property(CylinderCollider)
    private triggerCollider: CylinderCollider = null;
    @property
    private speed: number = 10.0;
    @property
    private rotationSpeed: number = 10.0;

    private movement: Movement = null;
    private targets: Targets = null;

    private lastOffset: Vec2 = null;
    private isMoving: boolean = false;
    private isAttacking: boolean = false;

    protected start(): void {
        if (this.triggerCollider) {
            this.triggerCollider.on('onTriggerEnter', this.onTriggerEnter, this);
            this.triggerCollider.on('onTriggerExit', this.onTriggerExit, this);
        } else {
            console.error('No trigger collider found on Player');
        }

        this.movement = new Movement(this.rigidBody, this.speed, this.rotationSpeed);
        this.targets = new Targets();
        this.setWeapon(WeaponTier.Basic);
    }

    protected onDestroy(): void {
        if (this.triggerCollider) {
            this.triggerCollider.off('onTriggerEnter', this.onTriggerEnter, this);
            this.triggerCollider.off('onTriggerExit', this.onTriggerExit, this);
        }

        this.unschedule(this.attackTarget);
    }

    protected update(dt: number): void {
        if (this.isMoving) {
            this.movement.moveForward(this.lastOffset);
            this.movement.rotate(this.lastOffset);
            return;
        }

        if (this.isAttacking) {
            if (!this.isTargetValid() || this.getTargetsInRange().length === 0) {
                this.stopAttacking();
                return;
            }
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

        const craftBench = otherCollider.node.getComponent(CraftBench);
        if (craftBench && isUIElement(craftBench)) {
            craftBench.showUI();
            return;
        }

        this.targets.addFromNode(otherCollider.node);

        // if (!this.isMoving) {
        //     this.startAttacking();
        // }
    }

    private onTriggerExit(event: ICollisionEvent): void {
        const otherCollider = event.otherCollider as physics.Collider;
        if (!otherCollider)
            return;

        const craftBench = otherCollider.node.getComponent(CraftBench);
        if (craftBench && isUIElement(craftBench)) {
            craftBench.hideUI();
            return;
        }

        this.targets.removeFromNode(otherCollider.node);
        // if (!this.targets.hasValidTargets()) {
        //     this.stopAttacking();
        // }
    }

    private startAttacking(): void {
        if (!this.isTargetValid() || this.isAttacking) {
            return;
        }
        if (this.getTargetsInRange().length === 0) return;

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
        if (!this.loadout || !this.isTargetValid()) {
            this.stopAttacking();
            return;
        }
        const targets = this.getTargetsInRange();
        if (targets.length === 0) {
            this.stopAttacking();
            return;
        }
        for (const target of targets) {
            this.loadout.attack(target);
        }
        if (!this.isTargetValid()) {
            this.stopAttacking();
        }
    }

    private isTargetValid(): boolean {
        return this.targets?.hasValidTargets() ?? false;
    }

    private getTargetsInRange() {
        const radius = this.triggerCollider ? this.triggerCollider.radius : 0;
        return this.targets.getTargetsInFrontArc(this.node.worldPosition, this.node.forward, radius);
    }
}