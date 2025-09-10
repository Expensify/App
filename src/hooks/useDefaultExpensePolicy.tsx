import useOnyx from '@hooks/useOnyx';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';

export default function useDefaultExpensePolicy() {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`);
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

    if (isPaidGroupPolicy(activePolicy)) {
        return activePolicy;
    }

    const groupPolicies = Object.values(allPolicies ?? {}).filter(isPaidGroupPolicy);
    if (groupPolicies.length === 1) {
        return groupPolicies.at(0);
    }

    return null;
}
