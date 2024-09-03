import type {ForwardedRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import type {Account, User} from '@src/types/onyx';

type BaseTwoFactorAuthFormOnyxProps = {
    account: OnyxEntry<Account>;
    user?: OnyxEntry<User>;
};

type BaseTwoFactorAuthFormRef = {
    validateAndSubmitForm: () => void;
    focus: () => void;
};

type TwoFactorAuthFormProps = {
    innerRef: ForwardedRef<BaseTwoFactorAuthFormRef>;

    // Set this to true in order to call the validateTwoFactorAuth action which is used when setting up 2FA for the first time.
    // Set this to false in order to disable 2FA when a valid code is entered.
    validateInsteadOfDisable?: boolean;
};

export type {BaseTwoFactorAuthFormOnyxProps, TwoFactorAuthFormProps, BaseTwoFactorAuthFormRef};
