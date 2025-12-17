import {appleAuthAndroid} from '@invertase/react-native-apple-authentication';
import type {AndroidConfig} from '@invertase/react-native-apple-authentication';
import React from 'react';
import IconButton from '@components/SignInButtons/IconButton';
import useOnyx from '@hooks/useOnyx';
import Log from '@libs/Log';
import {beginAppleSignIn} from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AppleSignInProps} from '.';

/**
 * Apple Sign In Configuration for Android.
 */
const config: AndroidConfig = {
    clientId: CONFIG.APPLE_SIGN_IN.SERVICE_ID,
    redirectUri: CONFIG.APPLE_SIGN_IN.REDIRECT_URI,
    responseType: appleAuthAndroid.ResponseType.ALL,
    scope: appleAuthAndroid.Scope.ALL,
    fullScreen: false,
};

/**
 * Apple Sign In method for Android that returns authToken.
 * @returns Promise that returns a string when resolved
 */
function appleSignInRequest(): Promise<string | undefined> {
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
 */
function AppleSignIn({onPress = () => {}}: AppleSignInProps) {
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    const handleSignIn = () => {
        appleSignInRequest()
            .then((token) => beginAppleSignIn(token, preferredLocale))
            .catch((error: Record<string, unknown>) => {
                if (error.message === appleAuthAndroid.Error.SIGNIN_CANCELLED) {
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
