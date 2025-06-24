type GetBrowser = () => string;

type IsMobile = () => boolean;

type IsMobileIOS = () => boolean;

type IsMobileSafari = () => boolean;

type IsMobileChrome = () => boolean;

type IsMobileWebKit = () => boolean;

type IsChromeIOS = () => boolean;

type IsSafari = () => boolean;

type IsModernSafari = () => boolean;

type OpenRouteInDesktopApp = (shortLivedAuthToken?: string, email?: string, initialRoute?: string) => void;

export type {GetBrowser, IsMobile, IsMobileIOS, IsMobileSafari, IsMobileChrome, IsMobileWebKit, IsSafari, IsModernSafari, IsChromeIOS, OpenRouteInDesktopApp};
