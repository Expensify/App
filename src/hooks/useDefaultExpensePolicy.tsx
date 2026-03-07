import {isPaidGroupPolicy, isPolicyAccessible} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePreferredPolicy from './usePreferredPolicy';

export default function useDefaultExpensePolicy() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const {login = ''} = useCurrentUserPersonalDetails();
    const [preferredPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicyID}`);

    if (isRestrictedToPreferredPolicy && isPaidGroupPolicy(preferredPolicy) && isPolicyAccessible(preferredPolicy, login)) {
        return preferredPolicy;
    }

    if (isPaidGroupPolicy(activePolicy) && isPolicyAccessible(activePolicy, login)) {
        return activePolicy;
    }

    // If there is exactly one group policy, use that as the default expense policy
    let singlePolicy;
    for (const policy of Object.values(allPolicies ?? {})) {
        if (!policy || !isPaidGroupPolicy(policy) || !isPolicyAccessible(policy, login)) {
            continue;
        }

        if (!singlePolicy) {
            singlePolicy = policy;
        } else {
            singlePolicy = undefined;
            break;
        }
    }

    return singlePolicy;
}
