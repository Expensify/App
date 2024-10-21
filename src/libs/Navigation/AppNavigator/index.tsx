import React, {lazy, memo, Suspense, useEffect, useState} from 'react';
import {preload, register} from 'react-native-bundle-splitter';
import lazyRetry, {retryImport} from '@src/utils/lazyRetry';

const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

const AUTH_SCREENS = 'AuthScreens';
const AuthScreens = register({
    name: AUTH_SCREENS,
    loader: () => retryImport(() => import('./AuthScreens')),
});

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const [canNavigateToProtectedRoutes, setNavigateToProtectedRoutes] = useState(false);

    useEffect(() => {
        // Preload Auth Screens in advance to be sure that navigator can be mounted synchronously
        // to avoid problems described in https://github.com/Expensify/App/issues/44600
        preload()
            .component(AUTH_SCREENS)
            .then(() => {
                setNavigateToProtectedRoutes(true);
            });
    }, []);

    if (authenticated && canNavigateToProtectedRoutes) {
        // These are the protected screens and only accessible when an authToken is present
        // Navigate to them only when route is preloaded
        return <AuthScreens />;
    }

    return (
        <Suspense fallback={null}>
            <PublicScreens />
        </Suspense>
    );
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
