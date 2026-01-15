import { _decorator, Component, Constructor, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenericPool')
export class GenericPool<T extends Component> extends Component {
    @property
    public initialSize: number = 10; 

    @property
    public expandSize: number = 5;

    @property(Prefab)
    public prefab: Prefab | null = null;

    private pool: T[] = [];
    private componentType: Constructor<T> | null = null;

    public initialize(componentType: Constructor<T>) {
        this.componentType = componentType;
        this.initializePool();
    }

    public get(): T | null {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        }

        for (let i = 0; i < this.expandSize; i++) {
            const newItem = this.createNewObject();
            this.pool.push(newItem);
        }

        return this.createNewObject();
    }

    public release(item: T): void {
        this.pool.push(item);
        item.node.setParent(this.node);
        item.node.active = false;
    }

    private initializePool() {
        if (!this.prefab || !this.componentType) {
            console.error('GenericPool: Prefab or component type is not assigned!');
            return;
        }

        for (let i = 0; i < this.initialSize; i++) {
            const newItem = this.createNewObject();
            this.pool.push(newItem);
        }
    }

    private createNewObject(): T {
        if (!this.prefab || !this.componentType) {
            console.error('GenericPool: Prefab or component type is not assigned!');
            throw new Error('Cannot create object without prefab or component type');
        }

        const node = instantiate(this.prefab) as Node;
        node.setParent(this.node);
        node.active = false;
        const component = node.getComponent(this.componentType);

        if (!component) {
            console.error(`GenericPool: Component not found on instantiated prefab!`);
            throw new Error('Component not found on prefab');
        }

        return component;
    }
}


