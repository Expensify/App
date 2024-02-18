import type {OnyxEntry} from 'react-native-onyx';
import type {Route} from '@src/ROUTES';
import type {Account, Session} from '@src/types/onyx';

type TwoFactorAuthStepOnyxNativeProps = {
    /** Session of currently logged in user */
    session: OnyxEntry<Session>;
};

type TwoFactorAuthStepOnyxProps = {
    account: OnyxEntry<Account>;
};

type TwoFactorAuthStepOnyxBothProps = TwoFactorAuthStepOnyxNativeProps & TwoFactorAuthStepOnyxProps;

type RouteParam = {
    params: {
        backTo?: Route | undefined;
    };
};

type TwoFactorAuthStepProps = TwoFactorAuthStepOnyxBothProps & {
    requiresTwoFactorAuth?: false;
    twoFactorAuthStep?: '';
    recoveryCodes?: '';
};

export type {TwoFactorAuthStepOnyxNativeProps, TwoFactorAuthStepOnyxProps, TwoFactorAuthStepProps, TwoFactorAuthStepOnyxBothProps, RouteParam};
