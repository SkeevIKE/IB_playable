import { _decorator, Component, Enum } from 'cc';
import { IDamageable } from './Interfaces/IDamageable';
const { ccclass, property } = _decorator;

export enum WeaponTier {
    Basic,    
    Standard,
    Elite     
} Enum(WeaponTier);

@ccclass('Weapon')
export class Weapon extends Component {
    @property({ type: WeaponTier })
    private type: WeaponTier = WeaponTier.Basic;
    @property
    private damage: number = 1;

    public getType(): WeaponTier {
        return this.type;
    }

    public attack(target: IDamageable): void {      
        target.damage(this.damage);
    }    
}


