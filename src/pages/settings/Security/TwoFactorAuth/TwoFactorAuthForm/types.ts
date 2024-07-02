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
};

export type {BaseTwoFactorAuthFormOnyxProps, TwoFactorAuthFormProps, BaseTwoFactorAuthFormRef};
