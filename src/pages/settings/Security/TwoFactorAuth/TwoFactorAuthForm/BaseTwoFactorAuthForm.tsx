import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import useLocalize from '@hooks/useLocalize';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {isValidTwoFactorCode} from '@libs/ValidationUtils';
import {clearAccountMessages, toggleTwoFactorAuth, validateTwoFactorAuth} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseTwoFactorAuthFormRef} from './types';

type BaseTwoFactorAuthFormProps = {
    autoComplete: AutoCompleteVariant;

    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;
};

function BaseTwoFactorAuthForm({autoComplete, validateInsteadOfDisable}: BaseTwoFactorAuthFormProps, ref: ForwardedRef<BaseTwoFactorAuthFormRef>) {
    const {translate} = useLocalize();
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string}>({});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const inputRef = useRef<MagicCodeInputHandle | null>(null);
    const shouldClearData = account?.needsTwoFactorAuthSetup ?? false;

    /**
     * Handle text input and clear formError upon text change
     */
    const onTextInput = useCallback(
        (text: string) => {
            setTwoFactorAuthCode(text);
            setFormError({});

            if (account?.errors) {
                clearAccountMessages();
            }
        },
        [account?.errors],
    );

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    const validateAndSubmitForm = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.blur();
        }
        if (!twoFactorAuthCode.trim()) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.pleaseFillTwoFactorAuth')});
            return;
        }

        if (!isValidTwoFactorCode(twoFactorAuthCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});

        if (validateInsteadOfDisable !== false) {
            validateTwoFactorAuth(twoFactorAuthCode, shouldClearData);
            return;
        }
        toggleTwoFactorAuth(false, twoFactorAuthCode);
    }, [twoFactorAuthCode, validateInsteadOfDisable, translate, shouldClearData]);

    useImperativeHandle(ref, () => ({
        validateAndSubmitForm() {
            validateAndSubmitForm();
        },
        focus() {
            if (!inputRef.current) {
                return;
            }
            inputRef.current.focus();
        },
    }));

    return (
        <MagicCodeInput
            autoComplete={autoComplete}
            name="twoFactorAuthCode"
            value={twoFactorAuthCode}
            onChangeText={onTextInput}
            onFulfill={validateAndSubmitForm}
            errorText={formError.twoFactorAuthCode ?? getLatestErrorMessage(account)}
            ref={inputRef}
            autoFocus={false}
        />
    );
}

export default forwardRef(BaseTwoFactorAuthForm);
