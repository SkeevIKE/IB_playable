import { _decorator, UITransform, Vec2, Vec3 } from 'cc';
import { ScreenBase } from './ScreenBase';
const { ccclass, property } = _decorator;

@ccclass('JoystickScreen')
export class JoystickScreen extends ScreenBase {
    @property(UITransform)
    private background: UITransform = null;
    @property(UITransform)
    public core: UITransform = null;
    @property
    public radius: number = 100;

    private group: UITransform = null;

    public onLoad() {
        this.group = this.background.node.parent.getComponent(UITransform);
    }

    public startDrag(position: Vec2): void {
        const localTouchPos = this.group.convertToNodeSpaceAR(new Vec3(position.x, position.y));
        this.background.node.setPosition(new Vec3(localTouchPos.x, localTouchPos.y));
        super.show();
    }

    public drag(position: Vec2): void {
        const localTouchPos = this.background.convertToNodeSpaceAR(new Vec3(position.x, position.y));

        const distance = localTouchPos.length();
        const clampedPos = distance > this.radius
            ? localTouchPos.normalize().multiplyScalar(this.radius)
            : localTouchPos;

        this.core.node.setPosition(clampedPos.x, clampedPos.y);
    }

    public endDrag() {
        super.hide();
        this.core.node.setPosition(0, 0);
    }
}
