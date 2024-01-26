import type {GetBrowser, IsMobile, IsMobileChrome, IsMobileSafari, IsSafari, OpenRouteInDesktopApp} from './types';

const getBrowser: GetBrowser = () => '';

const isMobile: IsMobile = () => false;

const isMobileSafari: IsMobileSafari = () => false;

const isMobileChrome: IsMobileChrome = () => false;

const isSafari: IsSafari = () => false;

const openRouteInDesktopApp: OpenRouteInDesktopApp = () => {};

export {getBrowser, isMobile, isMobileSafari, isSafari, isMobileChrome, openRouteInDesktopApp};
