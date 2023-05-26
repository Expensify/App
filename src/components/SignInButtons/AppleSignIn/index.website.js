import React from 'react';
import {View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import {beginAppleSignIn} from '../../../libs/actions/Session';

const propTypes = {...withLocalizePropTypes};

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
const SingletonAppleDiv = () => {
    const isFocused = useIsFocused();
    return isFocused ? (
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
        />
    ) : null;
};

const listenerHandler = (event) => console.log(event.detail);

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
    console.log(event);
};

// TODO: we get response twice with this approach. Hide it under useFocus, or create a single component for the script loading/listening elsewhere.

const AppleSignIn = (props) => {
    React.useEffect(() => {
        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//${localeCode}/appleid.auth.js`;
        script.async = true;

        const handleScriptLoad = () => {
            window.AppleID.auth.init(config);
        };
        script.addEventListener('load', handleScriptLoad);
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            document.body.removeChild(script);
        };
    }, []);

    // result listeners
    React.useEffect(() => {
        document.addEventListener('AppleIDSignInOnSuccess', successListener);
        document.addEventListener('AppleIDSignInOnFailure', listenerHandler);
        return () => {
            document.removeEventListener('AppleIDSignInOnSuccess', successListener);
            document.removeEventListener('AppleIDSignInOnFailure', listenerHandler);
        };
    }, []);

    return (
        <View
            style={$appleButtonContainerStyle}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.signInWithApple')}
        >
            <SingletonAppleDiv />
        </View>
    );
};

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;

export default withLocalize(AppleSignIn);
