import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import IconButton from '../IconButton';
import CONFIG from '../../../CONFIG';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';

const googleLogoIcon = require('../../../../assets/images/signIn/google-logo.svg').default;

const propTypes = {...withLocalizePropTypes};

const googleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.GOOGLE_SIGN_IN}`;

/**
 * Google Sign In button for desktop flow.
 * @returns {React.Component}
 */

function GoogleSignIn(props) {
    return (
        <View
            style={styles.appleButtonContainer}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.signInWithGoogle')}
        >
            <IconButton
                onPress={() => {
                    window.open(googleSignInWebRouteForDesktopFlow);
                }}
                icon={googleLogoIcon}
            />
        </View>
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;

export default withLocalize(GoogleSignIn);
