import React, {useState, useMemo, useCallback, useRef} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type { MagicCodeInputHandle } from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import BigNumberPad from '@components/BigNumberPad';
import CONST from '@src/CONST';
import { isValidValidateCode, isValidTwoFactorCode} from '@libs/ValidationUtils';

function EnableBiometricsErrorPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.goBack();
    const [hasSuccesfullyVerifiedMagicCode, setHasSuccesfullyVerifiedMagicCode] = useState(false);
    const has2FAEnabled = false; // TODO: Replace with actual 2FA status from user account
    const hasPhoneNumber = false; // TODO: Replace with actual phone number status from user account
    const [inputCode, setInputCode] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');
    const [formError, setFormError] = useState<{inputCode?: string}>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const bottomButtonText = useMemo(() => hasSuccesfullyVerifiedMagicCode ? `common.continue` : `common.verify`, [hasSuccesfullyVerifiedMagicCode]);

    const [verified2FA, setVerified2FA] = useState(false); // TODO: Replace with actual 2FA verification status
    const [verifiedSmsOtp, setVerifiedSmsOtp] = useState(false); // TODO: Replace with actual SMS OTP verification status

    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     *
     * NOTE: If the same digit is pressed twice in a row, append it to the end of the string
     * so that useEffect inside MagicCodeInput will be triggered by artificial change of the value.
     */
    const updateLastPressedDigit = useCallback((key: string) => setLastPressedDigit(lastPressedDigit === key ? lastPressedDigit + key : key), [lastPressedDigit]);

    /**
     * Handle Magic code input
     */
    const onCodeInput = (text: string) => {
        setFormError({});
        setInputCode(text);
    };

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateSubmitAndNavigateToNextStep = useCallback(() => {
        setCanShowError(true);

        if (inputRef.current) {
            inputRef.current.blur();
        }

        if (!hasSuccesfullyVerifiedMagicCode) {
            if (inputCode.trim().length !== CONST.MAGIC_CODE_LENGTH) {
                setFormError({inputCode: translate('validateCodeForm.error.pleaseFillMagicCode')});
                return;
            }

            if (!isValidValidateCode(inputCode)) {
                setFormError({inputCode: translate('validateCodeForm.error.incorrectMagicCode')});
                return;
            }
        } else if (has2FAEnabled) {
            if (inputCode.trim().length !== CONST.MAGIC_CODE_LENGTH) {
                setFormError({inputCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
                return;
            }

            if (!isValidTwoFactorCode(inputCode)) {
                setFormError({inputCode: translate('twoFactorAuthForm.error.incorrect2fa')});
                return;
            }
        } else {
            if (inputCode.trim().length !== CONST.MAGIC_CODE_LENGTH) {
                setFormError({inputCode: translate('smsOtpForm.error.pleaseFillSmsOtp')});
                return;
            }

            if (!isValidValidateCode(inputCode)) {
                setFormError({inputCode: translate('smsOtpForm.error.incorrectSmsOtp')});
                return;
            }
        }

        setFormError({});

        if (!hasSuccesfullyVerifiedMagicCode) {
            setHasSuccesfullyVerifiedMagicCode(true);
            setInputCode('');
            setCanShowError(false);
            setFormError({});
        } else if (has2FAEnabled) {
            setVerified2FA(true);
            setInputCode('');
            setCanShowError(false);
            setFormError({});
        } else {
            setVerifiedSmsOtp(true);
            setInputCode('');
            setCanShowError(false);
            setFormError({});
        }

    }, [inputCode, translate]);

    return (
        <ScreenWrapper testID={EnableBiometricsErrorPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <View style={[styles.flex1]}>
                <MagicCodeInput
                    isDisableKeyboard
                    autoComplete={hasSuccesfullyVerifiedMagicCode && !has2FAEnabled ? "sms-otp" : "one-time-code"}
                    name="enableBiometricsFallbackCode"
                    value={inputCode}
                    lastPressedDigit={lastPressedDigit}
                    onChangeText={onCodeInput}
                    onFulfill={validateSubmitAndNavigateToNextStep}
                    errorText={canShowError ? formError.inputCode : ''}
                    ref={inputRef}
                />
            </View>
            <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pv0]}>{canUseTouchScreen() && <BigNumberPad numberPressed={updateLastPressedDigit} />}</View>
            <View style={[styles.flexRow, styles.m5]}>
                <Button
                    success
                    style={[styles.flex1]}
                    onPress={validateSubmitAndNavigateToNextStep}
                    text={translate(bottomButtonText)}
                />
            </View>
        </ScreenWrapper>
    );
}

EnableBiometricsErrorPage.displayName = 'EnableBiometricsErrorPage';

export default EnableBiometricsErrorPage;