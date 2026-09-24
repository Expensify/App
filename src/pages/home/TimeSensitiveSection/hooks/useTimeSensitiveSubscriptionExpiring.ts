import usePrivateSubscription from '@hooks/usePrivateSubscription';

import {shouldShowSubscriptionExpiringSoonUI} from '@libs/SubscriptionUtils';

/**
 * Nudges the subscription owner to turn auto-renew back on before their annual subscription lapses.
 * `nvp_private_subscription` is only set for the subscription owner, so this is inherently scoped to them.
 */
function useTimeSensitiveSubscriptionExpiring() {
    const privateSubscription = usePrivateSubscription();

    return {
        shouldShowSubscriptionExpiring: shouldShowSubscriptionExpiringSoonUI(privateSubscription),
        subscriptionEndDate: privateSubscription?.endDate,
    };
}

export default useTimeSensitiveSubscriptionExpiring;
