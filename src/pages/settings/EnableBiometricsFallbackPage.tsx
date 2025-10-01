import React, {useState, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Text from '@components/Text';
import MagicCodeInput from '@components/MagicCodeInput';

function EnableBiometricsErrorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.goBack();
    const [hasSuccesfullyVerifiedMagicCode, setHasSuccesfullyVerifiedMagicCode] = useState(false);
    const [magicCode, setMagicCode] = useState('');
    const has2FAEnabled = false; // TODO: Replace with actual 2FA status from user account
    const hasPhoneNumber = false; // TODO: Replace with actual phone number status from user account

    const bottomButtonText = useMemo(() => hasSuccesfullyVerifiedMagicCode ? `common.continue` : `common.verify`, [hasSuccesfullyVerifiedMagicCode]);

    return (
        <ScreenWrapper testID={EnableBiometricsErrorPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                {!hasSuccesfullyVerifiedMagicCode ? (
                    <MagicCodeInput
                        isDisableKeyboard
                        autoComplete="one-time-code"
                        name="activateCardCode"
                        value={lastFourDigits}
                        lastPressedDigit={lastPressedDigit}
                        onChangeText={onCodeInput}
                        onFulfill={submitAndNavigateToNextPage}
                        errorText={canShowError ? formError || cardError : ''}
                        ref={activateCardCodeInputRef}
                    />
                ) : ()}
            </View>
            <View style={[styles.flexRow, styles.m5]}>
                <Button
                    success
                    style={[styles.flex1]}
                    onPress={onGoBackPress}
                    text={translate(bottomButtonText)}
                />
            </View>
        </ScreenWrapper>
    );
}

EnableBiometricsErrorPage.displayName = 'EnableBiometricsErrorPage';

export default EnableBiometricsErrorPage;