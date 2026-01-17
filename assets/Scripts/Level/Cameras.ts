import { _decorator, Camera, Component } from 'cc';
import { Follower } from '../Helpers/Follower';
import { CameraFOV } from './CameraFOV';
const { ccclass, property } = _decorator;

@ccclass('Cameras')
export class Cameras extends Component {
    @property(Camera)
    private mainCamera: Camera = null;
    @property(Camera)
    private uiCamera: Camera = null;
    @property(CameraFOV)
    private сameraFOV: CameraFOV = null;
    @property(Follower)
    private follower: Follower = null;

    public get getMainCamera(): Camera {
        return this.mainCamera;
    }

    public get getUICamera(): Camera {
        return this.uiCamera;
    }

    public get getCameraFOV(): CameraFOV {
        return this.сameraFOV;
    }

    public get getFollower(): Follower {
        return this.follower;
    }
}


