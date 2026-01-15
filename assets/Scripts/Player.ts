import { _decorator, Animation, CapsuleCollider, Component, ICollisionEvent, physics, RigidBody, Vec2 } from 'cc';
import { CharacterAnimation } from './CharacterAnimation';
import { isInteractable } from './Interfaces/IInteractable';
import { Movement } from './Movement';


const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property
    private speed: number = 10.0;
    @property
    private rotationSpeed: number = 10.0;
    @property(RigidBody)
    private rigidBody: RigidBody = null;
    @property(Animation)
    private animation: Animation = null;

    private movement: Movement = null;
    private capsuleCollider: CapsuleCollider = null;
    private characterAnimation: CharacterAnimation = null;

    private lastOffset: Vec2 = null;
    private isMoving: boolean = false;

    protected start(): void {
        this.capsuleCollider = this.getComponent(CapsuleCollider);
        if (this.capsuleCollider) {
            this.capsuleCollider.on('onTriggerEnter', this.onTriggerEnter, this);
            this.capsuleCollider.on('onTriggerExit', this.onTriggerExit, this);
        } else {
            console.error('No CapsuleCollider found on Player');
        }

        if (!this.animation) {
            console.error('No animation assigned to Player');
        }

        this.movement = new Movement(this.rigidBody, this.speed, this.rotationSpeed);
        this.characterAnimation = new CharacterAnimation(this.animation);
    }

    protected onDestroy(): void {
        if (this.capsuleCollider) {
            this.capsuleCollider.off('onTriggerEnter', this.onTriggerEnter, this);
            this.capsuleCollider.off('onTriggerExit', this.onTriggerExit, this);
        }
    }

    protected update(): void {
        if (!this.isMoving) {
            return;
        }

        this.movement.moveForward(this.lastOffset);
        this.movement.rotate(this.lastOffset);
    }

    public move(touchOffset: Vec2, cameraAngle: number = 0): void {
        if (!this.lastOffset) {
            this.lastOffset = new Vec2();
        }

        this.lastOffset.set(touchOffset);
        this.movement.setCameraAngle(cameraAngle);
        this.isMoving = true;
        this.characterAnimation.startMoving(touchOffset.length());
    }

    public stopMoving(): void {
        this.lastOffset.set(0, 0);
        this.isMoving = false;
        this.characterAnimation.stopMoving();
    }

    private onTriggerEnter(event: ICollisionEvent): void {
        const otherCollider = event.otherCollider as physics.Collider;
        if (!otherCollider)
            return;

        const interactables = otherCollider.node.getComponents(Component).filter(isInteractable);
        for (const interactable of interactables) {
            interactable.onPlayerEnter(this);
        }
    }

    private onTriggerExit(event: ICollisionEvent): void {
        const otherCollider = event.otherCollider as physics.Collider;
        if (!otherCollider)
            return;

        const interactables = otherCollider.node.getComponents(Component).filter(isInteractable);
        for (const interactable of interactables) {
            interactable.onPlayerExit(this);
        }
    }
}


