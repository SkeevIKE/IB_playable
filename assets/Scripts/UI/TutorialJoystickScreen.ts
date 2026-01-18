import { _decorator, Animation } from 'cc';
import { ScreenBase } from './ScreenBase';
const { ccclass, property } = _decorator;

@ccclass('TutorialJoystickScreen')
export class TutorialJoystickScreen extends ScreenBase {
    @property(Animation)
    private aimation: Animation = null;

    public show(duration = 0): void {
        super.show(duration);
        this.aimation.play();
    }

    public hide(duration = 0): void {
        super.hide(duration);
        this.aimation.stop();
    }    
}
