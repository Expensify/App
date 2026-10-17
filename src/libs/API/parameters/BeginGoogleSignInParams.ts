import type {TargetedAdvertisingConsent} from '@libs/Ketch/types';

import type Locale from '@src/types/onyx/Locale';
import type MarketingAttribution from '@src/types/onyx/MarketingAttribution';

type BeginGoogleSignInParams = {
    token: string | null;
    preferredLocale: Locale | null;
    deviceInfo: string;

    /** The user's Ketch targeted advertising consent, left out when unknown (always on native, which has no Ketch) */
    targetedAdvertisingConsent?: TargetedAdvertisingConsent;
} & MarketingAttribution;

export default BeginGoogleSignInParams;
