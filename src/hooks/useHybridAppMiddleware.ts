import {useContext} from 'react';
import {HybridAppMiddlewareContext} from '@components/HybridAppMiddleware';

type SplashScreenHiddenContextType = {isSplashHidden: boolean};

export default function useHybridAppMiddleware() {
    const {showSplashScreenOnNextStart} = useContext(HybridAppMiddlewareContext);
    return showSplashScreenOnNextStart;
}

export type {SplashScreenHiddenContextType};
