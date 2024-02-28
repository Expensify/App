import type {OnyxEntry} from 'react-native-onyx';
import type {Account} from '@src/types/onyx';

type TwoFactorAuthStepOnyxProps = {
    account: OnyxEntry<Account>;
};

type TwoFactorAuthStepProps = TwoFactorAuthStepOnyxProps & {
    requiresTwoFactorAuth?: false;
    twoFactorAuthStep?: '';
    recoveryCodes?: '';
};

export type {TwoFactorAuthStepOnyxProps, TwoFactorAuthStepProps};
