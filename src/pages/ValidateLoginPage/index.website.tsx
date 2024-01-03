import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import ExpiredValidateCodeModal from '@components/ValidateCode/ExpiredValidateCodeModal';
import JustSignedInModal from '@components/ValidateCode/JustSignedInModal';
import ValidateCodeModal from '@components/ValidateCode/ValidateCodeModal';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Account, Credentials, Session as SessionType} from '@src/types/onyx';

type ValidateLoginPageOnyxProps = {
    /** The details about the account that the user is signing in with */
    account: OnyxEntry<Account>;

    /** The credentials of the person logging in */
    credentials: OnyxEntry<Credentials>;

    /** Session of currently logged in user */
    session: OnyxEntry<SessionType>;
};

type ValidateLoginPageProps = ValidateLoginPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

function ValidateLoginPage({account, credentials, route, session}: ValidateLoginPageProps) {
    const login = credentials?.login;
    const autoAuthState = session?.autoAuthState ?? CONST.AUTO_AUTH_STATE.NOT_STARTED;
    const accountID = Number(route?.params.accountID) ?? -1;
    const validateCode = route.params.validateCode ?? '';
    const isSignedIn = !!session?.authToken;
    const is2FARequired = !!account?.requiresTwoFactorAuth;
    const cachedAccountID = credentials?.accountID;

    useEffect(() => {
        if (!login && isSignedIn && (autoAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN || autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN)) {
            // The user clicked the option to sign in the current tab
            Navigation.navigate();
            return;
        }
        Session.initAutoAuthState(autoAuthState);

        if (isSignedIn || !login) {
            return;
        }

        // The user has initiated the sign in process on the same browser, in another tab.
        Session.signInWithValidateCode(accountID, validateCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!!login || !cachedAccountID || !is2FARequired) {
            return;
        }

        // The user clicked the option to sign in the current tab
        Navigation.navigate();
    }, [login, cachedAccountID, is2FARequired]);

    return (
        <>
            {autoAuthState === CONST.AUTO_AUTH_STATE.FAILED && <ExpiredValidateCodeModal />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && is2FARequired && !isSignedIn && <JustSignedInModal is2FARequired />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN && isSignedIn && <JustSignedInModal is2FARequired={false} />}
            {autoAuthState === CONST.AUTO_AUTH_STATE.NOT_STARTED && (
                <ValidateCodeModal
                    accountID={accountID}
                    code={validateCode}
                />
            )}
            {autoAuthState === CONST.AUTO_AUTH_STATE.SIGNING_IN && <FullScreenLoadingIndicator />}
        </>
    );
}

ValidateLoginPage.displayName = 'ValidateLoginPage';

export default withOnyx<ValidateLoginPageProps, ValidateLoginPageOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
    credentials: {key: ONYXKEYS.CREDENTIALS},
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
