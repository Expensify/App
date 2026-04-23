import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {HoldMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {getAllReportActions, getIOUActionForReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticCreatedReportForUnapprovedAction,
    buildOptimisticExpenseReport,
    buildOptimisticHoldReportAction,
    buildOptimisticHoldReportActionComment,
    buildOptimisticIOUReport,
    buildOptimisticReportPreview,
    buildOptimisticUnHoldReportAction,
    buildTransactionThread,
    generateReportID,
    getDisplayedReportID,
    getOptimisticDataForAncestors,
    getReportOrDraftReport,
    isExpenseReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isProcessingReport,
} from '@libs/ReportUtils';
import {getAmount} from '@libs/TransactionUtils';
import {notifyNewAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllReports, getAllTransactions, getAllTransactionViolations, getCurrentUserEmail, getUserAccountID} from '.';

/**
 * Put expense on HOLD
 */
function putOnHold(transactionID: string, comment: string, initialReportID: string | undefined, isOffline: boolean, ancestors: Ancestor[] = []) {
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();
    const userAccountID = getUserAccountID();
    const currentUserEmail = getCurrentUserEmail();

    const currentTime = DateUtils.getDBTime();
    const reportID = initialReportID ?? generateReportID();
    const createdReportAction = buildOptimisticHoldReportAction(currentTime);
    const createdReportActionComment = buildOptimisticHoldReportActionComment(comment, DateUtils.addMillisecondsFromDateTime(currentTime, 1));
    const newViolation = {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION, showInReview: true};
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
    const updatedViolations = [...transactionViolations, newViolation];
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const iouAction = getIOUActionForReportID(transaction?.reportID, transactionID);
    let transactionThreadReport: OnyxTypes.Report;

    // If there is no existing transaction thread report, we should create one
    // This way we ensure every held request has a dedicated thread for comments
    if (initialReportID) {
        transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${initialReportID}`] ?? ({} as OnyxTypes.Report);
    } else {
        const moneyRequestReport = getReportOrDraftReport(transaction?.reportID);
        transactionThreadReport = buildTransactionThread(iouAction, moneyRequestReport, undefined, reportID);
    }

    const optimisticCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail);

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction as OnyxTypes.ReportAction,
                [createdReportActionComment.reportActionID]: createdReportActionComment as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: createdReportAction.reportActionID,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: updatedViolations,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastVisibleActionCreated: createdReportActionComment.created,
            },
        },
    ];

    if (iouReport && iouReport.currency === transaction?.currency) {
        const isExpenseReportLocal = isExpenseReport(iouReport);
        const coefficient = isExpenseReportLocal ? -1 : 1;
        const transactionAmount = getAmount(transaction, isExpenseReportLocal) * coefficient;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                unheldTotal: (iouReport.unheldTotal ?? 0) - transactionAmount,
                unheldNonReimbursableTotal: !transaction?.reimbursable ? (iouReport.unheldNonReimbursableTotal ?? 0) - transactionAmount : iouReport.unheldNonReimbursableTotal,
            },
        });
    }

    optimisticData.push(...getOptimisticDataForAncestors(ancestors, createdReportActionComment.created, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD));

    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
            },
        },
    ];

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericHoldExpenseFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: null,
                [createdReportActionComment.reportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastVisibleActionCreated: transactionThreadReport.lastVisibleActionCreated,
            },
        },
    ];

    // If the transaction thread report wasn't created before, we create it optimistically
    if (!initialReportID) {
        transactionThreadReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: transactionThreadReport,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            },
        );

        if (iouAction?.reportActionID) {
            // We link the IOU action to the new transaction thread by setting childReportID optimistically
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: reportID, childType: CONST.REPORT.TYPE.CHAT}},
            });
            // We reset the childReportID if the request fails
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: null, childType: null}},
            });
        }

        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                value: null,
            },
        );
    }

    if (iouReport) {
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const optimisticNextStepDeprecated = buildNextStepNew({
            report: iouReport,
            predictedNextStatus: iouReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: true,
            currentUserAccountIDParam: userAccountID,
            currentUserEmailParam: currentUserEmail,
        });
        const optimisticNextStep = buildOptimisticNextStep({
            report: iouReport,
            predictedNextStatus: iouReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: true,
            currentUserAccountIDParam: userAccountID,
            currentUserEmailParam: currentUserEmail,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: optimisticNextStepDeprecated,
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: null,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                nextStep: iouReport.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    const params: HoldMoneyRequestParams = {
        transactionID,
        comment,
        reportActionID: createdReportAction.reportActionID,
        commentReportActionID: createdReportActionComment.reportActionID,
    };

    if (!initialReportID) {
        params.transactionThreadReportID = reportID;
        params.createdReportActionIDForThread = optimisticCreatedAction.reportActionID;
    }

    API.write(WRITE_COMMANDS.HOLD_MONEY_REQUEST, params, {optimisticData, successData, failureData});

    const currentReportID = getDisplayedReportID(reportID, isOffline);
    Navigation.setNavigationActionToMicrotaskQueue(() => notifyNewAction(currentReportID, undefined, true));
}

function putTransactionsOnHold(transactionsID: string[], comment: string, reportID: string, isOffline: boolean, ancestors: Ancestor[] = []) {
    for (const transactionID of transactionsID) {
        const {childReportID} = getIOUActionForReportID(reportID, transactionID) ?? {};
        putOnHold(transactionID, comment, childReportID, isOffline, ancestors);
    }
}

/**
 * Remove expense from HOLD
 */
function unholdRequest(transactionID: string, reportID: string, policy: OnyxEntry<OnyxTypes.Policy>, isOffline: boolean) {
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();
    const userAccountID = getUserAccountID();
    const currentUserEmail = getCurrentUserEmail();

    const createdReportAction = buildOptimisticUnHoldReportAction();
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const updatedTransactionViolations = transactionViolations?.filter((violation) => violation.name !== CONST.VIOLATIONS.HOLD) ?? [];
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                comment: {
                    hold: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: updatedTransactionViolations,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastVisibleActionCreated: createdReportAction.created,
            },
        },
    ];

    if (iouReport && iouReport.currency === transaction?.currency) {
        const isExpenseReportLocal = isExpenseReport(iouReport);
        const coefficient = isExpenseReportLocal ? -1 : 1;
        const transactionAmount = getAmount(transaction, isExpenseReportLocal) * coefficient;
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                unheldTotal: (iouReport.unheldTotal ?? 0) + transactionAmount,
                unheldNonReimbursableTotal: !transaction?.reimbursable ? (iouReport.unheldNonReimbursableTotal ?? 0) + transactionAmount : iouReport.unheldNonReimbursableTotal,
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
            },
        },
    ];

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericUnholdExpenseFailureMessage'),
                comment: {
                    hold: transaction?.comment?.hold,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: transactionViolations ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                lastVisibleActionCreated: report?.lastVisibleActionCreated,
            },
        },
    ];

    if (iouReport) {
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const optimisticNextStepDeprecated = buildNextStepNew({
            report: iouReport,
            policy,
            predictedNextStatus: iouReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: updatedTransactionViolations.length > 0,
            currentUserAccountIDParam: userAccountID,
            currentUserEmailParam: currentUserEmail,
        });
        const optimisticNextStep = buildOptimisticNextStep({
            report: iouReport,
            policy,
            predictedNextStatus: iouReport.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
            shouldFixViolations: updatedTransactionViolations.length > 0,
            currentUserAccountIDParam: userAccountID,
            currentUserEmailParam: currentUserEmail,
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: optimisticNextStepDeprecated,
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: null,
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                nextStep: iouReport.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    API.write(
        WRITE_COMMANDS.UNHOLD_MONEY_REQUEST,
        {
            transactionID,
            reportActionID: createdReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );

    const currentReportID = getDisplayedReportID(reportID, isOffline);
    notifyNewAction(currentReportID, undefined, true);
}

type OptimisticHoldReportExpenseActionID = {
    optimisticReportActionID: string;
    oldReportActionID: string;
};

function getHoldReportActionsAndTransactions(reportID: string | undefined) {
    const allTransactions = getAllTransactions();
    const iouReportActions = getAllReportActions(reportID);
    const holdReportActions: Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = [];
    const holdTransactions: OnyxTypes.Transaction[] = [];

    for (const action of Object.values(iouReportActions)) {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

        if (transaction?.comment?.hold) {
            holdReportActions.push(action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>);
            holdTransactions.push(transaction);
        }
    }

    return {holdReportActions, holdTransactions};
}

type OptimisticReportActionCopyIDs = Record<string, string>;

/**
 * Gets duplicate workflow actions for a partial expense report.
 * Used when splitting held expenses into a new partial report to maintain action history.
 *
 * @param sourceReportID - The ID of the original report to copy actions from
 * @param targetReportID - The ID of the new partial expense report to copy actions to
 * @returns A tuple of [optimisticData, successData, failureData, duplicatedReportActionIDs]
 */
function getDuplicateActionsForPartialReport(
    sourceReportID: string | undefined,
    targetReportID: string | undefined,
): [
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    OptimisticReportActionCopyIDs,
] {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const optimisticReportActionCopyIDs: OptimisticReportActionCopyIDs = {};

    if (!sourceReportID || !targetReportID) {
        return [optimisticData, successData, failureData, optimisticReportActionCopyIDs];
    }

    const sourceReportActions = getAllReportActions(sourceReportID);

    // Match the backend's WORKFLOW_ACTIONS list
    const workflowActionTypes = [
        CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
        CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
        CONST.REPORT.ACTIONS.TYPE.APPROVED,
        CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
        CONST.REPORT.ACTIONS.TYPE.REJECTED,
        CONST.REPORT.ACTIONS.TYPE.REJECTED_TO_SUBMITTER,
        CONST.REPORT.ACTIONS.TYPE.RETRACTED,
        CONST.REPORT.ACTIONS.TYPE.CLOSED,
        CONST.REPORT.ACTIONS.TYPE.REOPENED,
        CONST.REPORT.ACTIONS.TYPE.FORWARDED,
        CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
        CONST.REPORT.ACTIONS.TYPE.REROUTE,
    ] as const;

    const copiedActions: Record<string, OnyxTypes.ReportAction> = {};
    const copiedActionsSuccess: OnyxCollection<NullishDeep<OnyxTypes.ReportAction>> = {};
    const copiedActionsFailure: Record<string, null> = {};

    for (const action of Object.values(sourceReportActions)) {
        if (action && (workflowActionTypes as readonly string[]).includes(action.actionName)) {
            const newActionID = NumberUtils.rand64();
            copiedActions[newActionID] = {
                ...action,
                reportActionID: newActionID,
                reportID: targetReportID,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };
            copiedActionsSuccess[newActionID] = {
                pendingAction: null,
            };
            copiedActionsFailure[newActionID] = null;
            optimisticReportActionCopyIDs[action.reportActionID] = newActionID;
        }
    }

    if (Object.keys(copiedActions).length > 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActions,
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActionsSuccess,
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActionsFailure,
        });
    }

    return [optimisticData, successData, failureData, optimisticReportActionCopyIDs];
}

function getReportFromHoldRequestsOnyxData({
    chatReport,
    iouReport,
    recipient,
    policy,
    createdTimestamp,
    betas,
    isApprovalFlow = false,
}: {
    chatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    recipient: Participant;
    policy: OnyxEntry<OnyxTypes.Policy>;
    createdTimestamp?: string;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isApprovalFlow?: boolean;
}): {
    optimisticHoldReportID: string;
    optimisticHoldActionID: string;
    optimisticCreatedReportForUnapprovedTransactionsActionID: string | undefined;
    optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[];
    optimisticReportActionCopyIDs: OptimisticReportActionCopyIDs;
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>>;
    successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>>;
} {
    const {holdReportActions, holdTransactions} = getHoldReportActionsAndTransactions(iouReport?.reportID);
    const firstHoldTransaction = holdTransactions.at(0);
    const newParentReportActionID = NumberUtils.rand64();

    const coefficient = isExpenseReport(iouReport) ? -1 : 1;
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(chatReport);
    const holdAmount = ((iouReport?.total ?? 0) - (iouReport?.unheldTotal ?? 0)) * coefficient;
    const holdNonReimbursableAmount = ((iouReport?.nonReimbursableTotal ?? 0) - (iouReport?.unheldNonReimbursableTotal ?? 0)) * coefficient;

    // Pass held transactions for formula computation (e.g., {report:startdate})
    const reportTransactions: Record<string, OnyxTypes.Transaction> = {};
    for (const holdTransaction of holdTransactions) {
        if (holdTransaction?.transactionID) {
            reportTransactions[holdTransaction.transactionID] = holdTransaction;
        }
    }

    const optimisticExpenseReport = isPolicyExpenseChat
        ? buildOptimisticExpenseReport({
              chatReportID: chatReport.reportID,
              policyID: chatReport.policyID ?? iouReport?.policyID,
              payeeAccountID: recipient.accountID ?? 1,
              total: holdAmount,
              currency: iouReport?.currency ?? '',
              nonReimbursableTotal: holdNonReimbursableAmount,
              parentReportActionID: newParentReportActionID,
              betas,
              reportTransactions,
              createdTimestamp,
          })
        : buildOptimisticIOUReport(
              iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
              iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID,
              holdAmount,
              chatReport.reportID,
              iouReport?.currency ?? '',
              false,
              newParentReportActionID,
              undefined,
              createdTimestamp,
          );

    const optimisticExpenseReportPreview = buildOptimisticReportPreview(
        chatReport,
        optimisticExpenseReport,
        '',
        firstHoldTransaction,
        optimisticExpenseReport.reportID,
        newParentReportActionID,
    );

    let optimisticCreatedReportForUnapprovedAction: OnyxTypes.ReportAction | null = null;
    if (isApprovalFlow) {
        optimisticCreatedReportForUnapprovedAction = buildOptimisticCreatedReportForUnapprovedAction(optimisticExpenseReport.reportID, iouReport?.reportID);
    }

    const updateHeldReports: Record<string, Pick<OnyxTypes.Report, 'parentReportActionID' | 'parentReportID' | 'chatReportID'>> = {};
    const addHoldReportActions: OnyxTypes.ReportActions = {};
    const addHoldReportActionsSuccess: OnyxCollection<NullishDeep<OnyxTypes.ReportAction>> = {};
    const deleteHoldReportActions: Record<string, Pick<OnyxTypes.ReportAction, 'message'>> = {};
    const optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[] = [];

    for (const holdReportAction of holdReportActions) {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const originalMessage = getOriginalMessage(holdReportAction) as OnyxTypes.OriginalMessageIOU;

        deleteHoldReportActions[holdReportAction.reportActionID] = {
            message: [
                {
                    deleted: DateUtils.getDBTime(),
                    type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                    text: '',
                },
            ],
        };

        const reportActionID = NumberUtils.rand64();
        addHoldReportActions[reportActionID] = {
            ...holdReportAction,
            reportActionID,
            originalMessage: {
                ...originalMessage,
                IOUReportID: optimisticExpenseReport.reportID,
            },
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        addHoldReportActionsSuccess[reportActionID] = {
            pendingAction: null,
        };

        optimisticHoldReportExpenseActionIDs.push({optimisticReportActionID: reportActionID, oldReportActionID: holdReportAction.reportActionID});

        const heldReport = getReportOrDraftReport(holdReportAction.childReportID);
        if (heldReport) {
            updateHeldReports[`${ONYXKEYS.COLLECTION.REPORT}${heldReport.reportID}`] = {
                parentReportActionID: reportActionID,
                parentReportID: optimisticExpenseReport.reportID,
                chatReportID: optimisticExpenseReport.reportID,
            };
        }
    }

    const updateHeldTransactions: Record<string, Pick<OnyxTypes.Transaction, 'reportID'>> = {};
    for (const transaction of holdTransactions) {
        updateHeldTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            reportID: optimisticExpenseReport.reportID,
        };
    }

    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: optimisticExpenseReport.reportID,
                lastVisibleActionCreated: optimisticExpenseReportPreview.created,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: {
                ...optimisticExpenseReport,
                unheldTotal: 0,
                unheldNonReimbursableTotal: 0,
                ...(isProcessingReport(iouReport) && isApprovalEnabled
                    ? {
                          stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                          statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: optimisticExpenseReportPreview,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: deleteHoldReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: addHoldReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.REPORT}`,
            value: updateHeldReports,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: updateHeldTransactions,
        },
    ];

    const bringReportActionsBack: Record<string, OnyxTypes.ReportAction> = {};
    for (const reportAction of holdReportActions) {
        bringReportActionsBack[reportAction.reportActionID] = reportAction;
    }

    const bringHeldTransactionsBack: Record<string, OnyxTypes.Transaction> = {};
    for (const transaction of holdTransactions) {
        bringHeldTransactionsBack[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: addHoldReportActionsSuccess,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: chatReport.iouReportID,
                lastVisibleActionCreated: chatReport.lastVisibleActionCreated,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: bringReportActionsBack,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: bringHeldTransactionsBack,
        },
    ];

    // Copy submission/approval actions to the new report
    const [copiedActionsOptimistic, copiedActionsSuccess, copiedActionsFailure, optimisticReportActionCopyIDs] = getDuplicateActionsForPartialReport(
        iouReport?.reportID,
        optimisticExpenseReport.reportID,
    );
    // Only copy the report action for approval flow
    if (isApprovalFlow && !isEmptyObject(optimisticReportActionCopyIDs)) {
        optimisticData.push(...copiedActionsOptimistic);
        successData.push(...copiedActionsSuccess);
        failureData.push(...copiedActionsFailure);
    }
    // add optimistic system message explaining the created report for unapproved transactions
    if (isApprovalFlow && optimisticCreatedReportForUnapprovedAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: optimisticCreatedReportForUnapprovedAction,
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: {
                    pendingAction: null,
                    isOptimisticAction: null,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: null,
            },
        });
    }

    return {
        optimisticData,
        optimisticHoldActionID: optimisticExpenseReportPreview.reportActionID,
        optimisticCreatedReportForUnapprovedTransactionsActionID: optimisticCreatedReportForUnapprovedAction?.reportActionID,
        failureData,
        successData,
        optimisticHoldReportID: optimisticExpenseReport.reportID,
        optimisticHoldReportExpenseActionIDs,
        optimisticReportActionCopyIDs,
    };
}

export {getReportFromHoldRequestsOnyxData, putOnHold, putTransactionsOnHold, unholdRequest};
