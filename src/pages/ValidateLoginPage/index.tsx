import type {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect} from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import type {AuthScreensParamList} from '@libs/Navigation/types';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Session as SessionType} from '@src/types/onyx';

type ValidateLoginPageOnyxProps = {
    session: OnyxEntry<SessionType>;
};

type ValidateLoginPageProps = ValidateLoginPageOnyxProps & StackScreenProps<AuthScreensParamList, typeof SCREENS.VALIDATE_LOGIN>;

function ValidateLoginPage({
    route: {
        params: {accountID = '', validateCode = ''},
    },
    session,
}: ValidateLoginPageProps) {
    useEffect(() => {
        if (session?.authToken) {
            // If already signed in, do not show the validate code if not on web,
            // because we don't want to block the user with the interstitial page.
            Navigation.goBack();
        } else {
            Session.signInWithValidateCodeAndNavigate(Number(accountID), validateCode);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <FullScreenLoadingIndicator />;
}

ValidateLoginPage.displayName = 'ValidateLoginPage';

export default withOnyx<ValidateLoginPageProps, ValidateLoginPageOnyxProps>({
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
