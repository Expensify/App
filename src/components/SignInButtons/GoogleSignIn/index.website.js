import React, {useCallback} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import * as Session from '../../../libs/actions/Session';
import CONFIG from '../../../CONFIG';
import styles from '../../../styles/styles';

const propTypes = {
    /** Whether we're rendering in the Desktop Flow, if so show a different button. */
    isDesktopFlow: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDesktopFlow: false,
};

/** Div IDs for styling the two different Google Sign-In buttons. */
const mainId = 'google-sign-in-main';
const desktopId = 'google-sign-in-desktop';

const signIn = (response) => {
    Session.beginGoogleSignIn(response.credential);
};

/**
 * Google Sign In button for Web.
 * We have to load the gis script and then determine if the page is focused before rendering the button.
 * @returns {React.Component}
 */
function GoogleSignIn({translate, isDesktopFlow}) {
    const loadScript = useCallback(() => {
        const google = window.google;
        if (google) {
            google.accounts.id.initialize({
                client_id: CONFIG.GOOGLE_SIGN_IN.WEB_CLIENT_ID,
                callback: signIn,
            });
            // Apply styles for each button
            google.accounts.id.renderButton(document.getElementById(mainId), {
                theme: 'outline',
                size: 'large',
                type: 'icon',
                shape: 'circle',
            });
            google.accounts.id.renderButton(document.getElementById(desktopId), {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                shape: 'pill',
                width: '300px',
            });
        }
    }, []);

    React.useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.addEventListener('load', loadScript);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            script.removeEventListener('load', loadScript);
            document.body.removeChild(script);
        };
    }, [loadScript]);

    return isDesktopFlow ? (
        <View style={styles.googlePillButtonContainer}>
            <div
                id={desktopId}
                accessibilityrole="button"
                accessibilitylabel={translate('common.signInWithGoogle')}
            />
        </View>
    ) : (
        <View style={styles.googleButtonContainer}>
            <div
                id={mainId}
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
