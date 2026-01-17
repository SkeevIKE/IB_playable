import { _decorator, Color, Component, MeshRenderer, Node, tween, Vec3 } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { IDamageable } from '../Interfaces/IDamageable';
import { IconResourcePool } from '../Pools/IconResourcePool';
import { DamageText } from '../UI/DamageText';
import { Lifebar } from '../UI/Lifebar';
import { WeaponTier } from './Weapon';
const { ccclass, property } = _decorator;

@ccclass('MaterialSource')
export class MaterialSource extends Component implements IDamageable {
    @property(Node)
    private transformGroup: Node = null;
    @property(Lifebar)
    private lifebar: Lifebar = null;
    @property(DamageText)
    private damageText: DamageText = null;   
    @property({ type: WeaponTier })
    private tierRequired: WeaponTier = WeaponTier.Basic;
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
    @property
    private jumpHeightMin: number = 0.1;
    @property
    private jumpHeightMax: number = 0.3;
    @property
    private rotationAngleXMin: number = 10;
    @property
    private rotationAngleXMax: number = 20;
    @property
    private rotationAngleZMin: number = 10;
    @property
    private rotationAngleZMax: number = 20;

    private currentDurability: number = 3;
    private currentIndex: number = 0;
    private originalColors: Map<number, { base: Color, shade1: Color, shade2: Color }> = new Map();
    private isDestoryed: boolean = false;

    public isActive(): boolean {
        return this.isDestoryed === false;
    }

    public getPosition(): Vec3 {
        return this.node.getWorldPosition();
    }

    protected start(): void {
        this.currentDurability = this.durability;
        this.cacheAllOriginalColors();
        this.setSegment(this.currentIndex);
        this.initializeLifebar();
    }

    private initializeLifebar(): void {
        if (!this.lifebar) {
            return;
        }

        this.lifebar.initialization(this.durability, this.durability);
    }

    private getCurrentHealth(): number {
        return this.currentDurability;
    }

    private updateLifebar(): void {
        if (!this.lifebar) {
            return;
        }

        const currentHealth = this.getCurrentHealth();
        this.lifebar.setValue(currentHealth, true);
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

    public damage(value: number, weaponTier: WeaponTier = WeaponTier.Basic): void {
        const oldIndex = this.calculateSegmentIndex();
        
        if (oldIndex < this.materialRenders.length) {
            this.playPulseAnimation(oldIndex);
        }

        if (weaponTier !== this.tierRequired) {
            return;
        }

        this.currentDurability -= value;
        if (this.currentDurability < 0) {
            this.currentDurability = 0;
        }
        this.updateLifebar();

        if (this.currentDurability <= 0) {
            const segmentHealth = Math.ceil(this.durability / this.materialRenders.length);
            this.spawnResourceIcon(segmentHealth);
            
            this.isDestoryed = true;
            this.remove();
        }
    }

    private playPulseAnimation(index: number): void {
        const renderer = this.materialRenders[index];
        if (!renderer || !renderer.node)
            return;
       
        const animNode = this.transformGroup ? this.transformGroup : this.node;
        const material = renderer.getMaterialInstance(0);
        if (!material)
            return;

        const originalWorldScale = animNode.worldScale.clone();
        const originalPosition = animNode.position.clone();
        const originalRotation = animNode.eulerAngles.clone();
        const targetScaleFactor = this.getRandomScale();
        const randomJumpHeight = this.jumpHeightMin + Math.random() * (this.jumpHeightMax - this.jumpHeightMin);
        const randomRotationX = this.rotationAngleXMin + Math.random() * (this.rotationAngleXMax - this.rotationAngleXMin);
        const randomRotationZ = this.rotationAngleZMin + Math.random() * (this.rotationAngleZMax - this.rotationAngleZMin);

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
        const jumpState = { height: 0 };
        const rotationState = { angleX: 0, angleZ: 0 };

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
            animNode.setWorldScale(newScale);
        };

        const applyJump = () => {
            const newPosition = originalPosition.clone();
            newPosition.y = originalPosition.y + jumpState.height;
            animNode.setPosition(newPosition);
        };

        const applyRotation = () => {
            const newRotation = originalRotation.clone();
            newRotation.x = originalRotation.x + rotationState.angleX;
            newRotation.z = originalRotation.z + rotationState.angleZ;
            animNode.setRotationFromEuler(newRotation.x, newRotation.y, newRotation.z);
        };

        tween(animNode)
            .parallel(
                tween(scaleState)
                    .to(this.animationDuration / 2, { factor: 1 }, { onUpdate: applyScale, easing: 'backOut' })
                    .to(this.animationDuration / 2, { factor: 0 }, { onUpdate: applyScale, easing: 'backIn' }),
                tween(jumpState)
                    .to(this.animationDuration / 2, { height: randomJumpHeight }, { onUpdate: applyJump, easing: 'sineOut' })
                    .to(this.animationDuration / 2, { height: 0 }, { onUpdate: applyJump, easing: 'sineIn' }),
                tween(rotationState)
                    .to(this.animationDuration / 2, { angleX: randomRotationX, angleZ: randomRotationZ }, { onUpdate: applyRotation, easing: 'backOut' })
                    .to(this.animationDuration / 2, { angleX: 0, angleZ: 0 }, { onUpdate: applyRotation, easing: 'backIn' }),
                tween(colorState)
                    .to(this.animationDuration / 2, { base: whiteBase, shade1: whiteShade1, shade2: whiteShade2 }, { onUpdate: applyColors, easing: 'sineOut' })
                    .call(() => this.checkAndSwitchSegment())
                    .to(this.animationDuration / 2, { base: originalBaseColor, shade1: originalShade1, shade2: originalShade2 }, { onUpdate: applyColors, easing: 'sineIn' })
            )
            .start();
    }

    private checkAndSwitchSegment(): void {
        const newIndex = this.calculateSegmentIndex();
        
        if (newIndex !== this.currentIndex) {
            const segmentHealth = Math.ceil(this.durability / this.materialRenders.length);
            this.spawnResourceIcon(segmentHealth);
            
            this.currentIndex = newIndex;
            this.setSegment(this.currentIndex);
        }
    }

    private spawnResourceIcon(amount: number): void {
        this.damageText.show(`${amount}`);
        const iconResource = ServiceAllocator.get(IconResourcePool)?.get();
        iconResource.show(amount, this.getPosition(), this.tierRequired);
    }

    private calculateSegmentIndex(): number {
        if (this.currentDurability <= 0) {
            return this.materialRenders.length - 1;
        }
        const healthPercent = this.currentDurability / this.durability;
        const segmentIndex = Math.floor((1 - healthPercent) * this.materialRenders.length);
        return Math.min(segmentIndex, this.materialRenders.length - 1);
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
        this.node.destroy();      
    }
}