import {activePolicySelector} from '@selectors/Policy';
import type {OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import {canSubmitPerDiemExpenseFromWorkspace, isPaidGroupPolicy, isPolicyMemberWithoutPendingDelete} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

// TODO: temporary util - if we don't have employeeList object we don't check for the pending delete
function checkForUserPendingDelete(login: string, policy: OnyxEntry<Policy>) {
    if (isEmptyObject(policy?.employeeList)) {
        return true;
    }
    return isPolicyMemberWithoutPendingDelete(login, policy);
}

function isPolicyMemberByRole(policy: OnyxEntry<Policy>) {
    return !!policy?.role && Object.values(CONST.POLICY.ROLE).includes(policy.role);
}

function isPolicyValidForMovingExpenses(policy: OnyxEntry<Policy>, login: string, isPerDiemRequest?: boolean) {
    return (
        checkForUserPendingDelete(login, policy) &&
        isPolicyMemberByRole(policy) &&
        isPaidGroupPolicy(policy) &&
        policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
        (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(policy))
    );
}

function usePolicyForMovingExpenses(isPerDiemRequest?: boolean, expensePolicyID?: string) {
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        canBeMissing: true,
        selector: activePolicySelector,
    });

    const session = useSession();
    const login = session?.email ?? '';

    // Early exit optimization: only need to check if we have 0, 1, or >1 policies
    let singleUserPolicy;
    let isMemberOfMoreThanOnePolicy = false;
    for (const policy of Object.values(allPolicies ?? {})) {
        if (!isPolicyValidForMovingExpenses(policy, login, isPerDiemRequest)) {
            continue;
        }

        if (!singleUserPolicy) {
            singleUserPolicy = policy;
        } else {
            isMemberOfMoreThanOnePolicy = true;
            break; // Found 2, no need to continue
        }
    }

    // If an expense policy ID is provided and valid, prefer it over the active policy
    // This ensures that when viewing/editing an expense from workspace B, we show workspace B
    // even if the user's default workspace is A
    if (expensePolicyID) {
        const expensePolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${expensePolicyID}`];
        if (expensePolicy && isPolicyValidForMovingExpenses(expensePolicy, login, isPerDiemRequest)) {
            return {policyForMovingExpensesID: expensePolicyID, policyForMovingExpenses: expensePolicy, shouldSelectPolicy: false};
        }
    }

    if (activePolicy && (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(activePolicy))) {
        return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false};
    }

    if (singleUserPolicy && !isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: singleUserPolicy.id, policyForMovingExpenses: singleUserPolicy, shouldSelectPolicy: false};
    }

    if (isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: true};
    }

    return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false};
}

export default usePolicyForMovingExpenses;
