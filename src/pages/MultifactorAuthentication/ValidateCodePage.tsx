import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MagicCodeInput from '@components/MagicCodeInput';
import type {MagicCodeInputHandle} from '@components/MagicCodeInput';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationValidateCodeResendButton from '@components/MultifactorAuthentication/ValidateCodeResendButton';
import type {MultifactorAuthenticationValidateCodeResendButtonHandle} from '@components/MultifactorAuthentication/ValidateCodeResendButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import AccountUtils from '@libs/AccountUtils';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidValidateCode} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
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

    const contactMethod = account?.primaryLogin ?? '';

    // Local state
    const [inputCode, setInputCode] = useState('');
    const [formError, setFormError] = useState<FormError>({});
    const [canShowError, setCanShowError] = useState<boolean>(false);
    const {cancel, setValidateCode} = useMultifactorAuthentication();
    // TODO: const {setValidateCode} = useMultifactorAuthenticationState();

    // Refs
    const inputRef = useRef<MagicCodeInputHandle>(null);
    const resendButtonRef = useRef<MultifactorAuthenticationValidateCodeResendButtonHandle>(null);
    const hasClearedInitialErrorsRef = useRef(false);

    // Derived state
    const hasError = !!account && !isEmptyObject(account?.errors);
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const shouldDisableResendCode = isOffline ?? account?.isLoading;

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
    };

    const resendValidationCode = () => {
        resendValidateCode(contactMethod);
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
        setValidateCode(inputCode);
    };

    const onGoBackPress = () => {
        // TODO: We probably do not need to trigger anything as the RHP is closed
        cancel();
        // Close the RHP instead of returning to the invisible biometrics test screen
        Navigation.dismissModal();
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationValidateCodePage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.letsVerifyItsYou')}
                onBackButtonPress={onGoBackPress}
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
                    {hasError && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                    <MultifactorAuthenticationValidateCodeResendButton
                        ref={resendButtonRef}
                        shouldDisableResendCode={shouldDisableResendCode}
                        hasError={hasError}
                        resendButtonText="validateCodeForm.magicCodeNotReceived"
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
