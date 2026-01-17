import { tween, UIOpacity, Vec3 } from 'cc';

export class UIAnimationHelper {
    public static showUI(uiOpacity: UIOpacity, fadeDuration: number): void {
        if (!uiOpacity) {
            return;
        }

        const node = uiOpacity.node;
        tween(uiOpacity)
            .to(fadeDuration, { opacity: 255 }, { easing: 'sineOut' })
            .start();
        tween(node)
            .set({ scale: Vec3.ZERO })
            .to(fadeDuration, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    public static hideUI(uiOpacity: UIOpacity, fadeDuration: number): void {
        if (!uiOpacity) {
            return;
        }

        const node = uiOpacity.node;
        tween(uiOpacity)
            .to(fadeDuration, { opacity: 0 }, { easing: 'sineIn' })
            .start();
        tween(node)
            .to(fadeDuration, { scale: Vec3.ZERO }, { easing: 'sineIn' })
            .start();
    }
}
