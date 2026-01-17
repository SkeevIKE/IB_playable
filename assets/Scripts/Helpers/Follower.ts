import { _decorator, Component, Mat4, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Follower')
export class Follower extends Component {
    @property(Node)
    private targetFollow: Node;
    @property
    private speedFollow: number = 5.0;
    @property
    private freezX: boolean = false;
    @property
    private freezY: boolean = false;
    @property
    private freezZ: boolean = false;

    private startOffset: Vec3 = new Vec3();
    private isInit: boolean = false;  

    private readonly targetPosition = new Vec3();
    private readonly newPosition = new Vec3();
    private readonly localTargetPos = new Vec3();
    private readonly localCurrentPos = new Vec3();
    private readonly tempMat4 = new Mat4();
    private readonly inverseMat4 = new Mat4();   

    public setSpeed(speed: number): void {
        this.speedFollow = speed;
    }

    public setFreezeAxes(freezX: boolean, freezY: boolean, freezZ: boolean): void {
        this.freezX = freezX;
        this.freezY = freezY;
        this.freezZ = freezZ;
    }

    public setTarget(target: Node, isOffset: boolean = false): void {
        this.targetFollow = target;       

        if (isOffset) {
            Vec3.subtract(this.startOffset, target.worldPosition, this.node.worldPosition);
        } else {
            this.startOffset = Vec3.ZERO;
        }

        this.isInit = true;
    }

    public instantMoveToTarget(): void {
        if (!this.isInit) {
            this.setTarget(this.targetFollow);
        }

        if (!this.targetFollow)
            return;

        let constrainedTargetPosition = this.calculateConstrainedTargetPosition();
        this.node.setWorldPosition(constrainedTargetPosition);
    }

    protected lateUpdate(deltaTime: number): void {
        if (!this.isInit) {
            this.setTarget(this.targetFollow);
        }

        if (!this.targetFollow)
            return;

        const constrainedTargetPosition = this.calculateConstrainedTargetPosition();

        Vec3.lerp(this.newPosition, this.node.worldPosition, constrainedTargetPosition, this.speedFollow * deltaTime);
        this.node.setWorldPosition(this.newPosition);
    }

    private calculateConstrainedTargetPosition(): Vec3 {
        Vec3.subtract(this.targetPosition, this.targetFollow.worldPosition, this.startOffset);

        if (!this.freezX && !this.freezY && !this.freezZ) {
            return this.targetPosition;
        }

        this.node.parent!.getWorldMatrix(this.tempMat4);
        Mat4.invert(this.inverseMat4, this.tempMat4);

        Vec3.transformMat4(this.localTargetPos, this.targetPosition, this.inverseMat4);
        Vec3.transformMat4(this.localCurrentPos, this.node.worldPosition, this.inverseMat4);

        if (this.freezX) {
            this.localTargetPos.x = this.localCurrentPos.x;
        }

        if (this.freezY) {
            this.localTargetPos.y = this.localCurrentPos.y;
        }

        if (this.freezZ) {
            this.localTargetPos.z = this.localCurrentPos.z;
        }
       
        Vec3.transformMat4(this.targetPosition, this.localTargetPos, this.tempMat4);
        return this.targetPosition;
    }
}