import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import APPLE_CONFIG from './AppleConfig';

const propTypes = {...withLocalizePropTypes};

const $appleButtonContainerStyle = {
    width: 40, height: 40, marginRight: 20,
};

const AppleSignIn = (props) => {
    React.useEffect(() => {
        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        script.src = `https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1//${localeCode}/appleid.auth.js`;
        script.async = true;

        const handleScriptLoad = () => {
            window.AppleID.auth.init({
                clientId: APPLE_CONFIG.CLIENT_ID,
                scope: APPLE_CONFIG.SCOPE,
                redirectURI: APPLE_CONFIG.REDIRECT_URI,
                state: APPLE_CONFIG.STATE,
                usePopup: APPLE_CONFIG.USEPOPUP,
            });
        };
        script.addEventListener('load', handleScriptLoad);
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            document.body.removeChild(script);
        };
    }, []);

    return (
        <View
            style={$appleButtonContainerStyle}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.signInWithApple')}
        >
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
        </View>

    );
};

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;

export default withLocalize(AppleSignIn);
