import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type SignInUserWithLinkParams = {
    accountID: number;
    validateCode?: string;
    twoFactorAuthCode?: string;
    preferredLocale: ValueOf<typeof CONST.LOCALES> | null;
    deviceInfo: string;
};

export default SignInUserWithLinkParams;
