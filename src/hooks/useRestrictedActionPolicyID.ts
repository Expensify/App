import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Resolves the policy ID to redirect to `RESTRICTED_ACTION` when the given policy's billable actions
 * are restricted (e.g. expired/owing workspace), or `undefined` when the action is allowed.
 *
 * Centralizes the billing-grace / amount-owed Onyx reads + the `shouldRestrictUserBillableActions`
 * check so callers (e.g. the split entry points) don't each duplicate them.
 */
function useRestrictedActionPolicyID(policy: OnyxEntry<Policy>): string | undefined {
    const {accountID} = useCurrentUserPersonalDetails();
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    if (!policy || !shouldRestrictUserBillableActions(policy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, accountID)) {
        return undefined;
    }
    return policy.id;
}

export default useRestrictedActionPolicyID;
