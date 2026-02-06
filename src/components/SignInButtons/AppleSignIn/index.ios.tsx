import appleAuth from '@invertase/react-native-apple-authentication';
import type {AppleError} from '@invertase/react-native-apple-authentication';
import React from 'react';
import IconButton from '@components/SignInButtons/IconButton';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import {beginAppleSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AppleSignInProps} from '.';

/**
 * Apple Sign In method for iOS that returns identityToken.
 * @returns Promise that returns a string when resolved
 */
function appleSignInRequest(): Promise<string | null | undefined> {
    return appleAuth
        .performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,

            // FULL_NAME must come first, see https://github.com/invertase/react-native-apple-authentication/issues/293.
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        })
        .then((response) =>
            appleAuth.getCredentialStateForUser(response.user).then((credentialState) => {
                if (credentialState !== appleAuth.State.AUTHORIZED) {
                    Log.alert('[Apple Sign In] Authentication failed. Original response: ', {response});
                    throw new Error('Authentication failed');
                }
                return response.identityToken;
            }),
        );
}

/**
 * Apple Sign In button for iOS.
 */
function AppleSignIn({onPress = () => {}}: AppleSignInProps) {
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => beginAppleSignIn(token, preferredLocale))
            .catch((error: {code: AppleError}) => {
                if (error.code === appleAuth.Error.CANCELED) {
                    return null;
                }
                Log.alert('[Apple Sign In] Apple authentication failed', error);
            });
    };
    return (
        <IconButton
            onPress={() => {
                onPress();
                handleSignIn();
            }}
            provider={CONST.SIGN_IN_METHOD.APPLE}
        />
    );
}

export default AppleSignIn;
