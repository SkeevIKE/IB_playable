import { _decorator } from 'cc';
import { GenericPool } from '../Helpers/GenericPool';
import { ParticleWrapper } from '../Helpers/ParticleWrapper';
const { ccclass, property } = _decorator;

@ccclass('HitsPool')
export class HitsPool extends GenericPool<ParticleWrapper> {
    protected start(): void {
        this.initialize(ParticleWrapper);
    }

    public get(): ParticleWrapper | null {
        const item = super.get();
        if (item) {
            item.setReturnFunction = () => {
                this.release(item);
            };
        }
        return item;
    }
}


