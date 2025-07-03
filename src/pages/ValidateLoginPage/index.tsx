import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import {setNewDotSignInState} from '@userActions/HybridApp';
import {handleExitToNavigation, signInWithValidateCodeAndNavigate} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type ValidateLoginPageProps from './types';

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});

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
                // On HybridApp we need to orchestrate the sign-in flow of both apps so we need to set the state to STARTED here
                if (CONFIG.IS_HYBRID_APP) {
                    setNewDotSignInState(CONST.HYBRID_APP_SIGN_IN_STATE.STARTED);
                }

                signInWithValidateCodeAndNavigate(Number(accountID), validateCode, '', exitTo);
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
