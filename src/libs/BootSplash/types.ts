type VisibilityStatus = 'visible' | 'hidden';

type BootSplashModule = {
    logoSizeRatio: number;
    navigationBarHeight: number;
    hide: () => Promise<void>;
    getVisibilityStatus: () => Promise<VisibilityStatus>;
    closeReactNativeApp: () => Promise<void>;
};

export type {BootSplashModule, VisibilityStatus};
