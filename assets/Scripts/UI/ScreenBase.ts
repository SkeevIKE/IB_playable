import { _decorator, Component, Eventify, tween, Tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScreenBase')
export class ScreenBase extends Eventify(Component) {
  @property
  private fadeDuration: number = 0.5;

  private uiOpacity: UIOpacity;
  private activeTween: Tween<UIOpacity> = null;

  public show() {
    this.setColor(255);
  }

  public hide() {
    this.setColor(0);
  }

  public immediatelyHide() {
    this.setColor(0);
  }

  public fadeIn() {
    this.fadeToOpacity(255, this.fadeDuration);
  }

  public fadeOut() {
    this.fadeToOpacity(0, this.fadeDuration);
  }

  public fadeToOpacity(targetOpacity: number, duration: number = 0.5) {
    if (!this.uiOpacity) {
      this.uiOpacity = this.getComponent(UIOpacity);
      if (!this.uiOpacity) this.uiOpacity = this.addComponent(UIOpacity);
    }

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

  private setColor(value: number) {
    if (!this.uiOpacity) {
      this.uiOpacity = this.getComponent(UIOpacity);
      if (!this.uiOpacity) this.uiOpacity = this.addComponent(UIOpacity);
    }

    if (this.activeTween) {
      this.activeTween.stop();
      this.activeTween = null;
    }

    this.uiOpacity.opacity = value;
  }
}
