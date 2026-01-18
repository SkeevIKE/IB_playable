declare const window: any;
declare const super_html: any;

interface IAdInfo {
  buildMachine: string;
  platformType: string;
  link: string;
}

export const enum AdEvents { 
  Started = 'CHALLENGE_STARTED',
  Failed = 'CHALLENGE_FAILED',
  Retry = 'CHALLENGE_RETRY',
  Pass25 = 'CHALLENGE_PASS_25',
  Pass50 = 'CHALLENGE_PASS_50',
  Pass75 = 'CHALLENGE_PASS_75',
  Solved = 'CHALLENGE_SOLVED',
  EndcardShown = 'ENDCARD_SHOWN',
  Completed = 'COMPLETED',
  CtaClicked = 'CTA_CLICKED',
}

export class AdPlatform {
  private static buildTypes = {
    SUPER_HTML: 'super-html',
    NO_BUILD: 'No Build',
  };

  private static platformTypes = {
    MINTEGRAL: 'mintegral',
    UNITY: 'unity',
    APPLOVIN: 'applovin',
    GOOGLE: 'google',
    VUNGLE: 'vungle',
    IRONSOURCE: 'ironsource',
    DEVELOP: 'develop',
  };

  private static androidLink =
    'https://play.google.com/store/apps/details?id=com.idle.breaker.game';
  private static iosLink =
    'https://apps.apple.com/us/app/idle-breaker/id6448195469';

  private static hasGameEnded = false;

  public static redirectToStore(): void {
    const { buildMachine, platformType: platformType, link } = AdPlatform.getAdInfo();

    AdPlatform.logApplovinEvent(AdEvents.CtaClicked);
    if (
      buildMachine === AdPlatform.buildTypes.SUPER_HTML &&
      window.super_html !== undefined
    ) {
      if (platformType === AdPlatform.platformTypes.APPLOVIN && window.mraid === undefined) {
        window.open(link);
      } else {
        super_html.appstore_url = AdPlatform.iosLink;
        super_html.google_play_url = AdPlatform.androidLink;
        window.super_html.download(link);
      }
    } else {
      window.open(link);
    }
  }

  public static gameEnded(): void {
    if (AdPlatform.hasGameEnded) {
      console.warn('Do not call gameEnded more than once');
      return;
    }

    AdPlatform.hasGameEnded = true;
    const { platformType } = AdPlatform.getAdInfo();

    if (platformType === AdPlatform.platformTypes.MINTEGRAL) {
      window.gameEnd && window.gameEnd();
    } else {
      console.log('GameEnded');
    }

    AdPlatform.logApplovinEvent(AdEvents.Completed);
  }

  public static getAdInfo(): IAdInfo {
    let buildMachine = AdPlatform.buildTypes.NO_BUILD;
    let platform = AdPlatform.platformTypes.DEVELOP;

    if (window.super_html_channel) {
      buildMachine = AdPlatform.buildTypes.SUPER_HTML;
      platform = window.super_html_channel;
    }

    const userAgent = navigator.userAgent || navigator.vendor;
    let link = AdPlatform.iosLink;
    if (/android/i.test(userAgent)) {
      link = AdPlatform.androidLink;
    }

    return { buildMachine, platformType: platform, link };
  }

  public static logEvent(name): void {
    if (AdPlatform.getAdInfo().platformType === AdPlatform.platformTypes.DEVELOP) {
      console.log(name);
    }
  }

  public static logApplovinEvent(adEvent: AdEvents): void {
    if (typeof window.ALPlayableAnalytics != 'undefined') {
      window.ALPlayableAnalytics.trackEvent(adEvent);
    } else if (AdPlatform.getAdInfo().platformType === AdPlatform.platformTypes.DEVELOP) {
      console.log(adEvent);
    }
  }    
}
