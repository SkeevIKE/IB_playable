import { _decorator, Component, Node, ParticleSystem, tween, Vec3 } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { IUIElement } from '../Interfaces/IUIElement';
import { UpgradePanel } from '../UI/UpgradePanel';
import { Resources } from './Resources';
const { ccclass, property } = _decorator;

@ccclass('CraftBench')
export class CraftBench extends Component implements IUIElement {
    @property(UpgradePanel)
    private tierOneUpgradePanel: UpgradePanel = null;
    @property(UpgradePanel)
    private tierTwoUpgradePanel: UpgradePanel = null;   
    @property(Node)
    private sawNode: Node = null;
    @property(ParticleSystem)
    private upgradeEffects: ParticleSystem[] = []; 

    private currentUpgradePanel: UpgradePanel = null;
    private isAllUpgraded: boolean = false;

    protected start(): void {    
        this.currentUpgradePanel = this.tierOneUpgradePanel;
        this.tierOneUpgradePanel.once(this.tierOneUpgradePanel.UPGRADE_CLICKED, this.onTierOneUpgradeClicked, this);
        this.tierTwoUpgradePanel.once(this.tierTwoUpgradePanel.UPGRADE_CLICKED, this.onTierTwoUpgradeClicked, this);
        const resources = ServiceAllocator.get(Resources);
        resources.setWoodNeededCount = this.tierOneUpgradePanel.neededCount;
        resources.setIronNeededCount = this.tierTwoUpgradePanel.neededCount;
    }

    public showUI(): void {      
        if (this.isAllUpgraded) {
            return;
        }

        this.currentUpgradePanel.show();
    }

    public hideUI(): void {        
        this.currentUpgradePanel.hide();
    }

    private onTierOneUpgradeClicked(): void {
        this.hideUI();
        this.currentUpgradePanel = this.tierTwoUpgradePanel;
        this.showUI();
        this.showUpgradeEffect();
    }

    private onTierTwoUpgradeClicked(): void {
        this.hideUI();
        this.showUpgradeEffect();
        this.isAllUpgraded = true;
    }

    private showUpgradeEffect(): void {
        if (this.upgradeEffects) {
            for (const effect of this.upgradeEffects) {
                effect.play();
            }
        }

        if (this.sawNode) {
            tween(this.sawNode)
                .by(0.7, { eulerAngles: new Vec3(0, 0, -720) }, { easing: 'sineOut' })
                .start();
        };
    }
}


