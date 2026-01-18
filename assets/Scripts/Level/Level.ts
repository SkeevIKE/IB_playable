import { _decorator, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { Audio } from '../Audio/Audio';
import { AdPlatform } from '../Helpers/AdPlatform';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { HitsPool } from '../Pools/HitsPool';
import { IconResourcePool } from '../Pools/IconResourcePool';
import { GameScreen } from '../UI/GameScreen';
import { JoystickScreen } from '../UI/JoystickScreen';
import { Screens } from '../UI/Screens';
import { TutorialJoystickScreen } from '../UI/TutorialJoystickScreen';
import { Cameras } from './Cameras';
import { MaterialSource } from './MaterialSource';
import { Player } from './Player';
import { Resources } from './Resources';
import { Tutorials } from './Tutorials';
import { WeaponTier } from './Weapon';

const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {
  @property(Screens)
  private screens: Screens;
  @property(Player)
  private player: Player = null;
  @property(Cameras)
  private cameras: Cameras = null;
  @property(HitsPool)
  private hitsPool: HitsPool = null;
  @property(IconResourcePool)
  private iconResourcePool: IconResourcePool = null;
  @property(Tutorials)
  private tutorials: Tutorials = null;
  @property(MaterialSource)
  private gateMaterialSource: MaterialSource = null;

  private resources: Resources = null;
  private joystickScreen: JoystickScreen = null;
  private offset: Vec2 = new Vec2();
  private isTouch: boolean = false;

  protected start(): void {
    const gameScreen = this.screens.get(GameScreen);
    gameScreen.show();
    this.resources = new Resources(gameScreen);
    this.resources.addEventListener(this.resources.TIER_ONE_WEAPON_UPGRADED, this.onWeaponUpgaraded);
    this.resources.addEventListener(this.resources.TIER_TWO_WEAPON_UPGRADED, this.onWeaponUpgaraded);
    this.resources.addEventListener(this.resources.WOOD_COLLECTED, this.onWoodCollected);
    ServiceAllocator.register(Cameras, this.cameras);
    ServiceAllocator.register(Resources, this.resources);
    ServiceAllocator.register(HitsPool, this.hitsPool);
    ServiceAllocator.register(IconResourcePool, this.iconResourcePool);
    ServiceAllocator.register(Tutorials, this.tutorials);

    this.joystickScreen = this.screens.get(JoystickScreen);
    this.cameras.getFollower.initializeOffset();
    this.cameras.getFollower.setTarget(this.player.node, true);
    this.scheduleOnce(this.showNextTutorial, 2);
    this.gateMaterialSource.once(this.gateMaterialSource.MATERIAL_SOURCE_DESTROYED, this.endGame, this);
  }

  private showNextTutorial = (): void => {
    this.stopControls();
    this.onTouchEnd(null);
    this.tutorials.nextTutorial();
    this.tutorials.once(this.tutorials.TUTORIAL_COMPLETED, this.endTutorial, this);
  }

  private endTutorial(): void {
    this.startControls();
    this.cameras.getFollower.setTarget(this.player.node, true);
    this.screens.get(TutorialJoystickScreen).show(0.3);
  }

  private onWoodCollected = (): void => {
    this.resources.removeEventListener(this.resources.WOOD_COLLECTED, this.onWoodCollected);
    this.showNextTutorial();
  }

  private startControls(): void {
    input.once(Input.EventType.TOUCH_START, this.startGameplay, this);
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private stopControls(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private startGameplay(): void {
    this.screens.get(TutorialJoystickScreen).hide(0.3);
    Audio.instance.playLoopBackground(`music`);
  }

  private onTouchStart(event: EventTouch): void {
    this.isTouch = true;
    this.joystickScreen.startDrag(event.getUILocation());
    this.cameras.getCameraFOV.zoomOut();
  }

  private onTouchMove(event: EventTouch): void {
    if (!this.isTouch) {
      return;
    }

    this.joystickScreen.drag(event.getUILocation());
    event.getUIOffset(this.offset);

    const cameraAngle = this.cameras.getCameraFOV.getCameraAngle();
    this.player.move(this.offset, cameraAngle);
  }

  private onTouchEnd(_: EventTouch): void {
    this.isTouch = false;
    this.joystickScreen.endDrag();
    this.player.stopMoving();
    this.cameras.getCameraFOV.resetZoom();
  }

  private onWeaponUpgaraded = (event: CustomEvent): void => {
    const weaponTier = event.detail as WeaponTier;
    this.player.setWeapon(weaponTier);
    switch (weaponTier) {
      case WeaponTier.Standard:
        this.resources.removeEventListener(this.resources.TIER_ONE_WEAPON_UPGRADED, this.onWeaponUpgaraded);
        break;
      case WeaponTier.Elite:
        this.resources.removeEventListener(this.resources.TIER_TWO_WEAPON_UPGRADED, this.onWeaponUpgaraded);
        break;
    }
  }

  private endGame(): void {
    this.gameStop();
    this.screens.get(TutorialJoystickScreen).show(0.3);

    AdPlatform.gameEnded();
    input.on(Input.EventType.TOUCH_START, () => AdPlatform.redirectToStore(), this);
  }

  private gameStop(): void {
    this.stopControls();
    ServiceAllocator.unregister(Cameras);
    ServiceAllocator.unregister(Resources);
    ServiceAllocator.unregister(HitsPool);
    ServiceAllocator.unregister(IconResourcePool);
    ServiceAllocator.unregister(Tutorials);
  }
}
