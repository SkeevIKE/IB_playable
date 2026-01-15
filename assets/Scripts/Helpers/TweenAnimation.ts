import { Color, Label, Node, Quat, sp, Sprite, tween, TweenEasing, Vec3 } from 'cc';

export class TweenAnimation {
    
    public static moveTo(node: Node, worldPosition: Vec3, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {  
        this.stopPositionTween(node);         
        const newTween = tween(node)
            .to(time, { worldPosition }, { easing })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearPositionTweens(node);
            });
        if (!node['__positionTweens']) {
            node['__positionTweens'] = [];
        }
        node['__positionTweens'].push(newTween);
        newTween.start();
    }

    public static moveToLocal(node: Node, localPosition: Vec3, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopLocalPositionTween(node);
        const newTween = tween(node)
            .to(time, { position: localPosition }, { easing })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearLocalPositionTweens(node);
            });
        if (!node['__localPositionTweens']) {
            node['__localPositionTweens'] = [];
        }
        node['__localPositionTweens'].push(newTween);
        newTween.start();
    }

    public static rotateTo(node: Node, worldRotation: Quat, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void,): void {
        this.stopRotationTween(node);
        const newTween = tween(node)
            .to(time, { worldRotation }, { easing })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearRotationTweens(node);
            });
        if (!node['__rotationTweens']) {
            node['__rotationTweens'] = [];
        }
        node['__rotationTweens'].push(newTween);
        newTween.start();
    }

    public static scaleTo( node: Node, scale: Vec3, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void,): void {
        this.stopScaleTween(node);
        const newTween = tween(node)
            .to(time, { scale }, { easing })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearScaleTweens(node);
            });
        if (!node['__scaleTweens']) {
            node['__scaleTweens'] = [];
        }
        node['__scaleTweens'].push(newTween);
        newTween.start();
    }

    public static colorToSprite(sprite: Sprite, color: Color, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopColorSpriteTween(sprite);
        const startColor = sprite.color;
        const newTween = tween({
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startColor.a
        })
            .to(time, {
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a
            }, {
                easing,
                onUpdate: (target: { r: number, g: number, b: number, a: number }) => {
                    sprite.color = new Color(target.r, target.g, target.b, target.a);
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearColorSpriteTweens(sprite);
            });
        if (!sprite['__colorSpriteTweens']) {
            sprite['__colorSpriteTweens'] = [];
        }
        sprite['__colorSpriteTweens'].push(newTween);
        newTween.start();
    }

    public static fadeToSprite(sprite: Sprite, opacity: number, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopFadeSpriteTween(sprite);
        const startOpacity = sprite.color.a;
        const newTween = tween({ opacity: startOpacity })
            .to(time, { opacity }, {
                easing,
                onUpdate: (target: { opacity: number }) => {
                    const color = sprite.color;
                    sprite.color = new Color(color.r, color.g, color.b, target.opacity);
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearFadeSpriteTweens(sprite);
            });
        if (!sprite['__fadeSpriteTweens']) {
            sprite['__fadeSpriteTweens'] = [];
        }
        sprite['__fadeSpriteTweens'].push(newTween);
        newTween.start();
    }

    public static fadeToSkeleton(skeleton: sp.Skeleton, opacity: number, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopFadeSkeletonTween(skeleton);
        const currentColor = skeleton.color;
        const startOpacity = currentColor.a / 255;
        const newTween = tween({ opacity: startOpacity })
            .to(time, { opacity }, {
                easing,
                onUpdate: (target: { opacity: number }) => {
                    skeleton.color = new Color(currentColor.r, currentColor.g, currentColor.b, target.opacity * 255);
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearFadeSkeletonTweens(skeleton);
            });
        if (!skeleton['__fadeSkeletonTweens']) {
            skeleton['__fadeSkeletonTweens'] = [];
        }
        skeleton['__fadeSkeletonTweens'].push(newTween);
        newTween.start();
    }
    
    public static fadeToLabel(label: Label, opacity: number, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopFadeLabelTween(label);
        const startOpacity = label.color.a;
        const newTween = tween({ opacity: startOpacity })
            .to(time, { opacity }, {
                easing,
                onUpdate: (target: { opacity: number }) => {
                    const color = label.color;
                    label.color = new Color(color.r, color.g, color.b, target.opacity);
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearFadeLabelTweens(label);
            });
        if (!label['__fadeLabelTweens']) {
            label['__fadeLabelTweens'] = [];  
        }
        label['__fadeLabelTweens'].push(newTween);
        newTween.start();
    }

    public static colorToLabel(label: Label, color: Color, time: number = 0.1, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopColorLabelTween(label);
        const startColor = label.color;
        const newTween = tween({
            r: startColor.r,
            g: startColor.g,
            b: startColor.b,
            a: startColor.a
        })
            .to(time, {
                r: color.r,
                g: color.g,
                b: color.b,
                a: color.a
            }, {
                easing,
                onUpdate: (target: { r: number, g: number, b: number, a: number }) => {
                    label.color = new Color(target.r, target.g, target.b, target.a);
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearColorLabelTweens(label);
            });
        if (!label['__colorLabelTweens']) {
            label['__colorLabelTweens'] = [];
        }
        label['__colorLabelTweens'].push(newTween);
        newTween.start();
    }

    public static numberTo(targetObj: any, propertyKey: string, targetValue: number, time: number = 0.1, easing: TweenEasing = 'sineOut', onUpdate?: (value: number) => void, onComplete?: () => void): void {
        if (typeof targetObj[propertyKey] !== 'number') {
            console.warn(`Property ${propertyKey} is not a number on the target object.`);
            return;
        }
        this.stopNumberTween(targetObj, propertyKey);
        const startValue = targetObj[propertyKey];
        const newTween = tween({ value: startValue })
            .to(time, { value: targetValue }, {
                easing,
                onUpdate: (tweenObj: { value: number }) => {
                    targetObj[propertyKey] = tweenObj.value;
                    if (onUpdate) {
                        onUpdate(tweenObj.value);
                    }
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearNumberTweens(targetObj, propertyKey);
            });
        const tweenKey = `__numberTweens_${propertyKey}`;
        if (!targetObj[tweenKey]) {
            targetObj[tweenKey] = [];
        }
        targetObj[tweenKey].push(newTween);
        newTween.start();
    }

     public static fillRangeToSprite(sprite: Sprite, targetFillRange: number, time: number = 0.5, easing: TweenEasing = 'sineOut', onComplete?: () => void): void {
        this.stopFillRangeSpriteTween(sprite);
        const startFillRange = sprite.fillRange || 0;
        
        const newTween = tween({ fillRange: startFillRange })
            .to(time, { fillRange: targetFillRange }, {
                easing,
                onUpdate: (target: { fillRange: number }) => {
                    sprite.fillRange = target.fillRange;
                }
            })
            .call(() => {
                if (onComplete) {
                    onComplete();
                }
                this.clearFillRangeSpriteTweens(sprite);
            });
            
        if (!sprite['__fillRangeSpriteTweens']) {
            sprite['__fillRangeSpriteTweens'] = [];
        }
        sprite['__fillRangeSpriteTweens'].push(newTween);
        newTween.start();
    }

    public static stopPositionTween(node: Node): void {
        if (node['__positionTweens']) {
            for (const positionTween of node['__positionTweens']) {
                positionTween.stop();
            }
            this.clearPositionTweens(node);
        }
    }

    public static stopLocalPositionTween(node: Node): void {
        if (node['__localPositionTweens']) {
            for (const localPositionTween of node['__localPositionTweens']) {
                localPositionTween.stop();
            }
            this.clearLocalPositionTweens(node);
        }
    }

    public static stopRotationTween(node: Node): void {
        if (node['__rotationTweens']) {
            for (const rotationTween of node['__rotationTweens']) {
                rotationTween.stop();
            }
            this.clearRotationTweens(node);
        }
    }

    public static stopScaleTween(node: Node): void {
        if (node['__scaleTweens']) {
            for (const scaleTween of node['__scaleTweens']) {
                scaleTween.stop();
            }
            this.clearScaleTweens(node);
        }
    } 

    public static stopColorSpriteTween(sprite: Sprite): void {
        if (sprite['__colorSpriteTweens']) {
            for (const colorTween of sprite['__colorSpriteTweens']) {
                colorTween.stop();
            }
            this.clearColorSpriteTweens(sprite);
        }
    }

     public static stopFadeSpriteTween(sprite: Sprite): void {
        if (sprite['__fadeSpriteTweens']) {
            for (const fadeTween of sprite['__fadeSpriteTweens']) {
                fadeTween.stop();
            }
            this.clearFadeSpriteTweens(sprite);
        }
    }

    public static stopFadeSkeletonTween(skeleton: sp.Skeleton): void {
        if (skeleton['__fadeSkeletonTweens']) {
            for (const fadeTween of skeleton['__fadeSkeletonTweens']) {
                fadeTween.stop();
            }
            this.clearFadeSkeletonTweens(skeleton);
        }
    }

    public static stopFadeLabelTween(label: Label): void {
        if (label['__fadeLabelTweens']) {
            for (const fadeTween of label['__fadeLabelTweens']) {
                fadeTween.stop();
            }
            this.clearFadeLabelTweens(label);
        }
    }

    public static stopColorLabelTween(label: Label): void {
        if (label['__colorLabelTweens']) {
            for (const colorTween of label['__colorLabelTweens']) {
                colorTween.stop();
            }
            this.clearColorLabelTweens(label);
        }
    }

    public static stopNumberTween(targetObj: any, propertyKey: string): void {
        const tweenKey = `__numberTweens_${propertyKey}`;
        if (targetObj[tweenKey]) {
            for (const numberTween of targetObj[tweenKey]) {
                numberTween.stop();
            }
            this.clearNumberTweens(targetObj, propertyKey);
        }
    }

    public static stopFillRangeSpriteTween(sprite: Sprite): void {
        if (sprite['__fillRangeSpriteTweens']) {
            for (const fillRangeTween of sprite['__fillRangeSpriteTweens']) {
                fillRangeTween.stop();
            }
            this.clearFillRangeSpriteTweens(sprite);
        }
    }

    public static stopAllTweens(node: Node): void {
        this.stopPositionTween(node);
        this.stopLocalPositionTween(node);
        this.stopRotationTween(node);
        this.stopScaleTween(node);
        const sprite = node.getComponent(Sprite);
        if (sprite){
            this.stopFadeSpriteTween(sprite);
            this.stopFillRangeSpriteTween(sprite);
            this.stopColorSpriteTween(sprite);
        }

        const skeleton = node.getComponent(sp.Skeleton);
        if (skeleton) {
            this.stopFadeSkeletonTween(skeleton);
        }

        const label = node.getComponent(Label);
        if (label) {
            this.stopFadeLabelTween(label);
            this.stopColorLabelTween(label);
        }
    }    

    private static clearPositionTweens(node: Node): void {
        node['__positionTweens'] = [];
    }

    private static clearLocalPositionTweens(node: Node): void {
        node['__localPositionTweens'] = [];
    }

    private static clearRotationTweens(node: Node): void {
        node['__rotationTweens'] = [];
    }

    private static clearScaleTweens(node: Node): void {
        node['__scaleTweens'] = [];
    }

    private static clearColorSpriteTweens(sprite: Sprite): void {
        sprite['__colorSpriteTweens'] = [];
    }

    private static clearFadeSpriteTweens(sprite: Sprite): void {
        sprite['__fadeSpriteTweens'] = [];
    }
    
    private static clearFadeSkeletonTweens(skeleton: sp.Skeleton): void {
        skeleton['__fadeSkeletonTweens'] = [];
    }

    private static clearFadeLabelTweens(label: Label): void {
        label['__fadeLabelTweens'] = [];
    }

    private static clearColorLabelTweens(label: Label): void {
        label['__colorLabelTweens'] = [];
    }

    private static clearNumberTweens(targetObj: any, propertyKey: string): void {
        const tweenKey = `__numberTweens_${propertyKey}`;
        targetObj[tweenKey] = [];
    }

    private static clearFillRangeSpriteTweens(sprite: Sprite): void {
        sprite['__fillRangeSpriteTweens'] = [];
    }}