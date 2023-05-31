import React from 'react';
import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
import Log from '../../../libs/Log';
import ButtonBase from '../ButtonBase';
import * as Session from '../../../libs/actions/Session';
import CONST from '../../../CONST';

const config = {
    clientId: CONST.APPLE_SIGN_IN_SERVICE_ID,
    redirectUri: CONST.APPLE_SIGN_IN_REDIRECT_URI,
    responseType: appleAuthAndroid.ResponseType.ALL,
    scope: appleAuthAndroid.Scope.ALL,
};

const appleLogoIcon = require('../../../../assets/images/signIn/apple-logo.svg').default;

function appleSignInRequest() {
    appleAuthAndroid.configure(config);
    return appleAuthAndroid
        .signIn()
        .then((response) => response.id_token)
        .catch((e) => {
            throw e;
        });
}

const AppleSignIn = () => {
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => Session.beginAppleSignIn(token))
            .catch((e) => {
                if (e.message === appleAuthAndroid.Error.SIGNIN_CANCELLED) return null;
                Log.error('Apple authentication failed', e);
            });
    };
    return (
        <ButtonBase
            onPress={handleSignIn}
            icon={appleLogoIcon}
        />
    );
};

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
