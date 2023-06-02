import React, {useCallback} from 'react';
import {View} from 'react-native';import {useIsFocused} from '@react-navigation/native';

import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import * as Session from '../../../libs/actions/Session';
import CONST from '../../../CONST';

const propTypes = {
    isDesktopFlow: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDesktopFlow: false,
};

const $googleContainerStyle = {
    height: 40,
    width: 40,
    alignItems: 'center',
    marginLeft: 12,
};

const $continueWithGoogleContainerStyle = {
    height: 40,
    width: 219,
    // alignItems: 'center',
};

function GoogleSignIn({ id, translate, isDesktopFlow }) {
    const isFocused = useIsFocused();

    const handleCredentialResponse = useCallback((response) => {
        Session.beginGoogleSignIn(response.credential);
    }, []);

    const handleScriptLoad = useCallback(() => {
        const google = window.google;
        if (google) {
            google.accounts.id.initialize({
                client_id: CONST.GOOGLE_SIGN_IN_WEB_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            if (isDesktopFlow) {
            google.accounts.id.renderButton(document.getElementById(id), {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
            });
            } else {
            google.accounts.id.renderButton(document.getElementById(id), {
                theme: 'outline',
                size: 'large',
                type: 'icon',
                shape: 'circle',
            });
        }}
    }, [id, handleCredentialResponse, isDesktopFlow]);

    React.useEffect(() => {
        const localeCode = getUserLanguage();
        const script = document.createElement('script');
        if (isDesktopFlow) {
            script.src = 'https://accounts.google.com/gsi/client';
        } else {
            script.src = `https://accounts.google.com/gsi/client?h1${localeCode}`;
        }
        script.addEventListener('load', handleScriptLoad);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', handleScriptLoad);
            document.body.removeChild(script);
        };
    }, [handleScriptLoad, isDesktopFlow]);

    if (!isFocused) {
        return null;
    }

    return isDesktopFlow ? (
        <View style={$continueWithGoogleContainerStyle}>
            <div
                id={id}
                accessibilityrole="button"
                accessibilitylabel={translate('common.signInWithGoogle')}
            />
        </View>
    ) : (
        <View style={$googleContainerStyle}>
            <div
                id={id}
                accessibilityrole="button"
                accessibilitylabel={translate('common.signInWithGoogle')}
            />
        </View>
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;
GoogleSignIn.defaultProps = defaultProps;

export default withLocalize(GoogleSignIn);
