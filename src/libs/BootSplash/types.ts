type VisibilityStatus = 'visible' | 'hidden';

type BootSplashModule = {
    navigationBarHeight: number;
    hide: () => Promise<void>;
    getVisibilityStatus: () => Promise<VisibilityStatus>;
};

export type {BootSplashModule, VisibilityStatus};
