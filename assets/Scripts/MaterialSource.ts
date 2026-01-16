import { _decorator, Color, Component, MeshRenderer, tween, Vec3 } from 'cc';
import { IDamageable } from './Interfaces/IDamageable';
const { ccclass, property } = _decorator;

@ccclass('MaterialSource')
export class MaterialSource extends Component implements IDamageable {
    @property(MeshRenderer)
    private materialRenders: MeshRenderer[] = [];
    @property
    private durability: number = 3;
    @property
    private scaleMin: number = 0.95;
    @property
    private scaleMax: number = 1.1;
    @property
    private animationDuration: number = 0.2;

    private currentDurability: number = 3;
    private currentIndex: number = 0;
    private originalColors: Map<number, { base: Color, shade1: Color, shade2: Color }> = new Map();
    private isDestoryed: boolean = false;

    public isActive(): boolean {
        return this.isDestoryed === false;
    }

    protected start(): void {
        this.currentDurability = this.durability;
        this.cacheAllOriginalColors();
        this.setSegment(this.currentIndex);
    }

    private cacheAllOriginalColors(): void {
        this.materialRenders.forEach((renderer, index) => {
            if (!renderer)
                return;

            const material = renderer.getMaterialInstance(0);
            if (!material || !material.passes || material.passes.length === 0)
                return;

            const pass = material.passes[0];
            const props = pass.properties;
            if (!props)
                return;

            const mainColorArr = props.mainColor?.value;
            const shade1Arr = props.shadeColor1?.value;
            const shade2Arr = props.shadeColor2?.value;
            if (!Array.isArray(mainColorArr) || mainColorArr.length < 4)
                return;

            const toSRGB = (linear: number) => Math.round(Math.pow(linear, 1 / 2.2) * 255);
            const baseColor = new Color(
                toSRGB(mainColorArr[0]),
                toSRGB(mainColorArr[1]),
                toSRGB(mainColorArr[2]),
                Math.round(mainColorArr[3] * 255)
            );
            const shade1 = Array.isArray(shade1Arr) && shade1Arr.length >= 4
                ? new Color(toSRGB(shade1Arr[0]), toSRGB(shade1Arr[1]), toSRGB(shade1Arr[2]), Math.round(shade1Arr[3] * 255))
                : new Color(102, 102, 102, 255);
            const shade2 = Array.isArray(shade2Arr) && shade2Arr.length >= 4
                ? new Color(toSRGB(shade2Arr[0]), toSRGB(shade2Arr[1]), toSRGB(shade2Arr[2]), Math.round(shade2Arr[3] * 255))
                : new Color(51, 51, 51, 255);
            this.originalColors.set(index, { base: baseColor, shade1, shade2 });
        });
    }

    public damage(value: number): void {
        this.currentDurability -= value;

        if (this.currentIndex < this.materialRenders.length) {
            this.playPulseAnimation(this.currentIndex);
        }

        if (this.currentDurability <= 0 && this.currentIndex >= this.materialRenders.length -1) {           
            this.isDestoryed = true;
        }
    }

    private playPulseAnimation(index: number): void {
        const renderer = this.materialRenders[index];
        if (!renderer || !renderer.node)
            return;

        const node = this.node;
        const material = renderer.getMaterialInstance(0);
        if (!material)
            return;

        const originalWorldScale = node.worldScale.clone();
        const targetScaleFactor = this.getRandomScale();

        const cachedColors = this.originalColors.get(index);
        if (!cachedColors) {
            return;
        }

        const originalBaseColor = cachedColors.base;
        const originalShade1 = cachedColors.shade1;
        const originalShade2 = cachedColors.shade2;
        const whiteBase = new Color(255, 255, 255, originalBaseColor.a);
        const whiteShade1 = new Color(230, 230, 230, originalShade1.a);
        const whiteShade2 = new Color(200, 200, 200, originalShade2.a);
        const colorState = {
            base: originalBaseColor.clone(),
            shade1: originalShade1.clone(),
            shade2: originalShade2.clone()
        };

        const scaleState = { factor: 0 };
        const applyColors = () => {
            material.setProperty('mainColor', new Color(colorState.base.r, colorState.base.g, colorState.base.b, colorState.base.a));
            material.setProperty('shadeColor1', new Color(colorState.shade1.r, colorState.shade1.g, colorState.shade1.b, colorState.shade1.a));
            material.setProperty('shadeColor2', new Color(colorState.shade2.r, colorState.shade2.g, colorState.shade2.b, colorState.shade2.a));
        };

        const applyScale = () => {
            const newScale = originalWorldScale.clone();
            newScale.x = originalWorldScale.x * (1 + (targetScaleFactor.x - 1) * scaleState.factor);
            newScale.y = originalWorldScale.y * (1 + (targetScaleFactor.y - 1) * scaleState.factor);
            newScale.z = originalWorldScale.z * (1 + (targetScaleFactor.z - 1) * scaleState.factor);
            node.setWorldScale(newScale);
        };

        tween(node)
            .parallel(
                tween(scaleState)
                    .to(this.animationDuration / 2, { factor: 1 }, { onUpdate: applyScale })
                    .to(this.animationDuration / 2, { factor: 0 }, { onUpdate: applyScale }),
                tween(colorState)
                    .to(this.animationDuration / 2, { base: whiteBase, shade1: whiteShade1, shade2: whiteShade2 }, { onUpdate: applyColors })
                    .call(() => this.checkAndSwitchSegment())
                    .to(this.animationDuration / 2, { base: originalBaseColor, shade1: originalShade1, shade2: originalShade2 }, { onUpdate: applyColors })
            )
            .start();
    }

    private checkAndSwitchSegment(): void {
        if (this.currentDurability <= 0) {
            this.currentDurability = this.durability;
            this.currentIndex++;

            if (this.currentIndex >= this.materialRenders.length) {
                this.remove();
            } else {
                this.setSegment(this.currentIndex);
            }
        }
    }

    private setSegment(index: number): void {
        this.materialRenders.forEach((renderer, i) => {
            renderer.node.active = i === index;
        });
    }

    private getRandomScale(): Vec3 {
        return new Vec3(
            this.scaleMin + Math.random() * (this.scaleMax - this.scaleMin),
            this.scaleMin + Math.random() * (this.scaleMax - this.scaleMin),
            this.scaleMin + Math.random() * (this.scaleMax - this.scaleMin)
        );
    }

    private remove(): void {
        this.scheduleOnce(() => {
            this.node.destroy();
        }, this.animationDuration);
    }
}