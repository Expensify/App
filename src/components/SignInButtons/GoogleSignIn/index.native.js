import React from 'react';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import Log from '../../../libs/Log';
import IconButton from '../IconButton';
import * as Session from '../../../libs/actions/Session';
import CONST from '../../../CONST';

/**
 * Google Sign In method for iOS and android that returns identityToken.
 */
function googleSignInRequest() {
    GoogleSignin.configure({
        webClientId: CONST.GOOGLE_SIGN_IN_WEB_CLIENT_ID,
        iosClientId: CONST.GOOGLE_SIGN_IN_IOS_CLIENT_ID,
        offlineAccess: false,
    });

    // The package on android can sign in without prompting
    // the user which is not what we want. So we sign out
    // before signing in to ensure the user is prompted.
    GoogleSignin.signOut();

    GoogleSignin.signIn()
        .then((response) => response.idToken)
        .then((token) => Session.beginGoogleSignIn(token))
        .catch((error) => {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Log.error('Google sign in cancelled', true, {error});
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Log.error('Google sign in already in progress', true, {error});
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Log.error('Google play services not available or outdated', true, {error});
            } else {
                Log.error('Unknown Google sign in error', true, {error});
            }
        });
}

/**
 * Google Sign In button for iOS.
 * @returns {React.Component}
 */
function GoogleSignIn() {
    return (
        <IconButton
            onPress={googleSignInRequest}
            provider={CONST.SIGN_IN_METHOD.GOOGLE}
        />
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';

export default GoogleSignIn;
