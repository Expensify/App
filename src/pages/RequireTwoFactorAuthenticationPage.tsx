import React, {useCallback} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {Encryption} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isUserValidatedSelector} from '@selectors/Account';

function RequireTwoFactorAuthenticationPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [isUserValidated = false] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector, canBeMissing: true});

    const handleOnPress = useCallback(() => {
        if (isUserValidated) {
            Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.REQUIRE_TWO_FACTOR_AUTH));
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_2FA_VERIFY_ACCOUNT.getRoute({backTo: ROUTES.REQUIRE_TWO_FACTOR_AUTH, forwardTo: ROUTES.SETTINGS_2FA_ROOT.getRoute()}));
    }, [isUserValidated]);

    return (
        <ScreenWrapper testID={RequireTwoFactorAuthenticationPage.displayName}>
            <View style={styles.twoFARequiredContainer}>
                <View style={[styles.twoFAIllustration, styles.alignItemsCenter]}>
                    <Icon
                        src={Encryption}
                        width={variables.twoFAIconHeight}
                        height={variables.twoFAIconHeight}
                    />
                </View>
                <View style={[styles.mt2, styles.mh5, styles.dFlex, styles.alignItemsCenter]}>
                    <View style={styles.mb5}>
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter, styles.mv2]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsDescription')}</Text>
                    </View>
                    <Button
                        large
                        success
                        pressOnEnter
                        onPress={handleOnPress}
                        text={translate('twoFactorAuth.enableTwoFactorAuth')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

RequireTwoFactorAuthenticationPage.displayName = 'RequireTwoFactorAuthenticationPage';

export default RequireTwoFactorAuthenticationPage;
