import type {ReactNode} from 'react';

type SplashScreenHiderProps = {
    /** Splash screen has been hidden */
    onHide: () => void;

    /** Whether the splash screen should be hidden */
    shouldHideSplash: boolean;
};

type SplashScreenHiderReturnType = ReactNode;

export type {SplashScreenHiderProps, SplashScreenHiderReturnType};
