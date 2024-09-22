type BrowserInfo = {
  name: string | null;
  version: number | null;
  os: string | null;
  osVersion: number | string | null;
  touch: boolean | null;
  mobile: boolean | null;
  _canUse: HTMLElement | null;
  canUse: (feature: string) => boolean;
  init: () => void;
};

const browser: BrowserInfo = {
  name: null,
  version: null,
  os: null,
  osVersion: null,
  touch: null,
  mobile: null,
  _canUse: null,
  canUse(feature: string): boolean {
      if (!this._canUse) {
          this._canUse = document.createElement('div');
      }

      const style = this._canUse.style;
      const featureCapitalized = feature.charAt(0).toUpperCase() + feature.slice(1);

      return feature in style ||
          `Moz${featureCapitalized}` in style ||
          `Webkit${featureCapitalized}` in style ||
          `O${featureCapitalized}` in style ||
          `ms${featureCapitalized}` in style;
  },
  init() {
      const userAgent = navigator.userAgent;
      let name: string | null = 'other';
      let version: number | null = 0;
      const browsers: [string, RegExp][] = [
          ['firefox', /Firefox\/([0-9\.]+)/],
          ['bb', /BlackBerry.+Version\/([0-9\.]+)/],
          ['bb', /BB[0-9]+.+Version\/([0-9\.]+)/],
          ['opera', /OPR\/([0-9\.]+)/],
          ['opera', /Opera\/([0-9\.]+)/],
          ['edge', /Edge\/([0-9\.]+)/],
          ['safari', /Version\/([0-9\.]+).+Safari/],
          ['chrome', /Chrome\/([0-9\.]+)/],
          ['ie', /MSIE ([0-9]+)/],
          ['ie', /Trident\/.+rv:([0-9]+)/]
      ];

      for (const [browserName, regex] of browsers) {
          const match = userAgent.match(regex);
          if (match) {
              name = browserName;
              version = parseFloat(match[1]);
              break;
          }
      }

      this.name = name;
      this.version = version;

      let os: string | null = 'other';
      let osVersion: number | string | null = null;
      const osList: [string, RegExp, ((match: string) => string | number) | null][] = [
          ['ios', /([0-9_]+) like Mac OS X/, (match) => match.replace(/_/g, '.')], 
          ['ios', /CPU like Mac OS X/, () => 0],
          ['wp', /Windows Phone ([0-9\.]+)/, null],
          ['android', /Android ([0-9\.]+)/, null],
          ['mac', /Macintosh.+Mac OS X ([0-9_]+)/, (match) => match.replace(/_/g, '.')], 
          ['windows', /Windows NT ([0-9\.]+)/, null],
          ['bb', /BlackBerry.+Version\/([0-9\.]+)/, null],
          ['bb', /BB[0-9]+.+Version\/([0-9\.]+)/, null],
          ['linux', /Linux/, null],
          ['bsd', /BSD/, null],
          ['unix', /X11/, null]
      ];

      for (const [osName, regex, transform] of osList) {
          const match = userAgent.match(regex);
          if (match) {
              os = osName;
              osVersion = transform ? transform(match[1]) : parseFloat(match[1]);
              break;
          }
      }

      // Special case for iOS detection on certain devices
      if (os === 'mac' && 'ontouchstart' in window && (
          (screen.width === 1024 && screen.height === 1366) ||
          (screen.width === 834 && screen.height === 1112) ||
          (screen.width === 810 && screen.height === 1080) ||
          (screen.width === 768 && screen.height === 1024)
      )) {
          os = 'ios';
      }

      this.os = os;
      this.osVersion = osVersion;
      this.touch = os === 'wp' ? navigator.maxTouchPoints > 0 : 'ontouchstart' in window;
      this.mobile = os === 'wp' || os === 'android' || os === 'ios' || os === 'bb';
  }
};

browser.init();

export default browser;
