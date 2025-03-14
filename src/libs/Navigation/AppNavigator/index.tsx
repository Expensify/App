import React, {lazy, memo, Suspense} from 'react';

const AuthScreens = lazy(() => import(/* webpackMode: "eager" */ './AuthScreens'));
const PublicScreens = lazy(() => import(/* webpackMode: "eager" */ './PublicScreens'));

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
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
