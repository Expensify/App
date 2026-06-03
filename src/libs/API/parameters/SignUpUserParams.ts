import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type SignUpUserParams = {
    email?: string;
    preferredLocale: Locale | null;
    deviceInfo: string;
} & MarketingAttribution;

export default SignUpUserParams;
