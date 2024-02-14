import type {OnyxEntry} from 'react-native-onyx';
import type {Account, Session} from '@src/types/onyx';

type TwoFactorAuthStepOnyxNativeProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<Session>;
};

type TwoFactorAuthStepOnyxProps = {
    account: OnyxEntry<Account>;
};

type TwoFactorAuthStepOnyxBothProps = TwoFactorAuthStepOnyxNativeProps & TwoFactorAuthStepOnyxProps;

type TwoFactorAuthStepProps = TwoFactorAuthStepOnyxBothProps & {
    requiresTwoFactorAuth?: false;
    twoFactorAuthStep?: '';
    recoveryCodes?: '';
};

export type {TwoFactorAuthStepOnyxNativeProps, TwoFactorAuthStepOnyxProps, TwoFactorAuthStepProps, TwoFactorAuthStepOnyxBothProps};
