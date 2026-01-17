import { Vec3 } from "cc";
import { GameScreen } from "../UI/GameScreen";

export class Resources {
    private wood: number = 0;
    private iron: number = 0;
    private gameScreen: GameScreen = null;

    constructor(gameScreen: GameScreen) {
        this.gameScreen = gameScreen;
    }

    public getWoodPosition(): Vec3 {
        return this.gameScreen.getWoodIconPosition();
    }

    public getIronPosition(): Vec3 {
        return this.gameScreen.getIronIconPosition();
    }

    public addWood(amount: number): void {
        this.wood += amount;
        this.gameScreen.setWoodCount(this.wood);
    }

    public addIron(amount: number): void {
        this.iron += amount;
        this.gameScreen.setIronCount(this.iron);
    }

    public removeWood(amount: number): boolean {
        if (this.wood >= amount) {
            this.wood -= amount;
            return true;
        }
        return false;
    }

    public removeIron(amount: number): boolean {
        if (this.iron >= amount) {
            this.iron -= amount;
            return true;
        }
        return false;
    }

    public getWood(): number {
        return this.wood;
    }

    public getIron(): number {
        return this.iron;
    }

    public reset(): void {
        this.wood = 0;
        this.iron = 0;
    }
}
