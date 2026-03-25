import type {GetBrowser, IsChromeIOS, IsMobile, IsMobileChrome, IsMobileIOS, IsMobileSafari, IsMobileSafariOnIos26, IsMobileWebKit, IsModernSafari, IsSafari} from './types';

const getBrowser: GetBrowser = () => '';

const isMobile: IsMobile = () => false;

const isMobileIOS: IsMobileIOS = () => false;

const isMobileSafari: IsMobileSafari = () => false;

const isMobileChrome: IsMobileChrome = () => false;

const isMobileWebKit: IsMobileWebKit = () => false;

const isChromeIOS: IsChromeIOS = () => false;

const isSafari: IsSafari = () => false;

const isModernSafari: IsModernSafari = () => false;

const isMobileSafariOnIos26: IsMobileSafariOnIos26 = () => false;

export {getBrowser, isMobile, isMobileIOS, isMobileSafari, isMobileWebKit, isSafari, isModernSafari, isMobileSafariOnIos26, isMobileChrome, isChromeIOS};
