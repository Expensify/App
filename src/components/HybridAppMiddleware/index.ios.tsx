import type React from 'react';
import {useEffect} from 'react';
import {NativeEventEmitter, NativeModules} from 'react-native';
import type {NativeModule} from 'react-native';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';

type HybridAppMiddlewareProps = {
    authenticated: boolean;
    children: React.ReactNode;
};

function HybridAppMiddleware({children}: HybridAppMiddlewareProps) {
    const {setSplashScreenState} = useSplashScreenStateContext();

    // In iOS, the HybridApp defines the `onReturnToOldDot` event.
    // If we frequently transition from OldDot to NewDot during a single app lifecycle,
    // we need to artificially display the bootsplash since the app is booted only once.
    // Therefore, splashScreenState needs to be updated at the appropriate time.
    useEffect(() => {
        if (!NativeModules.HybridAppModule) {
            return;
        }
        const HybridAppEvents = new NativeEventEmitter(NativeModules.HybridAppModule as unknown as NativeModule);
        const listener = HybridAppEvents.addListener(CONST.EVENTS.ON_RETURN_TO_OLD_DOT, () => {
            Log.info('[HybridApp] `onReturnToOldDot` event received. Resetting state of HybridAppMiddleware', true);
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.VISIBLE);
        });

        return () => {
            listener.remove();
        };
    }, [setSplashScreenState]);

    return children;
}

HybridAppMiddleware.displayName = 'HybridAppMiddleware';

export default HybridAppMiddleware;
