import { _decorator, Component } from 'cc';
import { TrackStructure } from './TrackStructure';
const { ccclass, property } = _decorator;

@ccclass('Tracks')
export class Tracks extends Component {
  @property({
    serializable: true,
    type: [TrackStructure],
    tooltip: 'TrackListPls',
  })
  public trackList: TrackStructure[] = [];
}
