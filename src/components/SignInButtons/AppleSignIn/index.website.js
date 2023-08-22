import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Config from 'react-native-config';
import get from 'lodash/get';
import getUserLanguage from '../GetUserLanguage';
import * as Session from '../../../libs/actions/Session';
import Log from '../../../libs/Log';
import CONFIG from '../../../CONFIG';
import CONST from '../../../CONST';
import withNavigationFocus from '../../withNavigationFocus';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to lodashGet here to prevent headaches.
const lodashGet = (config, key, defaultValue) => get(config, key, defaultValue).trim();

const requiredPropTypes = {
    isDesktopFlow: PropTypes.bool.isRequired,
};

const singletonPropTypes = {
    ...requiredPropTypes,

    // From withNavigationFocus
    isFocused: PropTypes.bool.isRequired,
};

const propTypes = {
    // Prop to indicate if this is the desktop flow or not.
    isDesktopFlow: PropTypes.bool,
};
const defaultProps = {
    isDesktopFlow: false,
};

/**
 * Apple Sign In Configuration for Web.
 */
const config = {
    clientId: lodashGet(Config, 'ASI_CLIENTID_OVERRIDE', CONFIG.APPLE_SIGN_IN.SERVICE_ID),
    scope: 'name email',
    // never used, but required for configuration
    redirectURI: lodashGet(Config, 'ASI_REDIRECTURI_OVERRIDE', CONFIG.APPLE_SIGN_IN.REDIRECT_URI),
    state: '',
    nonce: '',
    usePopup: true,
};

/**
 * Apple Sign In success and failure listeners.
 */

const successListener = (event) => {
    const token = event.detail.authorization.id_token;
    Session.beginAppleSignIn(token);
};

const failureListener = (event) => {
    if (!event.detail || event.detail.error === 'popup_closed_by_user') return null;
    Log.warn(`Apple sign-in failed: ${event.detail}`);
};

/**
 * Apple Sign In button for Web.
 * @returns {React.Component}
 */
function AppleSignInDiv({isDesktopFlow}) {
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

AppleSignInDiv.propTypes = requiredPropTypes;

// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton({isFocused, isDesktopFlow}) {
    if (!isFocused) {
        return null;
    }
    return <AppleSignInDiv isDesktopFlow={isDesktopFlow} />;
}

SingletonAppleSignInButton.propTypes = singletonPropTypes;

// withNavigationFocus is used to only render the button when it is visible.
const SingletonAppleSignInButtonWithFocus = withNavigationFocus(SingletonAppleSignInButton);

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

    return <SingletonAppleSignInButtonWithFocus isDesktopFlow={isDesktopFlow} />;
}

AppleSignIn.propTypes = propTypes;
AppleSignIn.defaultProps = defaultProps;

export default withNavigationFocus(AppleSignIn);
