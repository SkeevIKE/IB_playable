import { Vec3 } from "cc";
import { GameScreen } from "../UI/GameScreen";
import { WeaponTier } from "./Weapon";

export class Resources extends EventTarget {
    public readonly WOOD_COLLECTED = 'wood-collected';   
    public readonly TIER_ONE_WEAPON_UPGRADED = 'tier-one-weapon-upgraded';
    public readonly TIER_TWO_WEAPON_UPGRADED = 'tier-two-weapon-upgraded';

    private wood: number = 0;
    private iron: number = 0; 
    private woodNeededCount: number = 100;
    private ironNeededCount: number = 100;    
    private gameScreen: GameScreen = null;

    constructor(gameScreen: GameScreen) {
        super();
        this.gameScreen = gameScreen;
    }

    public getWoodPosition(): Vec3 {
        return this.gameScreen.getWoodIconPosition();
    }

    public getIronPosition(): Vec3 {
        return this.gameScreen.getIronIconPosition();
    }

    public get woodCount(): number {
        return this.wood;
    }

    public get ironCount(): number {
        return this.iron;
    }

    public set setWoodNeededCount(value: number) {
        this.woodNeededCount = value;       
    }

    public set setIronNeededCount(value: number) {
        this.ironNeededCount = value;       
    }

    public addWood(amount: number): void {
        this.wood += amount;
        this.gameScreen.setWoodCount(this.wood);

        if (this.wood >= this.woodNeededCount) {
        this.dispatchEvent(new CustomEvent(this.WOOD_COLLECTED));
        }
    }

    public addIron(amount: number): void {
        this.iron += amount;
        this.gameScreen.setIronCount(this.iron);
    }

    public removeWood(amount: number): boolean {
        if (this.wood >= amount) {
            this.wood -= amount;
             this.gameScreen.setWoodCount(this.wood);
            this.dispatchEvent(new CustomEvent(this.TIER_ONE_WEAPON_UPGRADED, { detail: WeaponTier.Standard }));
            return true;
        }
        return false;
    }

    public removeIron(amount: number): boolean {
        if (this.iron >= amount) {
            this.iron -= amount;
            this.gameScreen.setIronCount(this.iron);
            this.dispatchEvent(new CustomEvent(this.TIER_TWO_WEAPON_UPGRADED, { detail: WeaponTier.Elite }));
            return true;
        }
        return false;
    }
}
