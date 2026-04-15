import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import {DefaultCancelConfirmModal} from '@components/MultifactorAuthentication/components/Modals';
import {useMultifactorAuthentication, useMultifactorAuthenticationActions, useMultifactorAuthenticationState} from '@components/MultifactorAuthentication/Context';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import MultifactorAuthenticationValidateCodeResendButton from '@components/MultifactorAuthentication/ValidateCodeResendButton';
import type {MultifactorAuthenticationValidateCodeResendButtonHandle} from '@components/MultifactorAuthentication/ValidateCodeResendButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorField, getLatestErrorMessage} from '@libs/ErrorUtils';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import {isValidValidateCode} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import {clearAccountMessages} from '@userActions/Session';
import {clearValidateCodeActionError, requestValidateCodeAction} from '@userActions/User';
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
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [validateActionCode] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const contactMethod = usePrimaryContactMethod();

    // Local state
    const [inputCode, setInputCode] = useState('');
    const [formError, setFormError] = useState<FormError>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const {cancel} = useMultifactorAuthentication();
    const [isCancelModalVisible, setCancelModalVisibility] = useState(false);

    const state = useMultifactorAuthenticationState();
    const {dispatch} = useMultifactorAuthenticationActions();
    const {continuableError} = state;

    // Refs
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const resendButtonRef = useRef<MultifactorAuthenticationValidateCodeResendButtonHandle>(null);
    const hasClearedInitialErrorsRef = useRef(false);

    // Derived state
    const hasAccountError = !!account && !isEmptyObject(account?.errors);
    const hasContinuableError = !!continuableError;
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const shouldDisableResendCode = isOffline ?? account?.isLoading;
    const validateCodeActionError = getLatestErrorField(validateActionCode, 'actionVerified');
    const hasValidateCodeActionError = !isEmptyObject(validateCodeActionError);
    const hasError = hasAccountError || hasContinuableError || hasValidateCodeActionError;
    const errorMessage = getErrorMessage();

    function getErrorMessage() {
        // Rate limit or other backend error when sending/resending the validate code
        if (hasValidateCodeActionError) {
            return Object.values(validateCodeActionError).at(0);
        }
        // Invalid validate code submitted by the user
        if (hasContinuableError) {
            return translate('validateCodeForm.error.incorrectMagicCode');
        }
        // Generic account/session error (e.g. stale errors from a previous flow)
        return getLatestErrorMessage(account);
    }

    // Check if this page can handle the continuable error, if not convert to regular error
    useEffect(() => {
        if (!continuableError) {
            return;
        }

        if (continuableError.reason !== VALUES.REASON.BACKEND.INVALID_VALIDATE_CODE) {
            // Cannot handle this error - convert to regular error which will stop the flow
            dispatch({type: 'SET_ERROR', payload: {reason: continuableError.reason, message: continuableError.message}});
        }
    }, [continuableError, dispatch]);

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

    // Clear any pre-existing errors on mount
    useEffect(() => {
        if (hasClearedInitialErrorsRef.current || !account?.errors) {
            return;
        }
        hasClearedInitialErrorsRef.current = true;
        clearAccountMessages();
    }, [account?.errors]);

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

        // Clear continuable error when user starts typing after an error
        if (continuableError) {
            dispatch({type: 'CLEAR_CONTINUABLE_ERROR'});
        }
    };

    const resendValidationCode = () => {
        if (hasValidateCodeActionError) {
            clearValidateCodeActionError('actionVerified');
        }
        addMFABreadcrumb('Validate code resend requested');
        requestValidateCodeAction();
        inputRef.current?.clear();
        setInputCode('');
        setFormError({});
        setCanShowError(false);
        resendButtonRef.current?.resetCountdown();
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
            setFormError({inputCode: 'validateCodeForm.error.pleaseFillMagicCode'});
            return;
        }

        if (!isValidValidateCode(inputCode)) {
            setFormError({inputCode: 'validateCodeForm.error.incorrectMagicCode'});
            return;
        }

        // Clear errors before submit
        setFormError({});

        // Set validate code in state context - the process function will handle the rest
        dispatch({type: 'SET_VALIDATE_CODE', payload: inputCode});
    };

    const showCancelModal = () => {
        if (isOffline) {
            Navigation.closeRHPFlow();
        } else {
            setCancelModalVisibility(true);
        }
    };

    const hideCancelModal = () => {
        setCancelModalVisibility(false);
    };

    const cancelFlow = () => {
        if (isCancelModalVisible) {
            hideCancelModal();
        }
        cancel();
    };

    const focusTrapConfirmModal = () => {
        setCancelModalVisibility(true);
        return false;
    };

    const CancelConfirmModal = state.scenario?.modals.cancelConfirmation ?? DefaultCancelConfirmModal;

    return (
        <ScreenWrapper
            testID={MultifactorAuthenticationValidateCodePage.displayName}
            focusTrapSettings={{
                focusTrapOptions: {
                    allowOutsideClick: focusTrapConfirmModal,
                    clickOutsideDeactivates: focusTrapConfirmModal,
                    escapeDeactivates: focusTrapConfirmModal,
                },
            }}
        >
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.letsVerifyItsYou')}
                onBackButtonPress={showCancelModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <Text style={[styles.m5, styles.mt3, styles.textNormal]}>{translate('contacts.enterMagicCode', contactMethod)}</Text>
                <View style={[styles.mh5]}>
                    <MagicCodeInput
                        autoComplete="one-time-code"
                        name="multifactorAuthenticationValidateCode"
                        value={inputCode}
                        onChangeText={onCodeInput}
                        onFulfill={validateAndSubmitForm}
                        errorText={canShowError && formError.inputCode ? translate(formError.inputCode) : ''}
                        hasError={hasError}
                        ref={inputRef}
                        maxLength={CONST.MAGIC_CODE_LENGTH}
                    />
                    <MultifactorAuthenticationValidateCodeResendButton
                        ref={resendButtonRef}
                        shouldDisableResendCode={shouldDisableResendCode}
                        hasError={hasError}
                        resendButtonText="validateCodeForm.magicCodeNotReceived"
                        onResendValidationCode={resendValidationCode}
                    />
                </View>
                <View style={[styles.w100, styles.mtAuto]}>
                    {!!errorMessage && (
                        <FormHelpMessage
                            style={[styles.mh5]}
                            message={errorMessage}
                        />
                    )}
                    <Button
                        success
                        large
                        style={[styles.w100, styles.ph5, styles.pb5, styles.mt4]}
                        onPress={validateAndSubmitForm}
                        text={translate('common.verify')}
                        isLoading={isValidateCodeFormSubmitting}
                        isDisabled={isOffline}
                    />
                </View>
                <CancelConfirmModal
                    isVisible={isCancelModalVisible}
                    onConfirm={cancelFlow}
                    onCancel={hideCancelModal}
                />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationValidateCodePage.displayName = 'MultifactorAuthenticationValidateCodePage';

export default MultifactorAuthenticationValidateCodePage;
