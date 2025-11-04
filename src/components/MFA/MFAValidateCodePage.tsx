import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
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

type MFAValidateCodePageProps = {
    // Configuration
    title: TranslationPaths;
    description: TranslationPaths;
    contactMethod: string;
    autoComplete: AutoCompleteVariant;

    // Error messages
    errorMessages: {
        empty: TranslationPaths;
        invalid: TranslationPaths;
    };

    // Resend button text
    resendButtonText: TranslationPaths;

    // Submit handler from context
    onSubmit: (code: string) => void;

    // Optional: external loading state (from context)
    isVerifying?: boolean;
};

function MFAValidateCodePage({title, description, contactMethod, autoComplete, errorMessages, resendButtonText, onSubmit, isVerifying = false}: MFAValidateCodePageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    // Onyx data
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    // Local state
    const [inputCode, setInputCode] = useState('');
    const [formError, setFormError] = useState<FormError>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const [timeRemaining, setTimeRemaining] = useState(CONST.REQUEST_CODE_DELAY as number);
    const [needToClearError, setNeedToClearError] = useState<boolean>(!!account?.errors);

    // Refs
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const hasInitiallySentCodeRef = useRef(false);

    // Derived state
    const hasError = !!account && !isEmptyObject(account?.errors) && !needToClearError;
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const shouldDisableResendCode = isOffline ?? account?.isLoading;
    const shouldShowTimer = timeRemaining > 0 && !isOffline;

    // Send validation code on mount (first time)
    useEffect(() => {
        if (hasInitiallySentCodeRef.current || !contactMethod) {
            return;
        }
        hasInitiallySentCodeRef.current = true;
        resendValidateCode(contactMethod);
    }, [contactMethod]);

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
     * Handle code input and clear formError upon text change
     */
    const onCodeInput = useCallback(
        (text: string) => {
            setFormError({});
            setCanShowError(false);
            setInputCode(text);

            // Clear backend errors
            if (account?.errors) {
                clearAccountMessages();
            }
        },
        [account?.errors],
    );

    const resendValidationCode = useCallback(() => {
        resendValidateCode(contactMethod);
        inputRef.current?.clear();
        setInputCode('');
        setFormError({});
        setCanShowError(false);
        setTimeRemaining(CONST.REQUEST_CODE_DELAY);
    }, [contactMethod]);

    /**
     * Validate and submit form
     */
    const validateAndSubmitForm = useCallback(() => {
        // Check if already loading
        if (account?.isLoading || isVerifying) {
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
        onSubmit(inputCode);
    }, [account?.isLoading, account?.errors, inputCode, errorMessages, onSubmit, isVerifying]);

    const onGoBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    /**
     * Render resend code button with timer
     */
    const renderResendCodeButton = useCallback(() => {
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
                accessibilityLabel={translate(resendButtonText)}
            >
                <Text style={[StyleUtils.getDisabledLinkStyles(shouldDisableResendCode)]}>
                    {hasError ? translate('validateCodeForm.requestNewCodeAfterErrorOccurred') : translate(resendButtonText)}
                </Text>
            </PressableWithFeedback>
        );
    }, [shouldShowTimer, timeRemaining, styles, translate, resendValidationCode, shouldDisableResendCode, resendButtonText, hasError, StyleUtils]);

    return (
        <ScreenWrapper testID={MFAValidateCodePage.displayName}>
            <HeaderWithBackButton
                title={translate(title)}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <Text style={[styles.mh5, styles.mb6, styles.textNormal]}>
                {
                    // @ts-expect-error translation can have parameters
                    translate(description, {contactMethod})
                }
            </Text>
            <View style={[styles.mh5]}>
                <MagicCodeInput
                    isDisableKeyboard
                    autoComplete={autoComplete}
                    name="mfaValidateCode"
                    value={inputCode}
                    onChangeText={onCodeInput}
                    onFulfill={validateAndSubmitForm}
                    errorText={canShowError && formError.inputCode ? translate(formError.inputCode) : ''}
                    hasError={hasError}
                    ref={inputRef}
                    maxLength={CONST.MAGIC_CODE_LENGTH}
                />
                {hasError && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                {renderResendCodeButton()}
            </View>
            <Button
                success
                large
                style={[styles.w100, styles.p5, styles.mtAuto]}
                onPress={validateAndSubmitForm}
                text={translate('common.verify')}
                isLoading={isValidateCodeFormSubmitting || isVerifying}
                isDisabled={isOffline}
            />
        </ScreenWrapper>
    );
}

MFAValidateCodePage.displayName = 'MFAValidateCodePage';

export default memo(MFAValidateCodePage);
