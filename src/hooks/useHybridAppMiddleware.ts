import {useContext} from 'react';
import {HybridAppMiddlewareContext} from '@components/HybridAppMiddleware';

type SplashScreenHiddenContextType = {isSplashHidden: boolean};

export default function useHybridAppMiddleware() {
    const {navigateToExitUrl, showSplashScreenOnNextStart} = useContext(HybridAppMiddlewareContext);
    return {navigateToExitUrl, showSplashScreenOnNextStart};
}

export type {SplashScreenHiddenContextType};
