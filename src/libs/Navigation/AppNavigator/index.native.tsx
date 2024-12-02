import React, {memo, useContext, useEffect, useMemo} from 'react';
import {NativeModules} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TryNewDot} from '@src/types/onyx';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function shouldUseOldApp(tryNewDot?: TryNewDot) {
    return tryNewDot?.classicRedirect.dismissed === true;
}

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL, setInitialURL} = useContext(InitialURLContext);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRYNEWDOT);
    const [hybridApp] = useOnyx(ONYXKEYS.HYBRID_APP);

    const shouldShowAuthScreens = useMemo(() => {
        if (!NativeModules.HybridAppModule) {
            return authenticated;
        }
        if (shouldUseOldApp(tryNewDot) && !hybridApp?.isSingleNewDotEntry) {
            return false;
        }

        return authenticated && (!hybridApp?.useNewDotSignInPage || hybridApp?.readyToShowAuthScreens);
    }, [tryNewDot, hybridApp?.isSingleNewDotEntry, hybridApp?.useNewDotSignInPage, hybridApp?.readyToShowAuthScreens, authenticated]);

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
