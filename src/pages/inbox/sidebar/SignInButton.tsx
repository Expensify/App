import Button from '@components/ButtonComposed';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {signOutAndRedirectToSignIn} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

function SignInButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={() => signOutAndRedirectToSignIn(undefined, undefined, true, undefined, session)}
            sentryLabel={CONST.SENTRY_LABEL.SIDEBAR.SIGN_IN_BUTTON}
        >
            <View style={[styles.signInButtonAvatar, styles.ph2]}>
                <Button
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={() => {
                        signOutAndRedirectToSignIn(undefined, undefined, true, undefined, session);
                    }}
                >
                    <Button.Text>{translate('common.signIn')}</Button.Text>
                </Button>
            </View>
        </PressableWithoutFeedback>
    );
}

export default SignInButton;
