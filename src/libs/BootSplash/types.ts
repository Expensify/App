type BootSplashModule = {
    logoSizeRatio: number;
    navigationBarHeight: number;
    hide: () => Promise<void>;
    reportFullyDrawn?: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {BootSplashModule};
