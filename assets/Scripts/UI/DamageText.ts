import { _decorator, Component, Label, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DamageText')
export class DamageText extends Component {
    @property(Label)
    public label: Label = null;

    @property
    public moveDuration: number = 0.5;

    @property
    public scaleDuration: number = 0.2;

    @property
    public moveDistance: number = 100;

    private startPosition: Vec3 = new Vec3();
    private startScale: Vec3 = new Vec3();

    protected onLoad(): void {
        this.startPosition = this.node.getWorldPosition();        
        this.startScale = this.node.scale.clone();
        this.node.active = false;
    }

    public show(text: string): void {
        if (!this.label) {
            return;
        }

        this.label.string = text;
        this.node.active = true;
        this.node.setScale(0, 0, 0);
        this.node.setWorldPosition(this.startPosition);

        const targetPosition = this.startPosition.clone();
        targetPosition.y += this.moveDistance;

        tween(this.node)
            .parallel(
                tween(this.node)
                    .to(this.scaleDuration, { scale: this.startScale }, { easing: 'backOut' }),
                tween(this.node)
                    .delay(this.scaleDuration * 0.5)
                    .to(this.moveDuration, { worldPosition: targetPosition }, { easing: 'sineIn' })
            )
            .call(() => this.hide())
            .start();
    }

    private hide(): void {
        this.node.active = false;
        this.node.setWorldPosition(this.startPosition);
        this.node.setScale(this.startScale);
    }
}


