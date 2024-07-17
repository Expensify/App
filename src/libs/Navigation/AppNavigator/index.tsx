import React, {lazy, memo, Suspense, useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry<EmptyObject>(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry<EmptyObject>(() => import('./PublicScreens')));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const initUrl = useContext(InitialURLContext);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initUrl) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(initUrl);
        });
    }, [initUrl]);

    if (authenticated) {
        // These are the protected screens and only accessible when an authToken is present
        return (
            <Suspense fallback={null}>
                <AuthScreens />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={null}>
            <PublicScreens />
        </Suspense>
    );
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
