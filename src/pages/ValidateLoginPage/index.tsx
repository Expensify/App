import React, {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Navigation from '@libs/Navigation/Navigation';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ValidateLoginPageOnyxNativeProps, ValidateLoginPageProps} from './types';

function ValidateLoginPage({
    route: {
        params: {accountID, validateCode},
    },
    session,
}: ValidateLoginPageProps<ValidateLoginPageOnyxNativeProps>) {
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

export default withOnyx<ValidateLoginPageProps<ValidateLoginPageOnyxNativeProps>, ValidateLoginPageOnyxNativeProps>({
    session: {key: ONYXKEYS.SESSION},
})(ValidateLoginPage);
