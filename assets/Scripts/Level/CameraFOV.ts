import { _decorator, Camera, Component, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFOV')
export class CameraFOV extends Component {
    @property(Camera)
    private mainCamera: Camera = null;
    @property(Camera)
    private uiMainCamera: Camera = null;
    @property
    private initialFOV: number = 45;
    @property
    private zoomedOutFOV: number = 55;
    @property
    private animationDuration: number = 0.3;

    private currentFOV: number = 0;   

    protected start(): void {
        if (this.mainCamera) {
            this.currentFOV = this.mainCamera.fov;
            this.initialFOV = this.currentFOV;
        } else {
            console.error('Camera component not assigned to CameraFOVManager!');
        }

        if (!this.uiMainCamera) {
            console.error('Secondary camera component not assigned to CameraFOVManager!');
        }
    }

    public zoomOut(): void {
        if (!this.mainCamera)
            return;

        tween(this.mainCamera)
            .to(this.animationDuration, { fov: this.zoomedOutFOV }, { easing: 'sineOut' })
            .start();

        if (this.uiMainCamera) {
            tween(this.uiMainCamera)
                .to(this.animationDuration, { fov: this.zoomedOutFOV }, { easing: 'sineOut' })
                .start();
        }
    }

    public resetZoom(): void {
        if (!this.mainCamera)
            return;

        tween(this.mainCamera)
            .to(this.animationDuration, { fov: this.initialFOV }, { easing: 'sineOut' })
            .start();

        if (this.uiMainCamera) {
            tween(this.uiMainCamera)
                .to(this.animationDuration, { fov: this.initialFOV }, { easing: 'sineOut' })
                .start();
        }
    }

    public getCameraAngle(): number {
        if (!this.mainCamera)
            return 0;
        
        return this.mainCamera.node.eulerAngles.y;
    }
}
