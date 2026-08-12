import type Locale from '@src/types/onyx/Locale';

type SignUpUserParams = {
    email?: string;
    preferredLocale: Locale | null;
    hasSMSMarketingConsent?: boolean;
    deviceInfo: string;
};

export default SignUpUserParams;
