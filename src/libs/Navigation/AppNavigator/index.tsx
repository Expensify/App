import React, {useContext, useEffect} from 'react';
import {NativeModules} from 'react-native';
import InitialUrlContext from '@libs/InitialUrlContext';
import Navigation from '@libs/Navigation/Navigation';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const initUrl = useContext(InitialUrlContext);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initUrl) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(initUrl);
        });
    }, [initUrl]);

    if (authenticated) {
        const AuthScreens = require('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }
    const PublicScreens = require('./PublicScreens').default;
    return <PublicScreens />;
}

AppNavigator.displayName = 'AppNavigator';
export default AppNavigator;
