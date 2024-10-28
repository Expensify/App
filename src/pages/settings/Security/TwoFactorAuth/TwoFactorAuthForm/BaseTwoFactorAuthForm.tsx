import React, {forwardRef, useCallback, useImperativeHandle, useRef, useState} from 'react';
import type {ForwardedRef, RefAttributes} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {AutoCompleteVariant, MagicCodeInputHandle} from '@components/MagicCodeInput';
import MagicCodeInput from '@components/MagicCodeInput';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BaseTwoFactorAuthFormOnyxProps, BaseTwoFactorAuthFormRef} from './types';

type BaseTwoFactorAuthFormProps = BaseTwoFactorAuthFormOnyxProps & {
    autoComplete: AutoCompleteVariant;

    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;
};

function BaseTwoFactorAuthForm({account, autoComplete, validateInsteadOfDisable}: BaseTwoFactorAuthFormProps, ref: ForwardedRef<BaseTwoFactorAuthFormRef>) {
    const {translate} = useLocalize();
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string}>({});
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
                Session.clearAccountMessages();
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

        if (!ValidationUtils.isValidTwoFactorCode(twoFactorAuthCode)) {
            setFormError({twoFactorAuthCode: translate('twoFactorAuthForm.error.incorrect2fa')});
            return;
        }

        setFormError({});

        if (validateInsteadOfDisable !== false) {
            Session.validateTwoFactorAuth(twoFactorAuthCode, shouldClearData);
            return;
        }
        Session.toggleTwoFactorAuth(false, twoFactorAuthCode);
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
            errorText={formError.twoFactorAuthCode ?? ErrorUtils.getLatestErrorMessage(account)}
            ref={inputRef}
            autoFocus={false}
        />
    );
}

export default withOnyx<BaseTwoFactorAuthFormProps & RefAttributes<BaseTwoFactorAuthFormRef>, BaseTwoFactorAuthFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(forwardRef(BaseTwoFactorAuthForm));
