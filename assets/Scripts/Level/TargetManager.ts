import { Component, isValid, Node, Vec3 } from 'cc';
import { IDamageable, isDamageable } from '../Interfaces/IDamageable';

export class TargetManager {
    private targets: Array<Component & IDamageable> = [];

    public addFromNode(node: Node): void {
        const damageables = node.getComponents(Component).filter(isDamageable) as Array<Component & IDamageable>;
        for (const dmg of damageables) {
            if (this.targets.indexOf(dmg) === -1) {
                this.targets.push(dmg);
            }
        }
        this.clearInvalid();
    }

    public removeFromNode(node: Node): void {
        const damageables = node.getComponents(Component).filter(isDamageable) as Array<Component & IDamageable>;
        for (const dmg of damageables) {
            this.removeTarget(dmg);
        }
        this.clearInvalid();
    }

    public removeTarget(target: Component & IDamageable): void {
        const idx = this.targets.indexOf(target);
        if (idx !== -1) {
            this.targets.splice(idx, 1);
        }
    }

    public hasValidTargets(): boolean {
        this.clearInvalid();
        return this.targets.length > 0;
    }

    public getNearestValidTarget(origin: Vec3): (Component & IDamageable) | null {
        this.clearInvalid();
        let nearest: (Component & IDamageable) | null = null;
        let nearestDist = Number.POSITIVE_INFINITY;
        for (const target of this.targets) {
            const dist = Vec3.distance(origin, target.node.worldPosition);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = target;
            }
        }
        return nearest;
    }

    public getTargetsInFrontArc(origin: Vec3, forward: Vec3, radius: number): Array<Component & IDamageable> {
        this.clearInvalid();
        const result: Array<Component & IDamageable> = [];
        const forwardNormalized = forward.clone().normalize();        

        for (const target of this.targets) {
            const toTarget = new Vec3();
            Vec3.subtract(toTarget, target.node.worldPosition, origin);
            
            const distance = toTarget.length();
            if (distance > radius) {
                continue;
            }

            toTarget.normalize();
            const dot = Vec3.dot(forwardNormalized, toTarget);           
            if (dot >= 0) {
                result.push(target);
            }
        }
        return result;
    }

    private clearInvalid(): void {
        this.targets = this.targets.filter(target => isValid(target) && isValid(target.node) && target.isActive());
    }
}

export default TargetManager;