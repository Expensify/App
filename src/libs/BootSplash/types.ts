type VisibilityStatus = 'visible' | 'hidden';

type BootSplashModule = {
    logoSizeRatio: number;
    navigationBarHeight: number;
    hide: () => Promise<void>;
    getVisibilityStatus: () => Promise<VisibilityStatus>;
};

export type {BootSplashModule, VisibilityStatus};
