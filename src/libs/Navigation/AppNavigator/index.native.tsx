import React, {memo, useContext, useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReactComponentModule from '@src/types/utils/ReactComponentModule';

type AppNavigatorProps = {
    /** If we have an authToken this is true */
    authenticated: boolean;
};

function AppNavigator({authenticated}: AppNavigatorProps) {
    const {initialURL} = useContext(InitialURLContext);
    const [hybridApp] = useOnyx(ONYXKEYS.HYBRID_APP);

    const shouldShowAuthScreens = useMemo(() => {
        if (!CONFIG.IS_HYBRID_APP) {
            return authenticated;
        }

        return authenticated && (!hybridApp?.useNewDotSignInPage || hybridApp?.readyToShowAuthScreens);
    }, [hybridApp?.useNewDotSignInPage, hybridApp?.readyToShowAuthScreens, authenticated]);

    useEffect(() => {
        if (!CONFIG.IS_HYBRID_APP || !initialURL || !shouldShowAuthScreens) {
            return;
        }

        Navigation.isNavigationReady().then(() => {
            Navigation.navigate(Navigation.parseHybridAppUrl(initialURL));
        });
    }, [initialURL, shouldShowAuthScreens]);

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
