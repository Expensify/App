import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
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
import Text from '@components/Text';
import ConfirmationPage from '@components/ConfirmationPage';
import RenderHTML from '@components/RenderHTML';
import useNetwork from '@hooks/useNetwork';


function EnableBiometricsFallbackPage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.goBack();
    const [hasSuccesfullyVerifiedMagicCode, setHasSuccesfullyVerifiedMagicCode] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');
    const [formError, setFormError] = useState<{inputCode?: string}>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const bottomButtonText = useMemo(() => hasSuccesfullyVerifiedMagicCode ? `common.verify` : `common.continue`, [hasSuccesfullyVerifiedMagicCode]);
    const email = 'placeholder@email.com' // TODO: Replcae with actual logic responsible for retrieving the factual email of user
    const phoneNumber = '+15555264234'; // TODO: Replace with actual logic retrieving the factual phone number of user
    const hasPhoneNumber = false; // TODO: Replace of actual logic validating if the user has provided a (correct) phone number
    const has2FAEnabled = true; // TODO: Replace with actual 2FA status from user account
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const [verified2FA, setVerified2FA] = useState(false); // TODO: Replace with actual 2FA verification status
    const [verifiedSmsOtp, setVerifiedSmsOtp] = useState(false); // TODO: Replace with actual SMS OTP verification status

    const [hasSuccesfullyEnabledBiometrics, setHasSuccesfullyEnabledBiometrics] = useState(false); // TODO: Replace with actual Biometrics status

    if (!has2FAEnabled && !hasPhoneNumber) {
        onGoBackPress();
    }
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
        } else if (has2FAEnabled) {
            setVerified2FA(true);
        } else {
            setVerifiedSmsOtp(true);
        }
        setInputCode('');
        setCanShowError(false);
        setFormError({});

    }, [inputCode, translate]);

    useEffect(() => {
        if (!(verified2FA || verifiedSmsOtp)) {
            return;
        }
        setHasSuccesfullyEnabledBiometrics(true);
    }, [verified2FA, verifiedSmsOtp]);

    const renderMagicCodeContent = () => {
        if (!hasSuccesfullyVerifiedMagicCode) {
            return (
                <Text style={[styles.mh5, styles.mb6, styles.textNormal]}>
                    {translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageMagicCodeContent', { contactMethod: email})}
                </Text>
            );
        }

        if (has2FAEnabled) {
            return (
                <Text style={[styles.mh5, styles.mb6, styles.textNormal]}>
                    {translate('initialSettingsPage.troubleshoot.biometrics.fallbackPage2FAContent')}
                </Text>
            );
        }

        return (
            <Text style={[styles.mh5, styles.mb6, styles.textNormal]}>
                {translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageSMSotpContent', { contactMethod: phoneNumber })}
            </Text>
        );
    };

    useEffect(() => {
        if (timeRemaining > 0) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining(timeRemaining - 1);
            }, 1000);
        }
        return () => {
            clearTimeout(timerRef.current);
        };
    }, [timeRemaining]);

    const shouldShowTimer = timeRemaining > 0 && !isOffline;

    return (
        <ScreenWrapper testID={EnableBiometricsFallbackPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            {!hasSuccesfullyEnabledBiometrics ? (
                <>
                    {renderMagicCodeContent()} 
                    <View style={[styles.mh5]}>
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
                        {shouldShowTimer && (
                            <View style={[styles.mt5, styles.flexRow, styles.renderHTML]}>
                                <RenderHTML
                                    html={translate('validateCodeForm.requestNewCode', {
                                        timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
                                    })}
                                />
                            </View>
                        )}
                    </View>
                    <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pv0]}>{canUseTouchScreen() && <BigNumberPad numberPressed={updateLastPressedDigit} />}</View>
                    <Button
                        success
                        style={[styles.w100, styles.p5, styles.mtAuto]}
                        onPress={validateSubmitAndNavigateToNextStep}
                        text={translate(bottomButtonText)}
                    />
                </>
            ) : (
                <ConfirmationPage
                    heading={translate('initialSettingsPage.troubleshoot.biometrics.notificationTitle')}
                    description={translate('initialSettingsPage.troubleshoot.biometrics.notificationFallbackContent')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={() => onGoBackPress()}
                    containerStyle={styles.flex1}
                />
            )}
        </ScreenWrapper>
    );
}

EnableBiometricsFallbackPage.displayName = 'EnableBiometricsFallbackPage';

export default EnableBiometricsFallbackPage;