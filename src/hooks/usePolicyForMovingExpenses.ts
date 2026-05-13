import {activePolicySelector} from '@selectors/Policy';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useSession} from '@components/OnyxListItemProvider';
import {canSubmitPerDiemExpenseFromWorkspace, isPaidGroupPolicy, isPolicyMemberWithoutPendingDelete, isTimeTrackingEnabled} from '@libs/PolicyUtils';
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

function isPolicyValidForMovingExpenses(policy: OnyxEntry<Policy>, login: string, isPerDiemRequest?: boolean, isTimeRequest?: boolean) {
    return (
        checkForUserPendingDelete(login, policy) &&
        isPolicyMemberByRole(policy) &&
        isPaidGroupPolicy(policy) &&
        policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
        (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(policy)) &&
        (!isTimeRequest || isTimeTrackingEnabled(policy))
    );
}

type PolicyQualificationResult = {
    singlePolicyID: string | undefined;
    isMemberOfMoreThanOnePolicy: boolean;
    validExpensePolicyID: string | undefined;
};

/**
 * Selector that computes which policies qualify for moving expenses.
 * Returns only IDs and flags — stable output that prevents re-renders when unrelated policies change.
 */
function getPolicyQualificationResult(
    policies: OnyxCollection<Policy>,
    login: string,
    isPerDiemRequest?: boolean,
    isTimeRequest?: boolean,
    expensePolicyID?: string,
): PolicyQualificationResult {
    if (!policies) {
        return {singlePolicyID: undefined, isMemberOfMoreThanOnePolicy: false, validExpensePolicyID: undefined};
    }

    let singlePolicyID: string | undefined;
    let isMemberOfMoreThanOnePolicy = false;
    for (const policy of Object.values(policies)) {
        if (!isPolicyValidForMovingExpenses(policy, login, isPerDiemRequest, isTimeRequest)) {
            continue;
        }
        if (!singlePolicyID) {
            singlePolicyID = policy?.id;
        } else {
            isMemberOfMoreThanOnePolicy = true;
            break;
        }
    }

    let validExpensePolicyID: string | undefined;
    if (expensePolicyID) {
        const expensePolicy = policies[`${ONYXKEYS.COLLECTION.POLICY}${expensePolicyID}`];
        if (expensePolicy && isPolicyValidForMovingExpenses(expensePolicy, login, isPerDiemRequest, isTimeRequest)) {
            validExpensePolicyID = expensePolicyID;
        }
    }

    return {singlePolicyID, isMemberOfMoreThanOnePolicy, validExpensePolicyID};
}

function usePolicyForMovingExpenses(isPerDiemRequest?: boolean, isTimeRequest?: boolean, expensePolicyID?: string) {
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [activePolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`, {
        selector: activePolicySelector,
    });

    const session = useSession();
    const login = session?.email ?? '';

    // Contextual selector — captures login/flags from closure.
    // Returns only IDs + flags (stable output) to prevent re-renders when unrelated policies change.
    const policyQualificationSelector = (policies: OnyxCollection<Policy>) => getPolicyQualificationResult(policies, login, isPerDiemRequest, isTimeRequest, expensePolicyID);
    const [qualificationResult] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: policyQualificationSelector,
    });

    const {singlePolicyID, isMemberOfMoreThanOnePolicy, validExpensePolicyID} = qualificationResult ?? {};

    // Per-key lookup for the resolved policy (only fires when that specific policy changes)
    const resolvedPolicyID = validExpensePolicyID ?? singlePolicyID;
    const [resolvedPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${resolvedPolicyID}`);

    // If an expense policy ID is provided and valid, prefer it over the active policy
    if (validExpensePolicyID) {
        return {policyForMovingExpensesID: validExpensePolicyID, policyForMovingExpenses: resolvedPolicy, shouldSelectPolicy: false};
    }

    if (activePolicy && (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(activePolicy)) && (!isTimeRequest || isTimeTrackingEnabled(activePolicy))) {
        return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false};
    }

    if (singlePolicyID && !isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: singlePolicyID, policyForMovingExpenses: resolvedPolicy, shouldSelectPolicy: false};
    }

    if (isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: true};
    }

    return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false};
}

export default usePolicyForMovingExpenses;
