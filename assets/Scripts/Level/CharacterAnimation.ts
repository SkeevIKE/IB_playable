import { _decorator, Animation, Component, Eventify } from 'cc';
import { Audio } from '../Audio/Audio';
import { AnimationController } from '../Helpers/AnimationController';

const { ccclass, property } = _decorator;

export enum AnimationState {
    NONE = 'None',
    IDLE = 'Idle',
    RUN = 'Run',
    ATTACK = 'Attack'
}

@ccclass('CharacterAnimation')
export class CharacterAnimation extends Eventify(Component) {
    public readonly ATTACK_ANIMATION_EVENT: string = 'attackEvent';
    public readonly STEP_ANIMATION_EVENT: string = 'stepEvent';

    private readonly MIN_ANIMATION_SPEED: number = 0.01;
    private readonly SPEED_MAGNITUDE_MULTIPLIER: number = 0.01;
    private readonly MAX_ANIMATION_SPEED: number = 1.0;
    private readonly ATTACK_ANIMATION_SPEED: number = 3.0;
    private readonly ANIMATION_TRANSITION_DURATION: number = 0.2;

    @property(Animation)
    private animation: Animation | null = null;

    private animationController: AnimationController;
    private currentAnimationState: AnimationState = AnimationState.NONE;

    protected start() {       
        if (!this.animation) {
            console.error('No animation assigned to Player');
        }

        this.animationController = new AnimationController(this.animation);
    }


    public startMoving(speed: number): void {       
        speed = Math.min(
            this.MIN_ANIMATION_SPEED + speed * this.SPEED_MAGNITUDE_MULTIPLIER,
            this.MAX_ANIMATION_SPEED
        )       
        this.animationController.setAnimationSpeed(speed);

        this.changeState(AnimationState.RUN);
    }

    public stopMoving(): void {
        this.animationController.setAnimationSpeed(this.MAX_ANIMATION_SPEED);
        this.changeState(AnimationState.IDLE);
    }

    public startAttack(): void {
        this.animationController.setAnimationSpeed(this.ATTACK_ANIMATION_SPEED);
        this.changeState(AnimationState.ATTACK);
    }

    // called via Animation Event
    public attackEvent(): void {
        this.emit(this.ATTACK_ANIMATION_EVENT);
    }

    // called via Animation Event on Run animation
    public stepEvent(): void {
        Audio.instance.playSoundOneShot('steps');
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
