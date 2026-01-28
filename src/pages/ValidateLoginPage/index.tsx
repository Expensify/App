import React, {useEffect} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {handleExitToNavigation, signInWithValidateCodeAndNavigate} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ValidateLoginPageProps from './types';

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});

    useEffect(() => {
        // Wait till navigation becomes available
        Navigation.isNavigationReady().then(() => {
            if (session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                if (exitTo) {
                    handleExitToNavigation(exitTo);
                    return;
                }
                Navigation.goBack();
            } else {
                signInWithValidateCodeAndNavigate(Number(accountID), validateCode, preferredLocale, '', exitTo);
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

    return <FullScreenLoadingIndicator />;
}

export default ValidateLoginPage;
