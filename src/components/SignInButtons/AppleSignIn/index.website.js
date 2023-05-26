import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import {beginAppleSignIn} from '../../../libs/actions/Session';

const basePropTypes = {
    isFullWidth: PropTypes.bool.isRequired,
};

const propTypes = {
    isFullWidth: PropTypes.bool,
    ...withLocalizePropTypes,
};
const defaultProps = {
    isFullWidth: false,
};

const $appleButtonContainerStyle = {
    width: 40,
    height: 40,
    marginRight: 20,
};

const config = {
    clientId: 'com.infinitered.expensify.test',
    scope: 'name email',
    redirectURI: 'https://exptest.ngrok.io/appleauth',
    state: '',
    nonce: '',
    usePopup: true,
};

const hardcodedToken = '';
const successListener = (event) => {
    beginAppleSignIn({token: ''});
};

const failureListener = (event) => {
    console.log(event.detail);
};

function AppleSignInDiv({isFullWidth}) {
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

    return isFullWidth ? (
        <div
            style={{fontSize: '0'}}
            id="appleid-signin"
            data-type="sign in"
            data-mode="left-align"
            data-logo-size="medium"
            data-border="false"
            data-color="white"
            data-width="140"
            data-height="30"
        />
    ) : (
        <div
            style={{fontSize: '0'}}
            id="appleid-signin"
            data-type="sign in"
            data-mode="logo-only"
            data-logo-size="medium"
            data-color="white"
            data-border="false"
            data-border-radius="50"
            data-width="40"
            data-height="40"
        />
    );
}

AppleSignInDiv.propTypes = basePropTypes;

// The Sign in with Apple script may fail to render button if there are multiple
// of these divs present in the app, as it matches based on div id. So we'll
// only mount the div when it should be visible.
function SingletonAppleSignInButton({isFullWidth}) {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }
    return <AppleSignInDiv isFullWidth={isFullWidth} />;
}

SingletonAppleSignInButton.propTypes = basePropTypes;

const AppleSignIn = ({isFullWidth, translate}) => {
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

    return (
        <View
            style={$appleButtonContainerStyle}
            accessibilityRole="button"
            accessibilityLabel={translate('common.signInWithApple')}
        >
            <SingletonAppleSignInButton isFullWidth={isFullWidth} />
        </View>
    );
};

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;
AppleSignIn.defaultProps = defaultProps;

export default withLocalize(AppleSignIn);
