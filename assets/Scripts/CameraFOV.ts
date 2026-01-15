import { _decorator, Camera, Component } from 'cc';
import { TweenAnimation } from './Helpers/TweenAnimation';
const { ccclass, property } = _decorator;

@ccclass('CameraFOV')
export class CameraFOV extends Component {
    @property(Camera)
    private camera: Camera = null;

    @property
    private initialFOV: number = 45;

    @property
    private zoomedOutFOV: number = 55;

    @property
    private animationDuration: number = 0.3;

    private currentFOV: number = 0;

    protected start(): void {
        if (this.camera) {
            this.currentFOV = this.camera.fov;
            this.initialFOV = this.currentFOV;
        } else {
            console.error('Camera component not assigned to CameraFOVManager!');
        }
    }

    public zoomOut(): void {
        if (!this.camera)
            return;
        
        TweenAnimation.numberTo(
            this.camera,
            'fov',
            this.zoomedOutFOV,
            this.animationDuration,
            'sineOut'
        );
    }

    public resetZoom(): void {
        if (!this.camera)
            return;

        TweenAnimation.numberTo(
            this.camera,
            'fov',
            this.initialFOV,
            this.animationDuration,
            'sineOut'
        );
    }

    public getCameraAngle(): number {
        if (!this.camera)
            return 0;
        
        return this.camera.node.eulerAngles.y;
    }
}
