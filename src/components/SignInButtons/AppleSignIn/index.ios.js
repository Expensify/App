import appleAuth from '@invertase/react-native-apple-authentication';
import React from 'react';
import IconButton from '@components/SignInButtons/IconButton';
import Log from '@libs/Log';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

/**
 * Apple Sign In method for iOS that returns identityToken.
 * @returns {Promise<string>}
 */
function appleSignInRequest() {
    return appleAuth
        .performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,

            // FULL_NAME must come first, see https://github.com/invertase/react-native-apple-authentication/issues/293.
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        })
        .then((response) =>
            appleAuth.getCredentialStateForUser(response.user).then((credentialState) => {
                if (credentialState !== appleAuth.State.AUTHORIZED) {
                    Log.alert('[Apple Sign In] Authentication failed. Original response: ', response);
                    throw new Error('Authentication failed');
                }
                return response.identityToken;
            }),
        );
}

/**
 * Apple Sign In button for iOS.
 * @returns {React.Component}
 */
function AppleSignIn() {
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => Session.beginAppleSignIn(token))
            .catch((e) => {
                if (e.code === appleAuth.Error.CANCELED) {
                    return null;
                }
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
