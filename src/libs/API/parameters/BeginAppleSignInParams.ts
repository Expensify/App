import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type BeginAppleSignInParams = {
    idToken: string | undefined | null;
    preferredLocale: Locale | null;
    deviceInfo: string;
    isAdvertisingConsentGranted?: boolean;
} & MarketingAttribution;

export default BeginAppleSignInParams;
