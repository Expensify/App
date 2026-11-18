import {useActivePolicyContext} from '@components/ActivePolicyProvider';
import {useSession} from '@components/OnyxListItemProvider';

import {canCreateReportOnPolicy, canSubmitPerDiemExpenseFromWorkspace, isTimeTrackingEnabled} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import useOnyx from './useOnyx';

/** The shared destination rule, plus per diem and time expenses only moving to workspaces that support them. */
function isPolicyValidForMovingExpenses(policy: OnyxEntry<Policy>, login: string, isPerDiemRequest?: boolean, isTimeRequest?: boolean): boolean {
    return canCreateReportOnPolicy(policy, login) && (!isPerDiemRequest || canSubmitPerDiemExpenseFromWorkspace(policy)) && (!isTimeRequest || isTimeTrackingEnabled(policy));
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
     * False while policies are still loading from Onyx. Callers that act on the result (create report, move
     * transactions) must no-op until true, as with `useCreateReport`. Picker-only callers can ignore it.
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

    if (!resolvedPolicyID) {
        if (isPolicyValidForMovingExpenses(activePolicy, login, isPerDiemRequest, isTimeRequest)) {
            return {policyForMovingExpensesID: activePolicyID, policyForMovingExpenses: activePolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
        }

        return {policyForMovingExpensesID: undefined, policyForMovingExpenses: undefined, shouldSelectPolicy: false, shouldNavigateToUpgradePath: arePoliciesLoaded, arePoliciesLoaded};
    }

    // If an expense policy ID is provided and valid, prefer it over the active policy
    if (validExpensePolicyID) {
        return {policyForMovingExpensesID: validExpensePolicyID, policyForMovingExpenses: resolvedPolicy, shouldSelectPolicy: false, shouldNavigateToUpgradePath: false, arePoliciesLoaded};
    }

    if (isPolicyValidForMovingExpenses(activePolicy, login, isPerDiemRequest, isTimeRequest)) {
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
