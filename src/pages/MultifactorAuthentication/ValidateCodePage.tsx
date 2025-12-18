import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationValidateCodeResendButton from '@components/MultifactorAuthentication/ValidateCodeResendButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidValidateCode} from '@libs/ValidationUtils';
import {clearAccountMessages} from '@userActions/Session';
import {resendValidateCode} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type FormError = {
    inputCode?: TranslationPaths;
};

function MultifactorAuthenticationValidateCodePage() {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    // Onyx data
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const title: TranslationPaths = 'multifactorAuthentication.biometrics.additionalFactorPageTitle';
    const description: TranslationPaths = 'multifactorAuthentication.biometrics.additionalFactorMagicCodeContent';
    const contactMethod = account?.primaryLogin ?? '';
    const autoComplete: AutoCompleteVariant = 'one-time-code';
    const resendButtonText: TranslationPaths = 'validateCodeForm.magicCodeNotReceived';
    const errorMessages = {
        empty: 'validateCodeForm.error.pleaseFillMagicCode',
        invalid: 'validateCodeForm.error.incorrectMagicCode',
    } as const;

    // Local state
    const [inputCode, setInputCode] = useState('');
    const [formError, setFormError] = useState<FormError>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const [needToClearError, setNeedToClearError] = useState<boolean>(!!account?.errors);
    const {trigger, update} = useMultifactorAuthenticationContext();

    // Refs
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Derived state
    const hasError = !!account && !isEmptyObject(account?.errors) && !needToClearError;
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const shouldDisableResendCode = isOffline ?? account?.isLoading;
    const shouldShowTimer = timeRemaining > 0 && !isOffline;

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
        if (!(inputRef.current && hasError && (session?.autoAuthState === CONST.AUTO_AUTH_STATE.FAILED || account?.isLoading))) {
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
    }, [inputCode.length]);

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
     * Handle code input and clear formError upon text change
     */
    const onCodeInput = (text: string) => {
        setFormError({});
        setCanShowError(false);
        setInputCode(text);

        // Clear backend errors
        if (account?.errors) {
            clearAccountMessages();
        }
    };

    const resendValidationCode = () => {
        resendValidateCode(contactMethod);
        inputRef.current?.clear();
        setInputCode('');
        setFormError({});
        setCanShowError(false);
        setTimeRemaining(CONST.REQUEST_CODE_DELAY);
    };

    /**
     * Validate and submit form
     */
    const validateAndSubmitForm = () => {
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

        // Validate input
        if (!inputCode.trim()) {
            setFormError({inputCode: errorMessages.empty});
            return;
        }

        if (!isValidValidateCode(inputCode)) {
            setFormError({inputCode: errorMessages.invalid});
            return;
        }

        // Clear errors before submit
        setFormError({});

        // Call the submit callback (from context)
        update({validateCode: Number(inputCode)});
    };

    const onGoBackPress = () => {
        trigger(CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE);
        // Navigation.goBack();
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationValidateCodePage.displayName}>
            <HeaderWithBackButton
                title={translate(title)}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <Text style={[styles.m5, styles.mt3, styles.textNormal]}>{translate(description, {contactMethod})}</Text>
                <View style={[styles.mh5]}>
                    <MagicCodeInput
                        isDisableKeyboard
                        autoComplete={autoComplete}
                        name="multifactorAuthenticationValidateCode"
                        value={inputCode}
                        onChangeText={onCodeInput}
                        onFulfill={validateAndSubmitForm}
                        errorText={canShowError && formError.inputCode ? translate(formError.inputCode) : ''}
                        hasError={hasError}
                        ref={inputRef}
                        maxLength={CONST.MAGIC_CODE_LENGTH}
                    />
                    {hasError && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                    <MultifactorAuthenticationValidateCodeResendButton
                        shouldShowTimer={shouldShowTimer}
                        timeRemaining={timeRemaining}
                        shouldDisableResendCode={shouldDisableResendCode}
                        hasError={hasError}
                        resendButtonText={resendButtonText}
                        onResendValidationCode={resendValidationCode}
                    />
                </View>
                <Button
                    success
                    large
                    style={[styles.w100, styles.p5, styles.mtAuto]}
                    onPress={validateAndSubmitForm}
                    text={translate('common.verify')}
                    isLoading={isValidateCodeFormSubmitting}
                    isDisabled={isOffline}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationValidateCodePage.displayName = 'MultifactorAuthenticationValidateCodePage';

export default MultifactorAuthenticationValidateCodePage;
