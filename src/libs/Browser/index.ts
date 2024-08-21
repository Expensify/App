import type {GetBrowser, IsChromeIOS, IsMobile, IsMobileChrome, IsMobileSafari, IsMobileWebKit, IsSafari, OpenRouteInDesktopApp} from './types';

const getBrowser: GetBrowser = () => '';

const isMobile: IsMobile = () => false;

const isMobileSafari: IsMobileSafari = () => false;

const isMobileChrome: IsMobileChrome = () => false;

const isMobileWebKit: IsMobileWebKit = () => false;

const isChromeIOS: IsChromeIOS = () => false;

const isSafari: IsSafari = () => false;

const openRouteInDesktopApp: OpenRouteInDesktopApp = () => {};

export {getBrowser, isMobile, isMobileSafari, isMobileWebKit, isSafari, isMobileChrome, isChromeIOS, openRouteInDesktopApp};
