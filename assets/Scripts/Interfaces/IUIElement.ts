import { Component } from 'cc';

export interface IUIElement {
    /**
     * Method to show the UI element
     **/
    showUI(): void;
    /**
     * Method to hide the UI element
     **/
    hideUI(): void;
}

export function isUIElement(component: Component): component is Component & IUIElement {
    return component !== null && 'showUI' in component && 'hideUI' in component;
}
