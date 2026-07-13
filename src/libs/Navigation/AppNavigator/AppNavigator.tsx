import LoadingIndicator from '@components/LoadingIndicator';

import lazyRetry from '@src/utils/lazyRetry';

import React, {lazy, memo, Suspense} from 'react';

const AuthScreens = lazy(() => lazyRetry(() => import(/* webpackChunkName: "authScreens.prefetch" */ './AuthScreens'), 'authScreens'));
const PublicScreens = lazy(() => lazyRetry(() => import(/* webpackMode: "eager" */ './PublicScreens'), 'publicScreens'));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    if (authenticated) {
        // Protected screens, only accessible with an authToken. Show a loader (not a blank
        // screen) while the lazy AuthScreens chunk downloads during the sign-in swap.
        return (
            <Suspense fallback={<LoadingIndicator reasonAttributes={{context: 'AppNavigator.AuthScreens'}} />}>
                <AuthScreens />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<LoadingIndicator reasonAttributes={{context: 'AppNavigator.PublicScreens'}} />}>
            <PublicScreens />
        </Suspense>
    );
}

export default memo(AppNavigator);
