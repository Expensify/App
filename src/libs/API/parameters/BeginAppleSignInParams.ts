import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type BeginAppleSignInParams = {
    idToken: string | undefined | null;
    preferredLocale: Locale | null;
    deviceInfo: string;
} & MarketingAttribution;

export default BeginAppleSignInParams;
