import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import {buildCannedSearchQuery, buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import {isEligibleForApproveSuggestion} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Session} from '@src/types/onyx';
import useOnyx from './useOnyx';

type PaidPolicySummary = {
    approvalMode: string | undefined;
    isApprover: boolean;
    isSubmittedToTarget: boolean;
};

const sessionSelector = (session: OnyxEntry<Session>) => ({
    email: session?.email,
    accountID: session?.accountID,
});

/**
 * Creates a selector that extracts minimal paid policy summaries with approve eligibility
 * pre-computed, so the selector output does not include large objects like employeeList.
 * This keeps Onyx's deepEqual comparison cheap.
 */
function createPolicyCollectionSelector(email: string | undefined) {
    return (policies: OnyxCollection<Policy>): PaidPolicySummary[] | undefined => {
        if (!policies) {
            return undefined;
        }

        const result: PaidPolicySummary[] = [];
        for (const policy of Object.values(policies)) {
            if (!policy || !isPaidGroupPolicy(policy)) {
                continue;
            }
            result.push({
                approvalMode: policy.approvalMode,
                isApprover: policy.approver === email,
                isSubmittedToTarget: Object.values(policy.employeeList ?? {}).some((employee) => employee.submitsTo === email || employee.forwardsTo === email),
            });
        }
        return result;
    };
}

/**
 * Lightweight hook that computes only the default actionable search query string.
 *
 * This replaces the heavy `useSearchTypeMenuSections` hook for components like
 * NavigationTabBar that only need the default search query to navigate to the
 * Search tab, rather than the full menu section structure.
 *
 * The logic mirrors `getDefaultActionableSearchMenuItem` from SearchUIUtils:
 * 1. If APPROVE is visible → return APPROVE query
 * 2. If any paid policy exists → return SUBMIT query
 * 3. Otherwise → return default canned search query (expenses)
 */
function useDefaultSearchQuery(): string {
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: sessionSelector, canBeMissing: false});
    const email = session?.email;
    const accountID = session?.accountID;

    const [paidPolicies] = useOnyx(
        ONYXKEYS.COLLECTION.POLICY,
        {
            selector: createPolicyCollectionSelector(email),
            canBeMissing: true,
        },
        [email],
    );

    if (!paidPolicies || paidPolicies.length === 0 || !accountID) {
        return buildCannedSearchQuery();
    }

    const hasApproveEligiblePolicy = paidPolicies.some((policy) => isEligibleForApproveSuggestion(policy.approvalMode, policy.isApprover, policy.isSubmittedToTarget));

    if (hasApproveEligiblePolicy) {
        return buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: [`${accountID}`],
        });
    }

    return buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
        from: [`${accountID}`],
    });
}

export default useDefaultSearchQuery;
