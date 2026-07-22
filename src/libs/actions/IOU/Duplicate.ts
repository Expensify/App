import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SelectedReports} from '@components/Search/types';

import * as API from '@libs/API';
import type {MergeDuplicatesParams, ResolveDuplicatesParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {getExistingTransactionID} from '@libs/IOUUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {isInstantSubmitEnabled, isPolicyAccessible, isSubmitAndClose} from '@libs/PolicyUtils';
import {getIOUActionForReportID, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticDismissedViolationReportAction,
    buildOptimisticHoldReportAction,
    buildOptimisticResolvedDuplicatesReportAction,
    buildTransactionThread,
    canAddTransaction,
    generateReportID,
    getReimbursableTotal,
    getTransactionDetails,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {
    getDistanceRequestType,
    getReimbursable,
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

import type {CurrentUser} from '@userActions/Policy/Policy';
import {createNewReport} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {WaypointCollection} from '@src/types/onyx/Transaction';

import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {PartialDeep} from 'type-fest';

import {format} from 'date-fns';
import Onyx from 'react-native-onyx';

import type {RequestMoneyInformation} from './MoneyRequestBuilder';
import type {PerDiemExpenseInformation} from './PerDiem';
import type {CreateDistanceRequestInformation} from './Split';
import type {CreateTrackExpenseParams} from './TrackExpense';

import {buildParticipantsPolicyTags, getAllReportActionsFromIOU, getAllReports, getAllTransactions} from '.';
import {getCleanUpTransactionThreadReportOnyxData} from './DeleteMoneyRequest';
import {getMoneyRequestParticipantsFromReport} from './MoneyRequest';
import {submitPerDiemExpense} from './PerDiem';
import {createDistanceRequest} from './Split';
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

type DiscardedSource = {
    amount: number;
    reimbursableAmount: number;
    actions: Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>;
};

function buildSoftDeleteReportActionUpdate(
    reportAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>,
    deletedTime: string | null,
): NullishDeep<PartialDeep<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>> {
    if (deletedTime === null) {
        return {originalMessage: {deleted: null}, message: reportAction.message};
    }
    const firstMessage = Array.isArray(reportAction.message) ? reportAction.message.at(0) : null;
    return {
        originalMessage: {deleted: deletedTime},
        ...(firstMessage && {message: [{...firstMessage, deleted: deletedTime}, ...(Array.isArray(reportAction.message) ? reportAction.message.slice(1) : [])]}),
        ...(!Array.isArray(reportAction.message) && {message: {deleted: deletedTime}}),
    };
}

type DuplicateTransactionParams = {
    transactionID: string | undefined;
    originalSelectedTransaction: OnyxEntry<OnyxTypes.Transaction>;
    billable: boolean;
    comment: string;
    category: string;
    created: string;
    currency: string;
    merchant: string;
    reimbursable: boolean;
    tag: string;
    taxCode?: string;
    taxAmount?: number;
    taxValue?: string;
};

function buildOptimisticTransactionData({
    transactionID,
    originalSelectedTransaction,
    billable,
    comment,
    category,
    created,
    currency,
    merchant,
    reimbursable,
    tag,
    taxCode,
    taxAmount,
    taxValue,
}: DuplicateTransactionParams): OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...originalSelectedTransaction,
            billable,
            comment: {
                comment,
            },
            category,
            created,
            currency,
            modifiedMerchant: merchant,
            reimbursable,
            tag,
            taxCode: taxCode ?? originalSelectedTransaction?.taxCode,
            taxAmount: taxAmount ?? originalSelectedTransaction?.taxAmount,
            taxValue: taxValue ?? originalSelectedTransaction?.taxValue,
            // Clear `taxName` to stay consistent with the server response,
            // and avoid retaining an outdated value that doesn't match the new `taxCode`.
            taxName: taxCode ? null : originalSelectedTransaction?.taxName,
        },
    };
}

function buildFailureTransactionData(transactionID: string | undefined, originalSelectedTransaction: OnyxEntry<OnyxTypes.Transaction>): OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION> {
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };
}

type MergeDuplicatesFuncParams = MergeDuplicatesParams & {
    currentUserLogin: string;
    currentUserAccountID: number;
    taxAmount?: number;
    taxValue?: string;
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
};

/** Merge several transactions into one by updating the fields of the one we want to keep and deleting the rest */
function mergeDuplicates({
    transactionThreadReportID: optimisticTransactionThreadReportID,
    currentUserLogin,
    currentUserAccountID,
    taxAmount,
    taxValue,
    allTransactionViolations,
    ...params
}: MergeDuplicatesFuncParams) {
    const allParams: MergeDuplicatesParams = {...params};
    const allTransactions = getAllTransactions();
    const allReports = getAllReports();
    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData = buildOptimisticTransactionData({
        transactionID: params.transactionID,
        originalSelectedTransaction,
        billable: params.billable,
        comment: params.comment,
        category: params.category,
        created: params.created,
        currency: params.currency,
        merchant: params.merchant,
        reimbursable: params.reimbursable,
        tag: params.tag,
        taxCode: params.taxCode,
        taxAmount,
        taxValue,
    });

    const failureTransactionData = buildFailureTransactionData(params.transactionID, originalSelectedTransaction);

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
        const violations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations,
        };
    });

    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`];

    // Group each discarded duplicate's IOU action and amount by its own source report so the
    // soft-delete MERGE and total decrement target the correct keys when duplicates span reports.
    const sources = new Map<string, DiscardedSource>();
    for (const id of params.transactionIDList) {
        const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`];
        if (!transaction?.reportID) {
            continue;
        }
        const entry = sources.get(transaction.reportID) ?? {amount: 0, reimbursableAmount: 0, actions: []};
        entry.amount += transaction.amount;
        if (transaction.reimbursable) {
            entry.reimbursableAmount += transaction.amount;
        }
        entry.actions.push(...getIOUActionForTransactions([id], transaction.reportID));
        sources.set(transaction.reportID, entry);
    }
    const deletedTime = DateUtils.getDBTime();
    const expenseReportOptimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const expenseReportFailureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const expenseReportActionsOptimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const expenseReportActionsFailureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const cleanUpTransactionThreadReportsOptimisticData = [];
    const cleanUpTransactionThreadReportsSuccessData = [];
    const cleanUpTransactionThreadReportsFailureData = [];
    for (const [sourceReportID, {amount, reimbursableAmount, actions}] of sources) {
        const sourceReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`];
        const sourceReimbursableTotal = getReimbursableTotal(sourceReport);
        expenseReportOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`,
            value: {total: (sourceReport?.total ?? 0) - amount, reimbursableTotal: sourceReimbursableTotal - reimbursableAmount},
        });
        expenseReportFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${sourceReportID}`,
            value: {total: sourceReport?.total, reimbursableTotal: sourceReimbursableTotal},
        });
        expenseReportActionsOptimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceReportID}`,
            value: Object.fromEntries(actions.map((a) => [a.reportActionID, buildSoftDeleteReportActionUpdate(a, deletedTime)])),
        });
        expenseReportActionsFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${sourceReportID}`,
            value: Object.fromEntries(actions.map((a) => [a.reportActionID, buildSoftDeleteReportActionUpdate(a, null)])),
        });

        // Reset the report-preview accumulator per source so each source report's chat parent
        // gets its own flushed update (and we don't leak one source's preview action into another).
        let updatedReportPreviewAction;
        for (const [index, iouAction] of actions.entries()) {
            const transactionThreadID = iouAction.childReportID;
            const cleanUp = getCleanUpTransactionThreadReportOnyxData({
                transactionThreadID,
                shouldDeleteTransactionThread: !!transactionThreadID,
                reportAction: iouAction,
                updatedReportPreviewAction,
                shouldAddUpdatedReportPreviewActionToOnyxData: index === actions.length - 1,
                currentUserAccountID,
            });
            cleanUpTransactionThreadReportsOptimisticData.push(...cleanUp.optimisticData);
            cleanUpTransactionThreadReportsSuccessData.push(...cleanUp.successData);
            cleanUpTransactionThreadReportsFailureData.push(...cleanUp.failureData);
            updatedReportPreviewAction = cleanUp.updatedReportPreviewAction;
        }
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
        ...expenseReportOptimisticData,
        ...expenseReportActionsOptimisticData,
        optimisticReportActionData,
        ...cleanUpTransactionThreadReportsOptimisticData,
    );
    successData.push(...cleanUpTransactionThreadReportsSuccessData);
    failureData.push(
        failureTransactionData,
        ...failureTransactionDuplicatesData,
        ...failureTransactionViolations,
        ...expenseReportFailureData,
        ...expenseReportActionsFailureData,
        failureReportActionData,
        ...cleanUpTransactionThreadReportsFailureData,
    );

    if (optimisticTransactionThreadReportID) {
        const iouAction = getIOUActionForReportID(params.reportID, params.transactionID);
        const optimisticCreatedAction = buildOptimisticCreatedReportAction({emailCreatingAction: currentUserLogin});
        const optimisticTransactionThreadReport = buildTransactionThread(iouAction, expenseReport, currentUserAccountID, undefined, optimisticTransactionThreadReportID);

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
function resolveDuplicates({
    taxAmount,
    taxValue,
    transactionThreadReportIDMap,
    allTransactionViolations,
    ...params
}: MergeDuplicatesParams & {
    taxAmount?: number;
    taxValue?: string;
    transactionThreadReportIDMap: Record<string, string | undefined>;
    allTransactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
}) {
    if (!params.transactionID) {
        return;
    }

    const allTransactions = getAllTransactions();

    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData = buildOptimisticTransactionData({
        transactionID: params.transactionID,
        originalSelectedTransaction,
        billable: params.billable,
        comment: params.comment,
        category: params.category,
        created: params.created,
        currency: params.currency,
        merchant: params.merchant,
        reimbursable: params.reimbursable,
        tag: params.tag,
        taxCode: params.taxCode,
        taxAmount,
        taxValue,
    });

    const failureTransactionData = buildFailureTransactionData(params.transactionID, originalSelectedTransaction);

    const optimisticTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        const newViolation = {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION};
        const updatedViolations = id === params.transactionID ? violations : [...violations, newViolation];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: updatedViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
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

    for (const transactionID of params.transactionIDList) {
        const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }

        const transactionThreadReportID = transactionThreadReportIDMap[transactionID];
        if (!transactionThreadReportID) {
            continue;
        }

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
 * Returns the request type the duplicate should be created with. SCAN sources become MANUAL because
 * `buildDuplicateTransactionParams` strips the receipt — without one, the duplicate cannot be a scan request.
 */
function getDuplicateRequestType(transaction: OnyxTypes.Transaction) {
    const sourceRequestType = getRequestType(transaction);
    return sourceRequestType === CONST.IOU.REQUEST_TYPE.SCAN ? CONST.IOU.REQUEST_TYPE.MANUAL : sourceRequestType;
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
    isTrackIntentUser,
    formatPhoneNumber,
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
    isTrackIntentUser: boolean | undefined;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
}) {
    switch (transactionType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE: {
            const distanceParams: CreateDistanceRequestInformation = {
                ...params,
                participants,
                currentUserLogin: params.currentUserEmailParam,
                currentUserAccountID: params.currentUserAccountIDParam,
                existingTransaction: {
                    iouRequestType: getDuplicateRequestType(transaction),
                    amount: 0,
                    currency: '',
                    created: '',
                    merchant: '',
                    reportID: '1',
                    transactionID: '1',
                    comment: {
                        ...transaction.comment,
                        hold: undefined,
                        originalTransactionID: undefined,
                        source: undefined,
                        waypoints,
                    },
                },
                transactionParams: {
                    ...(params.transactionParams ?? {}),
                    comment: Parser.htmlToMarkdown(transactionDetails?.comment ?? ''),
                    validWaypoints: waypoints,
                    modifiedAmount: transactionDetails?.amount,
                    distanceRequestType: getDistanceRequestType(transaction),
                },
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                quickAction,
                customUnitPolicyID,
                personalDetails,
                recentWaypoints,
                formatPhoneNumber,
                // buildParticipantsPolicyTags is deprecated but still needed here until this call site is migrated to useOnyx (https://github.com/Expensify/App/issues/72721)
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                participantsPolicyTags: buildParticipantsPolicyTags(participants),
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
                isTrackIntentUser,
            };
            return submitPerDiemExpense(perDiemParams);
        }
        default:
            return requestMoney({
                ...params,
            });
    }
}

type DuplicateExpenseTransactionParams = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    optimisticChatReportID: string;
    optimisticIOUReportID: string;
    isASAPSubmitBetaEnabled: boolean;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    customUnitPolicyID?: string;
    targetPolicy?: OnyxEntry<OnyxTypes.Policy>;
    targetPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    targetReport?: OnyxTypes.Report;
    existingTransactionDraft: OnyxEntry<OnyxTypes.Transaction>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    targetPolicyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    shouldPlaySound?: boolean;
    shouldDeferAutoSubmit?: boolean;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    optimisticReportPreviewActionID?: string;
    currentUser: CurrentUser;
    currentUserLocalCurrency: string | undefined;
    isTrackIntentUser: boolean | undefined;
    delegateAccountID: number | undefined;
    policyTagList: OnyxTypes.PolicyTagLists;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function duplicateExpenseTransaction({
    transaction,
    optimisticChatReportID,
    optimisticIOUReportID,
    isASAPSubmitBetaEnabled,
    introSelected,
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    customUnitPolicyID,
    targetPolicy,
    targetPolicyCategories,
    targetReport,
    existingTransactionDraft,
    betas,
    personalDetails,
    recentWaypoints,
    shouldPlaySound = true,
    shouldDeferAutoSubmit = false,
    existingIOUReport,
    optimisticReportPreviewActionID: externalReportPreviewActionID,
    currentUser,
    currentUserLocalCurrency,
    isTrackIntentUser,
    delegateAccountID,
    policyTagList,
    formatPhoneNumber,
}: DuplicateExpenseTransactionParams) {
    if (!transaction) {
        return;
    }
    const {accountID: currentUserAccountID, email: currentUserLogin = ''} = currentUser;
    const participants = getMoneyRequestParticipantsFromReport(targetReport, currentUserAccountID);

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
            payeeAccountID: currentUserAccountID,
            payeeEmail: currentUserLogin,
            participant: participants.at(0) ?? {},
        },
        gpsPoint: undefined,
        action: CONST.IOU.ACTION.CREATE,
        transactionParams,
        shouldPlaySound,
        shouldGenerateTransactionThreadReport: true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam: currentUserAccountID,
        currentUserEmailParam: currentUserLogin,
        transactionViolations: {},
        policyRecentlyUsedCurrencies,
        quickAction,
        existingTransactionDraft,
        existingTransaction: {
            iouRequestType: getDuplicateRequestType(transaction),
            amount: 0,
            currency: '',
            created: '',
            merchant: '',
            reportID: '1',
            transactionID: '1',
        },
        isSelfTourViewed,
        betas,
        personalDetails,
        shouldDeferAutoSubmit,
        isTrackIntentUser,
        delegateAccountID,
    };

    // If no workspace is provided the expense should be unreported
    if (!targetPolicy) {
        const trackExpenseParams: CreateTrackExpenseParams = {
            ...params,
            participantParams: {
                ...(params.participantParams ?? {}),
                participant: {accountID: currentUserAccountID, selected: true},
            },
            existingTransaction: {
                iouRequestType: getDuplicateRequestType(transaction),
                amount: 0,
                currency: '',
                created: '',
                merchant: '',
                reportID: '1',
                transactionID: '1',
                comment: {
                    ...transaction.comment,
                    hold: undefined,
                    originalTransactionID: undefined,
                    source: undefined,
                    waypoints,
                },
            },
            transactionParams: {
                ...(params.transactionParams ?? {}),
                validWaypoints: waypoints,
            },
            report: undefined,
            isDraftPolicy: false,
            currentUser: {accountID: currentUserAccountID, email: currentUserLogin},
            introSelected,
            quickAction,
            recentWaypoints,
            betas,
            isSelfTourViewed,
            currentUserLocalCurrency,
            delegateAccountID,
            reportActionsList: undefined,
        };
        return trackExpense(trackExpenseParams);
    }

    params.policyParams = {
        policy: targetPolicy,
        policyTagList,
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
        isTrackIntentUser,
        formatPhoneNumber,
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
    isSelfTourViewed: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    translate: LocalizedTranslate;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    currentUserLogin: string;
    currentUserAccountID: number;
    shouldPlaySound?: boolean;
    isTrackIntentUser: boolean | undefined;
    delegateAccountID: number | undefined;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
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
    isSelfTourViewed,
    transactionViolations,
    translate,
    recentWaypoints,
    currentUserAccountID,
    currentUserLogin,
    shouldPlaySound = true,
    isTrackIntentUser,
    delegateAccountID,
    formatPhoneNumber,
}: DuplicateReportParams) {
    if (!targetPolicy || !parentChatReport) {
        return;
    }

    const newReportName = translate('common.copyOfReportName', sourceReportName);
    const {reportPreviewReportActionID, ...newReport} = createNewReport(
        ownerPersonalDetails,
        false,
        isASAPSubmitBetaEnabled,
        targetPolicy,
        betas,
        isTrackIntentUser,
        false,
        undefined,
        newReportName,
    );

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

    const participants = getMoneyRequestParticipantsFromReport(parentChatReport, currentUserAccountID);

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
                payeeAccountID: currentUserAccountID,
                payeeEmail: currentUserLogin,
                participant: participants.at(0) ?? {},
            },
            policyParams,
            gpsPoint: undefined,
            action: CONST.IOU.ACTION.CREATE,
            transactionParams,
            shouldPlaySound: false,
            shouldGenerateTransactionThreadReport: true,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserLogin,
            transactionViolations: transactionViolations ?? {},
            quickAction,
            policyRecentlyUsedCurrencies,
            existingTransactionDraft: undefined,
            existingTransaction: {
                iouRequestType: getDuplicateRequestType(transaction),
                amount: 0,
                currency: '',
                created: '',
                merchant: '',
                reportID: '1',
                transactionID: '1',
            },
            isSelfTourViewed,
            betas,
            personalDetails,
            shouldDeferAutoSubmit: !isLastExpense,
            isTrackIntentUser,
            delegateAccountID,
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
            isTrackIntentUser,
            formatPhoneNumber,
        });

        if (result?.iouReport) {
            currentIOUReport = result.iouReport;
        }
    }

    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }
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
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    transactionDrafts: Record<string, OnyxTypes.Transaction> | undefined;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    currentUser: CurrentUser;
    currentUserLocalCurrency: string | undefined;
    isTrackIntentUser: boolean | undefined;
    delegateAccountID: number | undefined;
    policyTagList: OnyxTypes.PolicyTagLists;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
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
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    transactionDrafts,
    betas,
    recentWaypoints,
    currentUser,
    currentUserLocalCurrency,
    isTrackIntentUser,
    delegateAccountID,
    policyTagList,
    formatPhoneNumber,
}: BulkDuplicateExpensesParams) {
    const transactionsToDuplicate = transactionIDs.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]).filter((t): t is OnyxTypes.Transaction => !!t);

    if (transactionsToDuplicate.length === 0) {
        return;
    }

    const optimisticChatReportID = generateReportID();

    // These are mutable: when the current IOU report can't accept more
    // transactions (e.g. instant-submit + submit-and-close with non-reimbursable
    // expenses), we generate fresh IDs so each expense gets its own report.
    let currentOptimisticIOUReportID = generateReportID();
    let currentReportPreviewActionID = NumberUtils.rand64();

    // After the first iteration creates a new optimistic IOU report, subsequent
    // iterations must know its ID so getMoneyRequestInformation can find and
    // MERGE into it instead of SET-overwriting it.  We carry a local copy of
    // targetReport whose iouReportID is patched after the first pass.
    // We also pass the optimistic IOU report object directly via existingIOUReport
    // to avoid a stale-state race: Onyx subscriber callbacks are deferred, so the
    // module-level allReports in IOU/index.ts is not yet updated when iteration 2 runs.
    let currentTargetReport = targetReport;
    let optimisticIOUReport: OnyxEntry<OnyxTypes.Report>;

    // When instant-submit + submit-and-close is active AND the duplicated
    // expenses are all non-reimbursable (or the policy disables reimbursement
    // entirely), canAddTransaction will reject the optimistic report after
    // the first expense auto-submits and closes it.  In that scenario every
    // iteration will create a new report, so we must never defer auto-submit
    // — otherwise the first expense's report stays in Draft because the
    // server was told to wait for more expenses that will never arrive.
    const allNonReimbursable = transactionsToDuplicate.every((t) => !getReimbursable(t));
    const policyWillSplitReport =
        isInstantSubmitEnabled(targetPolicy) &&
        isSubmitAndClose(targetPolicy) &&
        (allNonReimbursable || targetPolicy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO);

    for (let i = 0; i < transactionsToDuplicate.length; i++) {
        const item = transactionsToDuplicate.at(i);
        if (!item) {
            continue;
        }
        const isLastExpense = i === transactionsToDuplicate.length - 1;
        const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
        const existingTransactionDraft = existingTransactionID ? transactionDrafts?.[existingTransactionID] : undefined;

        // If the policy pre-check determined every expense must live on its
        // own report, or the previous iteration's report can't accept more
        // transactions, reset so this iteration creates its own independent
        // report.  policyWillSplitReport is needed because canAddTransaction
        // reads transactions from Onyx, which hasn't been updated yet for
        // optimistic reports (callbacks are deferred).
        let reportWasSplit = false;
        if (optimisticIOUReport && (policyWillSplitReport || !canAddTransaction(optimisticIOUReport))) {
            optimisticIOUReport = undefined;
            currentOptimisticIOUReportID = generateReportID();
            currentReportPreviewActionID = NumberUtils.rand64();
            reportWasSplit = true;
            if (currentTargetReport) {
                currentTargetReport = {...currentTargetReport, iouReportID: currentOptimisticIOUReportID};
            }
        }

        // Defer auto-submit only when this isn't the last expense AND the
        // report wasn't just split AND the policy won't force each expense
        // onto its own report.  Once a split happens every subsequent expense
        // will also split (the policy closes reports immediately), so none of
        // them should defer.
        const shouldDeferAutoSubmit = !isLastExpense && !reportWasSplit && !policyWillSplitReport;

        const result = duplicateExpenseTransaction({
            transaction: item,
            optimisticChatReportID,
            optimisticIOUReportID: currentOptimisticIOUReportID,
            isASAPSubmitBetaEnabled,
            introSelected,
            quickAction,
            policyRecentlyUsedCurrencies,
            isSelfTourViewed,
            customUnitPolicyID: (isDistanceRequest(item) ? sourcePolicyIDMap[item.transactionID] : undefined) ?? targetPolicy?.id,
            targetPolicy: targetPolicy ?? undefined,
            targetPolicyCategories: targetPolicyCategories ?? {},
            targetReport: currentTargetReport,
            existingTransactionDraft,
            betas,
            personalDetails,
            recentWaypoints,
            targetPolicyTags,
            shouldPlaySound: false,
            shouldDeferAutoSubmit,
            existingIOUReport: optimisticIOUReport,
            optimisticReportPreviewActionID: currentReportPreviewActionID,
            currentUser,
            currentUserLocalCurrency,
            isTrackIntentUser,
            delegateAccountID,
            policyTagList,
            formatPhoneNumber,
        });

        if (result?.iouReport) {
            optimisticIOUReport = result.iouReport;
        }

        if (currentTargetReport && !currentTargetReport.iouReportID) {
            currentTargetReport = {...currentTargetReport, iouReportID: currentOptimisticIOUReportID};
        }
    }

    playSound(SOUNDS.DONE);
}

type BulkDuplicateReportsParams = {
    selectedReports: SelectedReports[];
    allReports: NonNullable<OnyxCollection<OnyxTypes.Report>>;
    searchData: Record<string, unknown> | undefined;
    allPolicies: OnyxCollection<OnyxTypes.Policy>;
    allPolicyCategories: OnyxCollection<OnyxTypes.PolicyCategories>;
    allPolicyTags: OnyxCollection<OnyxTypes.PolicyTagLists>;
    defaultExpensePolicy: OnyxEntry<OnyxTypes.Policy>;
    activePolicyExpenseChat: OnyxEntry<OnyxTypes.Report>;
    ownerPersonalDetails: CurrentUserPersonalDetails;
    isASAPSubmitBetaEnabled: boolean;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    isSelfTourViewed: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    translate: LocalizedTranslate;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    currentUserLogin: string;
    currentUserAccountID: number;
    isTrackIntentUser: boolean | undefined;
    delegateAccountID: number | undefined;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
};

function bulkDuplicateReports({
    selectedReports: selectedReportsParam,
    allReports,
    searchData,
    allPolicies,
    allPolicyCategories,
    allPolicyTags,
    defaultExpensePolicy,
    activePolicyExpenseChat,
    ownerPersonalDetails,
    isASAPSubmitBetaEnabled,
    betas,
    personalDetails,
    quickAction,
    policyRecentlyUsedCurrencies,
    isSelfTourViewed,
    transactionViolations,
    translate,
    recentWaypoints,
    currentUserLogin,
    currentUserAccountID,
    isTrackIntentUser,
    delegateAccountID,
    formatPhoneNumber,
}: BulkDuplicateReportsParams) {
    const allTransactionsMap = getAllTransactions();
    const transactionsByReportID = new Map<string, OnyxTypes.Transaction[]>();

    const allTransactionSources = Object.values(allTransactionsMap ?? {}) as OnyxTypes.Transaction[];
    if (searchData) {
        for (const [key, value] of Object.entries(searchData)) {
            if (key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION) && value && typeof value === 'object' && 'transactionID' in value) {
                const txn = value as OnyxTypes.Transaction;
                if (!allTransactionsMap?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${txn.transactionID}`]) {
                    allTransactionSources.push(txn);
                }
            }
        }
    }

    for (const transaction of allTransactionSources) {
        if (!transaction || !transaction.reportID || transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        const list = transactionsByReportID.get(transaction.reportID) ?? [];
        list.push(transaction);
        transactionsByReportID.set(transaction.reportID, list);
    }

    for (const selectedReport of selectedReportsParam) {
        const reportID = selectedReport.reportID;
        if (!reportID) {
            continue;
        }

        const snapshotReport = searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] as OnyxTypes.Report | undefined;
        const onyxReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
        const report = snapshotReport ?? onyxReport ?? (selectedReport as OnyxTypes.Report);

        const reportTransactions = transactionsByReportID.get(reportID) ?? [];

        if (!snapshotReport && !onyxReport && reportTransactions.length === 0) {
            continue;
        }

        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
        const isSourcePolicyValid = !!reportPolicy && isPolicyAccessible(reportPolicy, currentUserLogin);
        const chatReportID = report.chatReportID ?? report.parentReportID;
        const chatReport = chatReportID
            ? ((searchData?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] as OnyxTypes.Report | undefined) ?? allReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`])
            : undefined;
        const useSourcePolicy = isSourcePolicyValid && !!chatReport;
        const targetPolicy = useSourcePolicy ? reportPolicy : defaultExpensePolicy;
        const parentChatReport = useSourcePolicy ? chatReport : activePolicyExpenseChat;
        const targetPolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${targetPolicy?.id}`] ?? {};
        const targetPolicyTags = allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${targetPolicy?.id}`] ?? {};

        duplicateReport({
            sourceReport: report,
            sourceReportTransactions: reportTransactions,
            sourceReportName: report.reportName ?? '',
            targetPolicy: targetPolicy ?? undefined,
            targetPolicyCategories,
            targetPolicyTags,
            parentChatReport,
            ownerPersonalDetails,
            isASAPSubmitBetaEnabled,
            betas,
            personalDetails,
            quickAction,
            policyRecentlyUsedCurrencies,
            isSelfTourViewed,
            transactionViolations,
            translate,
            recentWaypoints,
            shouldPlaySound: false,
            currentUserAccountID,
            currentUserLogin,
            isTrackIntentUser,
            delegateAccountID,
            formatPhoneNumber,
        });
    }

    playSound(SOUNDS.DONE);
}

export {getIOUActionForTransactions, mergeDuplicates, resolveDuplicates, duplicateExpenseTransaction, bulkDuplicateExpenses, duplicateReport, bulkDuplicateReports, createExpenseByType};
export type {DuplicateReportParams, BulkDuplicateReportsParams};
