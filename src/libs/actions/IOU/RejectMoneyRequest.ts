import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {MarkTransactionViolationAsResolvedParams, RejectExpenseReportParams, RejectMoneyRequestParams, SetNameValuePairParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import {navigationRef} from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {getLoginByAccountID} from '@libs/PersonalDetailsUtils';
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
import {getAllReports, getAllTransactions, getAllTransactionViolations, getCurrentUserEmail} from '.';

type RejectMoneyRequestData = {
    optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
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
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    >;
    parameters: RejectMoneyRequestParams;
    urlToNavigateBack: Route | undefined;
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
function prepareRejectMoneyRequestData(
    transactionID: string,
    reportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    options?: {sharedRejectedToReportID?: string},
    shouldUseBulkAction?: boolean,
): RejectMoneyRequestData | undefined {
    const allTransactions = getAllTransactions();
    const allReports = getAllReports();
    const allTransactionViolations = getAllTransactionViolations();
    const deprecatedCurrentUserEmail = getCurrentUserEmail();

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
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    // Create system messages in both expense report and expense thread
    // The "rejected this expense" action should come before the reject comment
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectReportAction = buildOptimisticRejectReportAction(baseTimestamp);
    const parsedComment = getParsedComment(comment);
    const optimisticRejectReportActionComment = buildOptimisticRejectReportActionComment(comment, DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1));
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
                // Navigate to the existing Reports > Expense view.
                urlToNavigateBack = undefined;
            } else if (isUserOnSearchMoneyRequestReport) {
                // Go back based on backTo param of the current route
                const lastRouteParams = lastRoute?.params;
                urlToNavigateBack = lastRouteParams && 'backTo' in lastRouteParams ? lastRouteParams?.backTo : undefined;
            } else {
                // Go back to the expense chat
                urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(report.chatReportID);
            }
        }
    } else if (hasMultipleExpenses && !shouldUseBulkAction) {
        if (isUserOnSearchPage || isUserOnSearchMoneyRequestReport) {
            // Navigate to the existing Reports > Expense view.
            urlToNavigateBack = undefined;
        } else {
            // Go back to the original expenses report
            urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        }
        // For reports with multiple expenses:
        // 1. Update report total
        // 2. Remove expense from report
        // 3. Add to existing draft report or create new one
        const existingOpenReport = Object.values(allReports ?? {}).find(
            (r) =>
                r?.reportID !== reportID &&
                r?.chatReportID === report.chatReportID &&
                r?.type === CONST.REPORT.TYPE.EXPENSE &&
                isOpenReport(r) &&
                r?.ownerAccountID === report.ownerAccountID,
        );

        if (existingOpenReport) {
            movedToReport = existingOpenReport;
            rejectedToReportID = existingOpenReport.reportID;

            const [, , iouAction] = buildOptimisticMoneyRequestEntities({
                iouReport: movedToReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment: parsedComment,
                payeeEmail: getLoginByAccountID(report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) ?? '',
                participants: [{accountID: report?.ownerAccountID}],
                transactionID: transaction.transactionID,
                existingTransactionThreadReportID: childReportID,
                shouldGenerateTransactionThreadReport: false,
            });
            createdIOUReportActionID = iouAction.reportActionID;

            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {
                        ...movedToReport,
                        total: (movedToReport?.total ?? 0) - transactionAmount,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[iouAction.reportActionID]: iouAction},
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

            // Add success data for existing report update
            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {pendingFields: {total: null}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[iouAction.reportActionID]: {pendingAction: null}},
                },
            );

            failureData.push(
                // Add failure data to revert existing report total
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {
                        total: movedToReport?.total ?? 0,
                        pendingFields: {total: null},
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
        } else {
            // When no existing open report is found, use the sharedRejectedToReportID
            // so multiple sequential rejections land in the same destination report
            // Fallback to generating a fresh ID if not provided
            rejectedToReportID = rejectedToReportID ?? generateReportID();

            // Pass transaction for formula computation (e.g., {report:startdate})
            const reportTransactions: Record<string, OnyxTypes.Transaction> = {[transaction.transactionID]: transaction};

            const newExpenseReport = buildOptimisticExpenseReport({
                chatReportID: report.chatReportID,
                policyID: report?.policyID,
                payeeAccountID: report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
                total: transactionAmount,
                currency: getCurrency(transaction),
                nonReimbursableTotal: transactionAmount,
                optimisticIOUReportID: rejectedToReportID,
                reportTransactions,
                betas,
            });
            const [, createdActionForExpenseReport, iouAction] = buildOptimisticMoneyRequestEntities({
                iouReport: newExpenseReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment: parsedComment,
                payeeEmail: deprecatedCurrentUserEmail,
                participants: [{accountID: report?.ownerAccountID}],
                transactionID: transaction.transactionID,
                existingTransactionThreadReportID: childReportID,
                shouldGenerateTransactionThreadReport: false,
            });

            reportPreviewAction = buildOptimisticReportPreview(policyExpenseChat, newExpenseReport, undefined, transaction, undefined);
            movedTransactionAction = buildOptimisticMovedTransactionAction(childReportID, newExpenseReport.reportID);
            createdIOUReportActionID = iouAction.reportActionID;
            expenseMovedReportActionID = movedTransactionAction.reportActionID;
            expenseCreatedReportActionID = createdActionForExpenseReport.reportActionID;
            newExpenseReport.parentReportActionID = reportPreviewAction.reportActionID;
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
        }
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    total: (report?.total ?? 0) + transactionAmount,
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
    } else {
        // For reports with single expense
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            },
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...(transactionCommentCleanup ?? {}),
            },
        });

        // Add success data for report state update
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    stateNum: null,
                    statusNum: null,
                },
            },
        });

        // Add failure data to revert report state
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: report?.stateNum,
                statusNum: report?.statusNum,
            },
        });

        if (isUserOnSearchPage || isUserOnSearchMoneyRequestReport) {
            // Navigate to the existing Reports > Expense view
            urlToNavigateBack = undefined;
        } else {
            // Go back to the original expenses report
            urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        }
    }

    // Add optimistic rejected actions to the child report
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: optimisticRejectReportAction,
            [optimisticRejectReportActionComment.reportActionID]: optimisticRejectReportActionComment,
            ...(movedTransactionAction ? {[movedTransactionAction.reportActionID]: movedTransactionAction} : {}),
        },
    });

    // Update hasOutstandingChildRequest on the chat report after all optimistic updates
    if (policyExpenseChat) {
        const excludedReportID = rejectedToReportID ?? reportID;
        const shouldHaveOutstandingChildRequest = hasOutstandingChildRequest(
            policyExpenseChat,
            excludedReportID,
            deprecatedCurrentUserEmail,
            currentUserAccountIDParam,
            allTransactionViolations,
            undefined,
        );

        if (policyExpenseChat.hasOutstandingChildRequest !== shouldHaveOutstandingChildRequest) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                value: {
                    hasOutstandingChildRequest: shouldHaveOutstandingChildRequest,
                },
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                value: {
                    hasOutstandingChildRequest: policyExpenseChat.hasOutstandingChildRequest,
                },
            });
        }
    }

    // Add successData to clear pending actions when the server confirms
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: {
                pendingAction: null,
            },
            [optimisticRejectReportActionComment.reportActionID]: {
                pendingAction: null,
            },
        },
    });

    // Add failureData to remove optimistic actions if the request fails
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: null,
            [optimisticRejectReportActionComment.reportActionID]: null,
        },
    });

    // Collect all reports that need lastReadTime and lastVisibleActionCreated updates
    const reportsToUpdate: Array<{reportID: string; lastVisibleActionCreated: string}> = [];

    // Add rter transaction violation
    if (!isIOU) {
        const currentTransactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`] ?? [];
        const newViolation = {
            name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
            type: CONST.VIOLATION_TYPES.WARNING,
            data: {
                comment: comment ?? '',
                rejectedBy: deprecatedCurrentUserEmail,
                rejectedDate: DateUtils.getDBTime(),
            },
            showInReview: true,
        };

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`,
            value: [...currentTransactionViolations, newViolation],
        });

        // Add failure data to revert transaction violations
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`,
            value: currentTransactionViolations,
        });
    }

    // Child report (where rejected actions are added)
    if (childReportID) {
        reportsToUpdate.push({
            reportID: childReportID,
            lastVisibleActionCreated: optimisticRejectReportActionComment.created,
        });
    }

    // Moved to report (if transaction is moved to another report)
    if (rejectedToReportID && rejectedToReportID !== reportID) {
        reportsToUpdate.push({
            reportID: rejectedToReportID,
            lastVisibleActionCreated: optimisticRejectReportActionComment.created,
        });
    }

    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(optimisticRejectReportAction.created, 1);
    // Add optimistic data for all reports
    for (const {reportID: targetReportID, lastVisibleActionCreated} of reportsToUpdate) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                lastReadTime,
                lastVisibleActionCreated,
            },
        });
    }

    // Add success data for all reports
    for (const {reportID: targetReportID} of reportsToUpdate) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        });
    }

    // Add failure data to revert all reports
    for (const {reportID: targetReportID} of reportsToUpdate) {
        const targetReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`];
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                lastReadTime: targetReport?.lastReadTime,
                lastVisibleActionCreated: targetReport?.lastVisibleActionCreated,
            },
        });
    }

    // Build API parameters
    const parameters: RejectMoneyRequestParams = {
        transactionID,
        reportID,
        comment: parsedComment,
        rejectedToReportID,
        reportPreviewReportActionID: reportPreviewAction?.reportActionID,
        rejectedActionReportActionID: optimisticRejectReportAction.reportActionID,
        rejectedCommentReportActionID: optimisticRejectReportActionComment.reportActionID,
        createdIOUReportActionID,
        expenseMovedReportActionID,
        expenseCreatedReportActionID,
    };

    return {optimisticData, successData, failureData, parameters, urlToNavigateBack: urlToNavigateBack as Route};
}

function rejectMoneyRequest(
    transactionID: string,
    reportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    options?: {sharedRejectedToReportID?: string},
): Route | undefined {
    const data = prepareRejectMoneyRequestData(transactionID, reportID, comment, policy, currentUserAccountIDParam, betas, options);
    if (!data) {
        return;
    }
    const {urlToNavigateBack, optimisticData, successData, failureData, parameters} = data;
    // Make API call
    API.write(WRITE_COMMANDS.REJECT_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});

    return urlToNavigateBack;
}

function markRejectViolationAsResolved(transactionID: string, isOffline: boolean, reportID?: string) {
    if (!reportID) {
        return;
    }

    const allTransactionViolations = getAllTransactionViolations();

    const currentViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const updatedViolations = currentViolations?.filter((violation) => violation.name !== CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
    const optimisticMarkedAsResolvedReportAction = buildOptimisticMarkedAsResolvedReportAction();

    // Build optimistic data
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: updatedViolations ?? null,
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

    const currentReportID = getDisplayedReportID(reportID, isOffline);
    notifyNewAction(currentReportID, undefined, true);
}

function rejectExpenseReport(
    report: OnyxTypes.Report,
    targetAccountID: number,
    comment: string,
    currentUserAccountID: number | undefined,
    currentUserDisplayName: string | undefined,
    currentUserAvatarSource: AvatarSource | undefined,
) {
    const {reportID} = report;
    const isRejectToSubmitter = targetAccountID === report.ownerAccountID;
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectAction = buildOptimisticReportLevelRejectAction(isRejectToSubmitter, currentUserAccountID, currentUserDisplayName, currentUserAvatarSource, baseTimestamp);
    const optimisticCommentAction = buildOptimisticReportLevelRejectCommentAction(
        comment,
        currentUserAccountID,
        currentUserDisplayName,
        currentUserAvatarSource,
        DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1),
    );

    const optimisticStateNum = isRejectToSubmitter ? CONST.REPORT.STATE_NUM.OPEN : CONST.REPORT.STATE_NUM.SUBMITTED;
    const optimisticStatusNum = isRejectToSubmitter ? CONST.REPORT.STATUS_NUM.OPEN : CONST.REPORT.STATUS_NUM.SUBMITTED;

    const optimisticNextStep = isRejectToSubmitter
        ? buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
              isRejectedReport: true,
          })
        : buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
              bypassNextApproverID: targetAccountID,
          });

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
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

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: isRejectToSubmitter
            ? // buildOptimisticNextStep is used in parallel
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              buildNextStepNew({
                  report,
                  predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                  isRejectedReport: true,
              })
            : // buildOptimisticNextStep is used in parallel
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              buildNextStepNew({
                  report,
                  predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                  bypassNextApproverID: targetAccountID,
              }),
    });

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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
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

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
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

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: null,
    });

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

    const parameters: RejectExpenseReportParams = {
        reportID,
        targetAccountID,
        comment,
        rejectedActionReportActionID: optimisticRejectAction.reportActionID,
        rejectedCommentReportActionID: optimisticCommentAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REJECT_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

export {dismissRejectUseExplanation, prepareRejectMoneyRequestData, rejectMoneyRequest, markRejectViolationAsResolved, rejectExpenseReport};
export type {RejectMoneyRequestData};
