import { _decorator, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TrackStructure')
export class TrackStructure {
  @property
  public trackName = '';
  @property
  public volumeClip = 0.5;
  @property([AudioClip])
  public audioClip: AudioClip[] = [];

  public getAudioClip(): AudioClip {
    const randomIndex = Math.floor(Math.random() * this.audioClip.length);
    return this.audioClip[randomIndex];
  }
}
