import type Locale from '@src/types/onyx/Locale';

type SignUpUserParams = {
    email?: string;
    preferredLocale: Locale | null;
    smsMarketingConsent?: boolean;
};

export default SignUpUserParams;
