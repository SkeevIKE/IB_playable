import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { IDamageable } from '../Interfaces/IDamageable';
import { Weapon, WeaponTier } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('LoadoutData')
export class LoadoutData {
    @property(Prefab)
    public weaponPrefab: Prefab | null = null;
    @property({ type: WeaponTier })
    public type: WeaponTier = WeaponTier.Basic;   
}

@ccclass('Loadout')
export class Loadout extends Component {
    @property(LoadoutData)
    private loadoutDatas: LoadoutData[] = [];

    @property(Node)
    private weaponHolder: Node | null = null;

    private currentWeapon: Weapon | null = null;

    public equipWeapon(type: WeaponTier): void {
        const loadoutData = this.loadoutDatas.find(data => data.type === type);
        if (!loadoutData || !loadoutData.weaponPrefab) {
            console.error(`Loadout: Weapon of type ${WeaponTier[type]} not found in loadout data!`);
            return;
        }

        if (this.currentWeapon) {
            this.currentWeapon.node.destroy();
            this.currentWeapon = null;
        }

        const weaponNode = instantiate(loadoutData.weaponPrefab) as Node;
        weaponNode.setParent(this.weaponHolder);
        weaponNode.setPosition(0, 0, 0);  
        this.currentWeapon = weaponNode.getComponent(Weapon);
        if (!this.currentWeapon) {
            console.error('Loadout: The instantiated weapon prefab does not have a Weapon component!');
        }
    }

    public attack(target: IDamageable): void {
        if (this.currentWeapon) {
            this.currentWeapon.attack(target);
        } else {
            console.warn('Loadout: No weapon equipped to attack with!');
        }
    }
}