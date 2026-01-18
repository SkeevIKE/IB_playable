import { _decorator, AudioSource, Component } from 'cc';
import { Tracks } from './Tracks';
const { ccclass, property } = _decorator;
declare const window: any;
declare const Luna: any; // eslint-disable-line @typescript-eslint/naming-convention
declare const dapi: any;
declare const mraid: any;

@ccclass('Audio')
export class Audio extends Component {
  public static instance: Audio;

  @property({ type: Tracks, tooltip: 'Tracks' })
  public tracks: Tracks;
  @property(AudioSource)
  private musicSource: AudioSource;
  @property(AudioSource)
  private soundSource: AudioSource;
  @property(AudioSource)
  private loopSource: AudioSource;
  @property(AudioSource)
  private soundOneShotSource: AudioSource;
  @property
  private volumeMusic = 1;
  @property
  private volumeSound = 1;

  private firstClickMuteMultiplier = 0;
  private muteMultiplier = 1;
  private currentMusicTrack;
  private currentSoundTrack;
  private currentLoopTrack;
  private currentOneShotTrack;

  public playSound(trackName: string): void {
    const track = this.tracks.trackList.find(x => x.trackName === trackName);
    this.currentSoundTrack = track;
    this.soundSource.volume = this.calculateVolume(track.volumeClip, this.volumeSound);
    this.soundSource.clip = track.getAudioClip();
    this.soundSource.play();
  }

  public playSoundOneShot(trackName: string): void {
    const track = this.tracks.trackList.find(x => x.trackName === trackName);
    this.currentOneShotTrack = track;
    this.soundOneShotSource.volume = this.calculateVolume(track.volumeClip, this.volumeSound);
    this.soundOneShotSource.playOneShot(track.getAudioClip(), this.volumeSound);
  }

  public playLoopBackground(trackName: string): void {
    const track = this.tracks.trackList.find(x => x.trackName === trackName);
    this.currentMusicTrack = track;
    this.musicSource.stop();
    this.musicSource.volume = this.calculateVolume(track.volumeClip, this.volumeMusic);
    this.musicSource.clip = track.getAudioClip();
    this.musicSource.play();
  }

  public stopLoopBackground(): void {
    this.musicSource.stop();
  }

  public playLoopSound(trackName: string): void {
    const track = this.tracks.trackList.find(x => x.trackName === trackName);
    this.currentLoopTrack = track;
    this.loopSource.stop();
    this.loopSource.volume = this.calculateVolume(track.volumeClip, this.volumeSound);
    this.loopSource.clip = track.getAudioClip();
    this.loopSource.play();
  }

  public stopLoopSound(): void {
    this.loopSource.stop();
  }

  public mute(): void {
    this.muteMultiplier = 0;
    this.applyVolumes();
  }

  public unmute(): void {
    this.muteMultiplier = 1;
    this.applyVolumes();
  }

  protected onLoad(): void {
    Audio.instance = this;

    
    if (typeof mraid !== 'undefined') {
      mraid.addEventListener('audioVolumeChange', audioVolumeChangeCallback);
    }

    if ('mute' in window) {
      audioVolumeChangeCallback(window.mute);
    }

    function audioVolumeChangeCallback(volume): void {
      const isAudioEnabled = !!volume;
      if (isAudioEnabled) {
        Audio.instance.unmute();
      } else {
        Audio.instance.mute();
      }
    }

    window.addEventListener(
      'pointerdown',
      () => {
        this.firstClickMuteMultiplier = 1;
        this.applyVolumes();
      },
      false
    );
  }

  protected start(): void {
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (this.currentMusicTrack !== undefined) {
      this.musicSource.volume = this.calculateVolume(
        this.currentMusicTrack.volumeClip,
        this.volumeMusic
      );
    }
    if (this.currentSoundTrack !== undefined) {
      this.soundSource.volume = this.calculateVolume(
        this.currentSoundTrack.volumeClip,
        this.volumeSound
      );
    }
    if (this.currentLoopTrack !== undefined) {
      this.loopSource.volume = this.calculateVolume(
        this.currentLoopTrack.volumeClip,
        this.volumeSound
      );
    }
    if (this.currentOneShotTrack !== undefined) {
      this.soundOneShotSource.volume = this.calculateVolume(
        this.currentOneShotTrack.volumeClip,
        this.volumeSound
      );
    }
  }

  private calculateVolume(trackVolume: number, volumeControl: number): number {
    return trackVolume * volumeControl * this.muteMultiplier * this.firstClickMuteMultiplier;
  }
}
