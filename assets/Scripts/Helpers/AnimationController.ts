import { Animation, AnimationClip } from 'cc';

export class AnimationController {
    private animationComponent: Animation;
    private previousAnimationName: string = '';
    private eventListeners: Function[] = [];

    constructor(animationComponent: Animation) {
        this.animationComponent = animationComponent;
    }

    public playAnimation(
        animationName: string,
        loop: boolean = false,
        mixDuration?: number,
        onEvent?: (eventType: string) => void,
        onComplete?: () => void
    ) {
        if (!this.animationComponent)
            return;

        if (mixDuration !== undefined && this.previousAnimationName) {
            this.animationComponent.crossFade(animationName, mixDuration);
        } else {
            this.animationComponent.play(animationName);
        }

        this.clearEventListeners();

        const state = this.animationComponent.getState(animationName);
        if (state) {
            state.wrapMode = loop ? AnimationClip.WrapMode.Loop : AnimationClip.WrapMode.Normal;

            if (onEvent) {
                const eventListener = (type: string) => {
                    onEvent(type);
                };
                this.animationComponent.on(Animation.EventType.LASTFRAME, eventListener);
                this.eventListeners.push(() => this.animationComponent.off(Animation.EventType.LASTFRAME, eventListener));
            }

            if (onComplete && !loop) {
                const completeListener = () => {
                    onComplete();
                };
                this.animationComponent.on(Animation.EventType.FINISHED, completeListener);
                this.eventListeners.push(() => this.animationComponent.off(Animation.EventType.FINISHED, completeListener));
            }
        }

        this.previousAnimationName = animationName;
    }

    private clearEventListeners() {
        this.eventListeners.forEach(off => off());
        this.eventListeners = [];
    }

    public stopAnimation() {
        if (!this.animationComponent)
            return;

        this.animationComponent.stop();
        this.clearEventListeners();
        this.previousAnimationName = '';
    }

    public setAnimationSpeed(speed: number) {
        if (this.animationComponent) {
            this.animationComponent.clips.forEach(clip => {
                const state = this.animationComponent.getState(clip?.name || '');
                if (state) {
                    state.speed = speed;
                }
            });
        }
    }
}