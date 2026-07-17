import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';
import type {Policy} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import type {YourSpendPolicy} from './YourSpendPatchData';

// eslint-disable-next-line no-restricted-imports -- Your spend is a billing/paid-only feature (Collect/Control), so paid-group scoping is intentional here.
import {isPaidGroupPolicy} from './PolicyUtils';
import {buildQueryStringFromFilterFormValues} from './SearchQueryUtils';

/** Extracts policy IDs from an already-narrowed paid-group collection (see `selectPaidGroupPolicies`). */
function getPaidGroupPolicyIDs(paidPolicies: OnyxCollection<YourSpendPolicy>): string[] {
    return Object.values(paidPolicies ?? {})
        .map((policy) => policy?.id)
        .filter((id): id is string => !!id);
}

/**
 * `useOnyx` selector that narrows the full policy collection to only paid-group workspaces (the only ones "Your spend"
 * cares about) and to the few fields the snapshot builders read, so subscribers re-render only when those fields of a
 * paid policy change rather than on any policy change.
 */
function selectPaidGroupPolicies(policies: OnyxCollection<Policy>): OnyxCollection<YourSpendPolicy> {
    const paidPolicies: OnyxCollection<YourSpendPolicy> = {};
    for (const [key, policy] of Object.entries(policies ?? {})) {
        if (!policy?.id || !isPaidGroupPolicy(policy)) {
            continue;
        }
        paidPolicies[key] = {id: policy.id, type: policy.type, outputCurrency: policy.outputCurrency};
    }
    return paidPolicies;
}

function get30DaysAgoDateString(): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 30);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildAwaitingApprovalQuery(accountID: number, policyIDs: string[]): string {
    return buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
        from: [String(accountID)],
        reimbursable: CONST.SEARCH.BOOLEAN.YES,
        // Limit to the user's workspaces so IOU and personal expenses aren't counted.
        ...(policyIDs.length > 0 ? {[FILTER_KEYS.POLICY_ID]: policyIDs} : {}),
    });
}

function buildRepaidLast30DaysQuery(accountID: number): string {
    return buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: [CONST.SEARCH.STATUS.EXPENSE.PAID],
        from: [String(accountID)],
        reimbursable: CONST.SEARCH.BOOLEAN.YES,
        [FILTER_KEYS.DATE_AFTER]: get30DaysAgoDateString(),
    });
}

function buildRecentCardTransactionsQuery(accountID: number, cardID: number): string {
    return buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        from: [String(accountID)],
        cardID: [String(cardID)],
        [FILTER_KEYS.DATE_AFTER]: get30DaysAgoDateString(),
    });
}

export {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery, buildRecentCardTransactionsQuery, get30DaysAgoDateString, getPaidGroupPolicyIDs, selectPaidGroupPolicies};
