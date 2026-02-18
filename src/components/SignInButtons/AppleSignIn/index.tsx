import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import type {NativeConfig} from 'react-native-config';
import Config from 'react-native-config';
import useOnyx from '@hooks/useOnyx';
import {beginAppleSignIn} from '@libs/actions/Session';
import {getDevicePreferredLocale} from '@libs/Localize';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AppleIDSignInOnFailureEvent, AppleIDSignInOnSuccessEvent} from '@src/types/modules/dom';
import type Locale from '@src/types/onyx/Locale';
import MAP_EXFY_LOCALE_TO_APPLE_LOCALE from './AppleSignInLocales';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to lodashGet here to prevent headaches.
const getConfig = (config: NativeConfig, key: string, defaultValue: string) => (config?.[key] ?? defaultValue).trim();

type AppleSignInDivProps = {
    isDesktopFlow: boolean;
    onPointerDown?: () => void;
};

type SingletonAppleSignInButtonProps = AppleSignInDivProps;

type AppleSignInProps = {
    isDesktopFlow?: boolean;
    onPointerDown?: () => void;
    // eslint-disable-next-line react/no-unused-prop-types
    onPress?: () => void;
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

const successListener = (event: AppleIDSignInOnSuccessEvent, preferredLocale?: Locale) => {
    const token = event.detail.authorization.id_token;
    beginAppleSignIn(token, preferredLocale);
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
function AppleSignInDiv({isDesktopFlow, onPointerDown}: AppleSignInDivProps) {
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    useEffect(() => {
        // `init` renders the button, so it must be called after the div is
        // first mounted.
        window.AppleID.auth.init(config);
    }, []);
    //  Result listeners need to live within the focused item to avoid duplicate
    //  side effects on success and failure.
    React.useEffect(() => {
        document.addEventListener('AppleIDSignInOnSuccess', (event) => successListener(event, preferredLocale));
        document.addEventListener('AppleIDSignInOnFailure', failureListener);
        return () => {
            document.removeEventListener('AppleIDSignInOnSuccess', (event) => successListener(event, preferredLocale));
            document.removeEventListener('AppleIDSignInOnFailure', failureListener);
        };
    }, [preferredLocale]);

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
            onPointerDown={onPointerDown}
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
            onPointerDown={onPointerDown}
        />
    );
}

// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton({isDesktopFlow, onPointerDown}: SingletonAppleSignInButtonProps) {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }
    return (
        <AppleSignInDiv
            isDesktopFlow={isDesktopFlow}
            onPointerDown={onPointerDown}
        />
    );
}

function AppleSignIn({isDesktopFlow = false, onPointerDown}: AppleSignInProps) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    useEffect(() => {
        if (window.appleAuthScriptLoaded) {
            return;
        }

        const localeCode = MAP_EXFY_LOCALE_TO_APPLE_LOCALE[getDevicePreferredLocale()];
        const script = document.createElement('script');
        script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//${localeCode}/appleid.auth.js`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);

        document.body.appendChild(script);
    }, []);

    if (scriptLoaded === false) {
        return null;
    }

    return (
        <SingletonAppleSignInButton
            isDesktopFlow={isDesktopFlow}
            onPointerDown={onPointerDown}
        />
    );
}

export default AppleSignIn;
export type {AppleSignInProps};
