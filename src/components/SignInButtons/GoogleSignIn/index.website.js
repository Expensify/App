import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import * as Session from '@userActions/Session';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

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
    const styles = useThemeStyles();
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

    // willChangeTransform is used to prevent the icon cut in safari when the overflow hidden and width given to the parent
    // ref: https://stackoverflow.com/questions/75306089/safari-when-using-border-radius-and-overflow-hidden-to-parent-and-the-child-th
    return isDesktopFlow ? (
        <View style={styles.googlePillButtonContainer}>
            <div
                id={desktopId}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                aria-label={translate('common.signInWithGoogle')}
            />
        </View>
    ) : (
        <View style={[styles.googleButtonContainer, styles.willChangeTransform]}>
            <div
                id={mainId}
                role={CONST.ACCESSIBILITY_ROLE.BUTTON}
                aria-label={translate('common.signInWithGoogle')}
            />
        </View>
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;
GoogleSignIn.defaultProps = defaultProps;

export default withLocalize(GoogleSignIn);
