import * as API from '@libs/API';
import type {DetachReceiptParams, ReplaceReceiptParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import type {CustomRNImageManipulatorResult} from '@libs/cropOrRotateImage/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {isRecord} from '@libs/ObjectUtils';
import {hasDependentTags, isGroupPolicy} from '@libs/PolicyUtils';
import ReceiptStorage from '@libs/ReceiptStorage';
import {buildOptimisticReceiptAddedAction, buildOptimisticReceiptRemovedAction, isInvoiceReport as isInvoiceReportReportUtils} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {logReceiptCaptured, logReceiptSuperseded, mintAndStampReceiptTraceId} from '@libs/telemetry/ReceiptObservability';
import {hasReceiptSource, hasUploadedReceipt, isFailedScanAmountPlaceholder} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import {getAll as getAllPersistedRequests} from '@userActions/PersistedRequests';
import {getSupersededReplaceReceiptIndices, resolveReplaceReceiptConflicts} from '@userActions/RequestConflictUtils';

import type {IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {AnyOnyxUpdate, AnyRequest} from '@src/types/onyx/Request';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import type {Receipt, ReceiptSource} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {NullishDeep, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import {getReceiptError} from './MoneyRequestBuilder';

type DetachReceipt = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>;
    transactionPolicyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    transactionViolations: OnyxEntry<OnyxTypes.TransactionViolations>;
    transactionReport: OnyxEntry<OnyxTypes.Report>;
    isVendorMatchingBetaEnabled: boolean | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    delegateAccountID: number | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
};

type ReplaceReceipt = {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    file?: File | CustomRNImageManipulatorResult;
    source: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>;
    isSameReceipt?: boolean;
    transactionPolicyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    transactionViolations?: OnyxEntry<OnyxTypes.TransactionViolations>;
    transactionReport: OnyxEntry<OnyxTypes.Report>;
    isVendorMatchingBetaEnabled: boolean | undefined;
    delegateAccountID: number | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    receiptAddedReportActionID?: string;
    receiptRemovedReportActionID?: string;
};
// The actor and thread fields are left out because a retry builds a fresh optimistic action,
// so it has to reflect who is acting and the thread state at retry time rather than when the upload failed.
type ReplaceReceiptRetryParams = Omit<ReplaceReceipt, 'transaction' | 'transactionReport' | 'delegateAccountID' | 'currentUserPersonalDetails' | 'transactionThreadReport'> & {
    transactionID: string;
};

function detachReceipt({
    transaction,
    transactionPolicy,
    transactionPolicyTagList,
    transactionViolations,
    transactionReport,
    isVendorMatchingBetaEnabled,
    transactionThreadReport,
    delegateAccountID,
    currentUserPersonalDetails,
    transactionPolicyCategories,
}: DetachReceipt) {
    const transactionID = transaction?.transactionID;
    if (!transactionID) {
        return;
    }
    const newTransaction = transaction
        ? {
              ...transaction,
              receipt: {},
          }
        : null;

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: null,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: transaction?.receipt ?? null,
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.receiptDeleteFailureError'),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isGroupPolicy(transactionPolicy) && newTransaction) {
        const currentTransactionViolations = transactionViolations ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData({
            updatedTransaction: newTransaction,
            transactionViolations: currentTransactionViolations,
            policy: transactionPolicy,
            policyTagList: transactionPolicyTagList ?? {},
            policyCategories: transactionPolicyCategories ?? {},
            hasDependentTags: hasDependentTags(transactionPolicy, transactionPolicyTagList ?? {}),
            isInvoiceTransaction: isInvoiceReportReportUtils(transactionReport),
            ownerLogin: undefined,
            isVendorMatchingBetaEnabled,
        });
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    const transactionThreadReportID = transactionThreadReport?.reportID;
    const optimisticReceiptRemovedAction = transactionThreadReportID
        ? buildOptimisticReceiptRemovedAction(
              transactionThreadReportID,
              transactionID,
              currentUserPersonalDetails.accountID,
              currentUserPersonalDetails.displayName,
              currentUserPersonalDetails.avatar,
              delegateAccountID,
          )
        : undefined;

    if (optimisticReceiptRemovedAction && transactionThreadReportID) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [optimisticReceiptRemovedAction.reportActionID]: optimisticReceiptRemovedAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastVisibleActionCreated: optimisticReceiptRemovedAction.created,
                    lastReadTime: optimisticReceiptRemovedAction.created,
                },
            },
        );
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [optimisticReceiptRemovedAction.reportActionID]: {pendingAction: null},
            },
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [optimisticReceiptRemovedAction.reportActionID]: {
                        ...optimisticReceiptRemovedAction,
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastVisibleActionCreated: transactionThreadReport?.lastVisibleActionCreated ?? null,
                    lastReadTime: transactionThreadReport?.lastReadTime ?? null,
                },
            },
        );
    }

    // The expense report only records a detach in some cases, so that message is not shown up front.
    // Since it isn't used optimistically, the backend generates the ID.
    const parameters: DetachReceiptParams = {
        transactionID,
        reportActionID: '0',
        receiptRemovedReportActionID: optimisticReceiptRemovedAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.DETACH_RECEIPT, parameters, {optimisticData, successData, failureData});
}

type ReplaceReceiptOnyxKey =
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.REPORT;

/** Keep the oldest rollback per key, but never restore audit actions belonging to uploads that will not be sent. */
function getOriginalRollbackUpdates(supersededRequests: AnyRequest[]): Map<string, AnyOnyxUpdate> {
    const originalUpdates = new Map<string, AnyOnyxUpdate>();
    for (const request of supersededRequests) {
        for (const update of request.failureData ?? []) {
            const key: unknown = update.key;
            if (typeof key !== 'string' || key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) || originalUpdates.has(key)) {
                continue;
            }
            originalUpdates.set(key, update);
        }
    }
    return originalUpdates;
}

/** A search first opened during these replacements must not restore a file that was never uploaded. */
function withOriginalSnapshotReceipt(update: AnyOnyxUpdate, originalTransactionValue: unknown, transactionKey: string): AnyOnyxUpdate {
    const key: unknown = update.key;
    const snapshotValue: unknown = update.value;
    if (
        typeof key !== 'string' ||
        !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) ||
        !isRecord(originalTransactionValue) ||
        !('receipt' in originalTransactionValue) ||
        !isRecord(snapshotValue) ||
        !isRecord(snapshotValue.data) ||
        !isRecord(snapshotValue.data[transactionKey])
    ) {
        return update;
    }
    return {
        ...update,
        value: {
            ...snapshotValue,
            data: {...snapshotValue.data, [transactionKey]: {...snapshotValue.data[transactionKey], receipt: originalTransactionValue.receipt}},
        },
    };
}

/** Undo receipt timestamps without rewinding activity that happened between the discarded uploads. */
function inheritReportTimestamps(update: AnyOnyxUpdate, supersededRequests: AnyRequest[]): AnyOnyxUpdate {
    const key: unknown = update.key;
    if (typeof key !== 'string' || !isRecord(update.value)) {
        return update;
    }
    const value = {...update.value};
    const actionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${key.slice(ONYXKEYS.COLLECTION.REPORT.length)}`;
    // A newer discarded upload may itself have inherited a rollback that preserves an intervening comment.
    for (const request of [...supersededRequests].reverse()) {
        // Optimistic updates are not persisted, but the failed receipt-added action retains the timestamp they wrote.
        const addedActionID = getStringField(request, 'reportActionID');
        const actionsValue: unknown = request.failureData?.find((entry) => entry.key === actionsKey)?.value;
        const addedAction = addedActionID && isRecord(actionsValue) ? actionsValue[addedActionID] : undefined;
        const failureValue: unknown = request.failureData?.find((entry) => entry.key === update.key)?.value;
        if (!isRecord(addedAction) || typeof addedAction.created !== 'string' || !isRecord(failureValue)) {
            continue;
        }
        for (const field of ['lastVisibleActionCreated', 'lastReadTime'] as const) {
            if (field in failureValue && value[field] === addedAction.created) {
                value[field] = failureValue[field];
            }
        }
    }
    return {...update, value};
}

/** Restore the state before the unsent replacements, while retaining the latest upload's errors and retry data. */
function inheritOriginalRollback(
    failureData: Array<OnyxUpdate<ReplaceReceiptOnyxKey>>,
    originalUpdates: Map<string, AnyOnyxUpdate>,
    transactionKey: string,
    supersededRequests: AnyRequest[],
): Array<OnyxUpdate<ReplaceReceiptOnyxKey>> {
    if (originalUpdates.size === 0) {
        return failureData;
    }
    const originalTransactionValue: unknown = originalUpdates.get(transactionKey)?.value;
    const inheritedFailureData = failureData.map((update): OnyxUpdate<ReplaceReceiptOnyxKey> => {
        const originalUpdate = originalUpdates.get(update.key);
        if (update.key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT)) {
            return withOriginalSnapshotReceipt(originalUpdate ?? update, originalTransactionValue, transactionKey);
        }
        if (update.key.startsWith(ONYXKEYS.COLLECTION.REPORT)) {
            return inheritReportTimestamps(update, supersededRequests);
        }
        if (!originalUpdate) {
            return update;
        }
        if (update.key !== transactionKey) {
            return originalUpdate;
        }
        const originalValue: unknown = originalUpdate.value;
        if (!isRecord(originalValue) || !('receipt' in originalValue) || !isRecord(update.value)) {
            return update;
        }
        const transactionUpdate: AnyOnyxUpdate = {...update, value: {...update.value, receipt: originalValue.receipt}};
        return transactionUpdate;
    });

    // A snapshot from a search that is no longer open still needs its rollback even if the latest upload did not touch it.
    const ownKeys = new Set<string>(failureData.map((update) => update.key));
    for (const [key, originalUpdate] of originalUpdates) {
        if (!ownKeys.has(key)) {
            inheritedFailureData.push(withOriginalSnapshotReceipt(originalUpdate, originalTransactionValue, transactionKey));
        }
    }
    return inheritedFailureData;
}

function getStringField(request: AnyRequest, field: string): string | undefined {
    const value = request.data?.[field];
    return typeof value === 'string' ? value : undefined;
}

function replaceReceipt({
    transaction,
    file,
    source,
    state,
    transactionPolicy,
    transactionPolicyCategories,
    isSameReceipt,
    transactionPolicyTagList,
    transactionViolations,
    transactionReport,
    isVendorMatchingBetaEnabled,
    delegateAccountID,
    currentUserPersonalDetails,
    transactionThreadReport,
    receiptAddedReportActionID,
    receiptRemovedReportActionID,
}: ReplaceReceipt) {
    const transactionID = transaction?.transactionID;

    if (!file || !transactionID) {
        return;
    }

    const receiptTraceId = mintAndStampReceiptTraceId(file);
    logReceiptCaptured({file, captureSource: 'replace', receiptTraceId});

    // Read the waiting queue in the same tick as API.write so cleanup and rollback cover exactly the dropped uploads.
    const persistedRequests = getAllPersistedRequests();
    const supersededRequests = getSupersededReplaceReceiptIndices(persistedRequests, transactionID).flatMap((index) => persistedRequests.at(index) ?? []);
    for (const request of supersededRequests) {
        const queuedReceipt = request.data?.receipt;
        logReceiptSuperseded({
            receiptTraceId: isRecord(queuedReceipt) && typeof queuedReceipt.receiptTraceId === 'string' ? queuedReceipt.receiptTraceId : undefined,
            transactionID,
            command: request.command,
        });
    }
    const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
    const originalRollbackUpdates = getOriginalRollbackUpdates(supersededRequests);
    const originalTransactionRollback: unknown = originalRollbackUpdates.get(transactionKey)?.value;
    const hasOriginalReceiptRollback = isRecord(originalTransactionRollback) && 'receipt' in originalTransactionRollback;
    const originalReceipt = hasOriginalReceiptRollback ? originalTransactionRollback.receipt : undefined;

    // A crop of an unsent replacement is still a new receipt to the server and must retain replacement auditing.
    const isSameReceiptOnServer = !!isSameReceipt && !supersededRequests.some((request) => !request.data?.isSameReceipt);

    const oldReceipt = transaction?.receipt ?? {};
    // Replacing a failed-scan receipt whose amount was never filled in: upgrade to SCAN_READY so the UI shows "Scanning" instead of 0.00, mirroring the backend.
    // If the user already entered an amount, keep it OPEN so re-scanning does not overwrite that amount.
    const isFailedScanPlaceholder = !state && !isSameReceipt && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED && isFailedScanAmountPlaceholder(transaction);
    const receiptOptimistic = {
        source,
        localSource: null,
        state: state ?? (isFailedScanPlaceholder ? CONST.IOU.RECEIPT_STATE.SCAN_READY : CONST.IOU.RECEIPT_STATE.OPEN),
        filename: file.name,
        receiptTraceId,
        // Clear the old count while the replacement is pending.
        pageCount: null,
        // A new receipt must not keep the old one's reservation dates, or the per-night limit check would use them.
        // A crop or rotate keeps the same receipt, so its dates stay.
        ...(isSameReceiptOnServer ? {} : {hotelReservationStartDate: null, hotelReservationEndDate: null}),
    };
    const newTransaction = transaction && {...transaction, receipt: receiptOptimistic};

    // The audit action IDs are chosen before the optimistic data is built. A retry passes the same IDs back
    // so it updates the failed actions. Nothing is posted for a crop or rotate, or when the thread does not exist yet.
    const transactionThreadReportID = transactionThreadReport?.reportID;
    const optimisticReceiptAddedActionID = !isSameReceiptOnServer && transactionThreadReportID ? (receiptAddedReportActionID ?? rand64()) : undefined;
    // A receipt added offline has a file but no receipt ID yet, and that still counts as one being replaced.
    // An expense that had no receipt before these uploads must not report a removal of an unsent local file.
    const isReplacingReceipt = hasOriginalReceiptRollback
        ? isRecord(originalReceipt) && (!!originalReceipt.source || !!originalReceipt.receiptID)
        : !!transaction && (hasReceiptSource(transaction) || hasUploadedReceipt(transaction));
    const optimisticReceiptRemovedActionID = optimisticReceiptAddedActionID && isReplacingReceipt ? (receiptRemovedReportActionID ?? rand64()) : undefined;
    const retryParams: ReplaceReceiptRetryParams = {
        transactionID: transaction.transactionID,
        file: undefined,
        source,
        state,
        isSameReceipt: isSameReceiptOnServer,
        transactionPolicy,
        transactionPolicyCategories,
        transactionPolicyTagList,
        transactionViolations,
        isVendorMatchingBetaEnabled,
        receiptAddedReportActionID: optimisticReceiptAddedActionID,
        receiptRemovedReportActionID: optimisticReceiptRemovedActionID,
    };
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: receiptOptimistic,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<ReplaceReceiptOnyxKey>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                errors: getReceiptError(receiptOptimistic, file.name, undefined, undefined, CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isGroupPolicy(transactionPolicy) && newTransaction) {
        const currentTransactionViolations = transactionViolations ?? [];
        // Restarting the scan clears the stale scan-failure violation; failureData restores it on rollback.
        const optimisticTransactionViolations = isFailedScanPlaceholder
            ? currentTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.SMARTSCAN_FAILED)
            : currentTransactionViolations;
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData({
            updatedTransaction: newTransaction,
            transactionViolations: optimisticTransactionViolations,
            policy: transactionPolicy,
            policyTagList: transactionPolicyTagList ?? {},
            policyCategories: transactionPolicyCategories ?? {},
            hasDependentTags: hasDependentTags(transactionPolicy, transactionPolicyTagList ?? {}),
            isInvoiceTransaction: isInvoiceReportReportUtils(transactionReport),
            ownerLogin: undefined,
            isVendorMatchingBetaEnabled,
        });
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }
    if (currentSearchQueryJSON?.hash) {
        // Initializing as an empty typed object to allow dynamic key assignment resolves TypeScript type inference issue
        const optimisticSnapshotData: NullishDeep<SearchResultDataType> = {};
        optimisticSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {
            receipt: receiptOptimistic,
        };
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            value: {
                data: optimisticSnapshotData,
            },
        });

        // Initializing as an empty typed object to allow dynamic key assignment resolves TypeScript type inference issue
        const failureSnapshotData: NullishDeep<SearchResultDataType> = {};
        failureSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = {
            receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
        };
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            value: {
                data: failureSnapshotData,
            },
        });
    }

    const created = DateUtils.getDBTime();
    const optimisticReceiptAddedAction = optimisticReceiptAddedActionID
        ? buildOptimisticReceiptAddedAction(
              transactionThreadReportID,
              transactionID,
              currentUserPersonalDetails.accountID,
              currentUserPersonalDetails.displayName,
              currentUserPersonalDetails.avatar,
              delegateAccountID,
              created,
              optimisticReceiptAddedActionID,
          )
        : undefined;

    const optimisticReceiptRemovedAction = optimisticReceiptRemovedActionID
        ? buildOptimisticReceiptRemovedAction(
              transactionThreadReportID,
              transactionID,
              currentUserPersonalDetails.accountID,
              currentUserPersonalDetails.displayName,
              currentUserPersonalDetails.avatar,
              delegateAccountID,
              DateUtils.subtractMillisecondsFromDateTime(created, 1),
              optimisticReceiptRemovedActionID,
          )
        : undefined;

    const optimisticAuditActions = [optimisticReceiptRemovedAction, optimisticReceiptAddedAction].filter((action) => !!action);

    // Dropped uploads cannot clear their pending audit actions. Keep IDs reused by this upload's retry intact.
    const supersededAuditActionIDs = supersededRequests
        .flatMap((request) => [getStringField(request, 'reportActionID'), getStringField(request, 'receiptRemovedReportActionID')])
        .filter((reportActionID): reportActionID is string => !!reportActionID && reportActionID !== optimisticReceiptAddedActionID && reportActionID !== optimisticReceiptRemovedActionID);
    if (supersededAuditActionIDs.length > 0 && transactionThreadReportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: Object.fromEntries(supersededAuditActionIDs.map((reportActionID) => [reportActionID, null])),
        });
    }

    if (optimisticAuditActions.length > 0 && transactionThreadReportID) {
        const lastAuditAction = optimisticAuditActions.at(-1);
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: Object.fromEntries(optimisticAuditActions.map((action) => [action.reportActionID, {...action, errors: null}])),
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastVisibleActionCreated: lastAuditAction?.created,
                    lastReadTime: lastAuditAction?.created,
                },
            },
        );
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: Object.fromEntries(optimisticAuditActions.map((action) => [action.reportActionID, {pendingAction: null}])),
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: Object.fromEntries(
                    optimisticAuditActions.map((action) => [
                        action.reportActionID,
                        {
                            ...action,
                            errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                        },
                    ]),
                ),
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastVisibleActionCreated: transactionThreadReport?.lastVisibleActionCreated ?? null,
                    lastReadTime: transactionThreadReport?.lastReadTime ?? null,
                },
            },
        );
    }

    const receipt: Receipt = file;
    receipt.source = source;

    const parameters: ReplaceReceiptParams = {
        transactionID,
        receipt,
        receiptState: state,
        isSameReceipt: isSameReceiptOnServer,
        reportActionID: optimisticReceiptAddedAction?.reportActionID,
        receiptRemovedReportActionID: optimisticReceiptRemovedAction?.reportActionID,
    };

    API.write(
        WRITE_COMMANDS.REPLACE_RECEIPT,
        parameters,
        {optimisticData, successData, failureData: inheritOriginalRollback(failureData, originalRollbackUpdates, transactionKey, supersededRequests)},
        {checkAndFixConflictingRequest: (requests) => resolveReplaceReceiptConflicts(requests, transactionID)},
    );
}

function setMoneyRequestReceipt(
    transactionID: string,
    source: string,
    filename: string,
    isDraft: boolean,
    type?: string,
    isTestReceipt = false,
    isTestDriveReceipt = false,
    thumbnail?: string,
    receiptTraceId?: string,
) {
    ReceiptStorage.retain(source);
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        // isTestReceipt = false and isTestDriveReceipt = false are being converted to null because we don't really need to store it in Onyx in those cases
        // pageCount belongs to the previous file, so clear it or the new receipt inherits the old count.
        receipt: {
            source,
            filename,
            type: type ?? '',
            isTestReceipt: isTestReceipt ? true : null,
            isTestDriveReceipt: isTestDriveReceipt ? true : null,
            thumbnail,
            receiptTraceId,
            pageCount: null,
        },
    });
}

function readReceiptFile(receiptFilename: string, receiptPath: ReceiptSource, receiptType: string | undefined, onSuccess: (file: File) => void, onFailure: () => void) {
    const path = ReceiptStorage.resolve(receiptPath) ?? receiptPath.toString();
    let didFail = false;
    const markFailed = () => {
        didFail = true;
    };

    return readFileAsync(path, receiptFilename, onSuccess, markFailed, receiptType).then(() => {
        if (!didFail) {
            return;
        }

        return ReceiptStorage.recheckAfterSwap(receiptPath).then((isPresent) => (isPresent ? readFileAsync(path, receiptFilename, onSuccess, onFailure, receiptType) : onFailure()));
    });
}

// eslint-disable-next-line rulesdir/no-negated-variables
function navigateToStartStepIfScanFileCannotBeRead(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    onSuccess: (file: File) => void,
    requestType: IOURequestType,
    iouType: IOUType,
    transactionID: string,
    reportID: string,
    receiptType: string | undefined,
    onFailureCallback?: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        return;
    }

    const onFailure = () => {
        setMoneyRequestReceipt(transactionID, '', '', true, '');
        if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            if (onFailureCallback) {
                onFailureCallback();
                return;
            }
            // The base is explicit because the unreadable receipt is discarded from screens that are themselves dynamic
            // routes (the participant picker), and their query params would clash with the ones this suffix adds.
            Navigation.navigate(
                createDynamicRoute(
                    DYNAMIC_ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID),
                    ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID),
                ),
            );
            return;
        }
        navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    };
    return readReceiptFile(receiptFilename, receiptPath, receiptType, onSuccess, onFailure);
}

function checkIfLocalFileIsAccessible(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        onFailure();
        return Promise.resolve();
    }

    return readReceiptFile(receiptFilename, receiptPath, receiptType, onSuccess, onFailure);
}

function clearReceiptUploadError({
    transactionID,
    reportID,
    reportActionID,
    reportIDWithCreationError,
}: {
    transactionID: string | undefined;
    reportID: string | undefined;
    reportActionID: string | undefined;
    reportIDWithCreationError: string | undefined;
}): Promise<unknown> {
    const writes: Array<Promise<void>> = [];
    if (transactionID) {
        writes.push(Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {errors: null}));
    }
    if (reportID && reportActionID) {
        writes.push(Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {[reportActionID]: {errors: null}}));
    }
    if (reportIDWithCreationError) {
        writes.push(Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportIDWithCreationError}`, {errorFields: {addWorkspaceRoom: null, createChat: null, createReport: null}}));
    }
    return Promise.all(writes);
}

export {checkIfLocalFileIsAccessible, clearReceiptUploadError, detachReceipt, navigateToStartStepIfScanFileCannotBeRead, replaceReceipt, setMoneyRequestReceipt};
export type {ReplaceReceipt, ReplaceReceiptRetryParams};
