import React, {useState, useMemo, useCallback, useRef, useEffect} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useStyleUtils from '@hooks/useStyleUtils';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import type { MagicCodeInputHandle } from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import BigNumberPad from '@components/BigNumberPad';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import { isValidValidateCode, isValidTwoFactorCode} from '@libs/ValidationUtils';
import Text from '@components/Text';
import ConfirmationPage from '@components/ConfirmationPage';
import RenderHTML from '@components/RenderHTML';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {clearAccountMessages} from '@userActions/Session';
import type { TranslationPaths } from '@src/languages/types';
import {resendValidateCode} from '@userActions/User';
// TODO: Implement those API calls
// import {verifyBiometricsMagicCode, verifyBiometrics2FA, verifyBiometricsSmsOtp} from '@userActions/User'; ?

type FormError = {
    inputCode?: string;
};

type VerificationStep = 'magicCode' | 'twoFactorAuth' | 'smsOtp';

function EnableBiometricsFallbackPage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    
    // Onyx data
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE, {canBeMissing: true});
    
    // Local state
    const [hasVerifiedMagicCode, setHasVerifiedMagicCode] = useState(false);
    const [inputCode, setInputCode] = useState('');
    const [lastPressedDigit, setLastPressedDigit] = useState('');
    const [formError, setFormError] = useState<FormError>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const [needToClearError, setNeedToClearError] = useState<boolean>(!!account?.errors);
    
    // Refs
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    
    // Derived data from Onyx
    const email = credentials?.login ?? '';
    // TODO: Add phoneNumber field to account in Onyx
    // const phoneNumber = account?.phoneNumber ?? '';
    const phoneNumber = '+48660939866'
    const hasPhoneNumber = !!phoneNumber;
    const has2FAEnabled = account?.requiresTwoFactorAuth ?? false;
    
    // TODO: Add biometricsEnabled field to account in Onyx
    // const hasSuccessfullyEnabledBiometrics = account?.biometricsEnabled ?? false;
    const [hasSuccessfullyEnabledBiometrics, setHasSuccessfullyEnabledBiometrics] = useState(false);
    
    // Derived state
    const hasError = !!account && !isEmptyObject(account?.errors) && !needToClearError;
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const shouldDisableResendCode = isOffline ?? account?.isLoading;
    const shouldShowTimer = timeRemaining > 0 && !isOffline;
    
    const currentStep: VerificationStep = useMemo(() => {
        if (!hasVerifiedMagicCode) {return 'magicCode';}
        if (has2FAEnabled) {return 'twoFactorAuth';}
        return 'smsOtp';
    }, [hasVerifiedMagicCode, has2FAEnabled]);
    
    const bottomButtonText = useMemo(() => 
        hasVerifiedMagicCode ? 'common.verify' : 'common.continue', 
        [hasVerifiedMagicCode]
    );

    const onGoBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    // Validation: redirect if no 2FA and no phone
    useEffect(() => {
        if (has2FAEnabled || hasPhoneNumber) {
            return;
        }
        onGoBackPress();
    }, [has2FAEnabled, hasPhoneNumber, onGoBackPress]);

    // Timer handling
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

    // Auto-blur on error
    useEffect(() => {
        if (!(inputRef.current && hasError && 
              (session?.autoAuthState === CONST.AUTO_AUTH_STATE.FAILED || account?.isLoading))) {
            return;
        }
        inputRef.current.blur();
    }, [account?.isLoading, session?.autoAuthState, hasError]);

    // Clear input when code is reset
    useEffect(() => {
        if (!inputRef.current || inputCode.length > 0) {
            return;
        }
        inputRef.current.clear();
    }, [inputCode]);

    // Handle needToClearError
    useEffect(() => {
        if (!needToClearError) {
            return;
        }

        if (account?.errors) {
            clearAccountMessages();
            return;
        }
        setNeedToClearError(false);
    }, [account?.errors, needToClearError]);

    // Reset formError when hasError changes
    useEffect(() => {
        if (!hasError) {
            return;
        }
        setFormError({});
    }, [hasError]);

    /**
     * Update lastPressedDigit with value that was pressed on BigNumberPad.
     */
    const updateLastPressedDigit = useCallback((key: string) => {
        setLastPressedDigit(lastPressedDigit === key ? lastPressedDigit + key : key);
    }, [lastPressedDigit]);

    /**
     * Handle code input and clear formError upon text change
     */
    const onCodeInput = useCallback((text: string) => {
        setFormError({});
        setCanShowError(false);
        setInputCode(text);
        
        // Clear backend errors
        if (account?.errors) {
            clearAccountMessages();
        }
    }, [account?.errors]);

    const resendValidationCode = useCallback(() => {
        const contactMethod = currentStep === 'magicCode' ? email : phoneNumber;
        resendValidateCode(contactMethod);
        inputRef.current?.clear();
        setInputCode('');
        setFormError({});
        setCanShowError(false);
        setTimeRemaining(CONST.REQUEST_CODE_DELAY);
    }, [currentStep, email, phoneNumber]);

    /**
     * Validate and submit form
     */
    const validateAndSubmitForm = useCallback(() => {
        // Check if already loading
        if (account?.isLoading) {
            return;
        }

        // Clear backend errors before validation
        if (account?.errors) {
            clearAccountMessages();
        }

        setCanShowError(true);

        // Blur input
        if (inputRef.current) {
            inputRef.current.blur();
        }

        // Step 1: Magic Code validation
        if (!hasVerifiedMagicCode) {
            if (!inputCode.trim()) {
                setFormError({inputCode: 'validateCodeForm.error.pleaseFillMagicCode'});
                return;
            }

            if (!isValidValidateCode(inputCode)) {
                setFormError({inputCode: 'validateCodeForm.error.incorrectMagicCode'});
                return;
            }

            // Clear errors before submit
            setFormError({});

            // TODO: Replace with actual action
            // verifyBiometricsMagicCode(email, inputCode, preferredLocale);
            console.log('Verifying magic code:', inputCode);
            
            // Mock success - TODO: Remove this when API is connected
            setTimeout(() => {
                setHasVerifiedMagicCode(true);
                setInputCode('');
                setCanShowError(false);
                if (has2FAEnabled || hasPhoneNumber) {
                    setTimeRemaining(CONST.REQUEST_CODE_DELAY);
                }
            }, 1000);

            return;
        }

        // Step 2a: 2FA Code validation
        if (has2FAEnabled) {
            if (!inputCode.trim()) {
                setFormError({inputCode: 'validateCodeForm.error.pleaseFillTwoFactorAuth'});
                return;
            }

            if (!isValidTwoFactorCode(inputCode)) {
                setFormError({inputCode: 'passwordForm.error.incorrect2fa'});
                return;
            }

            // Clear errors before submit
            setFormError({});

            // TODO: Replace with actual action
            // verifyBiometrics2FA(inputCode);
            console.log('Verifying 2FA code:', inputCode);
            
            // Mock success - TODO: Remove this when API is connected
            setTimeout(() => {
                // TODO: Call an actual acction that will set account.biometricsEnabled = true
                setHasSuccessfullyEnabledBiometrics(true);
                setInputCode('');
                setCanShowError(false);
            }, 1000);

            return;
        }

        // Step 2b: SMS OTP validation
        if (!inputCode.trim()) {
            setFormError({inputCode: 'smsOtpForm.error.pleaseFillSmsOtp'});
            return;
        }

        if (!isValidValidateCode(inputCode)) {
            setFormError({inputCode: 'smsOtpForm.error.incorrectSmsOtp'});
            return;
        }

        // Clear errors before submit
        setFormError({});

        // TODO: Replace with actual action
        // verifyBiometricsSmsOtp(phoneNumber, inputCode);
        console.log('Verifying SMS OTP:', inputCode);
        
        // Mock success - TODO: Remove this when API is connected
        setTimeout(() => {
            // TODO: Call an actual acction that will set account.biometricsEnabled = true
            setHasSuccessfullyEnabledBiometrics(true)
            setInputCode('');
            setCanShowError(false);
        }, 1000);

    }, [
        account?.isLoading,
        account?.errors,
        inputCode,
        hasVerifiedMagicCode,
        has2FAEnabled,
        email,
        phoneNumber,
        preferredLocale,
        hasPhoneNumber,
    ]);

    /**
     * Render content based on current step
     */
    const renderMagicCodeContent = () => {
        if (!hasVerifiedMagicCode) {
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

    /**
     * Render resend code button with timer
     */
    const renderResendCodeButton = () => {
        // Don't show resend for 2FA (2FA codes don't have resend)
        if (currentStep === 'twoFactorAuth') {
            return null;
        }

        const resendText = currentStep === 'magicCode' 
            ? 'validateCodeForm.magicCodeNotReceived'
            : 'validateCodeForm.magicCodeNotReceived'; // TODO: Add SMS-specific translation key

        if (shouldShowTimer) {
            return (
                <View style={[styles.mt5, styles.flexRow, styles.renderHTML]}>
                    <RenderHTML
                        html={translate('validateCodeForm.requestNewCode', {
                            timeRemaining: `00:${String(timeRemaining).padStart(2, '0')}`,
                        })}
                    />
                </View>
            );
        }

        return (
            <PressableWithFeedback
                style={[styles.mt5]}
                onPress={resendValidationCode}
                disabled={shouldDisableResendCode}
                hoverDimmingValue={1}
                pressDimmingValue={0.2}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={translate(resendText)}
            >
                <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendCode)]}>
                    {hasError 
                        ? translate('validateCodeForm.requestNewCodeAfterErrorOccurred') 
                        : translate(resendText)
                    }
                </Text>
            </PressableWithFeedback>
        );
    };

    return (
        <ScreenWrapper testID={EnableBiometricsFallbackPage.displayName}>
            <HeaderWithBackButton
                title={translate('initialSettingsPage.troubleshoot.biometrics.fallbackPageTitle')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            {!hasSuccessfullyEnabledBiometrics ? (
                <>
                    {renderMagicCodeContent()} 
                    <View style={[styles.mh5]}>
                        <MagicCodeInput
                            isDisableKeyboard
                            autoComplete={currentStep === 'smsOtp' ? "sms-otp" : "one-time-code"}
                            name="enableBiometricsFallbackCode"
                            value={inputCode}
                            lastPressedDigit={lastPressedDigit}
                            onChangeText={onCodeInput}
                            onFulfill={validateAndSubmitForm}
                            errorText={canShowError && formError.inputCode ? translate(formError.inputCode as TranslationPaths) : ''}
                            hasError={hasError}
                            ref={inputRef}
                            maxLength={currentStep === 'twoFactorAuth' ? CONST.TFA_CODE_LENGTH : CONST.MAGIC_CODE_LENGTH}
                            key={currentStep}
                        />
                        {hasError && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                        {renderResendCodeButton()}
                    </View>
                    <View style={[styles.w100, styles.justifyContentEnd, styles.pageWrapper, styles.pv0]}>
                        {canUseTouchScreen() && <BigNumberPad numberPressed={updateLastPressedDigit} />}
                    </View>
                    <Button
                        success
                        large
                        style={[styles.w100, styles.p5, styles.mtAuto]}
                        onPress={validateAndSubmitForm}
                        text={translate(bottomButtonText)}
                        isLoading={isValidateCodeFormSubmitting}
                        isDisabled={isOffline}
                    />
                </>
            ) : (
                <ConfirmationPage
                    heading={translate('initialSettingsPage.troubleshoot.biometrics.notificationTitle')}
                    description={translate('initialSettingsPage.troubleshoot.biometrics.notificationFallbackContent')}
                    shouldShowButton
                    buttonText={translate('common.buttonConfirm')}
                    onButtonPress={onGoBackPress}
                    containerStyle={styles.flex1}
                />
            )}
        </ScreenWrapper>
    );
}

EnableBiometricsFallbackPage.displayName = 'EnableBiometricsFallbackPage';

export default EnableBiometricsFallbackPage;