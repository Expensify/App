import React from 'react';
import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
import Log from '../../../libs/Log';
import IconButton from '../IconButton';
import * as Session from '../../../libs/actions/Session';
import CONFIG from '../../../CONFIG';
import CONST from '../../../CONST';

/**
 * Apple Sign In Configuration for Android.
 */
const config = {
    clientId: CONFIG.APPLE_SIGN_IN.SERVICE_ID,
    redirectUri: CONFIG.APPLE_SIGN_IN.REDIRECT_URI,
    responseType: appleAuthAndroid.ResponseType.ALL,
    scope: appleAuthAndroid.Scope.ALL,
};

/**
 * Apple Sign In method for Android that returns authToken.
 * @returns {Promise<string>}
 */
function appleSignInRequest() {
    appleAuthAndroid.configure(config);
    return appleAuthAndroid
        .signIn()
        .then((response) => response.id_token)
        .catch((e) => {
            throw e;
        });
}

/**
 * Apple Sign In button for Android.
 * @returns {React.Component}
 */
function AppleSignIn() {
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => Session.beginAppleSignIn(token))
            .catch((e) => {
                if (e.message === appleAuthAndroid.Error.SIGNIN_CANCELLED) return null;
                Log.alert('[Apple Sign In] Apple authentication failed', e);
            });
    };
    return (
        <IconButton
            onPress={handleSignIn}
            provider={CONST.SIGN_IN_METHOD.APPLE}
        />
    );
}

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
