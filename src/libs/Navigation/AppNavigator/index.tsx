import React, {lazy, memo, Suspense, useEffect, useState} from 'react';
import {preload, register} from 'react-native-bundle-splitter';
import lazyRetry from '@src/utils/lazyRetry';

// const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

const AuthScreens = register({
    name: 'AuthScreens',
    // TODO: add retry logic
    loader: () => import('./AuthScreens'),
});

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const [canNavigateToProtectedRoutes, setNavigateToProtectedRoutes] = useState(false);

    useEffect(() => {
        // Preload Auth Screens to be sure navigator can be mounted synchronously to avoid problems
        // described in https://github.com/Expensify/App/issues/44600
        preload()
            .component('AuthScreens')
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
