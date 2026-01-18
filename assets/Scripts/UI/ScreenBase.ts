import type { Tween } from 'cc';
import { _decorator, Component, Eventify, tween, UIOpacity } from 'cc';
const { ccclass } = _decorator;

/**
 * Base class for UI screens.
 * Extend this class to implement custom screen behaviors in your UI system.
 */
@ccclass('ScreenBase')
export class ScreenBase extends Eventify(Component) {
  private uiOpacity: UIOpacity;
  private activeTween: Tween<UIOpacity>;

  /**
   * Instantly hides the screen by setting opacity to 0 without animation.
   * This method does not need to be overridden in child classes.
   */
  public immediatelyHide(): void {
    this.initializeOpacity();
    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }
    this.uiOpacity.opacity = 0;
  }

  /**
   * Shows the screen with a fade animation to opacity 255.
   * @param duration Animation duration in seconds (default is 0 for no animation).
   */
  public show(duration = 0): void {
    this.fadeToOpacity(255, duration);
  }

  /**
   * Hides the screen with a fade animation to opacity 0.
   * @param duration Animation duration in seconds (default is 0 for no animation).
   */
  public hide(duration = 0): void {
    this.fadeToOpacity(0, duration);
  }

  /**
   * Animates the screen opacity to the specified value.
   * @param targetOpacity Target opacity (from 0 to 255).
   * @param duration Animation duration in seconds.
   * @throws Error if parameters are invalid.
   */
  public fadeToOpacity(targetOpacity: number, duration: number): void {
    this.validateFadeParams(targetOpacity, duration);

    this.initializeOpacity();

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.activeTween = tween(this.uiOpacity)
      .to(duration, { opacity: targetOpacity })
      .call(() => {
        this.activeTween = null;
      })
      .start();
  }

  private initializeOpacity(): void {
    if (!this.uiOpacity) {
      this.uiOpacity = this.getComponent(UIOpacity);
    }
    if (!this.uiOpacity) {
      this.uiOpacity = this.addComponent(UIOpacity);
    }
  }

  private validateFadeParams(targetOpacity: number, duration: number): void {
    if (typeof targetOpacity !== 'number' || isNaN(targetOpacity)) {
      throw new Error('Invalid targetOpacity: must be a valid number.');
    }
    if (typeof duration !== 'number' || isNaN(duration)) {
      throw new Error('Invalid duration: must be a valid number.');
    }
    if (targetOpacity < 0 || targetOpacity > 255) {
      throw new Error('Invalid opacity value. Opacity must be between 0 and 255.');
    }
    if (duration < 0) {
      throw new Error('Invalid duration value. Duration must be a positive number.');
    }
  }
}
