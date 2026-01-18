import { _decorator, Color, Component, Eventify, Label, Node, Sprite, UIOpacity, Vec3 } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { UIAnimationHelper } from '../Helpers/UIAnimationHelper';
import { Cameras } from './Cameras';
const { ccclass, property } = _decorator;

@ccclass('TutorialData')
export class TutorialData {
    @property(Node)
    public target: Node = null;
    @property
    public duration: number = 3;
    @property
    public text: string = '';
    @property(Color)
    public backgroundColor: Color = Color.GREEN;
    @property
    public isOffset: boolean = true;
    @property
    public isNextTutorial: boolean = false;
}

@ccclass('Tutorials')
export class Tutorials extends Eventify(Component) {
    public readonly TUTORIAL_COMPLETED = 'tutorial-completed';

    @property(Node)
    private tutorialRoot: Node = null;
    @property(Label)
    private tutorialLabel: Label = null;
    @property(Sprite)
    private tutorialSprite: Sprite = null;
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;
    @property
    private fadeDuration: number = 0.15;
    @property(TutorialData)
    private wrongToolInfoData: TutorialData = null;
    @property(TutorialData)
    private tutorialDatas: TutorialData[] = [];

    private currentTutorialIndex: number = 0;
    private isShowingWrongInfo: boolean = false;

    protected start(): void {
        if (!this.uiOpacity)
            return;

        this.uiOpacity.opacity = 0;
        this.uiOpacity.node.setScale(Vec3.ZERO);
    }

    public nextTutorial(): void {
        const targetData = this.getCurrentTutorialData();
        if (!targetData)
            return;

        this.updateCamera(targetData);
        this.displayTutorial(targetData);
    }

    public showWrongToolInfo(worldPosition: Vec3): void {
        this.unschedule(this.hideUI);
        this.isShowingWrongInfo = true;
        this.displayInfo(worldPosition, this.wrongToolInfoData);
    }

    private getCurrentTutorialData(): TutorialData | null {
        return this.tutorialDatas[this.currentTutorialIndex] || null;
    }

    private updateCamera(tutorialData: TutorialData): void {
        const follower = ServiceAllocator.get(Cameras).getFollower;
        follower?.setTarget(tutorialData.target, tutorialData.isOffset);
    }

    private displayTutorial(tutorialData: TutorialData): void {
        this.isShowingWrongInfo = false;
        this.displayInfo(tutorialData.target.worldPosition, tutorialData);
        this.currentTutorialIndex++;
    }

    private displayInfo(worldPosition: Vec3, tutorialData: TutorialData): void {
        this.updateUIPosition(worldPosition);
        this.updateUIContent(tutorialData);
        this.showUIWithAnimation();
        this.scheduleHideUI(tutorialData.duration);
    }

    private updateUIPosition(worldPosition: Vec3): void {
        this.tutorialRoot.setWorldPosition(worldPosition);
    }

    private updateUIContent(tutorialData: TutorialData): void {
        this.tutorialLabel.string = tutorialData.text;
        this.tutorialSprite.color = tutorialData.backgroundColor;
    }

    private showUIWithAnimation(): void {
        UIAnimationHelper.showUI(this.uiOpacity, this.fadeDuration);
    }

    private scheduleHideUI(duration: number): void {
        this.scheduleOnce(() => this.hideUI(), duration);
    }

    private hideUI(): void {
        UIAnimationHelper.hideUI(this.uiOpacity, this.fadeDuration);
        this.onTutorialEnd();
    }

    private onTutorialEnd(): void {
        if (this.isShowingWrongInfo) {
            return;
        }

        if (this.shouldShowNextTutorial()) {
            this.nextTutorial();
        } else {
            this.emit(this.TUTORIAL_COMPLETED);
        }
    }

    private shouldShowNextTutorial(): boolean {
        const previousData = this.tutorialDatas[this.currentTutorialIndex - 1];
        return previousData?.isNextTutorial ?? false;
    }
}