import {getOwnedPaidPolicies} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

function useSubscriptionPlan() {
    const [userMetadata] = useOnyx(ONYXKEYS.USER_METADATA);

    // Only the plan type leaves the selector, so changes to unrelated workspaces do not re-render the consumers.
    // Workspaces in which the user is the owner and the type is either corporate (control) or team (collect) count.
    const selector = (policies: OnyxCollection<Policy>) => {
        const ownerPolicies = getOwnedPaidPolicies(policies, userMetadata?.accountID);
        if (!ownerPolicies.length) {
            return null;
        }

        // Corporate (control) workspace is supposed to be the higher priority
        return ownerPolicies.some((policy) => policy?.type === CONST.POLICY.TYPE.CORPORATE) ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
    };
    const [subscriptionPlan] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector});

    return subscriptionPlan ?? null;
}

export default useSubscriptionPlan;
