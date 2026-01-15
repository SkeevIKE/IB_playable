import { _decorator, Component, CurveRange, Node, ParticleSystem, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('ParticleWrapper')
export class ParticleWrapper extends Component {
    @property(Node)
    private rootNode: Node;

    @property([ParticleSystem])
    private particles: ParticleSystem[] = [];

    @property
    private returneTime: number = 0;

    private returneFunction: Function;

    public set setReturnFunction(func: Function) {
        this.returneFunction = func;
    }

    protected onLoad(): void {
        this.rootNode.active = false;
    }

    public show(position: Vec3 | null): void {
        if (position !== null) {
            this.rootNode.setWorldPosition(position);
        }

        this.rootNode.active = true;
        let maxDuration = 0;

        for (let i = 0; i < this.particles.length; i++) {
            const element = this.particles[i];
            if (element) {
                const duration = element.duration;
                let startLifetimeValue = 0;

                const startLifetime = element.startLifetime;
                if (startLifetime instanceof CurveRange) {
                    switch (startLifetime.mode) {
                        case CurveRange.Mode.Constant:
                            startLifetimeValue = startLifetime.constant;
                            break;
                        case CurveRange.Mode.TwoConstants:
                            startLifetimeValue = startLifetime.constantMax;
                            break;
                        case CurveRange.Mode.Curve:
                        case CurveRange.Mode.TwoCurves:
                            startLifetimeValue = startLifetime.evaluate(1, 1);
                            break;
                        default:
                            startLifetimeValue = 0;
                    }
                } else if (typeof startLifetime === 'number') {
                    startLifetimeValue = startLifetime;
                } else {
                    startLifetimeValue = 0;
                }

                const totalDuration = duration + startLifetimeValue;
                if (totalDuration > maxDuration) {
                    maxDuration = totalDuration;
                }

                element.stop();
                element.clear();
                element.play();
            }
        }

        if (this.returneTime > -1) {
            this.unschedule(this.onCompleted);
            this.scheduleOnce(this.onCompleted, this.returneTime > 0 ? this.returneTime : maxDuration);
        }
    }

    public onCompleted = (): void => {
        this.unschedule(this.onCompleted);

        if (this.returneFunction) {
            this.returneFunction(this);
        }
        this.rootNode.active = false;
    }
}