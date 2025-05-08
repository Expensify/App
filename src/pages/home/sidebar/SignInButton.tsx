import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';

function SignInButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={() => signOutAndRedirectToSignIn()}
        >
            <View style={(styles.signInButtonAvatar, styles.ph2)}>
                <Button
                    success
                    text={translate('common.signIn')}
                    onPress={() => signOutAndRedirectToSignIn()}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

SignInButton.displayName = 'SignInButton';
export default SignInButton;
