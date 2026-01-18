import { _decorator, Component, Enum } from 'cc';
import { Audio } from '../Audio/Audio';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { IDamageable } from '../Interfaces/IDamageable';
import { HitsPool } from '../Pools/HitsPool';
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
        target.damage(this.damage, this.type);
        const particle = ServiceAllocator.get(HitsPool)?.get();
        const position = target.getPosition();
        position.y += 1.5;
        particle.show(position);
        Audio.instance.playSoundOneShot('attack');
    }    
}


