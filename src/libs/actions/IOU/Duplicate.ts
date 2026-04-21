import {format} from 'date-fns';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep} from 'type-fest';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import * as API from '@libs/API';
import type {MergeDuplicatesParams, ResolveDuplicatesParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getExistingTransactionID} from '@libs/IOUUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {getIOUActionForReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticDismissedViolationReportAction,
    buildOptimisticHoldReportAction,
    buildOptimisticResolvedDuplicatesReportAction,
    buildTransactionThread,
    generateReportID,
    getTransactionDetails,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {
    getRequestType,
    getTransactionType,
    hasCustomUnitOutOfPolicyViolation,
    isDistanceRequest,
    isExpenseSplit,
    isFromCreditCardImport,
    isOdometerDistanceRequest,
    isPartialTransaction,
    isPerDiemRequest,
    isScanning,
} from '@libs/TransactionUtils';
import {createNewReport} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {WaypointCollection} from '@src/types/onyx/Transaction';
import type {CreateDistanceRequestInformation, RequestMoneyInformation} from '.';
import {
    createDistanceRequest,
    getAllReportActionsFromIOU,
    getAllReports,
    getAllTransactions,
    getAllTransactionViolations,
    getCurrentUserEmail,
    getMoneyRequestParticipantsFromReport,
    getUserAccountID,
} from '.';
import {getCleanUpTransactionThreadReportOnyxData} from './DeleteMoneyRequest';
import type {PerDiemExpenseInformation} from './PerDiem';
import {submitPerDiemExpense} from './PerDiem';
import type {CreateTrackExpenseParams} from './TrackExpense';
import {requestMoney, trackExpense} from './TrackExpense';

function getIOUActionForTransactions(transactionIDList: Array<string | undefined>, iouReportID: string | undefined): Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> {
    const allReportActions = getAllReportActionsFromIOU();
    return Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`] ?? {})?.filter(
        (reportAction): reportAction is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
            if (!isMoneyRequestAction(reportAction)) {
                return false;
            }
            const message = getOriginalMessage(reportAction);
            if (!message?.IOUTransactionID) {
                return false;
            }
            return transactionIDList.includes(message.IOUTransactionID);
        },
    );
}

/** Merge several transactions into one by updating the fields of the one we want to keep and deleting the rest */
function mergeDuplicates({transactionThreadReportID: optimisticTransactionThreadReportID, ...params}: MergeDuplicatesParams) {
    const allParams: MergeDuplicatesParams = {...params};
    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();
    const allReports = getAllReports();
    const currentUserEmail = getCurrentUserEmail();
    const currentUserAccountID = getUserAccountID();

    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        value: {
            ...originalSelectedTransaction,
            billable: params.billable,
            comment: {
                comment: params.comment,
            },
            category: params.category,
            created: params.created,
            currency: params.currency,
            modifiedMerchant: params.merchant,
            reimbursable: params.reimbursable,
            tag: params.tag,
        },
    };

    const failureTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };

    const optimisticTransactionDuplicatesData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        value: null,
    }));

    const failureTransactionDuplicatesData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] as OnyxTypes.Transaction,
    }));

    const optimisticTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const duplicateTransactionTotals = params.transactionIDList.reduce((total, id) => {
        const duplicateTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (!duplicateTransaction) {
            return total;
        }
        return total + duplicateTransaction.amount;
    }, 0);

    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`];
    const expenseReportOptimisticData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: (expenseReport?.total ?? 0) - duplicateTransactionTotals,
        },
    };
    const expenseReportFailureData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: expenseReport?.total,
        },
    };

    const iouActionsToDelete = params.reportID ? getIOUActionForTransactions(params.transactionIDList, params.reportID) : [];

    const deletedTime = DateUtils.getDBTime();
    const expenseReportActionsOptimisticData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, PartialDeep<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>((val, reportAction) => {
            const firstMessage = Array.isArray(reportAction.message) ? reportAction.message.at(0) : null;
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: deletedTime,
                },
                ...(firstMessage && {
                    message: [
                        {
                            ...firstMessage,
                            deleted: deletedTime,
                        },
                        ...(Array.isArray(reportAction.message) ? reportAction.message.slice(1) : []),
                    ],
                }),
                ...(!Array.isArray(reportAction.message) && {
                    message: {
                        deleted: deletedTime,
                    },
                }),
            };
            return val;
        }, {}),
    };
    const expenseReportActionsFailureData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, NullishDeep<PartialDeep<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>>((val, reportAction) => {
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: null,
                },
                message: reportAction.message,
            };
            return val;
        }, {}),
    };

    const cleanUpTransactionThreadReportsOptimisticData = [];
    const cleanUpTransactionThreadReportsSuccessData = [];
    const cleanUpTransactionThreadReportsFailureData = [];
    let updatedReportPreviewAction;
    for (const [index, iouAction] of Object.entries(iouActionsToDelete)) {
        const transactionThreadID = iouAction.childReportID;
        const shouldDeleteTransactionThread = !!transactionThreadID;
        const cleanUpTransactionThreadReportOnyxDataForIouAction = getCleanUpTransactionThreadReportOnyxData({
            transactionThreadID,
            shouldDeleteTransactionThread,
            reportAction: iouAction,
            updatedReportPreviewAction,
            shouldAddUpdatedReportPreviewActionToOnyxData: Number(index) === iouActionsToDelete.length - 1,
            currentUserAccountID,
        });
        cleanUpTransactionThreadReportsOptimisticData.push(...cleanUpTransactionThreadReportOnyxDataForIouAction.optimisticData);
        cleanUpTransactionThreadReportsSuccessData.push(...cleanUpTransactionThreadReportOnyxDataForIouAction.successData);
        cleanUpTransactionThreadReportsFailureData.push(...cleanUpTransactionThreadReportOnyxDataForIouAction.failureData);
        updatedReportPreviewAction = cleanUpTransactionThreadReportOnyxDataForIouAction.updatedReportPreviewAction;
    }
    const optimisticReportAction = buildOptimisticResolvedDuplicatesReportAction();

    const transactionThreadReportID =
        optimisticTransactionThreadReportID ?? (params.reportID ? getIOUActionForTransactions([params.transactionID], params.reportID).at(0)?.childReportID : undefined);
    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    const failureReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: null,
        },
    };

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];

    optimisticData.push(
        optimisticTransactionData,
        ...optimisticTransactionDuplicatesData,
        ...optimisticTransactionViolations,
        expenseReportOptimisticData,
        expenseReportActionsOptimisticData,
        optimisticReportActionData,
        ...cleanUpTransactionThreadReportsOptimisticData,
    );
    successData.push(...cleanUpTransactionThreadReportsSuccessData);
    failureData.push(
        failureTransactionData,
        ...failureTransactionDuplicatesData,
        ...failureTransactionViolations,
        expenseReportFailureData,
        expenseReportActionsFailureData,
        failureReportActionData,
        ...cleanUpTransactionThreadReportsFailureData,
    );

    if (optimisticTransactionThreadReportID) {
        const iouAction = getIOUActionForReportID(params.reportID, params.transactionID);
        const optimisticCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail);
        const optimisticTransactionThreadReport = buildTransactionThread(iouAction, expenseReport, undefined, optimisticTransactionThreadReportID);

        allParams.transactionThreadReportID = optimisticTransactionThreadReportID;
        allParams.createdReportActionIDForThread = optimisticCreatedAction?.reportActionID;
        optimisticTransactionThreadReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`,
                value: optimisticTransactionThreadReport,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
                value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
            },
        );

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThreadReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
                value: null,
            },
        );

        if (iouAction?.reportActionID) {
            // Context: Right now updates provided in one Onyx.update can reach component in different renders.
            // This is because `Onyx.merge` is batched and `Onyx.set` is not, so it may not be necessary after https://github.com/Expensify/App/issues/71207 is resolved.
            // Setting up the transactions null values (removing of the transactions) happens faster than setting of optimistic childReportID,
            // though both updates come from one optimistic data.
            // To escape unexpected effects we setting the childReportID using Onyx.merge, making sure it will be in place when transactions are cleared out.
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`, {
                [iouAction?.reportActionID]: {childReportID: optimisticTransactionThreadReportID, childType: CONST.REPORT.TYPE.CHAT},
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: optimisticTransactionThreadReportID, childType: CONST.REPORT.TYPE.CHAT}},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReport?.parentReportID}`,
                value: {[iouAction?.reportActionID]: {childReportID: null, childType: null}},
            });
        }

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThreadReportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        });
    }

    API.write(WRITE_COMMANDS.MERGE_DUPLICATES, {...allParams, reportActionID: optimisticReportAction.reportActionID}, {optimisticData, failureData, successData});
}

/** Instead of merging the duplicates, it updates the transaction we want to keep and puts the others on hold without deleting them */
function resolveDuplicates(params: MergeDuplicatesParams) {
    if (!params.transactionID) {
        return;
    }

    const allTransactions = getAllTransactions();
    const allTransactionViolations = getAllTransactionViolations();

    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        value: {
            ...originalSelectedTransaction,
            billable: params.billable,
            comment: {
                comment: params.comment,
            },
            category: params.category,
            created: params.created,
            currency: params.currency,
            modifiedMerchant: params.merchant,
            reimbursable: params.reimbursable,
            tag: params.tag,
        },
    };

    const failureTransactionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };

    const optimisticTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        const newViolation = {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION};
        const updatedViolations = id === params.transactionID ? violations : [...violations, newViolation];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: updatedViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const optimisticHoldActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureHoldActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const reportActionIDList: string[] = [];
    const resolvedTransactionIDList: string[] = [];
    const optimisticHoldTransactionActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureHoldTransactionActions: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const allReportActions = getAllReportActionsFromIOU();

    // For each duplicate transaction, find its IOU action and create hold actions
    // This handles cross-report duplicates by searching across all reports
    for (const transactionID of params.transactionIDList) {
        const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }

        // Find the IOU action for this transaction in its own report
        const transactionReportID = transaction.reportID;
        const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionReportID}`];
        const iouAction = Object.values(reportActions ?? {}).find((action): action is OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
            if (!isMoneyRequestAction(action)) {
                return false;
            }
            const message = getOriginalMessage(action);
            return message?.IOUTransactionID === transactionID;
        });

        if (!iouAction) {
            continue;
        }

        const transactionThreadReportID = iouAction.childReportID;
        const createdReportAction = buildOptimisticHoldReportAction();
        reportActionIDList.push(createdReportAction.reportActionID);
        resolvedTransactionIDList.push(transactionID);
        optimisticHoldTransactionActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                comment: {
                    hold: createdReportAction.reportActionID,
                },
            },
        });
        failureHoldTransactionActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                comment: {
                    hold: null,
                },
            },
        });
        optimisticHoldActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [createdReportAction.reportActionID]: createdReportAction,
            },
        });
        failureHoldActions.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [createdReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericHoldExpenseFailureMessage'),
                },
            },
        });
    }

    const transactionThreadReportID = params.reportID ? getIOUActionForTransactions([params.transactionID], params.reportID).at(0)?.childReportID : undefined;
    const optimisticReportAction = buildOptimisticDismissedViolationReportAction({
        reason: 'manual',
        violationName: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
    });

    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    const failureReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [optimisticReportAction.reportActionID]: null,
        },
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];

    optimisticData.push(optimisticTransactionData, ...optimisticTransactionViolations, ...optimisticHoldActions, ...optimisticHoldTransactionActions, optimisticReportActionData);
    failureData.push(failureTransactionData, ...failureTransactionViolations, ...failureHoldActions, ...failureHoldTransactionActions, failureReportActionData);
    const {reportID, transactionIDList, receiptID, ...otherParams} = params;

    const parameters: ResolveDuplicatesParams = {
        ...otherParams,
        transactionID: params.transactionID,
        reportActionIDList,
        transactionIDList: resolvedTransactionIDList,
        dismissedViolationReportActionID: optimisticReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.RESOLVE_DUPLICATES, parameters, {optimisticData, failureData});
}

/**
 * Builds the transactionParams object and computes waypoints used when duplicating a transaction.
 * Shared between duplicateExpenseTransaction and duplicateReport.
 */
function buildDuplicateTransactionParams(transaction: OnyxTypes.Transaction, transactionDetails: ReturnType<typeof getTransactionDetails>) {
    const {linkedTrackedExpenseReportAction, ...transactionWithoutLinkedAction} = transaction;
    const waypoints = !isExpenseSplit(transaction) ? (transactionDetails?.waypoints as WaypointCollection | undefined) : undefined;

    const transactionParams = {
        ...transactionWithoutLinkedAction,
        ...transactionDetails,
        amount: transactionDetails?.amount ?? 0,
        taxAmount: transactionDetails?.taxAmount ?? 0,
        convertedAmount: undefined,
        originalAmount: undefined,
        actionableWhisperReportActionID: undefined,
        attendees: transactionDetails?.attendees as Attendee[] | undefined,
        comment: Parser.htmlToMarkdown(transactionDetails?.comment ?? ''),
        created: format(new Date(), CONST.DATE.FNS_FORMAT_STRING),
        customUnitRateID: transaction.comment?.customUnit?.customUnitRateID,
        isFromGlobalCreate: undefined,
        isLinkedTrackedExpenseReportArchived: undefined,
        isTestDrive: transaction.receipt?.isTestDriveReceipt,
        linkedTrackedExpenseReportID: undefined,
        merchant: transaction.modifiedMerchant ? transaction.modifiedMerchant : (transaction.merchant ?? ''),
        modifiedAmount: undefined,
        originalTransactionID: undefined,
        odometerStart: transaction.comment?.odometerStart ?? undefined,
        odometerEnd: transaction.comment?.odometerEnd ?? undefined,
        receipt: undefined,
        source: undefined,
        waypoints,
        type: transaction.comment?.type,
        count: transaction.comment?.units?.count,
        rate: transaction.comment?.units?.rate,
        unit: transaction.comment?.units?.unit,
    };

    if (isDistanceRequest(transaction) && (isExpenseSplit(transaction) || isOdometerDistanceRequest(transaction))) {
        transactionParams.distance = transaction.comment?.customUnit?.quantity ?? undefined;
    }

    return {transactionParams, waypoints};
}

/**
 * Routes a duplicate expense to the correct creation function based on transaction type.
 * Shared between duplicateExpenseTransaction and duplicateReport.
 */
function createExpenseByType({
    transactionType,
    params,
    transaction,
    transactionDetails,
    waypoints,
    participants,
    policyRecentlyUsedCurrencies,
    quickAction,
    customUnitPolicyID,
    personalDetails,
    recentWaypoints,
}: {
    transactionType: string;
    params: RequestMoneyInformation;
    transaction: OnyxTypes.Transaction;
    transactionDetails: ReturnType<typeof getTransactionDetails>;
    waypoints: WaypointCollection | undefined;
    participants: Participant[];
    policyRecentlyUsedCurrencies: string[];
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    customUnitPolicyID?: string;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
}) {
    switch (transactionType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE: {
            const distanceParams: CreateDistanceRequestInformation = {
                ...params,
                participants,
                existingTransaction: {
                    ...(params.transactionParams ?? {}),
                    comment: {
                        ...transaction.comment,
                        originalTransactionID: undefined,
                        source: undefined,
                        waypoints,
                    },
                    iouRequestType: getRequestType(transaction),
                    modifiedCreated: '',
                    reportID: '1',
                    transactionID: '1',
                },
                transactionParams: {
                    ...(params.transactionParams ?? {}),
                    comment: Parser.htmlToMarkdown(transactionDetails?.comment ?? ''),
                    validWaypoints: waypoints,
                    modifiedAmount: transactionDetails?.amount,
                },
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                quickAction,
                customUnitPolicyID,
                personalDetails,
                recentWaypoints,
            };
            return createDistanceRequest(distanceParams);
        }
        case CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM: {
            const perDiemParams: PerDiemExpenseInformation = {
                ...params,
                transactionParams: {
                    ...(params.transactionParams ?? {}),
                    comment: transactionDetails?.comment ?? '',
                    customUnit: transaction.comment?.customUnit ?? {},
                },
                hasViolations: false,
                customUnitPolicyID,
            };
            return submitPerDiemExpense(perDiemParams);
        }
        default:
            return requestMoney(params);
    }
}

type DuplicateExpenseTransactionParams = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    optimisticChatReportID: string;
    optimisticIOUReportID: string;
    isASAPSubmitBetaEnabled: boolean;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    customUnitPolicyID?: string;
    targetPolicy?: OnyxEntry<OnyxTypes.Policy>;
    targetPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    targetReport?: OnyxTypes.Report;
    existingTransactionDraft: OnyxEntry<OnyxTypes.Transaction>;
    draftTransactionIDs: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    targetPolicyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    shouldPlaySound?: boolean;
    shouldDeferAutoSubmit?: boolean;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    optimisticReportPreviewActionID?: string;
};

function duplicateExpenseTransaction({
    transaction,
    optimisticChatReportID,
    optimisticIOUReportID,
    isASAPSubmitBetaEnabled,
    introSelected,
    activePolicyID,
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    customUnitPolicyID,
    targetPolicy,
    targetPolicyCategories,
    targetReport,
    existingTransactionDraft,
    draftTransactionIDs,
    betas,
    personalDetails,
    recentWaypoints,
    targetPolicyTags,
    shouldPlaySound = true,
    shouldDeferAutoSubmit = false,
    existingIOUReport,
    optimisticReportPreviewActionID: externalReportPreviewActionID,
}: DuplicateExpenseTransactionParams) {
    if (!transaction) {
        return;
    }

    const userAccountID = getUserAccountID();
    const currentUserEmail = getCurrentUserEmail();

    const participants = getMoneyRequestParticipantsFromReport(targetReport, userAccountID);
    const transactionDetails = getTransactionDetails(transaction);
    const {transactionParams, waypoints} = buildDuplicateTransactionParams(transaction, transactionDetails);

    const params: RequestMoneyInformation = {
        report: targetReport,
        existingIOUReport,
        optimisticChatReportID,
        optimisticCreatedReportActionID: NumberUtils.rand64(),
        optimisticIOUReportID,
        optimisticReportPreviewActionID: externalReportPreviewActionID ?? NumberUtils.rand64(),
        participantParams: {
            payeeAccountID: userAccountID,
            payeeEmail: currentUserEmail,
            participant: participants.at(0) ?? {},
        },
        gpsPoint: undefined,
        action: CONST.IOU.ACTION.CREATE,
        transactionParams,
        shouldHandleNavigation: false,
        shouldPlaySound,
        shouldGenerateTransactionThreadReport: true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam: userAccountID,
        currentUserEmailParam: currentUserEmail,
        transactionViolations: {},
        policyRecentlyUsedCurrencies,
        quickAction,
        existingTransactionDraft,
        draftTransactionIDs,
        isSelfTourViewed,
        betas,
        personalDetails,
        shouldDeferAutoSubmit,
    };

    // If no workspace is provided the expense should be unreported
    if (!targetPolicy) {
        const trackExpenseParams: CreateTrackExpenseParams = {
            ...params,
            participantParams: {
                ...(params.participantParams ?? {}),
                participant: {accountID: userAccountID, selected: true},
            },
            existingTransaction: {
                ...(params.transactionParams ?? {}),
                comment: {
                    ...transaction.comment,
                    originalTransactionID: undefined,
                    source: undefined,
                    waypoints,
                },
                iouRequestType: getRequestType(transaction),
                modifiedCreated: '',
                reportID: '1',
                transactionID: '1',
            },
            transactionParams: {
                ...(params.transactionParams ?? {}),
                validWaypoints: waypoints,
            },
            report: undefined,
            isDraftPolicy: false,
            introSelected,
            activePolicyID,
            quickAction,
            recentWaypoints,
            betas,
            draftTransactionIDs,
            isSelfTourViewed,
        };
        return trackExpense(trackExpenseParams);
    }

    params.policyParams = {
        policy: targetPolicy,
        policyTagList: targetPolicyTags,
        policyCategories: targetPolicyCategories ?? {},
    };

    return createExpenseByType({
        transactionType: getTransactionType(transaction),
        params,
        transaction,
        transactionDetails,
        waypoints,
        participants,
        policyRecentlyUsedCurrencies,
        quickAction,
        customUnitPolicyID,
        personalDetails,
        recentWaypoints,
    });
}

type DuplicateReportParams = {
    sourceReport: OnyxEntry<OnyxTypes.Report>;
    sourceReportTransactions: OnyxTypes.Transaction[];
    sourceReportName: string;
    targetPolicy: OnyxEntry<OnyxTypes.Policy>;
    targetPolicyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    targetPolicyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    ownerPersonalDetails: CurrentUserPersonalDetails;
    isASAPSubmitBetaEnabled: boolean;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    draftTransactionIDs: string[];
    isSelfTourViewed: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    translate: LocalizedTranslate;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
};

function duplicateReport({
    sourceReport,
    sourceReportTransactions,
    sourceReportName,
    targetPolicy,
    targetPolicyCategories,
    targetPolicyTags,
    parentChatReport,
    ownerPersonalDetails,
    isASAPSubmitBetaEnabled,
    betas,
    personalDetails,
    quickAction,
    policyRecentlyUsedCurrencies,
    draftTransactionIDs,
    isSelfTourViewed,
    transactionViolations,
    translate,
    recentWaypoints,
}: DuplicateReportParams) {
    if (!targetPolicy || !parentChatReport) {
        return;
    }

    const userAccountID = getUserAccountID();
    const currentUserEmailValue = getCurrentUserEmail();

    const newReportName = translate('common.copyOfReportName', sourceReportName);
    const {reportPreviewReportActionID, ...newReport} = createNewReport(ownerPersonalDetails, false, isASAPSubmitBetaEnabled, targetPolicy, betas, false, undefined, newReportName);

    const isCrossWorkspace = !!sourceReport && sourceReport.policyID !== targetPolicy.id;

    const eligibleTransactions = sourceReportTransactions.filter((transaction) => {
        if (isFromCreditCardImport(transaction)) {
            return false;
        }
        if (transaction.accountant) {
            return false;
        }
        if (isPartialTransaction(transaction) || isScanning(transaction)) {
            return false;
        }
        const txnViolations = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
        if (hasCustomUnitOutOfPolicyViolation(txnViolations)) {
            return false;
        }
        if (isCrossWorkspace && (isPerDiemRequest(transaction) || isDistanceRequest(transaction))) {
            return false;
        }
        return true;
    });

    const participants = getMoneyRequestParticipantsFromReport(parentChatReport, userAccountID);

    const policyParams = targetPolicy
        ? {
              policy: targetPolicy,
              policyTagList: targetPolicyTags,
              policyCategories: targetPolicyCategories ?? {},
          }
        : undefined;

    let currentIOUReport = newReport as OnyxEntry<OnyxTypes.Report>;

    for (let i = 0; i < eligibleTransactions.length; i++) {
        const transaction = eligibleTransactions.at(i);
        if (!transaction) {
            continue;
        }
        const transactionDetails = getTransactionDetails(transaction);
        if (!transactionDetails) {
            continue;
        }

        const isLastExpense = i === eligibleTransactions.length - 1;
        const {transactionParams, waypoints} = buildDuplicateTransactionParams(transaction, transactionDetails);

        const params: RequestMoneyInformation = {
            report: parentChatReport,
            existingIOUReport: currentIOUReport,
            optimisticReportPreviewActionID: reportPreviewReportActionID,
            participantParams: {
                payeeAccountID: userAccountID,
                payeeEmail: currentUserEmailValue,
                participant: participants.at(0) ?? {},
            },
            policyParams,
            gpsPoint: undefined,
            action: CONST.IOU.ACTION.CREATE,
            transactionParams,
            shouldHandleNavigation: false,
            shouldPlaySound: false,
            shouldGenerateTransactionThreadReport: true,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: userAccountID,
            currentUserEmailParam: currentUserEmailValue,
            transactionViolations: transactionViolations ?? {},
            quickAction,
            policyRecentlyUsedCurrencies,
            existingTransactionDraft: undefined,
            draftTransactionIDs,
            isSelfTourViewed,
            betas,
            personalDetails,
            shouldDeferAutoSubmit: !isLastExpense,
        };

        const result = createExpenseByType({
            transactionType: getTransactionType(transaction),
            params,
            transaction,
            transactionDetails,
            waypoints,
            participants,
            policyRecentlyUsedCurrencies,
            quickAction,
            customUnitPolicyID: targetPolicy?.id,
            personalDetails,
            recentWaypoints,
        });

        if (result?.iouReport) {
            currentIOUReport = result.iouReport;
        }
    }

    playSound(SOUNDS.DONE);
}

type BulkDuplicateExpensesParams = {
    transactionIDs: string[];
    allTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>>;
    sourcePolicyIDMap: Record<string, string | undefined>;
    targetPolicy: OnyxEntry<OnyxTypes.Policy>;
    targetPolicyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    targetPolicyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    targetReport: OnyxEntry<OnyxTypes.Report>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    isASAPSubmitBetaEnabled: boolean;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    transactionDrafts: Record<string, OnyxTypes.Transaction> | undefined;
    draftTransactionIDs: string[];
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
};

function bulkDuplicateExpenses({
    transactionIDs,
    allTransactions,
    sourcePolicyIDMap,
    targetPolicy,
    targetPolicyCategories,
    targetPolicyTags,
    targetReport,
    personalDetails,
    isASAPSubmitBetaEnabled,
    introSelected,
    activePolicyID,
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    transactionDrafts,
    draftTransactionIDs,
    betas,
    recentWaypoints,
}: BulkDuplicateExpensesParams) {
    const transactionsToDuplicate = transactionIDs.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((t): t is OnyxTypes.Transaction => !!t);

    if (transactionsToDuplicate.length === 0) {
        return;
    }

    const optimisticChatReportID = generateReportID();
    const optimisticIOUReportID = generateReportID();
    const sharedReportPreviewActionID = NumberUtils.rand64();

    // After the first iteration creates a new optimistic IOU report, subsequent
    // iterations must know its ID so getMoneyRequestInformation can find and
    // MERGE into it instead of SET-overwriting it.  We carry a local copy of
    // targetReport whose iouReportID is patched after the first pass.
    // We also pass the optimistic IOU report object directly via existingIOUReport
    // to avoid a stale-state race: Onyx subscriber callbacks are deferred, so the
    // module-level allReports in IOU/index.ts is not yet updated when iteration 2 runs.
    let currentTargetReport = targetReport;
    let optimisticIOUReport: OnyxEntry<OnyxTypes.Report>;

    for (let i = 0; i < transactionsToDuplicate.length; i++) {
        const item = transactionsToDuplicate.at(i);
        if (!item) {
            continue;
        }
        const isLastExpense = i === transactionsToDuplicate.length - 1;
        const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
        const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

        const result = duplicateExpenseTransaction({
            transaction: item,
            optimisticChatReportID,
            optimisticIOUReportID,
            isASAPSubmitBetaEnabled,
            introSelected,
            activePolicyID,
            quickAction,
            policyRecentlyUsedCurrencies,
            isSelfTourViewed,
            customUnitPolicyID: (isDistanceRequest(item) ? sourcePolicyIDMap[item.transactionID] : undefined) ?? targetPolicy?.id,
            targetPolicy: targetPolicy ?? undefined,
            targetPolicyCategories: targetPolicyCategories ?? {},
            targetReport: currentTargetReport,
            existingTransactionDraft,
            draftTransactionIDs,
            betas,
            personalDetails,
            recentWaypoints,
            targetPolicyTags,
            shouldPlaySound: false,
            shouldDeferAutoSubmit: !isLastExpense,
            existingIOUReport: optimisticIOUReport,
            optimisticReportPreviewActionID: sharedReportPreviewActionID,
        });

        if (result?.iouReport) {
            optimisticIOUReport = result.iouReport;
        }

        if (currentTargetReport && !currentTargetReport.iouReportID) {
            currentTargetReport = {...currentTargetReport, iouReportID: optimisticIOUReportID};
        }
    }

    playSound(SOUNDS.DONE);
}

export {getIOUActionForTransactions, mergeDuplicates, resolveDuplicates, duplicateExpenseTransaction, bulkDuplicateExpenses, duplicateReport};
export type {DuplicateExpenseTransactionParams, BulkDuplicateExpensesParams, DuplicateReportParams};
