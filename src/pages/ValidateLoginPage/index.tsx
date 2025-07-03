import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ValidateLoginPageProps from './types';

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);

    useEffect(() => {
        // Wait till navigation becomes available
        Navigation.isNavigationReady().then(() => {
            if (session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                if (exitTo) {
                    Session.handleExitToNavigation(exitTo);
                    return;
                }
                Navigation.goBack();
            } else {
                Session.signInWithValidateCodeAndNavigate(Number(accountID), validateCode, '', exitTo);
            }
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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

    return <FullScreenLoadingIndicator />;
}

ValidateLoginPage.displayName = 'ValidateLoginPage';

export default ValidateLoginPage;
