import { _decorator } from 'cc';
import { GenericPool } from '../Helpers/GenericPool';
import { IconResource } from '../UI/IconResource';
const { ccclass, property } = _decorator;

@ccclass('IconResourcePool')
export class IconResourcePool extends GenericPool<IconResource> {
    protected start(): void {
        this.initialize(IconResource);
    }

    public get(): IconResource | null {
        const item = super.get();
        if (item) {
            item.setReturnFunction = () => {
                this.release(item);
            };
        }
        return item;
    }
}


