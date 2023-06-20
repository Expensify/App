import React from 'react';
import {View} from 'react-native';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import ButtonBase from '../ButtonBase';
import CONFIG from '../../../CONFIG';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import appleLogoIcon from '../../../../assets/images/signIn/apple-logo.svg';

const propTypes = {...withLocalizePropTypes};

const appleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.APPLE_SIGN_IN}`;

/**
 * Apple Sign In button for desktop flow
 * @returns {React.Component}
 */

function AppleSignIn(props) {
    return (
        <View
            style={styles.appleButtonContainer}
            accessibilityRole="button"
            accessibilityLabel={props.translate('common.signInWithApple')}
        >
            <ButtonBase
                onPress={() => {
                    window.open(appleSignInWebRouteForDesktopFlow);
                }}
                icon={appleLogoIcon}
            />
        </View>
    );
}

AppleSignIn.displayName = 'AppleSignIn';
AppleSignIn.propTypes = propTypes;

export default withLocalize(AppleSignIn);
