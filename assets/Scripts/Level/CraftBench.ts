import { _decorator, Component, UIOpacity, Vec3 } from 'cc';
import { UIAnimationHelper } from '../Helpers/UIAnimationHelper';
import { IUIElement } from '../Interfaces/IUIElement';
import { UpgradePanel } from '../UI/UpgradePanel';
const { ccclass, property } = _decorator;

@ccclass('CraftBench')
export class CraftBench extends Component implements IUIElement {
    @property(UpgradePanel)
    private tierOneUpgradePanel: UpgradePanel = null;
    @property(UpgradePanel)
    private tierTwoUpgradePanel: UpgradePanel = null;
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;
    @property
    private fadeDuration: number = 0.15;

    private currentUpgradePanel: UpgradePanel = null;

    protected start(): void {
        if (this.uiOpacity) {
            this.uiOpacity.opacity = 0;
            this.uiOpacity.node.setScale(Vec3.ZERO);
        }
        this.currentUpgradePanel = this.tierOneUpgradePanel;
    }

    public showUI(): void {
        UIAnimationHelper.showUI(this.uiOpacity, this.fadeDuration);
        this.currentUpgradePanel.show();
    }

    public hideUI(): void {
        UIAnimationHelper.hideUI(this.uiOpacity, this.fadeDuration);
        this.currentUpgradePanel.hide();
    }
}


