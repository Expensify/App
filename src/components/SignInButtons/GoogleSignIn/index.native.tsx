import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import React from 'react';
import IconButton from '@components/SignInButtons/IconButton';
import Log from '@libs/Log';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {GoogleSignInProps} from '.';
import type GoogleError from './types';

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
        .catch((error: GoogleError | undefined) => {
            // Handle unexpected error shape
            if (error?.code === undefined) {
                Log.alert(`[Google Sign In] Google sign in failed: ${JSON.stringify(error)}`);
                return;
            }
            /** The logged code is useful for debugging any new errors that are not specifically handled. To decode, see:
              - The common status codes documentation: https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes
              - The Google Sign In codes documentation: https://developers.google.com/android/reference/com/google/android/gms/auth/api/signin/GoogleSignInStatusCodes
            */
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                Log.info('[Google Sign In] Google Sign In cancelled');
            } else {
                Log.alert(`[Google Sign In] Error Code: ${error.code}. ${error.message}`, {}, false);
            }
        });
}

/**
 * Google Sign In button for iOS.
 */
function GoogleSignIn({onPress = () => {}}: GoogleSignInProps) {
    return (
        <IconButton
            onPress={() => {
                onPress();
                googleSignInRequest();
            }}
            provider={CONST.SIGN_IN_METHOD.GOOGLE}
        />
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';

export default GoogleSignIn;
