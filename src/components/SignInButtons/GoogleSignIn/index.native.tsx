import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import React from 'react';
import IconButton from '@components/SignInButtons/IconButton';
import {setNewDotSignInState} from '@libs/actions/HybridApp';
import Growl from '@libs/Growl';
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
        webClientId: CONFIG.IS_HYBRID_APP ? CONFIG.GOOGLE_SIGN_IN.HYBRID_APP_WEB_CLIENT_ID : CONFIG.GOOGLE_SIGN_IN.WEB_CLIENT_ID,
        iosClientId: CONFIG.IS_HYBRID_APP ? CONFIG.GOOGLE_SIGN_IN.HYBRID_APP_IOS_CLIENT_ID : CONFIG.GOOGLE_SIGN_IN.IOS_CLIENT_ID,
        offlineAccess: false,
    });

    // The package on android can sign in without prompting
    // the user which is not what we want. So we sign out
    // before signing in to ensure the user is prompted.
    GoogleSignin.signOut();

    GoogleSignin.signIn()
        .then((response) => response.idToken)
        .then((token) => {
            setNewDotSignInState(CONST.HYBRID_APP_SIGN_IN_STATE.STARTED);
            Session.beginGoogleSignIn(token);
        })
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
                // TODO: Growl is temporary to allow debugging
                Growl.error('[Google Sign In] Google Sign In cancelled');
            } else {
                Log.alert(`[Google Sign In] Error Code: ${error.code}. ${error.message}`, {}, false);
                // TODO: Growl is temporary to allow debugging
                Growl.error(`[Google Sign In] Error Code: ${error.code}. ${error.message}`);
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
