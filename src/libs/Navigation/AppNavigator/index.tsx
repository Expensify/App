import React, {lazy, memo, Suspense, useCallback, useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import HybridAppMiddleware from '@components/HybridAppMiddleware';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));
const HybridAppPublicScreens = lazy(() => lazyRetry(() => import('./HybridAppPublicScreens')));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const initUrl = useContext(InitialURLContext);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initUrl || !initUrl.includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(initUrl);
        });
    }, [initUrl]);

    const CurrentNavigator = useCallback(() => {
        if (authenticated) {
            // These are the protected screens and only accessible when an authToken is present
            return (
                <Suspense fallback={null}>
                    <AuthScreens />
                </Suspense>
            );
        }

        return <Suspense fallback={null}>{NativeModules.HybridAppModule ? <HybridAppPublicScreens /> : <PublicScreens />}</Suspense>;
    }, [authenticated]);

    // HybridAppMiddleware handles communication between OldDot and NewDot
    if (NativeModules.HybridAppModule) {
        return (
            <HybridAppMiddleware authenticated={authenticated}>
                <CurrentNavigator />
            </HybridAppMiddleware>
        );
    }

    return <CurrentNavigator />;
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
