import React, {lazy, memo, Suspense} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import lazyRetry from '@src/utils/lazyRetry';

const AuthScreens = lazy(() => lazyRetry(() => import('./AuthScreens')));
const PublicScreens = lazy(() => lazyRetry(() => import('./PublicScreens')));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    if (authenticated) {
        // These are the protected screens and only accessible when an authToken is present
        return (
            <Suspense fallback={<FullScreenLoadingIndicator />}>
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

export default memo(AppNavigator);
