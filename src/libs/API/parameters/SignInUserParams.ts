import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SignInUserParams = {
    twoFactorAuthCode?: string;
    email?: string;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
    validateCode?: string;
    deviceInfo: string;
};

export default SignInUserParams;
