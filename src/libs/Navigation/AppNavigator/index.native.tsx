import React, {memo, useContext, useEffect} from 'react';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import CONFIG from '@src/CONFIG';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL} = useContext(InitialURLContext);

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || !initialURL) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(Navigation.parseHybridAppUrl(initialURL));
        });
    }, [initialURL]);

    if (authenticated) {
        const AuthScreens = require<ReactComponentModule>('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }

    const PublicScreens = require<ReactComponentModule>('./PublicScreens').default;

    return <PublicScreens />;
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
