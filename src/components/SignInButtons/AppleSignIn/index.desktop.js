import React from 'react';
import {View} from 'react-native';
import IconButton from '../IconButton';
import CONFIG from '../../../CONFIG';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';

const appleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.APPLE_SIGN_IN}`;

/**
 * Apple Sign In button for desktop flow
 * @returns {React.Component}
 */

function AppleSignIn() {
    return (
        <View style={styles.appleButtonContainer}>
            <IconButton
                onPress={() => {
                    window.open(appleSignInWebRouteForDesktopFlow);
                }}
                provider={CONST.SIGN_IN_METHOD.APPLE}
            />
        </View>
    );
}

AppleSignIn.displayName = 'AppleSignIn';

export default AppleSignIn;
