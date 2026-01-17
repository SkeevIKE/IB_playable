import { _decorator, Component, Node, tween, Tween, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Lifebar')
export class Lifebar extends Component {
    @property(Node)
    public maskNode: Node = null;

    @property(Node)
    public blueBar: Node = null;

    @property(Node)
    public whiteBar: Node = null;

    @property
    public animationSpeed: number = 0.3;

    private currentValue: number = 0;
    private maxValue: number = 100;
    private barWidth: number = 0;
    private activeTween: any = null;
    private blueStartX: number = 0;
    private whiteStartX: number = 0;
    private positionsInited: boolean = false;

    protected onLoad() {
        if (this.maskNode) {
            const uiTransform = this.maskNode.getComponent(UITransform);
            if (uiTransform) {
                this.barWidth = uiTransform.contentSize.width;
            }
        }
    }

    public initialization(maxValue: number, startValue: number = null): void {
        this.maxValue = maxValue;
        this.currentValue = startValue !== null ? startValue : maxValue;
        if (!this.positionsInited) {
            if (this.blueBar) {
                this.blueStartX = this.blueBar.position.x;
            }
            if (this.whiteBar) {
                this.whiteStartX = this.whiteBar.position.x;
            }
            this.positionsInited = true;
        }
        this.updateBar(this.currentValue, false);
    }

    public setValue(newValue: number, animate: boolean = true): void {
        newValue = Math.max(0, Math.min(newValue, this.maxValue));
        
        if (animate) {
            this.updateBar(newValue, true);
        } else {
            this.updateBar(newValue, false);
        }

        this.currentValue = newValue;
    }

    public increase(amount: number): void {
        this.setValue(this.currentValue + amount, true);
    }

    public decrease(amount: number): void {
        this.setValue(this.currentValue - amount, true);
    }

    public getValue(): number {
        return this.currentValue;
    }

    public getPercent(): number {
        return (this.currentValue / this.maxValue) * 100;
    }

    private updateBar(newValue: number, animate: boolean): void { 
        const newPercent = (newValue / this.maxValue) * 100;
        const offset = ((newPercent - 100) / 100) * this.barWidth;

        const blueTargetX = this.blueStartX + offset;
        const whiteTargetX = this.whiteStartX + offset;

        if (this.activeTween) {
            this.activeTween.stop();
            this.activeTween = null;
        }
        if (this.whiteBar) {
            Tween.stopAllByTarget(this.whiteBar);
        }

        if (this.blueBar) {
            const bp = this.blueBar.position;
            this.blueBar.setPosition(blueTargetX, bp.y, bp.z);
        }

        if (this.whiteBar && animate) {
            const wp = this.whiteBar.position;
            const targetPos = new Vec3(whiteTargetX, wp.y, wp.z);
            this.activeTween = tween(this.whiteBar)
                .to(this.animationSpeed, { position: targetPos })
                .call(() => {
                    const cur = this.whiteBar.position;
                    this.whiteBar.setPosition(whiteTargetX, cur.y, cur.z);
                })
                .start();
        } else if (this.whiteBar && !animate) {
            const wp = this.whiteBar.position;
            this.whiteBar.setPosition(whiteTargetX, wp.y, wp.z);
        }
    }
}


