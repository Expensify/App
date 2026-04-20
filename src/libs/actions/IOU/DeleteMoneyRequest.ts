import cloneDeep from 'lodash/cloneDeep';
import {InteractionManager} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {DeleteMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import {getLastVisibleAction, getLastVisibleMessage, getOriginalMessage, getReportActionMessage, isDeletedAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getOutstandingChildRequest,
    getPersonalDetailsForAccountID,
    getReportTransactions,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasOutstandingChildRequest,
    isArchivedReport,
    isExpenseReport,
    updateOptimisticParentReportAction,
} from '@libs/ReportUtils';
import {getAmount, getCurrency, isOnHold, removeTransactionFromDuplicateTransactionViolation} from '@libs/TransactionUtils';
import {clearByKey as clearPdfByOnyxKey} from '@userActions/CachedPDFPaths';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {optimisticReportLastData} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import {getAllReportActionsFromIOU, getAllReportNameValuePairs, getAllReports, getAllTransactions, getAllTransactionViolations, getReportPreviewAction} from '.';

type DeleteMoneyRequestFunctionParams = {
    transactionID: string | undefined;
    reportAction: OnyxTypes.ReportAction;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    violations: OnyxCollection<OnyxTypes.TransactionViolations>;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    isChatIOUReportArchived?: boolean | undefined;
    isSingleTransactionView?: boolean;
    transactionIDsPendingDeletion?: string[];
    selectedTransactionIDs?: string[];
    allTransactionViolationsParam: OnyxCollection<OnyxTypes.TransactionViolations>;
    currentUserAccountID: number;
    currentUserEmail: string;
};

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @return the url to navigate back once the money request is deleted
 */
function prepareToCleanUpMoneyRequest(
    transactionID: string,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    shouldRemoveIOUTransactionID = true,
    transactionIDsPendingDeletion?: string[],
    selectedTransactionIDs?: string[],
) {
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();
    const allReportActions = getAllReportActionsFromIOU();

    // STEP 1: Get all collections we're updating
    const iouReportID = iouReport?.reportID;
    const reportPreviewAction = getReportPreviewAction(iouReport?.chatReportID, iouReport?.reportID);
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const isTransactionOnHold = isOnHold(transaction);
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted
    // The current state is that we want to get rid of the [Deleted expense] breadcrumb,
    // so we never want to display it if transactionThreadID is present.
    const shouldDeleteTransactionThread = !!transactionThreadID;

    // STEP 3: Update the IOU reportAction and decide if the iouReport should be deleted. We delete the iouReport if there are no visible comments left in the report.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldDeleteTransactionThread,
                },
            ],
            originalMessage: {
                IOUTransactionID: shouldRemoveIOUTransactionID ? null : transactionID,
            },
            errors: null,
        },
    } as Record<string, NullishDeep<OnyxTypes.ReportAction>>;

    let canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatReportArchived);
    }
    // If we are deleting the last transaction on a report, then delete the report too
    const shouldDeleteIOUReport = getReportTransactions(iouReportID).filter((trans) => !transactionIDsPendingDeletion?.includes(trans.transactionID)).length === 1;

    const iouReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`];
    if (shouldDeleteIOUReport) {
        for (const [reportActionID, reportActionData] of Object.entries(iouReportActions ?? {})) {
            if (
                reportAction.reportActionID === reportActionID ||
                reportActionData.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                reportActionData.actionName === 'CREATED' ||
                !reportActionData.message ||
                isDeletedAction(reportActionData)
            ) {
                continue;
            }

            updatedReportAction[reportActionID] = {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                previousMessage: reportAction.message,
                message: [
                    {
                        type: 'COMMENT',
                        html: '',
                        text: '',
                        isEdited: true,
                    },
                ],
                errors: null,
            };
        }
    }
    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    let updatedIOUReport;
    const currency = getCurrency(transaction);
    const updatedReportPreviewAction: Partial<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> = cloneDeep(reportPreviewAction ?? {});
    updatedReportPreviewAction.pendingAction = shouldDeleteIOUReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    const transactionPendingDelete = transactionIDsPendingDeletion?.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
    const selectedTransactions = selectedTransactionIDs?.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
    const canEditTotal = !selectedTransactions?.some((trans) => getCurrency(trans) !== iouReport?.currency);
    const isExpenseReportType = isExpenseReport(iouReport);
    const amountDiff = getAmount(transaction, isExpenseReportType) + (transactionPendingDelete?.reduce((prev, curr) => prev + getAmount(curr, isExpenseReportType), 0) ?? 0);
    const unheldAmountDiff =
        getAmount(transaction, isExpenseReportType) + (transactionPendingDelete?.reduce((prev, curr) => prev + (!isOnHold(curr) ? getAmount(curr, isExpenseReportType) : 0), 0) ?? 0);

    if (iouReport && isExpenseReportType) {
        updatedIOUReport = {...iouReport};

        if (typeof updatedIOUReport.total === 'number' && currency === iouReport?.currency && canEditTotal) {
            // Because of the Expense reports are stored as negative values, we add the total from the amount
            updatedIOUReport.total += amountDiff;

            if (!transaction?.reimbursable && typeof updatedIOUReport.nonReimbursableTotal === 'number') {
                const nonReimbursableAmountDiff =
                    getAmount(transaction, true) + (transactionPendingDelete?.reduce((prev, curr) => prev + (!curr?.reimbursable ? getAmount(curr, true) : 0), 0) ?? 0);
                updatedIOUReport.nonReimbursableTotal += nonReimbursableAmountDiff;
            }

            if (!isTransactionOnHold) {
                if (typeof updatedIOUReport.unheldTotal === 'number') {
                    updatedIOUReport.unheldTotal += unheldAmountDiff;
                }

                if (!transaction?.reimbursable && typeof updatedIOUReport.unheldNonReimbursableTotal === 'number') {
                    const unheldNonReimbursableAmountDiff =
                        getAmount(transaction, true) +
                        (transactionPendingDelete?.reduce((prev, curr) => prev + (!isOnHold(curr) && !curr?.reimbursable ? getAmount(curr, true) : 0), 0) ?? 0);
                    updatedIOUReport.unheldNonReimbursableTotal += unheldNonReimbursableAmountDiff;
                }
            }
        }
    } else {
        updatedIOUReport =
            iouReport && !canEditTotal
                ? {...iouReport}
                : updateIOUOwnerAndTotal(iouReport, reportAction.actorAccountID ?? CONST.DEFAULT_NUMBER_ID, amountDiff, currency, true, false, isTransactionOnHold, unheldAmountDiff);
    }

    if (updatedIOUReport) {
        const lastVisibleAction = getLastVisibleAction(iouReport?.reportID, canUserPerformWriteAction, updatedReportAction);
        const iouReportLastMessageText = getLastVisibleMessage(iouReport?.reportID, canUserPerformWriteAction, updatedReportAction).lastMessageText;
        updatedIOUReport.lastMessageText = iouReportLastMessageText;
        updatedIOUReport.lastVisibleActionCreated = lastVisibleAction?.created;
    }

    const hasNonReimbursableTransactions = hasNonReimbursableTransactionsReportUtils(iouReport?.reportID);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const messageText = Localize.translateLocal(
        hasNonReimbursableTransactions ? 'iou.payerSpentAmount' : 'iou.payerOwesAmount',
        convertToDisplayString(updatedIOUReport?.total, updatedIOUReport?.currency),
        getPersonalDetailsForAccountID(updatedIOUReport?.managerID ?? CONST.DEFAULT_NUMBER_ID).login ?? '',
    );

    if (getReportActionMessage(updatedReportPreviewAction)) {
        if (Array.isArray(updatedReportPreviewAction?.message)) {
            const message = updatedReportPreviewAction.message.at(0);
            if (message) {
                message.text = messageText;
                message.html = messageText;
                message.deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
            }
        } else if (!Array.isArray(updatedReportPreviewAction.message) && updatedReportPreviewAction.message) {
            updatedReportPreviewAction.message.text = messageText;
            updatedReportPreviewAction.message.deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
        }
    }

    if (updatedReportPreviewAction && reportPreviewAction?.childMoneyRequestCount && reportPreviewAction?.childMoneyRequestCount > 0) {
        updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
    }

    return {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transactionThread,
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReportActions,
    };
}

/**
 * Calculate the URL to navigate to after a money request deletion
 * @param transactionID - The ID of the money request being deleted
 * @param reportAction - The report action associated with the money request
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @returns The URL to navigate to
 */
function getNavigationUrlOnMoneyRequestDelete(
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    isSingleTransactionView = false,
): Route | undefined {
    if (!transactionID) {
        return undefined;
    }

    const {shouldDeleteTransactionThread, shouldDeleteIOUReport} = prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatReportArchived);

    // Determine which report to navigate back to
    if (iouReport && isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        return ROUTES.REPORT_WITH_ID.getRoute(iouReport.reportID);
    }

    if (iouReport?.chatReportID && shouldDeleteIOUReport) {
        return ROUTES.REPORT_WITH_ID.getRoute(iouReport.chatReportID);
    }

    return undefined;
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function cleanUpMoneyRequest(
    transactionID: string,
    reportAction: OnyxTypes.ReportAction,
    reportID: string,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatIOUReportArchived: boolean | undefined,
    originalReportID: string | undefined,
    isSingleTransactionView = false,
) {
    const {shouldDeleteTransactionThread, shouldDeleteIOUReport, updatedReportAction, updatedIOUReport, updatedReportPreviewAction, transactionThreadID, reportPreviewAction} =
        prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, false);

    const urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, isSingleTransactionView);
    // build Onyx data

    // Onyx operations to delete the transaction, update the IOU report action and chat report action
    const reportActionsOnyxUpdates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const onyxUpdates: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT>
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];
    if (shouldDeleteIOUReport) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        });
    } else {
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        });
    }

    if (reportPreviewAction?.reportActionID) {
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    ...updatedReportPreviewAction,
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    // added the operation to delete associated transaction violations
    onyxUpdates.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    // added the operation to delete transaction thread
    if (shouldDeleteTransactionThread) {
        onyxUpdates.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: null,
            },
        );
    }

    if (shouldDeleteIOUReport) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        });
    } else {
        // added operations to update IOU report and chat report
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        });
    }
    onyxUpdates.push(
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: getOutstandingChildRequest(updatedIOUReport),
        },
    );

    if (!shouldDeleteIOUReport && updatedReportPreviewAction.childMoneyRequestCount === 0) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: false,
            },
        });
    }

    if (shouldDeleteIOUReport) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived);
        }

        const lastMessageText = getLastVisibleMessage(
            iouReport?.chatReportID,
            canUserPerformWriteAction,
            reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {},
        )?.lastMessageText;
        const lastVisibleActionCreated = getLastVisibleAction(
            iouReport?.chatReportID,
            canUserPerformWriteAction,
            reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {},
        )?.created;

        onyxUpdates.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
                value: {
                    hasOutstandingChildRequest: false,
                    iouReportID: null,
                    lastMessageText,
                    lastVisibleActionCreated,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: null,
            },
        );
    }

    if (!shouldDeleteIOUReport) {
        clearAllRelatedReportActionErrors(reportID, reportAction, originalReportID);
    }

    // First, update the reportActions to ensure related actions are not displayed.
    Onyx.update(reportActionsOnyxUpdates).then(() => {
        Navigation.goBack(urlToNavigateBack);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (shouldDeleteIOUReport) {
                clearAllRelatedReportActionErrors(reportID, reportAction, originalReportID);
            }
            // After navigation, update the remaining data.
            Onyx.update(onyxUpdates);
        });
    });
}

/**
 * @param transactionThreadID - The transaction thread reportID of the transaction
 * @param shouldDeleteTransactionThread - Flag indicating whether the transactionThread should be optimistically deleted
 * @param reportAction - The IOU action of the transaction
 * @return Returns Onyx data including information about deleting the transactionThread and updating the child comment count for the preview report action
 */
function getCleanUpTransactionThreadReportOnyxData({
    transactionThreadID,
    shouldDeleteTransactionThread,
    reportAction,
    isChatIOUReportArchived,
    updatedReportPreviewAction,
    shouldAddUpdatedReportPreviewActionToOnyxData = true,
    currentUserAccountID,
}: {
    transactionThreadID?: string;
    shouldDeleteTransactionThread: boolean;
    reportAction?: ReportAction;
    isChatIOUReportArchived?: boolean;
    updatedReportPreviewAction?: ReportAction;
    shouldAddUpdatedReportPreviewActionToOnyxData?: boolean;
    currentUserAccountID: number;
}) {
    const allReports = getAllReports();
    const allReportActions = getAllReportActionsFromIOU();
    const allReportNameValuePairs = getAllReportNameValuePairs();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];

    if (shouldDeleteTransactionThread) {
        let transactionThread = null;
        let transactionThreadReportActions = null;
        if (transactionThreadID) {
            transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
            transactionThreadReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`] ?? null;
        }

        optimisticData.push(
            // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
            // The remaining parts of the report object will be removed after the API call is successful.
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: {
                    reportID: null,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    participants: {
                        [currentUserAccountID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: null,
            },
        );
        if (transactionThread) {
            successData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: null,
            });
        }
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: transactionThread ?? null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: transactionThreadReportActions,
            },
        );
    }

    // Update the child comment visible count for reportPreviewAction.
    const iouReportID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUReportID : undefined;
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
    const originalReportPreviewAction = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID) ?? undefined;
    let reportPreviewAction = updatedReportPreviewAction ?? originalReportPreviewAction;
    if (
        originalReportPreviewAction?.reportActionID &&
        reportPreviewAction?.reportActionID &&
        reportPreviewAction?.childVisibleActionCount &&
        reportPreviewAction?.childVisibleActionCount > 0 &&
        reportAction?.childVisibleActionCount &&
        reportAction?.childVisibleActionCount > 0
    ) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport?.reportID}`];
            const isArchivedExpenseReport = isArchivedReport(reportNameValuePairs);

            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived ?? isArchivedExpenseReport);
        }
        const lastVisibleAction = getLastVisibleAction(iouReportID, canUserPerformWriteAction);

        const {childVisibleActionCount, childCommenterCount, childLastVisibleActionCreated, childOldestFourAccountIDs} = updateOptimisticParentReportAction(
            reportPreviewAction,
            lastVisibleAction?.childLastVisibleActionCreated ?? lastVisibleAction?.created ?? '',
            CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            reportAction.childVisibleActionCount,
        );

        if (shouldAddUpdatedReportPreviewActionToOnyxData) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [reportPreviewAction.reportActionID]: {
                        childVisibleActionCount,
                        childCommenterCount,
                        childLastVisibleActionCreated,
                        childOldestFourAccountIDs,
                    },
                },
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [reportPreviewAction.reportActionID]: {
                        childVisibleActionCount: originalReportPreviewAction.childVisibleActionCount,
                        childCommenterCount: originalReportPreviewAction.childCommenterCount,
                        childLastVisibleActionCreated: originalReportPreviewAction.childLastVisibleActionCreated,
                        childOldestFourAccountIDs: originalReportPreviewAction.childOldestFourAccountIDs,
                    },
                },
            });
        }

        reportPreviewAction = {
            reportActionID: originalReportPreviewAction.reportActionID,
            childVisibleActionCount,
            childCommenterCount,
            childLastVisibleActionCreated,
            childOldestFourAccountIDs,
        } as ReportAction;
    }

    return {
        optimisticData,
        successData,
        failureData,
        updatedReportPreviewAction: reportPreviewAction,
    };
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function deleteMoneyRequest({
    transactionID,
    reportAction,
    transactions,
    violations,
    iouReport,
    chatReport,
    isChatIOUReportArchived,
    isSingleTransactionView = false,
    transactionIDsPendingDeletion,
    selectedTransactionIDs,
    allTransactionViolationsParam,
    currentUserAccountID,
    currentUserEmail,
}: DeleteMoneyRequestFunctionParams) {
    if (!transactionID) {
        return;
    }

    // STEP 1: Calculate and prepare the data
    const {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReportActions,
    } = prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, false, transactionIDsPendingDeletion, selectedTransactionIDs);

    const urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, isSingleTransactionView);

    // STEP 2: Build Onyx data
    // The logic mostly resembles the cleanUpMoneyRequest function
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {...transaction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {...transaction, pendingAction: null},
        },
    ];

    removeTransactionFromDuplicateTransactionViolation({optimisticData, failureData}, transactionID, transactions, violations);

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        },
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: getOutstandingChildRequest(updatedIOUReport),
        },
    );

    if (reportPreviewAction?.reportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {[reportPreviewAction.reportActionID]: updatedReportPreviewAction},
        });
    }

    if (chatReport && updatedIOUReport && !shouldDeleteIOUReport && updatedReportPreviewAction?.childMoneyRequestCount === 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, updatedIOUReport, currentUserEmail, currentUserAccountID, allTransactionViolationsParam, undefined),
            },
        });
    }

    if (shouldDeleteIOUReport) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived);
        }

        const optimisticReportActions = reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {};
        const optimisticLastReportData = optimisticReportLastData(iouReport?.chatReportID ?? String(CONST.DEFAULT_NUMBER_ID), optimisticReportActions, canUserPerformWriteAction);

        if (chatReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
                value: {
                    hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, currentUserEmail, currentUserAccountID, allTransactionViolationsParam, undefined),
                    iouReportID: null,
                    ...optimisticLastReportData,
                },
            });
        }
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                reportID: null,
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        });
    }

    const cleanUpTransactionThreadReportOnyxData = getCleanUpTransactionThreadReportOnyxData({
        shouldDeleteTransactionThread,
        transactionThreadID,
        reportAction,
        isChatIOUReportArchived,
        currentUserAccountID,
    });
    optimisticData.push(...cleanUpTransactionThreadReportOnyxData.optimisticData);

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        shouldDeleteIOUReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                  value: null,
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                  value: {
                      [reportAction.reportActionID]: {
                          pendingAction: null,
                      },
                  },
              },
    ];

    if (reportPreviewAction?.reportActionID) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    successData.push(...cleanUpTransactionThreadReportOnyxData.successData);

    if (shouldDeleteIOUReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: null,
        });
    }

    successData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: null,
    });

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: transactionViolations ?? null,
    });

    failureData.push(...cleanUpTransactionThreadReportOnyxData.failureData);

    const errorKey = DateUtils.getMicroseconds();

    const originalReportActionsUpdate = {} as Record<string, Partial<OnyxTypes.ReportAction>>;
    if (shouldDeleteIOUReport) {
        for (const action of Object.values(iouReportActions ?? {})) {
            if (action.reportActionID === reportAction.reportActionID) {
                continue;
            }
            originalReportActionsUpdate[action.reportActionID] = {
                pendingAction: action.pendingAction ?? null,
                message: action.message,
            };
        }
    }
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                ...originalReportActionsUpdate,
                [reportAction.reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage', errorKey),
                },
            },
        },
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        shouldDeleteIOUReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                  value: iouReport,
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                  value: iouReport,
              },
    );

    if (reportPreviewAction?.reportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    ...reportPreviewAction,
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage', errorKey),
                },
            },
        });
    }

    if (chatReport && shouldDeleteIOUReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: chatReport,
        });
    }

    if (!shouldDeleteIOUReport && updatedReportPreviewAction?.childMoneyRequestCount === 0) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: true,
            },
        });
    }

    const parameters: DeleteMoneyRequestParams = {
        transactionID,
        reportActionID: reportAction.reportActionID,
    };

    // STEP 3: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    clearPdfByOnyxKey(transactionID);

    return urlToNavigateBack;
}

export {cleanUpMoneyRequest, deleteMoneyRequest, getNavigationUrlOnMoneyRequestDelete, getCleanUpTransactionThreadReportOnyxData};
