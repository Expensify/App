import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import FILTER_KEYS from '@src/types/form/SearchAdvancedFiltersForm';

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
        status: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
        from: [String(accountID)],
        reimbursable: CONST.SEARCH.BOOLEAN.YES,
        // Limit to the user's workspaces so IOU and personal expenses aren't counted.
        ...(policyIDs.length > 0 ? {[FILTER_KEYS.POLICY_ID]: policyIDs} : {}),
    });
}

function buildRepaidLast30DaysQuery(accountID: number): string {
    return buildQueryStringFromFilterFormValues({
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        status: CONST.SEARCH.STATUS.EXPENSE.PAID,
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

export {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery, buildRecentCardTransactionsQuery};
