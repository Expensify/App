/**
 * Leaf helpers for optimistic search snapshot updates.
 * Kept separate from SearchUIUtils so action modules (e.g. Transaction → SearchUpdate) can use them
 * without pulling Report/MoneyRequest and creating import cycles.
 */
import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {buildQueryStringFromFilterFormValues, buildSearchQueryJSON, getFilterFromQuery} from './SearchQueryUtils';

type ExpenseStatusPredicate = (expenseReport?: OnyxTypes.Report, transactionReportID?: string) => boolean;

const expenseStatusActionMapping: Record<string, ExpenseStatusPredicate> = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport, transactionReportID) => !expenseReport && transactionReportID !== CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.DELETED]: (_expenseReport, transactionReportID) => transactionReportID === CONST.REPORT.TRASH_REPORT_ID,
};

function isValidExpenseStatus(status: unknown): status is ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE> {
    return typeof status === 'string' && status in expenseStatusActionMapping;
}

function isEligibleForStatus(currentQueryJSON: SearchQueryJSON | undefined, report: OnyxEntry<OnyxTypes.Report>, transactionItemReportID?: string) {
    const status = getFilterFromQuery(currentQueryJSON, CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS);
    if (!status.value) {
        return true;
    }

    if (status.isNegated) {
        return Object.keys(expenseStatusActionMapping).some((expenseStatus) => {
            const isExcluded = status.value?.includes(expenseStatus);
            return !isExcluded && expenseStatusActionMapping[expenseStatus](report, transactionItemReportID);
        });
    }

    // Invalid statuses should be treated as if there were no status filter, mirroring backend behaviour.
    const validStatuses = status.value.filter(isValidExpenseStatus);
    if (validStatuses.length === 0) {
        return true;
    }

    return validStatuses.some((expenseStatus) => expenseStatusActionMapping[expenseStatus](report, transactionItemReportID));
}

/**
 * Query hashes for the suggested searches that `shouldOptimisticallyUpdateSearch` matches against.
 * Mirrors the SUBMIT / APPROVE / UNAPPROVED_CASH entries in `getSuggestedSearches` without importing SearchUIUtils.
 */
function getOptimisticSuggestedSearchHashes(accountID: number) {
    const submitQueryJSON = buildSearchQueryJSON(
        buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.SUBMIT,
            from: [`${accountID}`],
        }),
    );
    const approveQueryJSON = buildSearchQueryJSON(
        buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
            action: CONST.SEARCH.ACTION_FILTERS.APPROVE,
            to: [`${accountID}`],
        }),
    );
    const unapprovedCashQueryJSON = buildSearchQueryJSON(
        buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: [CONST.SEARCH.STATUS.EXPENSE.DRAFTS, CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING],
            groupBy: CONST.SEARCH.GROUP_BY.FROM,
            reimbursable: CONST.SEARCH.BOOLEAN.YES,
        }),
    );

    return {
        submitQueryJSON,
        approveQueryJSON,
        unapprovedCashSimilarSearchHash: unapprovedCashQueryJSON?.similarSearchHash ?? CONST.DEFAULT_NUMBER_ID,
    };
}

export {expenseStatusActionMapping, isEligibleForStatus, getOptimisticSuggestedSearchHashes};
