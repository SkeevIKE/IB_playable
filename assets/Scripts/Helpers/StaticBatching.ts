import { _decorator, BatchingUtility, Component, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StaticBatching')
export class StaticBatching extends Component {
  @property(Node)
  private staticModelRoot = null;
  @property(Node)
  private batchedRoot = null;
  @property
  private isReceiveShadow: false = false;
  @property
  private isCastShadow: false = false;

  protected start(): void {
    if (this.staticModelRoot && this.batchedRoot) {
      const success = BatchingUtility.batchStaticModel(this.staticModelRoot, this.batchedRoot);
      if (success) {
        console.log('Static batching completed successfully!');
        const meshRender = this.batchedRoot.getComponent(MeshRenderer);
        meshRender.receiveShadow = this.isReceiveShadow ? 1 : 0;
        meshRender.shadowCastingMode = this.isCastShadow ? 1 : 0;
      } else {
        console.log('Static batching failed.');
      }
    } else {
      console.error('staticModelRoot or batchedRoot is not set!');
    }
  }
}
