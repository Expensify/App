import React from 'react';
import {View} from 'react-native';
import IconButton from '@components/SignInButtons/IconButton';
import useThemeStyles from '@styles/useThemeStyles';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const appleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.APPLE_SIGN_IN}`;

/**
 * Apple Sign In button for desktop flow
 * @returns {React.Component}
 */
function AppleSignIn() {
    const styles = useThemeStyles();
    return (
        <View style={styles.desktopSignInButtonContainer}>
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
