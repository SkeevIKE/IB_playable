import { Animation, Node, Vec3 } from 'cc';
import { AnimationController } from './Helpers/AnimationController';

export enum AnimationState {
    NONE = 'None',
    IDLE = 'Idle',
    RUN = 'Run',
    IDLE_CARRY = 'IdleCarry',
    RUN_CARRY = 'RunCarry',
    SLEEP = 'Sleep'
}

export class CharacterAnimation {
    private readonly MIN_ANIMATION_SPEED: number = 0.01;
    private readonly SPEED_MAGNITUDE_MULTIPLIER: number = 0.01;
    private readonly MAX_ANIMATION_SPEED: number = 1.0;
    private readonly ANIMATION_TRANSITION_DURATION: number = 0.2;

    private animationController: AnimationController;
    private currentAnimationState: AnimationState = AnimationState.NONE;
    private characterNode: Node;
    private startPosition: Vec3;

    constructor(animation: Animation) {
        this.animationController = new AnimationController(animation);
        this.characterNode = animation.node;
        this.startPosition = this.characterNode.getPosition();
    }

    public startMoving(speed: number): void {
        speed = Math.min(
            this.MIN_ANIMATION_SPEED + speed * this.SPEED_MAGNITUDE_MULTIPLIER,
            this.MAX_ANIMATION_SPEED
        )
        this.animationController.setAnimationSpeed(speed);

        this.changeState(AnimationState.RUN);
        this.characterNode.setPosition(0, 0, 0);
    }

    public stopMoving(): void {
        this.animationController.setAnimationSpeed(this.MAX_ANIMATION_SPEED);
        this.changeState(AnimationState.IDLE);
    }

    public startCarrying(speed: number): void {
        speed = Math.min(
            this.MIN_ANIMATION_SPEED + speed * this.SPEED_MAGNITUDE_MULTIPLIER,
            this.MAX_ANIMATION_SPEED
        )
        this.animationController.setAnimationSpeed(speed);

        this.changeState(AnimationState.RUN_CARRY);
    }

    public stopCarrying(): void {
        this.changeState(AnimationState.IDLE_CARRY);       
    }

    public startSleeping(): void {
        this.animationController.setAnimationSpeed(this.MAX_ANIMATION_SPEED);
        this.changeState(AnimationState.SLEEP);
        this.characterNode.setPosition(0, 1, 0);
    }

    private changeState(newState: AnimationState): void {
        if (this.currentAnimationState !== newState) {
            this.currentAnimationState = newState;           
            this.animationController.playAnimation(
                this.currentAnimationState,
                true,
                this.ANIMATION_TRANSITION_DURATION
            );
        }
    }
}
