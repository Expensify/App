import type {OnyxCollection} from 'react-native-onyx';
import {isPaidGroupPolicy, isPolicyAccessible} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePreferredPolicy from './usePreferredPolicy';

/**
 * Selector that finds the single qualifying group policy ID from the collection.
 * Returns only an ID (stable) — prevents re-renders when unrelated policies change.
 */
function getSingleGroupPolicyID(policies: OnyxCollection<Policy>, login: string): string | undefined {
    if (!policies) {
        return undefined;
    }

    let singlePolicyID: string | undefined;
    for (const policy of Object.values(policies)) {
        if (!policy || !isPaidGroupPolicy(policy) || !isPolicyAccessible(policy, login)) {
            continue;
        }
        if (!singlePolicyID) {
            singlePolicyID = policy.id;
        } else {
            return undefined; // More than one — no single default
        }
    }

    return singlePolicyID;
}

export default function useDefaultExpensePolicy() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const {login = ''} = useCurrentUserPersonalDetails();
    const [preferredPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`);

    // Selector returns only the qualifying policy ID — stable value, prevents re-renders
    const [singleGroupPolicyID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => getSingleGroupPolicyID(policies, login),
    });

    // Per-key lookup for the single group policy (only fires when that specific policy changes)
    const [singleGroupPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${singleGroupPolicyID}`);

    if (isRestrictedToPreferredPolicy && isPaidGroupPolicy(preferredPolicy) && isPolicyAccessible(preferredPolicy, login)) {
        return preferredPolicy;
    }

    if (isPaidGroupPolicy(activePolicy) && isPolicyAccessible(activePolicy, login)) {
        return activePolicy;
    }

    return singleGroupPolicy;
}
