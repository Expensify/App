import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import get from 'lodash/get';
import getUserLanguage from '../GetUserLanguage';
import * as Session from '../../../libs/actions/Session';
import Log from '../../../libs/Log';
import * as Environment from '../../../libs/Environment/Environment';

// TODO: copied from CONFIG.js, refactor
// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to lodashGet here to prevent headaches
const lodashGet = (config, key, defaultValue) => get(config, key, defaultValue).trim();

const requiredPropTypes = {
    isDesktopFlow: PropTypes.bool.isRequired,
};

const propTypes = {
    isDesktopFlow: PropTypes.bool,
};
const defaultProps = {
    isDesktopFlow: false,
};

// TODO: move to appropriate consts file
const defaultClientId = 'com.expensify.expensifylite.AppleSignIn';
// const defaultClientId = 'com.chat.expensify.chat.AppleSignIn';
const defaultRedirectURI = 'https://www.expensify.com/partners/apple/loginCallback';
// const defaultRedirectURI = 'https://new.expensify.com/appleauth';

const config = {
    clientId: lodashGet(Config, 'ASI_CLIENTID_OVERRIDE', defaultClientId),
    scope: 'name email',
    // never used, but required for configuration
    redirectURI: lodashGet(Config, 'ASI_REDIRECTURI_OVERRIDE', defaultRedirectURI),
    state: '',
    nonce: '',
    usePopup: true,
};

const successListener = (event) => {
    const token = !Environment.isDevelopment() ? event.detail.id_token : lodashGet(Config, 'ASI_TOKEN_OVERRIDE', event.detail.id_token);
    Session.beginAppleSignIn(token);
};

const failureListener = (event) => {
    Log.warn(`Apple sign-in failed: ${event.detail}`);
};

function AppleSignInDiv({isDesktopFlow}) {
    useEffect(() => {
        // `init` renders the button, so it must be called after the div is
        // first mounted
        window.AppleID.auth.init(config);
    }, []);
    //  Result listeners need to live within the focused item to avoid duplicate
    //  side effects on success and failure
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
            data-width="279"
            data-height="52"
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
        />
    );
}

AppleSignInDiv.propTypes = requiredPropTypes;

// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton({isDesktopFlow}) {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }
    return <AppleSignInDiv isDesktopFlow={isDesktopFlow} />;
}

SingletonAppleSignInButton.propTypes = requiredPropTypes;

function AppleSignIn({isDesktopFlow}) {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    useEffect(() => {
        if (window.appleAuthScriptLoaded) return;

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

    return <SingletonAppleSignInButton isDesktopFlow={isDesktopFlow} />;
}

AppleSignIn.propTypes = propTypes;
AppleSignIn.defaultProps = defaultProps;

export default AppleSignIn;
