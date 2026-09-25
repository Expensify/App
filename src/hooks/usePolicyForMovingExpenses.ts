import {useActivePolicyContext} from '@components/ActivePolicyProvider';
import {useSession} from '@components/OnyxListItemProvider';

import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import {canSubmitPerDiemExpenseFromWorkspace, getPolicyRole, isGroupPolicy, isPolicyMemberWithoutPendingDelete, isTimeTrackingEnabled} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

// TODO: temporary util - if we don't have employeeList object we don't check for the pending delete
function checkForUserPendingDelete(login: string, policy: OnyxEntry<Policy>) {
    if (isEmptyObject(policy?.employeeList)) {
        return true;
    }
    return isPolicyMemberWithoutPendingDelete(login, policy);
}

// `policy.role` is only populated on the user's default/active policy, so fall back to the member's role in
// `employeeList` via `getPolicyRole`. Without the login-aware lookup, a workspace the user is genuinely a member
// of is rejected here while `getGroupPoliciesWhereReportCanBeCreated` (which uses `getPolicyRole`) accepts it,
// and the two disagree about whether the user has a workspace at all.
function isPolicyMemberByRole(policy: OnyxEntry<Policy>, login: string) {
    const role = getPolicyRole(policy, login);
    return !!role && (Object.values(CONST.POLICY.ROLE) as string[]).includes(role);
}

function isPolicyValidForMovingExpenses(policy: OnyxEntry<Policy>, login: string, isPerDiemRequest?: boolean, isTimeRequest?: boolean) {
    return (
        checkForUserPendingDelete(login, policy) &&
        isPolicyMemberByRole(policy, login) &&
        isGroupPolicy(policy) &&
        policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
        // Teachers Unite doesn't support reimbursement, so it can never be a destination for moving/reporting an expense.
        !isTeachersUnitePolicyID(policy?.id) &&
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

type PolicyForMovingExpenses = {
    policyForMovingExpensesID: string | undefined;
    policyForMovingExpenses: OnyxEntry<Policy>;
    shouldSelectPolicy: boolean;
    shouldNavigateToUpgradePath: boolean;
    /**
     * False while the policy collection is still being read from Onyx. Callers that *act* on the result — creating
     * a report, moving transactions — must no-op until this is true, because `shouldNavigateToUpgradePath: false`
     * during the read is "we don't know yet", not "this user has an eligible policy". `useCreateReport` gates the
     * same way. Callers that only navigate to a picker can ignore it; they already handle an unresolved policy.
     */
    arePoliciesLoaded: boolean;
};

function usePolicyForMovingExpenses(isPerDiemRequest?: boolean, isTimeRequest?: boolean, expensePolicyID?: string, isUnreportedManagedCardTransaction?: boolean): PolicyForMovingExpenses {
    const {activePolicyID, activePolicy} = useActivePolicyContext();

    const session = useSession();
    const login = session?.email ?? '';

    // Contextual selector — captures login/flags from closure.
    // Returns only IDs + flags (stable output) to prevent re-renders when unrelated policies change.
    const policyQualificationSelector = (policies: OnyxCollection<Policy>) => getPolicyQualificationResult(policies, login, isPerDiemRequest, isTimeRequest, expensePolicyID);
    const [qualificationResult, policiesLoadStatus] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: policyQualificationSelector,
    });

    const {singlePolicyID, isMemberOfMoreThanOnePolicy, validExpensePolicyID} = qualificationResult ?? {};

    // Per-key lookup for the resolved policy (only fires when that specific policy changes)
    const resolvedPolicyID = validExpensePolicyID ?? singlePolicyID;
    const [resolvedPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${resolvedPolicyID}`);

    // Gate the upgrade path on policy hydration. Without this, during Onyx cold-start the collection reads
    // empty and we'd report that a member of a group workspace has none, sending them to MONEY_REQUEST_UPGRADE.
    // `useCreateReport` guards the same way.
    const arePoliciesLoaded = !isLoadingOnyxValue(policiesLoadStatus);

    // If this is an employee's card transaction that we manage, then we should report it to their default policy
    // which we don't know. Sending an empty `policyID` instructs the backend to auto-select the preferred policy.
    // This never depends on a locally resolved policy, so it has to be answered before the upgrade path below.
    if (isUnreportedManagedCardTransaction) {
        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    // User has no eligible policy
    if (!resolvedPolicyID) {
        // The active workspace can still be a valid destination even when the qualification pass came back
        // empty, so check it before giving up. This has to run ahead of the upgrade path below, otherwise a
        // perfectly valid active workspace can never rescue the user.
        if (isPolicyValidForMovingExpenses(activePolicy, login, isPerDiemRequest, isTimeRequest)) {
            return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
        }

        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: arePoliciesLoaded, arePoliciesLoaded};
    }

    // If an expense policy ID is provided and valid, prefer it over the active policy
    if (validExpensePolicyID) {
        return {policyForMovingExpensesID: validExpensePolicyID, policyForMovingExpenses: resolvedPolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    if (
        activePolicy &&
        !isTeachersUnitePolicyID(activePolicy.id) &&
        (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(activePolicy)) &&
        (!isTimeRequest || isTimeTrackingEnabled(activePolicy))
    ) {
        return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    if (singlePolicyID && !isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: singlePolicyID, policyForMovingExpenses: resolvedPolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    if (isMemberOfMoreThanOnePolicy) {
        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: true, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: true, arePoliciesLoaded};
}

export default usePolicyForMovingExpenses;
