import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import ButtonBase from '../ButtonBase';
import CONFIG from '../../../CONFIG';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';

const googleLogoIcon = require('../../../../assets/images/signIn/google-logo.svg').default;

const propTypes = {...withLocalizePropTypes};

const googleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.GOOGLE_SIGN_IN}`;

const GoogleSignIn = (props) => (
    <View
        style={styles.appleButtonContainer}
        accessibilityRole="button"
        accessibilityLabel={props.translate('common.signInWithGoogle')}
    >
        <ButtonBase
            onPress={() => {
                window.open(googleSignInWebRouteForDesktopFlow);
            }}
            icon={googleLogoIcon}
        />
    </View>
);

GoogleSignIn.displayName = 'GoogleSignIn';
GoogleSignIn.propTypes = propTypes;

export default withLocalize(GoogleSignIn);
