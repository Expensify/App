import React, {useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ExpiredValidateCodeModal from '@components/ValidateCode/ExpiredValidateCodeModal';
import JustSignedInModal from '@components/ValidateCode/JustSignedInModal';
import ValidateCodeModal from '@components/ValidateCode/ValidateCodeModal';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import {isValidValidateCode} from '@libs/ValidationUtils';
import {handleExitToNavigation, initAutoAuthState, signInWithValidateCode} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session as SessionType} from '@src/types/onyx';
import type ValidateLoginPageProps from './types';

const autoAuthStateSelector = (session: OnyxEntry<SessionType>) => session?.autoAuthState;

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode, exitTo},
    },
}: ValidateLoginPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [session] = useOnyx(ONYXKEYS.SESSION);

    const login = credentials?.login;
    const isSignedIn = !!session?.authToken && session?.authTokenType !== CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
    // When not signed in, ignore stored autoAuthState on the first render to prevent stale values
    // (e.g. FAILED from a previous magic link attempt) from briefly rendering incorrect UI.
    // Once initAutoAuthState() runs in the useEffect, the state is set to true and real values are used.
    const [hasInitialized, setHasInitialized] = useState(isSignedIn);
    const [autoAuthState] = useOnyx(ONYXKEYS.SESSION, {selector: autoAuthStateSelector});
    const effectiveAutoAuthState = hasInitialized ? autoAuthState : undefined;
    const autoAuthStateWithDefault = effectiveAutoAuthState ?? CONST.AUTO_AUTH_STATE.NOT_STARTED;
    const is2FARequired = !!account?.requiresTwoFactorAuth;
    const cachedAccountID = credentials?.accountID;
    const isUserClickedSignIn = !login && isSignedIn && (autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN);
    const shouldStartSignInWithValidateCode = !isUserClickedSignIn && !isSignedIn && (!!login || !!exitTo) && isValidValidateCode(validateCode);
    const isNavigatingToExitTo = isSignedIn && !!exitTo;
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);

    useEffect(() => {
        setHasInitialized(true);

        if (isUserClickedSignIn) {
            // The user clicked the option to sign in the current tab
            Navigation.isNavigationReady().then(() => {
                Navigation.goBack();
            });
            return;
        }
        initAutoAuthState(autoAuthStateWithDefault);

        if (!shouldStartSignInWithValidateCode) {
            if (exitTo) {
                handleExitToNavigation(exitTo);
            }
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        signInWithValidateCode(Number(accountID), validateCode, preferredLocale);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!!login || !cachedAccountID || !is2FARequired) {
            if (exitTo) {
                handleExitToNavigation(exitTo);
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
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && is2FARequired && !isSignedIn && !!login && <JustSignedInModal is2FARequired />}
            {autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && !exitTo && !!login && <JustSignedInModal is2FARequired={false} />}
            {/* If session.autoAuthState isn't available yet, we use shouldStartSignInWithValidateCode to conditionally render the component instead of local autoAuthState which contains a default value of NOT_STARTED */}
            {(!effectiveAutoAuthState ? !shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.NOT_STARTED && !isNavigatingToExitTo) && (
                <ValidateCodeModal
                    accountID={Number(accountID)}
                    code={validateCode}
                />
            )}
            {(!effectiveAutoAuthState ? shouldStartSignInWithValidateCode : autoAuthStateWithDefault === CONST.AUTO_AUTH_STATE.SIGNING_IN) && <FullScreenLoadingIndicator />}
        </>
    );
}

export default ValidateLoginPage;
