import type {ReactNode} from 'react';

type SplashScreenHiderProps = {
    /** Splash screen has been hidden */
    onHide: () => void;
};

type SplashScreenHiderReturnType = ReactNode;

export type {SplashScreenHiderProps, SplashScreenHiderReturnType};
