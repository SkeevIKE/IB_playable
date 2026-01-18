import { _decorator, Component, Mat4, Node, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Follower')
export class Follower extends Component {
    @property(Node)
    private targetFollow: Node;
    @property
    private speedFollow: number = 5.0;
    @property
    private offsetTransitionSpeed: number = 5.0;
    @property
    private freezX: boolean = false;
    @property
    private freezY: boolean = false;
    @property
    private freezZ: boolean = false;

    private startOffset: Vec3 = new Vec3();
    private currentOffset: Vec3 = new Vec3();
    private targetOffset: Vec3 = new Vec3();
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

    public setOffsetTransitionSpeed(speed: number): void {
        this.offsetTransitionSpeed = speed;
    }

    public setFreezeAxes(freezX: boolean, freezY: boolean, freezZ: boolean): void {
        this.freezX = freezX;
        this.freezY = freezY;
        this.freezZ = freezZ;
    }

    public initializeOffset(): void {
        if (this.targetFollow) {
            Vec3.subtract(this.startOffset, this.targetFollow.worldPosition, this.node.worldPosition);    
            this.targetOffset = this.startOffset.clone();        
        }
    }

    public setTarget(target: Node, isStartOffset: boolean = false): void {
        this.targetFollow = target;

        if (isStartOffset) {
            this.targetOffset = this.startOffset.clone();
        } else {
            this.targetOffset = Vec3.ZERO.clone();
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
    
        Vec3.lerp(this.currentOffset, this.currentOffset, this.targetOffset, this.offsetTransitionSpeed * deltaTime);
        const constrainedTargetPosition = this.calculateConstrainedTargetPosition();
        Vec3.lerp(this.newPosition, this.node.worldPosition, constrainedTargetPosition, this.speedFollow * deltaTime);
        this.node.setWorldPosition(this.newPosition);
    }

    private calculateConstrainedTargetPosition(): Vec3 {
        Vec3.subtract(this.targetPosition, this.targetFollow.worldPosition, this.currentOffset);

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