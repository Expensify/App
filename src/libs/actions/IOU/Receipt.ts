import * as API from '@libs/API';
import type {DetachReceiptParams, ReplaceReceiptParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import {navigateToStartMoneyRequestStep} from '@libs/IOUUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {rand64} from '@libs/NumberUtils';
import {hasDependentTags, isGroupPolicy} from '@libs/PolicyUtils';
import ReceiptStorage from '@libs/ReceiptStorage';
import {buildOptimisticReceiptAddedAction, buildOptimisticReceiptRemovedAction, isInvoiceReport as isInvoiceReportReportUtils} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {logReceiptCaptured, mintAndStampReceiptTraceId} from '@libs/telemetry/ReceiptObservability';
import {hasUploadedReceipt} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';

import type {IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
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
    file?: File;
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
                ...(transaction ?? null),
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

    // The expense report's own MANAGER_DETACH_RECEIPT action is only written by the backend when someone other
    // than the report owner detaches, or the report has been submitted, so it cannot be shown optimistically.
    // We still name it, so the action the backend may create reconciles with this ID.
    const parameters: DetachReceiptParams = {
        transactionID,
        reportActionID: rand64(),
        receiptRemovedReportActionID: optimisticReceiptRemovedAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.DETACH_RECEIPT, parameters, {optimisticData, successData, failureData});
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
}: ReplaceReceipt) {
    const transactionID = transaction?.transactionID;

    if (!file || !transactionID) {
        return;
    }

    const receiptTraceId = mintAndStampReceiptTraceId(file);
    logReceiptCaptured({file, captureSource: 'replace', receiptTraceId});

    const oldReceipt = transaction?.receipt ?? {};
    const receiptOptimistic = {
        source,
        localSource: null,
        state: state ?? CONST.IOU.RECEIPT_STATE.OPEN,
        filename: file.name,
        receiptTraceId,
        // Clear the old count while the replacement is pending.
        pageCount: null,
    };
    const newTransaction = transaction && {...transaction, receipt: receiptOptimistic};
    const retryParams: ReplaceReceiptRetryParams = {
        transactionID: transaction.transactionID,
        file: undefined,
        source,
        transactionPolicy,
        transactionPolicyCategories,
        transactionPolicyTagList,
        transactionViolations,
        isVendorMatchingBetaEnabled,
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

    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
        >
    > = [
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

    // Show the audit messages right away, but not for a crop or rotate (isSameReceipt) and only if the
    // thread already exists. Otherwise the backend creates the thread and messages and they sync in.
    // `transaction` is the expense as it was before this replacement, because the caller may merge the new
    // receipt into Onyx just before calling this, so an uploaded receipt on it is the one being replaced.
    const transactionThreadReportID = transactionThreadReport?.reportID;
    const shouldAuditReceiptChange = !isSameReceipt && !!transactionThreadReportID;
    const optimisticReceiptAddedAction = shouldAuditReceiptChange
        ? buildOptimisticReceiptAddedAction(
              transactionThreadReportID,
              transactionID,
              currentUserPersonalDetails.accountID,
              currentUserPersonalDetails.displayName,
              currentUserPersonalDetails.avatar,
              delegateAccountID,
          )
        : undefined;

    const optimisticReceiptRemovedAction =
        shouldAuditReceiptChange && hasUploadedReceipt(transaction)
            ? buildOptimisticReceiptRemovedAction(
                  transactionThreadReportID,
                  transactionID,
                  currentUserPersonalDetails.accountID,
                  currentUserPersonalDetails.displayName,
                  currentUserPersonalDetails.avatar,
                  delegateAccountID,
                  DateUtils.subtractMillisecondsFromDateTime(DateUtils.getDBTime(), 1),
              )
            : undefined;

    const optimisticAuditActions = [optimisticReceiptRemovedAction, optimisticReceiptAddedAction].filter((action) => !!action);

    if (optimisticAuditActions.length > 0 && transactionThreadReportID) {
        const lastAuditAction = optimisticAuditActions.at(-1);
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: Object.fromEntries(optimisticAuditActions.map((action) => [action.reportActionID, action])),
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
        isSameReceipt,
        reportActionID: optimisticReceiptAddedAction?.reportActionID,
        receiptRemovedReportActionID: optimisticReceiptRemovedAction?.reportActionID,
    };

    API.write(WRITE_COMMANDS.REPLACE_RECEIPT, parameters, {optimisticData, successData, failureData});
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
    readFileAsync(ReceiptStorage.resolve(receiptPath) ?? receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
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

    return readFileAsync(ReceiptStorage.resolve(receiptPath) ?? receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
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
export type {ReplaceReceiptRetryParams};
