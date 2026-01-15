import { _decorator, Component } from 'cc';
import { ScreenBase } from './ScreenBase';
const { ccclass, property } = _decorator;

@ccclass('Screens')
export class Screens extends Component {
  private screens: ScreenBase[] = [];

  protected onLoad() {
    this.screens = this.getComponentsInChildren(ScreenBase);
    this.disable();
  }

  public get<T extends ScreenBase>(ctor: new () => T): T {
    for (let i = 0; i < this.screens.length; i++) {
      if (this.screens[i] instanceof ctor) {
        return this.screens[i] as T;
      }
    }
  }

  public disable(): void {
    for (let i = 0; i < this.screens.length; ++i) {
      this.screens[i].immediatelyHide();
    }
  }
}
