import { _decorator, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { ServiceAllocator } from '../Helpers/ServiceAllocator';
import { HitsPool } from '../Pools/HitsPool';
import { IconResourcePool } from '../Pools/IconResourcePool';
import { GameScreen } from '../UI/GameScreen';
import { JoystickScreen } from '../UI/JoystickScreen';
import { Screens } from '../UI/Screens';
import { Cameras } from './Cameras';
import { Player } from './Player';
import { Resources } from './Resources';

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

  private resources: Resources = null;
  private joystickScreen: JoystickScreen = null;
  private offset: Vec2 = new Vec2();
  private isTouch: boolean = false; 
  
  protected start(): void {
    const gameScreen = this.screens.get(GameScreen);
    gameScreen.show();
    this.resources = new Resources(gameScreen);   
    ServiceAllocator.register(Cameras, this.cameras);
    ServiceAllocator.register(Resources, this.resources);
    ServiceAllocator.register(HitsPool, this.hitsPool);
    ServiceAllocator.register(IconResourcePool, this.iconResourcePool);

    this.joystickScreen = this.screens.get(JoystickScreen);
    this.cameras.getFollower.setTarget(this.player.node, true);
    this.startControls();
  }

  private startControls(): void {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  private stopControls(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
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

  private endGame(): void {
    this.gameStop();
    //  AdPlatform.gameEnded();
    //  input.on(Input.EventType.TOUCH_START, () => AdPlatform.redirectToStore(), this);
  }

  private gameStop(): void {
    this.stopControls();
    ServiceAllocator.unregister(HitsPool);
  }
}
