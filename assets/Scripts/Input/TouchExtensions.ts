import { EventTouch, Vec2 } from 'cc';

EventTouch.prototype.getOffset = function(out?: Vec2): Vec2 {   
    out = out || new Vec2();
    this.getLocation(out);
    out.subtract(this.getStartLocation());    
    return out;   
};

EventTouch.prototype.getUIOffset = function(out?: Vec2): Vec2 {  
    out = out || new Vec2();
    this.getUILocation(out);
    out.subtract(this.getUIStartLocation());   
    return out;
};
