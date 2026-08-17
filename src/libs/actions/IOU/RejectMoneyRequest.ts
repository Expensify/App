import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import * as API from '@libs/API';
import type {MarkTransactionViolationAsResolvedParams, RejectExpenseReportParams, RejectMoneyRequestParams, SetNameValuePairParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {navigationRef} from '@libs/Navigation/Navigation';
import {buildOptimisticNextStep} from '@libs/NextStepUtils';
import {isDelayedSubmissionEnabled} from '@libs/PolicyUtils';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import {
    buildOptimisticExpenseReport,
    buildOptimisticMarkedAsResolvedReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticMovedTransactionAction,
    buildOptimisticRejectReportAction,
    buildOptimisticRejectReportActionComment,
    buildOptimisticReportLevelRejectAction,
    buildOptimisticReportLevelRejectCommentAction,
    buildOptimisticReportPreview,
    generateReportID,
    getDisplayedReportID,
    getParsedComment,
    getReimbursableTotal,
    getReportTransactions,
    hasOutstandingChildRequest,
    isIOUReport,
    isOpenReport,
} from '@libs/ReportUtils';
import {getAmount, getCurrency} from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';

import {notifyNewAction} from '@userActions/Report';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import {getAllReports, getAllTransactions, getAllTransactionViolations} from '.';

type RejectMoneyRequestData = {
    optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    >;
    successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    >;
    failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    >;
    parameters: RejectMoneyRequestParams;
    urlToNavigateBack: Route | undefined;
};

type RejectMoneyRequestOptions = {
    sharedRejectedToReportID?: string;
    existingRejectedReport?: OnyxEntry<OnyxTypes.Report>;
    setExistingRejectedReport?: (report: OnyxEntry<OnyxTypes.Report>) => void;
};

function dismissRejectUseExplanation() {
    const parameters: SetNameValuePairParams = {
        name: ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,
        value: true,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,
            value: true,
        },
    ];

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData,
    });
}

/**
 * Retrieve the reject money request data
 * @param transactionID - The ID of the transaction to reject
 * @param reportID - The ID of the expense report to reject
 * @param comment - The comment to add to the reject action
 * @param options
 *   - sharedRejectedToReportID: When rejecting multiple expenses sequentially, pass a single shared destination reportID so all rejections land in the same new report.
 * @returns optimisticData, successData, failureData, parameters, urlToNavigateBack
 */
type PrepareRejectMoneyRequestDataParams = {
    transactionID: string;
    reportID: string;
    comment: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserLogin: string;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    delegateAccountID: number | undefined;
    getCurrencyDecimals: CurrencyListActionsContextType['getCurrencyDecimals'];
    options?: RejectMoneyRequestOptions;
    shouldUseBulkAction?: boolean;
};

function prepareRejectMoneyRequestData({
    transactionID,
    reportID,
    comment,
    policy,
    currentUserAccountIDParam,
    currentUserLogin,
    betas,
    delegateAccountID,
    getCurrencyDecimals,
    options,
    shouldUseBulkAction,
}: PrepareRejectMoneyRequestDataParams): RejectMoneyRequestData | undefined {
    const allTransactions = getAllTransactions();
    const allReports = getAllReports();
    // TODO: https://github.com/Expensify/App/issues/66512
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const allTransactionViolations = getAllTransactionViolations();

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionAmount = getAmount(transaction);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const policyExpenseChat = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const isPolicyDelayedSubmissionEnabled = policy ? isDelayedSubmissionEnabled(policy) : false;
    const isIOU = isIOUReport(report);
    const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
    const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;
    const isUserOnSearchMoneyRequestReport = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;

    if (!report || !transaction) {
        return undefined;
    }

    const reportAction = getIOUActionForReportID(reportID, transactionID);
    const childReportID = reportAction?.childReportID;
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`];

    let movedToReport;
    let rejectedToReportID = options?.sharedRejectedToReportID;
    let urlToNavigateBack;
    let reportPreviewAction: OnyxTypes.ReportAction | undefined;
    let createdIOUReportActionID;
    let expenseMovedReportActionID;
    let expenseCreatedReportActionID;

    const hasMultipleExpenses = getReportTransactions(reportID).length > 1;
    const transactionCommentCleanup = (() => {
        if (!transaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE]) {
            return undefined;
        }

        const dismissedViolations = {...(transaction.comment.dismissedViolations ?? {})};
        delete dismissedViolations[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE];

        return {
            comment: {
                ...(transaction.comment ?? {}),
                dismissedViolations: isEmptyObject(dismissedViolations) ? null : dismissedViolations,
            },
        };
    })();

    // Build optimistic data updates
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    // Create system messages in both expense report and expense thread
    // The "rejected this expense" action should come before the reject comment
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectReportAction = buildOptimisticRejectReportAction(delegateAccountID, baseTimestamp);
    const parsedComment = getParsedComment(comment);
    const optimisticRejectReportActionComment = buildOptimisticRejectReportActionComment(comment, delegateAccountID, DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1));
    let movedTransactionAction;

    // Build successData and failureData to prevent duplication
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    if ((!isPolicyDelayedSubmissionEnabled || isIOU) && !shouldUseBulkAction) {
        if (hasMultipleExpenses) {
            // For reports with multiple expenses: Update report total
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        total: (report?.total ?? 0) + transactionAmount,
                        reimbursableTotal: getReimbursableTotal(report) + transactionAmount,
                        pendingFields: {
                            total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID: null,
                        ...(transactionCommentCleanup ?? {}),
                    },
                },
            );

            // Add success data for report total update
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    pendingFields: {total: null},
                },
            });

            // Add failure data for report total revert
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    total: report?.total ?? 0,
                    reimbursableTotal: getReimbursableTotal(report),
                    pendingFields: {total: null},
                },
            });

            // Add failure data for transaction revert
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    reportID: transaction?.reportID ?? reportID,
                },
            });

            if (isUserOnSearchPage) {
                // Navigate to the existing Reports > Expense view
                urlToNavigateBack = undefined;
            } else {
                // Go back to the original expenses report
                urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
            }
        } else {
            // For reports with single expense: Delete the report
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        ...(transactionCommentCleanup ?? {}),
                    },
                },
            );

            // And delete the corresponding REPORTPREVIEW action
            const parentReportID = report?.parentReportID;
            const parentReportActionID = report?.parentReportActionID;
            const deletedTime = DateUtils.getDBTime();
            if (parentReportActionID) {
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
                    value: {
                        [parentReportActionID]: {
                            originalMessage: {
                                deleted: deletedTime,
                            },
                        },
                    },
                });
                failureData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
                    value: {
                        [parentReportActionID]: {
                            originalMessage: {
                                deleted: null,
                            },
                        },
                    },
                });
            }

            // Add success data for report deletion (no action needed, report is already deleted)
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: null,
            });

            // Add failure data to restore the report
            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: report,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID,
                    },
                },
            );

            if (isUserOnSearchPage) {
                // Navigate to the existing Reports > Expense view
                urlToNavigateBack = undefined;
            } else {
                // Go back to the original expenses report
                urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
            }
        }

        // Make API call
        const parameters: RejectMoneyRequestParams = {
            transactionID,
            reportID,
            comment: parsedComment,
            rejectedActionReportActionID: optimisticRejectReportAction.reportActionID,
            rejectedCommentReportActionID: optimisticRejectReportActionComment.reportActionID,
        };

        API.write(WRITE_COMMANDS.REJECT_MONEY_REQUEST, parameters, {
            optimisticData,
            successData,
            failureData,
        });

        const currentReportID = getDisplayedReportID(reportID, false);
        notifyNewAction(currentReportID, undefined, true);

        return {
            optimisticData,
            successData,
            failureData,
            parameters,
            urlToNavigateBack,
        };
    }

    // Handle delayed submission or bulk actions
    if (!rejectedToReportID) {
        rejectedToReportID = generateReportID();
    }

    const newExpenseReport = buildOptimisticExpenseReport(
        report?.chatReportID ?? '',
        report?.ownerAccountID ?? 0,
        currentUserAccountIDParam,
        transactionAmount,
        getCurrency(transaction),
        rejectedToReportID,
    );
    const [, createdActionForExpenseReport, iouAction] = buildOptimisticMoneyRequestEntities({
        getCurrencyDecimals,
        iouReport: newExpenseReport,
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount: transactionAmount,
        currency: getCurrency(transaction),
        comment: parsedComment,
        payeeEmail: currentUserLogin,
        participants: [{accountID: report?.ownerAccountID}],
        transactionID: transaction.transactionID,
        existingTransactionThreadReportID: childReportID,
        shouldGenerateTransactionThreadReport: false,
        currentUserAccountID: currentUserAccountIDParam,
        delegateAccountIDParam: delegateAccountID,
    });

    reportPreviewAction = buildOptimisticReportPreview(policyExpenseChat, newExpenseReport, getCurrencyDecimals, undefined, transaction, undefined, undefined, delegateAccountID);
    movedTransactionAction = buildOptimisticMovedTransactionAction(childReportID, newExpenseReport.reportID);
    createdIOUReportActionID = iouAction.reportActionID;
    expenseMovedReportActionID = movedTransactionAction.reportActionID;
    expenseCreatedReportActionID = createdActionForExpenseReport.reportActionID;
    newExpenseReport.parentReportActionID = reportPreviewAction.reportActionID;
    options?.setExistingRejectedReport?.(newExpenseReport);
    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat?.reportID}`,
            value: {
                lastVisibleActionCreated: reportPreviewAction.created,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
            value: {
                ...newExpenseReport,
                pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${rejectedToReportID}`,
            value: {
                hasOnceLoadedReportActions: true,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
            value: {[createdActionForExpenseReport.reportActionID]: createdActionForExpenseReport, [iouAction.reportActionID]: iouAction},
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rejectedToReportID}`,
            value: {
                parentReportID: report?.chatReportID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
            value: {
                parentReportActionID: iouAction.reportActionID,
                parentReportID: rejectedToReportID,
            },
        },
    );
    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
            value: {
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
            value: {
                isOptimisticReport: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
            value: {[createdActionForExpenseReport.reportActionID]: {pendingAction: null}, [iouAction.reportActionID]: {pendingAction: null}},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {pendingAction: null},
            },
        },
    );

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat?.reportID}`,
            value: {
                lastVisibleActionCreated: policyExpenseChat?.lastVisibleActionCreated,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rejectedToReportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
            value: {
                parentReportActionID: transactionThreadReport?.parentReportActionID,
                parentReportID: transactionThreadReport?.parentReportID,
            },
        },
    );

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                total: (report?.total ?? 0) + transactionAmount,
                reimbursableTotal: getReimbursableTotal(report) + transactionAmount,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                reportID: rejectedToReportID,
                ...(transactionCommentCleanup ?? {}),
            },
        },
    );

    // Add success data for original report total update
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            pendingFields: null,
            errorFields: null,
        },
    });

    // Add success data for transaction update
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingAction: null,
            errorFields: null,
        },
    });

    // Add failure data to revert original report total
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            total: report?.total ?? 0,
            reimbursableTotal: getReimbursableTotal(report),
        },
    });

    // Add failure data to revert transaction reportID
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            reportID: transaction?.reportID ?? reportID,
        },
    });

    // Make API call
    const parameters: RejectMoneyRequestParams = {
        transactionID,
        reportID,
        comment: parsedComment,
        rejectedActionReportActionID: optimisticRejectReportAction.reportActionID,
        rejectedCommentReportActionID: optimisticRejectReportActionComment.reportActionID,
        createdIOUReportActionID,
        expenseMovedReportActionID,
        expenseCreatedReportActionID,
        newExpenseReportID: rejectedToReportID,
    };

    API.write(WRITE_COMMANDS.REJECT_MONEY_REQUEST, parameters, {
        optimisticData,
        successData,
        failureData,
    });

    const currentReportID = getDisplayedReportID(reportID, false);
    notifyNewAction(currentReportID, undefined, true);

    return {
        optimisticData,
        successData,
        failureData,
        parameters,
        urlToNavigateBack,
    };
}

function rejectMoneyRequest({
    transactionID,
    reportID,
    comment,
    policy,
    currentUserAccountIDParam,
    currentUserLogin,
    betas,
    delegateAccountID,
    getCurrencyDecimals,
    options,
}: PrepareRejectMoneyRequestDataParams) {
    prepareRejectMoneyRequestData({
        transactionID,
        reportID,
        comment,
        policy,
        currentUserAccountIDParam,
        currentUserLogin,
        betas,
        delegateAccountID,
        getCurrencyDecimals,
        options,
    });
}

function markRejectViolationAsResolved(transactionID: string, reportID: string) {
    const allTransactionViolations = getAllTransactionViolations();
    const currentViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

    const optimisticMarkedAsResolvedReportAction = buildOptimisticMarkedAsResolvedReportAction();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: optimisticMarkedAsResolvedReportAction,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentViolations ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: null,
            },
        },
    ];

    const parameters: MarkTransactionViolationAsResolvedParams = {
        transactionID,
        markedAsResolvedReportActionID: optimisticMarkedAsResolvedReportAction.reportActionID,
    };

    // Make API call
    API.write(WRITE_COMMANDS.MARK_TRANSACTION_VIOLATION_AS_RESOLVED, parameters, {
        optimisticData,
        successData,
        failureData,
    });

    const currentReportID = getDisplayedReportID(reportID, false);
    notifyNewAction(currentReportID, undefined, true);
}

function rejectExpenseReport(
    report: OnyxTypes.Report,
    targetAccountID: number,
    comment: string,
    currentUserAccountID: number | undefined,
    currentUserDisplayName: string | undefined,
    currentUserAvatarSource: AvatarSource | undefined,
    isTrackIntentUser: boolean | undefined,
    delegateAccountID: number | undefined,
) {
    const {reportID} = report;
    const isRejectToSubmitter = targetAccountID === report.ownerAccountID;
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectAction = buildOptimisticReportLevelRejectAction(
        isRejectToSubmitter,
        currentUserAccountID,
        currentUserDisplayName,
        currentUserAvatarSource,
        delegateAccountID,
        baseTimestamp,
    );
    const parsedComment = getParsedComment(comment);
    const optimisticCommentAction = buildOptimisticReportLevelRejectCommentAction(
        parsedComment,
        currentUserAccountID,
        currentUserDisplayName,
        currentUserAvatarSource,
        delegateAccountID,
        DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1),
    );

    const optimisticStateNum = isRejectToSubmitter ? CONST.REPORT.STATE_NUM.OPEN : CONST.REPORT.STATE_NUM.SUBMITTED;
    const optimisticStatusNum = isRejectToSubmitter ? CONST.REPORT.STATUS_NUM.OPEN : CONST.REPORT.STATUS_NUM.SUBMITTED;

    const optimisticNextStep = isRejectToSubmitter
        ? buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
              isRejectedReport: true,
              isTrackIntentUser,
          })
        : buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
              bypassNextApproverID: targetAccountID,
              isTrackIntentUser,
          });

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                managerID: targetAccountID,
                stateNum: optimisticStateNum,
                statusNum: optimisticStatusNum,
                pendingFields: {
                    partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                nextStep: optimisticNextStep,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticRejectAction.reportActionID]: {
                    ...(optimisticRejectAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                [optimisticCommentAction.reportActionID]: {
                    ...(optimisticCommentAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
    ];

    if (report.parentReportID && report.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {
                [report.parentReportActionID]: {
                    childStateNum: optimisticStateNum,
                    childStatusNum: optimisticStatusNum,
                },
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                errorFields: {
                    partial: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticRejectAction.reportActionID]: {
                    pendingAction: null,
                },
                [optimisticCommentAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                managerID: report.managerID,
                stateNum: report.stateNum,
                statusNum: report.statusNum,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                errorFields: {
                    partial: getMicroSecondOnyxErrorWithTranslationKey('iou.rejectReport.couldNotReject'),
                },
                nextStep: report.nextStep ?? null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticCommentAction.reportActionID]: {
                    ...(optimisticCommentAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.rejectReport.couldNotReject'),
                },
            },
        },
    ];

    if (report.parentReportID && report.parentReportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {
                [report.parentReportActionID]: {
                    childStateNum: report.stateNum,
                    childStatusNum: report.statusNum,
                },
            },
        });
    }

    const isIOU = isIOUReport(report);
    if (!isIOU) {
        const transactions = getReportTransactions(reportID);
        const allTransactionViolations = getAllTransactionViolations();
        transactions.forEach((transaction) => {
            const transactionID = transaction.transactionID;
            if (!transactionID) {
                return;
            }

            // Add the violation to the transaction
            const currentTransactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            const hasRejectedExpenseViolation = currentTransactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);

            if (!hasRejectedExpenseViolation) {
                const newViolation = {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    data: {
                        comment: comment ?? '',
                        rejectedBy: currentUserDisplayName,
                        rejectedDate: DateUtils.getDBTime(),
                    },
                    showInReview: true,
                };

                optimisticData.push({
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    value: [...currentTransactionViolations, newViolation],
                });

                failureData.push({
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    value: currentTransactionViolations,
                });
            }

            // Clean up dismissed violations
            if (transaction.comment?.dismissedViolations?.[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE]) {
                const dismissedViolations = {...transaction.comment.dismissedViolations};
                delete dismissedViolations[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE];

                const updatedComment = {
                    ...(transaction.comment ?? {}),
                    dismissedViolations: isEmptyObject(dismissedViolations) ? null : dismissedViolations,
                };

                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        comment: updatedComment,
                    },
                });

                failureData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        comment: transaction.comment,
                    },
                });
            }
        });
    }

    const parameters: RejectExpenseReportParams = {
        reportID,
        targetAccountID,
        comment: parsedComment,
        rejectedActionReportActionID: optimisticRejectAction.reportActionID,
        rejectedCommentReportActionID: optimisticCommentAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REJECT_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

export {dismissRejectUseExplanation, prepareRejectMoneyRequestData, rejectMoneyRequest, markRejectViolationAsResolved, rejectExpenseReport};
export type {RejectMoneyRequestData};
