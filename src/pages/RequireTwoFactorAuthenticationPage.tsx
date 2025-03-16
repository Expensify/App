import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {Encryption} from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function RequireTwoFactorAuthenticationPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <ScreenWrapper testID={RequireTwoFactorAuthenticationPage.displayName}>
            <HeaderWithBackButton
                title={translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsHeader')}
                shouldShowBackButton={false}
                shouldDisplayHelpButton={false}
            />
            <View style={[styles.twoFARequiredContainer]}>
                <View style={[styles.cardSectionIllustration, styles.alignItemsCenter]}>
                    <Icon
                        src={Encryption}
                        width={variables.modalTopIconHeight}
                        height={variables.modalTopIconHeight}
                    />
                </View>
                <View style={[styles.mt5, styles.mh5]}>
                    <View style={[styles.gap2, styles.mb10]}>
                        <Text style={[styles.textHeadlineH1, styles.textAlignCenter]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsTitle')}</Text>
                        <Text style={[styles.textSupporting, styles.textAlignCenter]}>{translate('twoFactorAuth.twoFactorAuthIsRequiredForAdminsDescription')}</Text>
                    </View>
                    <Button
                        large
                        success
                        pressOnEnter
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_2FA_ROOT.getRoute(ROUTES.REQUIRE_TWO_FACTOR_AUTH))}
                        text={translate('twoFactorAuth.enableTwoFactorAuth')}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

RequireTwoFactorAuthenticationPage.displayName = 'RequireTwoFactorAuthenticationPage';

export default RequireTwoFactorAuthenticationPage;
