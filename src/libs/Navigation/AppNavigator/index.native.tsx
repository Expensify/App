import React, {memo, useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL, setInitialURL} = useContext(InitialURLContext);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initialURL) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(Navigation.parseHybridAppUrl(initialURL));
            setInitialURL(undefined);
        });
    }, [initialURL, setInitialURL]);

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
