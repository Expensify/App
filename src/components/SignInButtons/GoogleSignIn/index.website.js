import React, {useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import getUserLanguage from '../GetUserLanguage';
import * as Session from '../../../libs/actions/Session';
import CONST from '../../../CONST';
import styles from '../../../styles/styles';
import compose from '../../../libs/compose';
import withNavigationFocus from '../../withNavigationFocus';

const propTypes = {
    /** Whether we're rendering in the Desktop Flow, if so show a different button. */
    isDesktopFlow: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDesktopFlow: false,
};

/**
 * Google Sign In button for Web.
 * Depending on the isDesktopFlow prop, it will render a different button (Icon or Pill).
 * We have to load the gis script and then determine if the page is focused before rendering the button.
 * @returns {React.Component}
 */

function GoogleSignIn({translate, isDesktopFlow, isFocused}) {
    const id = 'google-sign-in-main';

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
            }
        }
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
        <View style={styles.googlePillButtonContainer}>
            <div
                id={id}
                accessibilityrole="button"
                accessibilitylabel={translate('common.signInWithGoogle')}
            />
        </View>
    ) : (
        <View style={styles.googleButtonContainer}>
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

export default compose(withLocalize, withNavigationFocus)(GoogleSignIn);
