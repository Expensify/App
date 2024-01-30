import React, {forwardRef, useCallback, useImperativeHandle, useState} from 'react';
import type {RefObject} from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import type {Account} from '@src/types/onyx';
import MagicCodeInput from '@components/MagicCodeInput';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TranslationPaths} from '@src/languages/types';


type BaseTwoFactorAuthFormOnyxProps = {
    account: OnyxEntry<Account>;
}

type BaseTwoFactorAuthFormProps = BaseTwoFactorAuthFormOnyxProps & {

    autoComplete: 'sms-otp' | 'one-time-code' | 'off';
    ref: RefObject<HTMLFormElement>;
    innerRef: () => void;

}

function BaseTwoFactorAuthForm({
    account, 
    autoComplete, 
    ref, 
    innerRef
}: BaseTwoFactorAuthFormProps) {
    const [formError, setFormError] = useState<{twoFactorAuthCode?: string}>({});
    const [twoFactorAuthCode, setTwoFactorAuthCode] = useState('');
    const inputRef = ref;
    const {translate} = useLocalize();

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
            setFormError({twoFactorAuthCode: 'twoFactorAuthForm.error.pleaseFillTwoFactorAuth'});
            return;
        }

        if (!ValidationUtils.isValidTwoFactorCode(twoFactorAuthCode)) {
            setFormError({twoFactorAuthCode: 'twoFactorAuthForm.error.incorrect2fa'});
            return;
        }

        setFormError({});
        Session.validateTwoFactorAuth(twoFactorAuthCode);
    }, [twoFactorAuthCode, inputRef]);

    useImperativeHandle(innerRef, () => ({
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
            textContentType="oneTimeCode"
            label={translate('common.twoFactorCode')}
            id="twoFactorAuthCode"
            name="twoFactorAuthCode"
            value={twoFactorAuthCode}
            onChangeText={onTextInput}
            onFulfill={validateAndSubmitForm}
            errorText={formError.twoFactorAuthCode ? translate(formError.twoFactorAuthCode as TranslationPaths) : ErrorUtils.getLatestErrorMessage(account)}
            ref={inputRef}
            autoFocus={false}
        />
    );
}

const BaseTwoFactorAuthFormWithRef = forwardRef((props, ref) => (
    <BaseTwoFactorAuthForm
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        innerRef={ref}
    />
));

BaseTwoFactorAuthFormWithRef.displayName = 'BaseTwoFactorAuthFormWithRef';

export default withOnyx<BaseTwoFactorAuthFormProps, BaseTwoFactorAuthFormOnyxProps>({
    account: {key: ONYXKEYS.ACCOUNT},
})(BaseTwoFactorAuthFormWithRef);

