import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {signOutAndRedirectToSignIn} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function SignInButton() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [network] = useOnyx(ONYXKEYS.NETWORK, {canBeMissing: true});

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('sidebarScreen.buttonMySettings')}
            role={CONST.ROLE.BUTTON}
            onPress={() => signOutAndRedirectToSignIn({
                shouldSignOutFromOldDot: true,
                isOffline: network?.isOffline,
                shouldForceOffline: network?.shouldForceOffline,
            })}
        >
            <View style={(styles.signInButtonAvatar, styles.ph2)}>
                <Button
                    success
                    text={translate('common.signIn')}
                    onPress={() => signOutAndRedirectToSignIn({
                shouldSignOutFromOldDot: true,
                isOffline: network?.isOffline,
                shouldForceOffline: network?.shouldForceOffline,
            })}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

SignInButton.displayName = 'SignInButton';
export default SignInButton;
