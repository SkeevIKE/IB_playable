import { Quat, RigidBody, Vec2 } from 'cc';

export class Movement {
    private readonly OFFSET_MULTIPLIER = 0.01;
    private readonly MIN_SPEED = 0.1;
    private readonly MAX_SPEED = 1.0;

    private rigidBody: RigidBody = null;
    private speed: number = 10.0;
    private rotationSpeed: number = 0.1;
    private cameraAngle: number = 0;

    public constructor(rigidBody: RigidBody, speed: number, rotationSpeed: number = 0.1) {
        this.rigidBody = rigidBody;
        this.speed = speed;
        this.rotationSpeed = rotationSpeed;
    }

    public setCameraAngle(angle: number): void {
        this.cameraAngle = angle;
    }

    public moveForward(touchOffset: Vec2): void {
        if (touchOffset.length() < 0.1) {
            return;
        }

        const offsetLength = touchOffset.length();
        const speedMultiplier = Math.min(Math.max(offsetLength * this.OFFSET_MULTIPLIER, this.MIN_SPEED), this.MAX_SPEED);
        this.rigidBody.applyForce(this.rigidBody.node.forward.multiplyScalar(this.speed * speedMultiplier));
    }
    
    public rotate(touchOffset: Vec2): void {
        if (touchOffset.length() < 0.1) {
            return;
        }

        const angle = Math.atan2(-touchOffset.x, touchOffset.y);
        const totalAngle = angle * 180 / Math.PI + this.cameraAngle;

        const rotation = new Quat();
        Quat.fromEuler(rotation, 0, totalAngle, 0);

        const currentRotation = this.rigidBody.node.rotation;
        Quat.slerp(currentRotation, currentRotation, rotation, this.rotationSpeed);
        this.rigidBody.node.rotation = currentRotation;
    }
}


