import { Component } from 'cc';

export interface IDamageable {
    /**
     * Applies damage to the object
     * @param value The amount of damage to apply
     */
    damage(value: number): void;

    /**
     * Optional property to indicate if the object is currently active
     */
    isActive(): boolean;
}

/**
 * Type guard to check if a component implements IDamageable
 */
export function isDamageable(component: Component): component is Component & IDamageable {
    return component !== null && 'damage' in component;
}

