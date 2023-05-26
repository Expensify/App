import React from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import {beginAppleSignIn} from '../../../libs/actions/Session';

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

// Apple script may fail to render button if there are multiple of these divs
// present in the app, as its logic is based on div id. So we'll only mount the
// div when it should be visible.
const SingletonAppleLogoDiv = () => {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }
    return (
        <div
            style={{fontSize: '0'}}
            id="appleid-signin"
            data-mode="logo-only"
            data-color="white"
            data-border-radius="50"
            data-border="false"
            data-border-color="white"
            data-width="40"
            data-height="40"
            data-type="sign in"
            data-logo-size="medium"
        />
    );
};

const SingletonAppleFullWidthDiv = () => {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }
    return (
        <div
            style={{fontSize: '0'}}
            id="appleid-signin"
            data-mode="left-align"
            data-color="white"
            data-border="false"
            data-border-color="white"
            data-type="sign in"
            data-logo-size="medium"
            data-width="140"
            data-height="30"
        />
    );
};

const hardcodedToken = '';
const successListener = (event) => {
    // successful response:
    // { code: "...",
    // id_token: "..." }
    // should be: beginAppleSignIn(event.detail.id_token);
    // using:
    console.log('logging in with hardcoded token');
    beginAppleSignIn({token: hardcodedToken});
};

const failureListener = (event) => {
    console.log(event.detail);
};

const AppleSignIn = (props) => {
    React.useEffect(() => {
        if (window.appleAuthScriptLoaded) return;

        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//${localeCode}/appleid.auth.js`;
        script.async = true;

        const handleScriptLoad = () => {
            window.AppleID.auth.init(config);
            window.appleAuthScriptLoaded = true;
        };
        script.addEventListener('load', handleScriptLoad);
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            // Don't remove the script when unmounting because we want to reuse it
        };
    }, []);

    // result listeners
    React.useEffect(() => {
        if (!window.appleAuthScriptLoaded) return;

        document.addEventListener('AppleIDSignInOnSuccess', successListener);
        document.addEventListener('AppleIDSignInOnFailure', failureListener);
        return () => {
            document.removeEventListener('AppleIDSignInOnSuccess', successListener);
            document.removeEventListener('AppleIDSignInOnFailure', failureListener);
        };
    }, []);

    return (
        <View
            style={$appleButtonContainerStyle}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.signInWithApple')}
        >
            {props.isFullWidth ? <SingletonAppleFullWidthDiv /> : <SingletonAppleLogoDiv />}
        </View>
    );
};

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;
AppleSignIn.defaultProps = defaultProps;

export default withLocalize(AppleSignIn);
