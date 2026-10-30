import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: Locale | null;
    deviceInfo: string;
    isAdvertisingConsentGranted?: boolean;
} & MarketingAttribution;

export default BeginGoogleSignInParams;
