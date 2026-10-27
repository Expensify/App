import type {ReactNode} from 'react';

type SplashScreenHiderProps = {
    /** Splash screen has been hidden */
    onHide: () => void;

    shouldHideSplash: boolean;
};

type SplashScreenHiderReturnType = ReactNode;

export type {SplashScreenHiderProps, SplashScreenHiderReturnType};
