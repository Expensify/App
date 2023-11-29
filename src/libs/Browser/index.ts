import type {GetBrowser, IsFileCancelSupported, IsMobile, IsMobileChrome, IsMobileSafari, IsSafari, OpenRouteInDesktopApp} from './types';

const getBrowser: GetBrowser = () => '';

const isMobile: IsMobile = () => false;

const isMobileSafari: IsMobileSafari = () => false;

const isMobileChrome: IsMobileChrome = () => false;

const isSafari: IsSafari = () => false;

const openRouteInDesktopApp: OpenRouteInDesktopApp = () => {};

const isFileCancelSupported: IsFileCancelSupported = () => true;

export {getBrowser, isMobile, isMobileSafari, isSafari, isMobileChrome, openRouteInDesktopApp, isFileCancelSupported};
