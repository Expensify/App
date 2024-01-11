import React from 'react';
import {View} from 'react-native';
import IconButton from '@components/SignInButtons/IconButton';
import useThemeStyles from '@hooks/useThemeStyles';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

const googleSignInWebRouteForDesktopFlow = `${CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL}${ROUTES.GOOGLE_SIGN_IN}`;

/**
 * Google Sign In button for desktop flow.
 */
function GoogleSignIn() {
    const styles = useThemeStyles();
    return (
        <View style={styles.desktopSignInButtonContainer}>
            <IconButton
                onPress={() => {
                    window.open(googleSignInWebRouteForDesktopFlow);
                }}
                provider={CONST.SIGN_IN_METHOD.GOOGLE}
            />
        </View>
    );
}

GoogleSignIn.displayName = 'GoogleSignIn';

export default GoogleSignIn;
