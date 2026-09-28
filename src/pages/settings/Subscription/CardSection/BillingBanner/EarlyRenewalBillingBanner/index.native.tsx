/** Subscription changes aren't available in the mobile app, so the usual billing banner is shown instead of the early renewal offer. */
import type EarlyRenewalBillingBannerProps from './types';

function EarlyRenewalBillingBanner({fallback}: EarlyRenewalBillingBannerProps) {
    return fallback;
}

export default EarlyRenewalBillingBanner;
