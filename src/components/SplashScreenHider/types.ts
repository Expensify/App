import type {ReactNode} from 'react';

type SplashScreenHiderProps = {
    /** Whether the splash screen should be hidden */
    shouldHideSplash: boolean;

    /** Splash screen has been hidden */
    onHide: () => void;
};

type SplashScreenHiderReturnType = ReactNode;

export type {SplashScreenHiderProps, SplashScreenHiderReturnType};
