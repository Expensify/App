import React from 'react';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import Log from '../../../libs/Log';
import ButtonBase from '../ButtonBase';
import * as Session from '../../../libs/actions/Session';

const googleLogoIcon = require('../../../../assets/images/signIn/google-logo.svg').default;

/**
 * Apple Sign In method for iOS that returns identityToken
 * @returns {Promise<string>}
 */

function googleSignInRequest() {
    GoogleSignin.configure({
        webClientId: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
        iosClientId: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
        offlineAccess: false,
    });

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
 * Apple Sign In button for iOS
 * @returns {React.Component}
 */

function GoogleSignIn() {
    return (
        <ButtonBase
            onPress={googleSignInRequest}
            icon={googleLogoIcon}
        />
    );
};

GoogleSignIn.displayName = 'GoogleSignIn';

export default GoogleSignIn;
