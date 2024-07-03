import {useContext} from 'react';
import {HybridAppMiddlewareContext} from '@components/HybridAppMiddleware';

type SplashScreenHiddenContextType = {isSplashHidden: boolean};

export default function useHybridAppMiddleware() {
    const {handleTransition, showSplashScreenOnNextStart} = useContext(HybridAppMiddlewareContext);
    return {handleTransition, showSplashScreenOnNextStart};
}

export type {SplashScreenHiddenContextType};
