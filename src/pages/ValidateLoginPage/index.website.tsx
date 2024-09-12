import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ExpiredValidateCodeModal from '@components/ValidateCode/ExpiredValidateCodeModal';
import JustSignedInModal from '@components/ValidateCode/JustSignedInModal';
import ValidateCodeModal from '@components/ValidateCode/ValidateCodeModal';
import desktopLoginRedirect from '@libs/desktopLoginRedirect';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateLoginPageOnyxProps, ValidateLoginPageProps} from './types';

function ValidateLoginPage({
    account,
    credentials,
    route: {
        params: {accountID, validateCode, exitTo},
    },
    session,
    autoAuthState: autoAuthStateProp,
}: ValidateLoginPageProps<ValidateLoginPageOnyxProps>) {
    const login = credentials?.login;
    const isSignedIn = !!session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    // We don't want the previous autoAuthState affects the rendering of the current magic link page, so the autoAuthState prop sets initWithStoredValues as false,
    // except if the user is signed in because the page will be remounted when successfully signed in as explained in Session.initAutoAuthState.
    const autoAuthState = isSignedIn ? session?.autoAuthState : autoAuthStateProp;
    const autoAuthStateWithDefault = autoAuthState ?? CONST.AUTO_AUTH_STATE.NOT_STARTED;
    const is2FARequired = !!account?.requiresTwoFactorAuth;
    const cachedAccountID = credentials?.accountID;
    const isUserClickedSignIn = !login && isSignedIn && (autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN);
    const shouldStartSignInWithValidateCode = !isUserClickedSignIn && !isSignedIn && (!!login || !!exitTo);

    useEffect(() => {
        if (isUserClickedSignIn) {
            // The user clicked the option to sign in the current tab
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack();
            });
            return;
        }
        Session.initAutoAuthState(autoAuthStateWithDefault);

        if (!shouldStartSignInWithValidateCode) {
            if (exitTo) {
                Session.handleExitToNavigation(exitTo);
            }
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        Session.signInWithValidateCode(Number(accountID), validateCode);

        // Since on Desktop we don't have multi-tab functionality to handle the login flow,
        // we need to `popToTop` the stack after `signInWithValidateCode` in order to
        // perform login for both 2FA and non-2FA accounts.
        desktopLoginRedirect(autoAuthStateWithDefault, isSignedIn);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!!login || !cachedAccountID || !is2FARequired) {
            if (exitTo) {
                Session.handleExitToNavigation(exitTo);
            }
            return;
        }

        // The user clicked the option to sign in the current tab
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack();
        });
    }, [login, cachedAccountID, is2FARequired, exitTo]);

    return (
        <>
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.FAILED && <ExpiredValidateCodeModal />}
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && is2FARequired && !isSignedIn && login && <JustSignedInModal is2FARequired />}
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && !exitTo && login && <JustSignedInModal is2FARequired={false} />}
            {/* If session.autoAuthState isn't available yet, we use shouldStartSignInWithValidateCode to conditionally render the component instead of local autoAuthState which contains a default value of NOT_STARTED */}
            {(!autoAuthState ? !shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.NOT_STARTED) && !exitTo && (
                <ValidateCodeModal
                    accountID={Number(accountID)}
                    code={validateCode}
                />
            )}
            {(!autoAuthState ? shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN) && <FullScreenLoadingIndicator />}
        </>
    );
}

ValidateLoginPage.displayName = 'ValidateLoginPage';

export default withOnyx<ValidateLoginPageProps<ValidateLoginPageOnyxProps>, ValidateLoginPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
    session: {key: ONYXKEYS.SESSION},
    autoAuthState: {
        key: ONYXKEYS.SESSION,
        selector: (session) => session?.autoAuthState,
        initWithStoredValues: false,
    },
})(ValidateLoginPage);
