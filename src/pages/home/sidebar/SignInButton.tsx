import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';

function SignInButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline, shouldForceOffline} = useNetwork();

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={() =>
                signOutAndRedirectToSignIn({
                    shouldSignOutFromOldDot: true,
                    isOffline,
                    shouldForceOffline,
                })
            }
        >
            <View style={(styles.signInButtonAvatar, styles.ph2)}>
                <Button
                    success
                    text={translate('common.signIn')}
                    onPress={() =>
                        signOutAndRedirectToSignIn({
                            shouldSignOutFromOldDot: true,
                            isOffline,
                            shouldForceOffline,
                        })
                    }
                />
            </View>
        </PressableWithoutFeedback>
    );
}

SignInButton.displayName = 'SignInButton';
export default SignInButton;
