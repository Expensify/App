import {isPaidGroupPolicy, isPolicyAccessible} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

export default function useDefaultExpensePolicy() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const {login = ''} = useCurrentUserPersonalDetails();

    if (isPaidGroupPolicy(activePolicy) && isPolicyAccessible(activePolicy, login)) {
        return activePolicy;
    }

    // If there is exactly one group policy, use that as the default expense policy
    const groupPolicies = Object.values(allPolicies ?? {}).filter((policy) => isPaidGroupPolicy(policy) && isPolicyAccessible(policy, login));
    if (groupPolicies.length === 1) {
        return groupPolicies.at(0);
    }

    return null;
}
