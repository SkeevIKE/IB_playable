import 'cc';

declare module 'cc' {
  interface EventTouch {
    /**
     * Gets the offset from start position to current position
     * @param out Optional Vec2 to store the result
     */
    getOffset(out?: Vec2): Vec2;
    
    /**
     * Gets the offset from start UI position to current UI position
     * @param out Optional Vec2 to store the result
     */
    getUIOffset(out?: Vec2): Vec2;  
  }
}
