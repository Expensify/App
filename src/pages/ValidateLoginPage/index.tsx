import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {handleExitToNavigation, signInWithValidateCodeAndNavigate} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import type ValidateLoginPageProps from './types';

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const isSignedIn = !!session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

    useEffect(() => {
        // Wait till navigation becomes available
        Navigation.isNavigationReady().then(() => {
            if (isSignedIn) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                if (exitTo) {
                    handleExitToNavigation(exitTo);
                    return;
                }
                Navigation.goBack();
            } else {
                signInWithValidateCodeAndNavigate(Number(accountID), validateCode, preferredLocale, exitTo);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (session?.autoAuthState !== CONST.AUTO_AUTH_STATE.FAILED) {
            return;
        }
        // Go back to initial route if validation fails
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack();
        });
    }, [session?.autoAuthState]);

    // No "Go Back" button: this is a deep-link entry point, so there is usually no history to pop back to.
    const loadingIndicator = <FullScreenLoadingIndicator shouldUseGoBackButton={false} />;

    // Signed-in users are sent on by the effect above without waiting on a request, so only signed-out users need the offline view.
    if (!isOffline || isSignedIn) {
        return loadingIndicator;
    }

    // Offline, the sign-in request waits in the queue until the network returns, so show why instead of a bare spinner.
    // The offline view has no background of its own, so paint one to cover whatever is underneath.
    return (
        <View style={[StyleSheet.absoluteFill, styles.appBG]}>
            <FullPageOfflineBlockingView>{loadingIndicator}</FullPageOfflineBlockingView>
        </View>
    );
}

export default ValidateLoginPage;
