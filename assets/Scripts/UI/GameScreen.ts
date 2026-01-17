import { _decorator, Label, Node, Sprite, tween, Vec3 } from 'cc';
import { ScreenBase } from './ScreenBase';
const { ccclass, property } = _decorator;

@ccclass('GameScreen')
export class GameScreen extends ScreenBase {
    @property(Sprite)
    private woodIcon: Sprite = null;
    @property(Sprite)
    private ironIcon: Sprite = null;
    @property(Label)
    private woodText: Label = null;
    @property(Label)
    private ironText: Label = null;
    
    public getWoodIconPosition(): Vec3 {
        return this.woodIcon.node.getWorldPosition();
    }

    public getIronIconPosition(): Vec3 {
        return this.ironIcon.node.getWorldPosition();
    }   

    public setWoodCount(value: number): void {
        if (this.woodText) {
            this.animateLabelCount(this.woodText, value, this.woodIcon.node);
        }
    }

    public setIronCount(value: number): void {
        if (this.ironText) {
            this.animateLabelCount(this.ironText, value, this.ironIcon.node);
        }
    }

    private bumpIcon(node: Node): void {
        const up = new Vec3(1.12, 1.12, 1.12);
        const normal = new Vec3(1, 1, 1);
        tween(node)
            .to(0.1, { scale: up }, { easing: 'sineOut' })
            .to(0.1, { scale: normal }, { easing: 'sineIn' })
            .start();
    }

    private animateLabelCount(label: Label, target: number, bumpNode: Node): void {
        const current = parseInt(label.string || '0') || 0;
        const state = { v: current };
        this.bumpIcon(bumpNode);
        tween(state)
            .to(0.25, { v: target }, {
                onUpdate: () => {
                    label.string = String(Math.floor(state.v));
                },
                easing: 'sineOut'
            })
            .start();
    }
}
