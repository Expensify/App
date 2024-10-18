import React, {memo, useContext, useEffect, useMemo} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL, setInitialURL} = useContext(InitialURLContext);

    // const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT);
    const [useNewDotLoginPage] = useOnyx(ONYXKEYS.USE_NEWDOT_SIGN_IN_PAGE);

    const shouldShowAuthScreens = useMemo(() => {
        if (!NativeModules.HybridAppModule) {
            return authenticated;
        }

        return useNewDotLoginPage === false && authenticated;
    }, [authenticated, useNewDotLoginPage]);

    useEffect(() => {
        if (!NativeModules.HybridAppModule || !initialURL || !shouldShowAuthScreens) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(Navigation.parseHybridAppUrl(initialURL));
            setInitialURL(undefined);
        });
    }, [initialURL, setInitialURL, shouldShowAuthScreens]);

    if (shouldShowAuthScreens) {
        const AuthScreens = require<ReactComponentModule>('./AuthScreens').default;

        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }

    const PublicScreens = require<ReactComponentModule>('./PublicScreens').default;

    return <PublicScreens />;
}

AppNavigator.displayName = 'AppNavigator';

export default memo(AppNavigator);
