type VisibilityStatus = 'visible' | 'hidden';

type BootSplashModule = {
    logoSizeRatio: number;
    navigationBarHeight: number;
    hide: () => Promise<void>;
};

export type {BootSplashModule, VisibilityStatus};
