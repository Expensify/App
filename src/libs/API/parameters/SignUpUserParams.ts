import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type SignUpUserParams = {
    email?: string;
    preferredLocale: Locale | null;
    hasSMSAlertsConsent?: boolean;
    hasSMSMarketingConsent?: boolean;
    deviceInfo: string;
    isAdvertisingConsentGranted?: boolean;
} & MarketingAttribution;

export default SignUpUserParams;
