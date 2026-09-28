import LoadingIndicator from '@components/LoadingIndicator';

import useThemeStyles from '@hooks/useThemeStyles';

import lazyRetry from '@src/utils/lazyRetry';

import React, {lazy, memo, Suspense} from 'react';

const AuthScreens = lazy(() => lazyRetry(() => import(/* webpackChunkName: "authScreens.prefetch" */ './AuthScreens'), 'authScreens'));
const PublicScreens = lazy(() => lazyRetry(() => import(/* webpackMode: "eager" */ './PublicScreens'), 'publicScreens'));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const styles = useThemeStyles();

    if (authenticated) {
        // Opaque because this loader covers no content: AuthScreens has not mounted yet. The shared 0.8
        // opacity lets the dark backdrop bleed into componentBG here, which reads as gray.
        return (
            <Suspense fallback={<LoadingIndicator style={styles.opacity1} />}>
                <AuthScreens />
            </Suspense>
        );
    }

    return (
        <Suspense fallback={<LoadingIndicator />}>
            <PublicScreens />
        </Suspense>
    );
}

export default memo(AppNavigator);
