import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as API from '@libs/API';
import type {HoldMoneyRequestParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {getIOUActionForReportID} from '@libs/ReportActionsUtils';
import type {Ancestor} from '@libs/ReportUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticHoldReportAction,
    buildOptimisticHoldReportActionComment,
    buildOptimisticUnHoldReportAction,
    buildTransactionThread,
    generateReportID,
    getDisplayedReportID,
    getOptimisticDataForAncestors,
    getReportOrDraftReport,
    isExpenseReport,
} from '@libs/ReportUtils';
import {getAmount} from '@libs/TransactionUtils';
import {notifyNewAction} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction} from '@src/types/onyx';
import {getAllReports, getAllTransactions, getAllTransactionViolations, getCurrentUserEmail, getUserAccountID} from '.';

/**
 * Put expense on HOLD
 */
function putOnHold(transactionID: string, comment: string, initialReportID: string | undefined, ancestors: Ancestor[] = []) {
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
    let transactionThreadReport: Report;

    // If there is no existing transaction thread report, we should create one
    // This way we ensure every held request has a dedicated thread for comments
    if (initialReportID) {
        transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${initialReportID}`] ?? ({} as Report);
    } else {
        const moneyRequestReport = getReportOrDraftReport(transaction?.reportID);
        transactionThreadReport = buildTransactionThread(iouAction, moneyRequestReport, undefined, reportID);
    }

    const optimisticCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail);

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction as ReportAction,
                [createdReportActionComment.reportActionID]: createdReportActionComment as ReportAction,
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

    const currentReportID = getDisplayedReportID(reportID);
    Navigation.setNavigationActionToMicrotaskQueue(() => notifyNewAction(currentReportID, undefined, true));
}

function putTransactionsOnHold(transactionsID: string[], comment: string, reportID: string, ancestors: Ancestor[] = []) {
    for (const transactionID of transactionsID) {
        const {childReportID} = getIOUActionForReportID(reportID, transactionID) ?? {};
        putOnHold(transactionID, comment, childReportID, ancestors);
    }
}

/**
 * Remove expense from HOLD
 */
function unholdRequest(transactionID: string, reportID: string, policy: OnyxEntry<Policy>) {
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
                [createdReportAction.reportActionID]: createdReportAction as ReportAction,
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

    const currentReportID = getDisplayedReportID(reportID);
    notifyNewAction(currentReportID, undefined, true);
}

export {putOnHold, putTransactionsOnHold, unholdRequest};
