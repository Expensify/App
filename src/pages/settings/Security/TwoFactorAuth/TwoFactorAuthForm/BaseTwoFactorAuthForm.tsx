import {useFocusEffect} from '@react-navigation/native';
import type {ForwardedRef} from 'react';
import React, {useCallback, useImperativeHandle, useRef, useState} from 'react';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidRecoveryCode, isValidTwoFactorCode} from '@libs/ValidationUtils';
import {clearAccountMessages, toggleTwoFactorAuth, validateTwoFactorAuth} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseTwoFactorAuthFormRef} from './types';

type BaseTwoFactorAuthFormProps = {
    autoComplete: AutoCompleteVariant;

    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;

    /** Callback that is called when the text input is focused */
    onFocus?: () => void;

    shouldAutoFocusOnMobile?: boolean;

    /** Reference to the outer element */
    ref?: ForwardedRef<BaseTwoFactorAuthFormRef>;
};

const isMobile = !canFocusInputOnScreenFocus();

function BaseTwoFactorAuthForm({autoComplete, validateInsteadOfDisable, onFocus, shouldAutoFocusOnMobile = true, ref}: BaseTwoFactorAuthFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string; recoveryCode?: string}>({});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [isUsingRecoveryCode, setIsUsingRecoveryCode] = useState(false);
    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const recoveryInputRef = useRef<BaseTextInputRef | null>(null);
    const shouldClearData = account?.needsTwoFactorAuthSetup ?? false;
    const shouldAllowRecoveryCode = validateInsteadOfDisable === false;

    const focusRecoveryInput = useCallback(() => {
        if (!recoveryInputRef.current) {
            return;
        }

        if ('focus' in recoveryInputRef.current && typeof recoveryInputRef.current.focus === 'function') {
            recoveryInputRef.current.focus();
        }
    }, []);

    /**
     * Handle text input and clear formError upon text change
     */
    const clearAccountErrorsIfPresent = useCallback(() => {
        if (!account?.errors) {
            return;
        }
        clearAccountMessages();
    }, [account?.errors]);

    const onTwoFactorCodeInput = useCallback(
        (text: string) => {
            setTwoFactorAuthCode(text);
            setFormError((prev) => ({...prev, twoFactorAuthCode: undefined}));
            clearAccountErrorsIfPresent();
        },
        [clearAccountErrorsIfPresent],
    );

    const onRecoveryCodeInput = useCallback(
        (text: string) => {
            setRecoveryCode(text);
            setFormError((prev) => ({...prev, recoveryCode: undefined}));
            clearAccountErrorsIfPresent();
        },
        [clearAccountErrorsIfPresent],
    );

    const validateAndSubmitAuthAppCode = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
        const sanitizedTwoFactorCode = twoFactorAuthCode.trim();
        if (!sanitizedTwoFactorCode) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
            return;
        }

        if (!isValidTwoFactorCode(sanitizedTwoFactorCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});

        if (validateInsteadOfDisable !== false) {
            validateTwoFactorAuth(sanitizedTwoFactorCode, shouldClearData);
            return;
        }
        toggleTwoFactorAuth(false, sanitizedTwoFactorCode);
    }, [translate, twoFactorAuthCode, validateInsteadOfDisable, shouldClearData]);

    const validateAndSubmitRecoveryCode = useCallback(() => {
        if (recoveryInputRef.current && 'blur' in recoveryInputRef.current && typeof recoveryInputRef.current.blur === 'function') {
            recoveryInputRef.current.blur();
        }

        const sanitizedRecoveryCode = recoveryCode.trim();
        if (!sanitizedRecoveryCode) {
            setFormError({recoveryCode: translate('recoveryCodeForm.error.pleaseFillRecoveryCode')});
            return;
        }

        if (!isValidRecoveryCode(sanitizedRecoveryCode)) {
            setFormError({recoveryCode: translate('recoveryCodeForm.error.incorrectRecoveryCode')});
            return;
        }

        setFormError({});
        toggleTwoFactorAuth(false, sanitizedRecoveryCode);
    }, [recoveryCode, translate]);

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
            validateAndSubmitRecoveryCode();
            return;
        }
        validateAndSubmitAuthAppCode();
    }, [isUsingRecoveryCode, shouldAllowRecoveryCode, validateAndSubmitAuthAppCode, validateAndSubmitRecoveryCode]);

    useImperativeHandle(ref, () => ({
        validateAndSubmitForm() {
            validateAndSubmitForm();
        },
        focus() {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                focusRecoveryInput();
                return;
            }
            inputRef.current?.focus();
        },
        focusLastSelected() {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                focusRecoveryInput();
                return;
            }
            setTimeout(() => {
                inputRef.current?.focusLastSelected();
            }, CONST.ANIMATED_TRANSITION);
        },
    }));

    useFocusEffect(
        useCallback(() => {
            if (shouldAllowRecoveryCode && isUsingRecoveryCode) {
                if (!recoveryInputRef.current || (isMobile && !shouldAutoFocusOnMobile)) {
                    return;
                }

                // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
                // This is the same condition as in BaseValidateCodeForm
                if (!isMobileSafari()) {
                    setTimeout(() => {
                        focusRecoveryInput();
                    }, CONST.ANIMATED_TRANSITION);
                } else {
                    focusRecoveryInput();
                }

                return;
            }
            if (!inputRef.current || (isMobile && !shouldAutoFocusOnMobile)) {
                return;
            }
            // Keyboard won't show if we focus the input with a delay, so we need to focus immediately.
            if (!isMobileSafari()) {
                setTimeout(() => {
                    inputRef.current?.focusLastSelected();
                }, CONST.ANIMATED_TRANSITION);
            } else {
                inputRef.current?.focusLastSelected();
            }
        }, [focusRecoveryInput, isUsingRecoveryCode, shouldAllowRecoveryCode, shouldAutoFocusOnMobile]),
    );

    const errorMessage = getLatestErrorMessage(account);

    const handleToggleInputType = useCallback(() => {
        if (!shouldAllowRecoveryCode) {
            return;
        }

        setIsUsingRecoveryCode((prev) => {
            const nextValue = !prev;
            if (nextValue) {
                setTwoFactorAuthCode('');
            } else {
                setRecoveryCode('');
            }
            return nextValue;
        });

        setFormError({});
        clearAccountErrorsIfPresent();
    }, [clearAccountErrorsIfPresent, shouldAllowRecoveryCode]);

    const toggleLabelKey = isUsingRecoveryCode ? 'recoveryCodeForm.use2fa' : 'recoveryCodeForm.useRecoveryCode';

    return (
        <>
            {shouldAllowRecoveryCode && (
                <Text style={[styles.mb3]}>{translate(isUsingRecoveryCode ? 'twoFactorAuth.explainProcessToRemoveWithRecovery' : 'twoFactorAuth.explainProcessToRemove')}</Text>
            )}
            {shouldAllowRecoveryCode && isUsingRecoveryCode ? (
                <TextInput
                    ref={(input) => {
                        recoveryInputRef.current = input;
                    }}
                    value={recoveryCode}
                    onChangeText={onRecoveryCodeInput}
                    onFocus={onFocus}
                    autoFocus={shouldAllowRecoveryCode && isUsingRecoveryCode && (!isMobile || shouldAutoFocusOnMobile)}
                    autoCapitalize="characters"
                    label={translate('recoveryCodeForm.recoveryCode')}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    errorText={formError.recoveryCode ?? errorMessage}
                    onSubmitEditing={validateAndSubmitForm}
                    accessibilityLabel={translate('recoveryCodeForm.recoveryCode')}
                    role={CONST.ROLE.PRESENTATION}
                    testID="recoveryCodeInput"
                />
            ) : (
                <MagicCodeInput
                    autoComplete={autoComplete}
                    name="twoFactorAuthCode"
                    value={twoFactorAuthCode}
                    onChangeText={onTwoFactorCodeInput}
                    onFocus={onFocus}
                    onFulfill={validateAndSubmitForm}
                    errorText={formError.twoFactorAuthCode ?? errorMessage}
                    ref={inputRef}
                    autoFocus={false}
                    accessibilityLabel={translate('common.twoFactorCode')}
                    testID="twoFactorAuthCodeInput"
                />
            )}
            {shouldAllowRecoveryCode && (
                <PressableWithFeedback
                    style={[styles.mt2]}
                    onPress={handleToggleInputType}
                    hoverDimmingValue={1}
                    accessibilityLabel={translate(toggleLabelKey)}
                >
                    <Text style={[styles.link]}>{translate(toggleLabelKey)}</Text>
                </PressableWithFeedback>
            )}
        </>
    );
}

export default BaseTwoFactorAuthForm;
