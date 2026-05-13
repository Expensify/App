import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchQueryJSON} from '@components/Search/types';
import {isExpenseReport, isOptimisticPersonalDetail} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import {getCurrentUserPersonalDetails, getUserAccountID} from './index';

type ExpenseReportStatusPredicate = (expenseReport: OnyxEntry<OnyxTypes.Report>, transactionReportID?: string) => boolean;

const expenseReportStatusFilterMapping: Record<string, ExpenseReportStatusPredicate> = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport, transactionReportID) => !expenseReport && transactionReportID !== CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.DELETED]: (_expenseReport, transactionReportID) => transactionReportID === CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.ALL]: () => true,
};

type GetSearchOnyxUpdateParams = {
    transaction: OnyxTypes.Transaction;
    participant?: Participant;
    iouReport?: OnyxEntry<OnyxTypes.Report>;
    iouAction?: OnyxEntry<OnyxTypes.ReportAction>;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    isFromOneTransactionReport?: boolean;
    isInvoice?: boolean;
    transactionThreadReportID: string | undefined;
};

//  Determines whether the current search results should be optimistically updated
function shouldOptimisticallyUpdateSearch(
    currentSearchQueryJSON: Readonly<SearchQueryJSON>,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    isInvoice: boolean | undefined,
    transaction?: OnyxEntry<OnyxTypes.Transaction>,
) {
    if (
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.INVOICE &&
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.EXPENSE &&
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT
    ) {
        return false;
    }
    let shouldOptimisticallyUpdateByStatus;
    const status = currentSearchQueryJSON.status;
    const transactionReportID = transaction?.reportID;
    if (Array.isArray(status)) {
        shouldOptimisticallyUpdateByStatus = status.some((val) => {
            const expenseStatus = val as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
            return expenseReportStatusFilterMapping[expenseStatus](iouReport, transactionReportID);
        });
    } else {
        const expenseStatus = status as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
        shouldOptimisticallyUpdateByStatus = expenseReportStatusFilterMapping[expenseStatus](iouReport, transactionReportID);
    }

    if (currentSearchQueryJSON.policyID?.length && iouReport?.policyID) {
        if (!currentSearchQueryJSON.policyID.includes(iouReport.policyID)) {
            return false;
        }
    }

    if (!shouldOptimisticallyUpdateByStatus) {
        return false;
    }

    const suggestedSearches = getSuggestedSearches(getUserAccountID());
    const submitQueryJSON = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQueryJSON;
    const approveQueryJSON = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.APPROVE].searchQueryJSON;
    const unapprovedCashSimilarSearchHash = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH].similarSearchHash;

    const validSearchTypes =
        (!isInvoice && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (isInvoice && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.INVOICE) ||
        (iouReport?.type === CONST.REPORT.TYPE.EXPENSE && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    const hasNoFlatFilters = currentSearchQueryJSON.flatFilters.length === 0;

    const matchesSubmitQuery =
        submitQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport);

    const matchesApproveQuery =
        approveQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport);

    const matchesUnapprovedCashQuery =
        unapprovedCashSimilarSearchHash === currentSearchQueryJSON.similarSearchHash &&
        isExpenseReport(iouReport) &&
        (expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport) || expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport)) &&
        transaction?.reimbursable;

    const matchesFilterQuery = hasNoFlatFilters || matchesSubmitQuery || matchesApproveQuery || matchesUnapprovedCashQuery;

    return shouldOptimisticallyUpdateByStatus && validSearchTypes && matchesFilterQuery;
}

function getSearchOnyxUpdate({
    participant,
    transaction,
    iouReport,
    iouAction,
    policy,
    transactionThreadReportID,
    isFromOneTransactionReport,
    isInvoice,
}: GetSearchOnyxUpdateParams): OnyxData<typeof ONYXKEYS.COLLECTION.SNAPSHOT> | undefined {
    const toAccountID = participant?.accountID;
    const deprecatedCurrentUserPersonalDetails = getCurrentUserPersonalDetails();
    const fromAccountID = deprecatedCurrentUserPersonalDetails?.accountID;
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    if (!currentSearchQueryJSON || toAccountID === undefined || fromAccountID === undefined) {
        return;
    }

    if (shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, isInvoice, transaction)) {
        const isOptimisticToAccountData = isOptimisticPersonalDetail(toAccountID);
        const successData = [];
        if (isOptimisticToAccountData) {
            // The optimistic personal detail is cleared from PERSONAL_DETAILS_LIST on API success, but the snapshot's report still references
            // that optimistic accountID via report.managerID. Re-merging the personal detail into the snapshot in successData prevents the
            // "To" column from briefly going blank before Search API delivers the real data.
            // See https://github.com/Expensify/App/issues/61310 for more information.
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                value: {
                    data: {
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                            [toAccountID]: {
                                accountID: toAccountID,
                                displayName: participant?.displayName,
                                login: participant?.login,
                            },
                        },
                    },
                },
            });
        }
        // Building this object sequentially resolves TypeScript type inference issues
        const optimisticSnapshotData: SearchResultDataType = {};

        optimisticSnapshotData[ONYXKEYS.PERSONAL_DETAILS_LIST] = {
            [toAccountID]: {
                accountID: toAccountID,
                displayName: participant?.displayName,
                login: participant?.login,
            },
            [fromAccountID]: {
                accountID: fromAccountID,
                avatar: deprecatedCurrentUserPersonalDetails?.avatar,
                displayName: deprecatedCurrentUserPersonalDetails?.displayName,
                login: deprecatedCurrentUserPersonalDetails?.login,
            },
        };

        optimisticSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            ...(transactionThreadReportID && {transactionThreadReportID}),
            ...(isFromOneTransactionReport && {isFromOneTransactionReport}),
            ...transaction,
        };

        if (policy) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;
        }

        if (iouReport) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`] = iouReport;
        }

        if (iouReport && iouAction) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`] = {[iouAction.reportActionID]: iouAction};
        }

        const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                value: {
                    data: optimisticSnapshotData,
                },
            },
        ];

        if (currentSearchQueryJSON.groupBy === CONST.SEARCH.GROUP_BY.FROM) {
            const newFlatFilters = currentSearchQueryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
            newFlatFilters.push({
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: fromAccountID}],
            });

            const groupTransactionsQueryJSON = buildSearchQueryJSON(
                buildSearchQueryString({
                    ...currentSearchQueryJSON,
                    groupBy: undefined,
                    flatFilters: newFlatFilters,
                }),
            );

            if (groupTransactionsQueryJSON?.hash) {
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${groupTransactionsQueryJSON.hash}` as const,
                    value: {
                        search: {
                            type: groupTransactionsQueryJSON.type,
                            status: groupTransactionsQueryJSON.status,
                            offset: 0,
                            hasMoreResults: false,
                            hasResults: true,
                            isLoading: false,
                        },
                        data: optimisticSnapshotData,
                    },
                });
            }
        }

        return {
            optimisticData,
            successData,
        };
    }
}

export {getSearchOnyxUpdate, shouldOptimisticallyUpdateSearch};
