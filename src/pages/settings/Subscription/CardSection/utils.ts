import * as SubscriptionUtils from '@libs/SubscriptionUtils';

function shouldShowPreTrialBillingBanner(): boolean {
    return !SubscriptionUtils.isUserOnFreeTrial() && !SubscriptionUtils.hasUserFreeTrialEnded();
}

export default {
    shouldShowPreTrialBillingBanner,
};
