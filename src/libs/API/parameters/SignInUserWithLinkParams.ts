import type {Locale} from '@src/CONST/LOCALES';

type SignInUserWithLinkParams = {
    accountID: number;
    validateCode?: string;
    twoFactorAuthCode?: string;
    preferredLocale: Locale | null;
    deviceInfo: string;
};

export default SignInUserWithLinkParams;
