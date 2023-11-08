/* eslint-disable rulesdir/onyx-props-must-have-default */
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import styles from '@styles/styles';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';

function SignInButton() {
    const {translate} = useLocalize();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
            onPress={Session.signOutAndRedirectToSignIn}
        >
            <View style={styles.signInButtonAvatar}>
                <Button
                    medium
                    success
                    text={translate('common.signIn')}
                    onPress={Session.signOutAndRedirectToSignIn}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

SignInButton.displayName = 'SignInButton';
export default SignInButton;
