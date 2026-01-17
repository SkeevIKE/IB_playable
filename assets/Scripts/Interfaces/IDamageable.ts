import { Component, Vec3 } from 'cc';
import { WeaponTier } from '../Level/Weapon';

export interface IDamageable {
    /**
     * Applies damage to the object
     * @param value The amount of damage to apply
     */
    damage(value: number, weaponTier: WeaponTier): void;

    /**
     * Optional property to indicate if the object is currently active
     */
    isActive(): boolean;

    /**
     * Optional method to get the position of the object
     */
    getPosition(): Vec3;
}

/**
 * Type guard to check if a component implements IDamageable
 */
export function isDamageable(component: Component): component is Component & IDamageable {
    return component !== null && 'damage' in component;
}

