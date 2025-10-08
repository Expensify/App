import {activePolicySelector} from '@selectors/Policy';
import type {OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import {isPaidGroupPolicy, isPolicyAdmin, isPolicyMemberWithoutPendingDelete, isPolicyUser} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

// TODO: temporary util - if we don't have employeeList object we don't check for the pending delete
function checkForPendingDelete(login: string, policy: OnyxEntry<Policy>) {
    if (isEmptyObject(policy?.employeeList)) {
        return true;
    }
    return isPolicyMemberWithoutPendingDelete(login, policy);
}

function usePolicyForMovingExpenses() {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: activePolicySelector,
    });

    const session = useSession();
    const login = session?.email ?? '';
    const userPolicies = Object.values(allPolicies ?? {}).filter(
        (policy) =>
            checkForPendingDelete(login, policy) &&
            (isPolicyAdmin(policy, login) || isPolicyUser(policy, login)) &&
            isPaidGroupPolicy(policy) &&
            policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
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
