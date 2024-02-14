import React, {useEffect, useState} from 'react';
import type {NativeConfig} from 'react-native-config';
import Config from 'react-native-config';
import getUserLanguage from '@components/SignInButtons/GetUserLanguage';
import type {WithNavigationFocusProps} from '@components/withNavigationFocus';
import withNavigationFocus from '@components/withNavigationFocus';
import Log from '@libs/Log';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type {AppleIDSignInOnFailureEvent, AppleIDSignInOnSuccessEvent} from '@src/types/modules/dom';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to lodashGet here to prevent headaches.
const getConfig = (config: NativeConfig, key: string, defaultValue: string) => (config?.[key] ?? defaultValue).trim();

type AppleSignInDivProps = {
    isDesktopFlow: boolean;
};

type SingletonAppleSignInButtonProps = AppleSignInDivProps & {
    isFocused: boolean;
};

type AppleSignInProps = WithNavigationFocusProps & {
    isDesktopFlow?: boolean;
};

/**
 * Apple Sign In Configuration for Web.
 */
const config = {
    clientId: getConfig(Config, 'ASI_CLIENTID_OVERRIDE', CONFIG.APPLE_SIGN_IN.SERVICE_ID),
    scope: 'name email',
    // never used, but required for configuration
    redirectURI: getConfig(Config, 'ASI_REDIRECTURI_OVERRIDE', CONFIG.APPLE_SIGN_IN.REDIRECT_URI),
    state: '',
    nonce: '',
    usePopup: true,
};

/**
 * Apple Sign In success and failure listeners.
 */

const successListener = (event: AppleIDSignInOnSuccessEvent) => {
    const token = event.detail.authorization.id_token;
    Session.beginAppleSignIn(token);
};

const failureListener = (event: AppleIDSignInOnFailureEvent) => {
    if (!event.detail || event.detail.error === 'popup_closed_by_user') {
        return null;
    }
    Log.warn(`Apple sign-in failed: ${event.detail.error}`);
};

/**
 * Apple Sign In button for Web.
 */
function AppleSignInDiv({isDesktopFlow}: AppleSignInDivProps) {
    useEffect(() => {
        // `init` renders the button, so it must be called after the div is
        // first mounted.
        window.AppleID.auth.init(config);
    }, []);
    //  Result listeners need to live within the focused item to avoid duplicate
    //  side effects on success and failure.
    React.useEffect(() => {
        document.addEventListener('AppleIDSignInOnSuccess', successListener);
        document.addEventListener('AppleIDSignInOnFailure', failureListener);
        return () => {
            document.removeEventListener('AppleIDSignInOnSuccess', successListener);
            document.removeEventListener('AppleIDSignInOnFailure', failureListener);
        };
    }, []);

    return isDesktopFlow ? (
        <div
            id="appleid-signin"
            data-mode="center-align"
            data-type="continue"
            data-color="white"
            data-border="false"
            data-border-radius="50"
            data-width={CONST.SIGN_IN_FORM_WIDTH}
            data-height="52"
            style={{cursor: 'pointer'}}
        />
    ) : (
        <div
            id="appleid-signin"
            data-mode="logo-only"
            data-type="sign in"
            data-color="white"
            data-border="false"
            data-border-radius="50"
            data-size="40"
            style={{cursor: 'pointer'}}
        />
    );
}

// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton({isFocused, isDesktopFlow}: SingletonAppleSignInButtonProps) {
    if (!isFocused) {
        return null;
    }
    return <AppleSignInDiv isDesktopFlow={isDesktopFlow} />;
}

// withNavigationFocus is used to only render the button when it is visible.
const SingletonAppleSignInButtonWithFocus = withNavigationFocus(SingletonAppleSignInButton);

function AppleSignIn({isDesktopFlow = false}: AppleSignInProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    useEffect(() => {
        if (window.appleAuthScriptLoaded) {
            return;
        }

        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//${localeCode}/appleid.auth.js`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);

        document.body.appendChild(script);
    }, []);

    if (scriptLoaded === false) {
        return null;
    }

    return <SingletonAppleSignInButtonWithFocus isDesktopFlow={isDesktopFlow} />;
}

AppleSignIn.displayName = 'AppleSignIn';
export default withNavigationFocus(AppleSignIn);
