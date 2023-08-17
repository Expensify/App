import React from 'react';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import Log from '../../../libs/Log';
import IconButton from '../IconButton';
import * as Session from '../../../libs/actions/Session';
import CONST from '../../../CONST';
import CONFIG from '../../../CONFIG';

/**
 * Google Sign In method for iOS and android that returns identityToken.
 */
function googleSignInRequest() {
    GoogleSignin.configure({
        webClientId: CONFIG.GOOGLE_SIGN_IN.WEB_CLIENT_ID,
        iosClientId: CONFIG.GOOGLE_SIGN_IN.IOS_CLIENT_ID,
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
                Log.alert('[Google Sign In] Google sign in cancelled', true, {error});
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Log.alert('[Google Sign In] Google sign in already in progress', true, {error});
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Log.alert('[Google Sign In] Google play services not available or outdated', true, {error});
            } else {
                Log.alert('[Google Sign In] Unknown Google sign in error', true, {error});
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
