import type Locale from '@src/types/onyx/Locale';

type SignInUserWithLinkParams = {
    accountID: number;
    validateCode?: string;
    twoFactorAuthCode?: string;
    preferredLocale: Locale | null;
    deviceInfo: string;
};

export default SignInUserWithLinkParams;
