import type Locale from '@src/types/onyx/Locale';

type SignInUserParams = {
    twoFactorAuthCode?: string;
    email?: string;
    preferredLocale: Locale | null;
    validateCode?: string;
    deviceInfo: string;
};

export default SignInUserParams;
