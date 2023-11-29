type GetBrowser = () => string;

type IsMobile = () => boolean;

type IsMobileSafari = () => boolean;

type IsMobileChrome = () => boolean;

type IsSafari = () => boolean;

type OpenRouteInDesktopApp = (shortLivedAuthToken?: string, email?: string) => void;

type IsFileCancelSupported = () => boolean;

export type {GetBrowser, IsMobile, IsMobileSafari, IsMobileChrome, IsSafari, OpenRouteInDesktopApp, IsFileCancelSupported};
