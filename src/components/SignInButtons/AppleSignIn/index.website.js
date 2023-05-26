import React, {useEffect, useState} from 'react';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import getUserLanguage from '../GetUserLanguage';
import {beginAppleSignIn} from '../../../libs/actions/Session';
import Log from '../../../libs/Log';

const requiredPropTypes = {
    isDesktopFlow: PropTypes.bool.isRequired,
};

const propTypes = {
    isDesktopFlow: PropTypes.bool,
};
const defaultProps = {
    isDesktopFlow: false,
};

// TODO: env vars for config and token override

const config = {
    clientId: 'com.chat.expensify.chat.AppleSignIn',
    scope: 'name email',
    // never used, but required for configuration
    redirectURI: 'https://new.expensify.com/appleauth',
    state: '',
    nonce: '',
    usePopup: true,
};

const successListener = (event) => {
    beginAppleSignIn({token: event.detail.id_token});
};

const failureListener = (event) => {
    Log.warn(`Apple sign-in failed: ${event.detail}`);
};

function AppleSignInDiv({isDesktopFlow}) {
    useEffect(() => {
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
