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
    let count = 0;
    let singlePolicy;
    for (const policy of Object.values(allPolicies ?? {})) {
        if (isPaidGroupPolicy(policy) && isPolicyAccessible(policy, login)) {
            count++;

            if (count === 1) {
                singlePolicy = policy;
            } else {
                break; // More than 1, no need to continue
            }
        }
    }

    if (count === 1) {
        return singlePolicy;
    }

    return undefined;
}
