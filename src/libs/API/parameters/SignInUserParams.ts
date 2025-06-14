import type {Locale} from '@src/CONST/LOCALES';

type SignInUserParams = {
    twoFactorAuthCode?: string;
    email?: string;
    preferredLocale: Locale | null;
    validateCode?: string;
    deviceInfo: string;
};

export default SignInUserParams;
