import {activePolicySelector} from '@selectors/Policy';
import {useSession} from '@components/OnyxListItemProvider';
import {isPaidGroupPolicy, isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function usePolicyForMovingExpenses() {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: activePolicySelector,
    });

    const session = useSession();
    const userPolicies = Object.values(allPolicies ?? {}).filter((policy) => isPolicyMemberWithoutPendingDelete(session?.email, policy) && isPaidGroupPolicy(policy));
    const isMemberOfMoreThanOnePolicy = userPolicies.length > 1;

    if (activePolicy) {
        return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false};
    }

    if (userPolicies.length === 1) {
        return {policyForMovingExpensesID: userPolicies.at(0)?.id, policyForMovingExpenses: userPolicies.at(0), shouldSelectPolicy: false};
    }

    if (isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: true};
    }

    return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false};
}

export default usePolicyForMovingExpenses;
