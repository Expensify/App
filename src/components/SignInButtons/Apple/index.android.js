import React from 'react';
import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
import Log from '../../../libs/Log';
import ButtonBase from '../ButtonBase';
import AppleLogoIcon from '../../../../assets/images/signIn/apple-logo.svg';
import * as Session from '../../../libs/actions/Session';
import APPLE_CONFIG from './AppleConfig';

function appleSignInRequest() {
    appleAuthAndroid.configure({
        clientId: APPLE_CONFIG.CLIENT_ID,
        redirectUri: APPLE_CONFIG.REDIRECT_URI,
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
    });
    return appleAuthAndroid
        .signIn()
        .then((response) => response.id_token)
        .catch((e) => {
            Log.error('Request to sign in with Apple failed. Error: ', e);
            throw e;
        });
}

const AppleSignIn = () => {
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => Session.beginAppleSignIn(token))
            .catch((e) => {
                Log.error('Apple authentication failed', e);
            });
    };
    return (
        <ButtonBase
            onPress={handleSignIn}
            icon={<AppleLogoIcon />}
        />
    );
};

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
