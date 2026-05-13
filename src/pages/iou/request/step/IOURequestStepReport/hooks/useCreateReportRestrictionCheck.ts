import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';

/**
 * @param session — current user session; provides the accountID used by `shouldRestrictUserBillableActions`.
 * @returns a check function: given the candidate restriction policy, returns true when create-report should be blocked.
 */
function useCreateReportRestrictionCheck(session: OnyxEntry<Session>): (restrictionPolicy: OnyxEntry<Policy>) => boolean {
    const [userBillingGracePeriodEnds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [ownerBillingGracePeriodEnd] = useOnyx(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END);
    const [amountOwed] = useOnyx(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED);

    return (restrictionPolicy: OnyxEntry<Policy>) => {
        if (!restrictionPolicy) {
            return false;
        }
        return shouldRestrictUserBillableActions(restrictionPolicy, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed, session?.accountID);
    };
}

export default useCreateReportRestrictionCheck;
