import React, {memo} from 'react';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;

    /** Initial url */
    initialUrl: string | null;
};

function AppNavigator({authenticated, initialUrl}: AppNavigatorProps) {
    if (authenticated) {
        const AuthScreens = require<ReactComponentModule<{initialUrl: string | null}>>('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens initialUrl={initialUrl} />;
    }

    const PublicScreens = require<ReactComponentModule>('./PublicScreens').default;

    return <PublicScreens />;
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
