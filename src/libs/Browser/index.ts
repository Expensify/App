import type {GetBrowser, IsIPadInDesktopMode, IsMobile, IsMobileChrome, IsMobileIOS, IsMobileSafari, IsMobileSafariOnIos26, IsMobileWebKit, IsSafari} from './types';

const getBrowser: GetBrowser = () => '';

const isMobile: IsMobile = () => false;

const isIPadInDesktopMode: IsIPadInDesktopMode = () => false;

const isMobileIOS: IsMobileIOS = () => false;

const isMobileSafari: IsMobileSafari = () => false;

const isMobileChrome: IsMobileChrome = () => false;

const isMobileWebKit: IsMobileWebKit = () => false;

const isSafari: IsSafari = () => false;

const isMobileSafariOnIos26: IsMobileSafariOnIos26 = () => false;

export {getBrowser, isMobile, isIPadInDesktopMode, isMobileIOS, isMobileSafari, isMobileWebKit, isSafari, isMobileSafariOnIos26, isMobileChrome};
