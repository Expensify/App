import React, {lazy, memo, Suspense, useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import usePrevious from '@hooks/usePrevious';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL} = useContext(InitialURLContext);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initialURL || !initialURL.includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(initialURL);
        });
    }, [initialURL]);

    // When switching from authenticated to not authenticated, we want to reset the navigation state
    const prevAuthenticated = usePrevious(authenticated);
    useEffect(() => {
        if (authenticated) {
            return;
        }
        if (!prevAuthenticated) {
            return;
        }

        return () => {
            // We explicitly disabled react-navigation's own mechanism to reset state when switching navigators.
            // When we sign-in we explicitly want to keep the navigation state (see #44600).
            // This is run in the cleanup to execute this once the new navigator is definitely mounted (there will be an additional render).
            Navigation.reset();
        };
    }, [authenticated, prevAuthenticated]);

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
