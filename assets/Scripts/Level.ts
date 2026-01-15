import { _decorator, Component, EventTouch, Input, input, Vec2 } from 'cc';
import { CameraFOV } from './CameraFOV';
import { Follower } from './Helpers/Follower';
import { ServiceAllocator } from './Helpers/ServiceAllocator';
import { Player } from './Player';
import { JoystickScreen } from './UI/JoystickScreen';
import { Screens } from './UI/Screens';

const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {
  @property(Screens)
  private screens: Screens;

  @property(Player)
  private player: Player = null; 

  @property(CameraFOV)
  private сameraFOV: CameraFOV = null; 

  @property(Follower)
  private follower: Follower = null;  

  private offset: Vec2 = new Vec2();
  private isTouch: boolean = false;
 
  private joystickScreen: JoystickScreen = null;
 

  protected onLoad(): void {
    ServiceAllocator.register(Level, this);    
  }

  protected start(): void {   
    this.joystickScreen = this.screens.get(JoystickScreen);  
    this.follower.setTarget(this.player.node, true);
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
    this.сameraFOV.zoomOut();
  }

  private onTouchMove(event: EventTouch): void {
    if (!this.isTouch) {
      return;
    }

    this.joystickScreen.drag(event.getUILocation());
    event.getUIOffset(this.offset);
    
    const cameraAngle = this.сameraFOV.getCameraAngle();
    this.player.move(this.offset, cameraAngle); 
  }

  private onTouchEnd(_: EventTouch): void {
    this.isTouch = false;
    this.joystickScreen.endDrag();
    this.player.stopMoving();
    this.сameraFOV.resetZoom();
  }
  
  private endGame(): void {
    this.gameStop();
  //  AdPlatform.gameEnded();
  //  input.on(Input.EventType.TOUCH_START, () => AdPlatform.redirectToStore(), this);
  }

  private gameStop(): void {
    this.stopControls();   
  }
}
