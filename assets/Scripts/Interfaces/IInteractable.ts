import { Component } from 'cc';
import { Player } from '../Player';

export interface IInteractable  {
    /**
     * Called when the player enters the interaction zone
     * @param player The player that entered the zone
     */
    onPlayerEnter(player: Player): void;
    
    /**
     * Called when the player exits the interaction zone
     * @param player The player that exited the zone
     */
    onPlayerExit(player: Player): void;
}

/**
 * Type guard to check if a component implements IInteractable
 */
export function isInteractable(component: Component): component is Component & IInteractable {
    return component !== null && 
           'onPlayerEnter' in component && 
           'onPlayerExit' in component;
}
