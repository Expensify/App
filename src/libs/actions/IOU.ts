import {format} from 'date-fns';
import {fastMerge, Str} from 'expensify-common';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxInputValue, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {PartialDeep, SetRequired, ValueOf} from 'type-fest';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import * as API from '@libs/API';
import type {
    ApproveMoneyRequestParams,
    CompleteSplitBillParams,
    CreateDistanceRequestParams,
    CreateWorkspaceParams,
    DeleteMoneyRequestParams,
    DetachReceiptParams,
    EditMoneyRequestParams,
    PayInvoiceParams,
    PayMoneyRequestParams,
    ReplaceReceiptParams,
    RequestMoneyParams,
    SendInvoiceParams,
    SendMoneyParams,
    SetNameValuePairParams,
    SplitBillParams,
    StartSplitBillParams,
    SubmitReportParams,
    TrackExpenseParams,
    TransactionMergeParams,
    UnapproveExpenseReportParams,
    UpdateMoneyRequestParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import * as IOUUtils from '@libs/IOUUtils';
import * as LocalePhoneNumber from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import isSearchTopmostCentralPane from '@libs/Navigation/isSearchTopmostCentralPane';
import Navigation from '@libs/Navigation/Navigation';
import * as NextStepUtils from '@libs/NextStepUtils';
import {rand64} from '@libs/NumberUtils';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportConnection from '@libs/ReportConnection';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction, TransactionDetails} from '@libs/ReportUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as SessionUtils from '@libs/SessionUtils';
import * as SubscriptionUtils from '@libs/SubscriptionUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import {getCurrency, getTransaction} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant, Split} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Comment, Receipt, ReceiptSource, Routes, SplitShares, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CachedPDFPaths from './CachedPDFPaths';
import * as Category from './Policy/Category';
import * as Policy from './Policy/Policy';
import * as Tag from './Policy/Tag';
import * as Report from './Report';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type OneOnOneIOUReport = OnyxTypes.Report | undefined | null;

type MoneyRequestInformation = {
    payerAccountID: number;
    payerEmail: string;
    iouReport: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID: string;
    createdIOUReportActionID: string;
    reportPreviewAction: OnyxTypes.ReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
    onyxData: OnyxData;
};

type TrackExpenseInformation = {
    createdWorkspaceParams?: CreateWorkspaceParams;
    iouReport?: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID: string;
    createdIOUReportActionID?: string;
    reportPreviewAction?: OnyxTypes.ReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
    actionableWhisperReportActionIDParam?: string;
    onyxData: OnyxData;
};

type SendInvoiceInformation = {
    senderWorkspaceID: string;
    receiver: Partial<OnyxTypes.PersonalDetails>;
    invoiceRoom: OnyxTypes.Report;
    createdChatReportActionID: string;
    invoiceReportID: string;
    reportPreviewReportActionID: string;
    transactionID: string;
    transactionThreadReportID: string;
    createdIOUReportActionID: string;
    createdReportActionIDForThread: string;
    reportActionID: string;
    onyxData: OnyxData;
};

type SplitData = {
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    policyID?: string;
    createdReportActionID?: string;
    chatType?: string;
};

type SplitsAndOnyxData = {
    splitData: SplitData;
    splits: Split[];
    onyxData: OnyxData;
};

type UpdateMoneyRequestData = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData;
};

type PayMoneyRequestData = {
    params: PayMoneyRequestParams & Partial<PayInvoiceParams>;
    optimisticData: OnyxUpdate[];
    successData: OnyxUpdate[];
    failureData: OnyxUpdate[];
};

type SendMoneyParamsData = {
    params: SendMoneyParams;
    optimisticData: OnyxUpdate[];
    successData: OnyxUpdate[];
    failureData: OnyxUpdate[];
};

type GPSPoint = {
    lat: number;
    long: number;
};

let allPersonalDetails: OnyxTypes.PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

let allTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactions = {};
            return;
        }

        allTransactions = value;
    },
});

let allTransactionDrafts: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

let allTransactionViolations: NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactionViolations = {};
            return;
        }

        allTransactionViolations = value;
    },
});

let allDraftSplitTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allDraftSplitTransactions = value ?? {};
    },
});

let allNextSteps: NonNullable<OnyxCollection<OnyxTypes.ReportNextStep>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.NEXT_STEP,
    waitForCollectionCallback: true,
    callback: (value) => {
        allNextSteps = value ?? {};
    },
});

let userAccountID = -1;
let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        userAccountID = value?.accountID ?? -1;
    },
});

let currentUserPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        currentUserPersonalDetails = value?.[userAccountID] ?? undefined;
    },
});

let currentDate: OnyxEntry<string> = '';
Onyx.connect({
    key: ONYXKEYS.CURRENT_DATE,
    callback: (value) => {
        currentDate = value;
    },
});

let quickAction: OnyxEntry<OnyxTypes.QuickAction> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: (value) => {
        quickAction = value;
    },
});

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});

let activePolicyID: OnyxEntry<string>;
Onyx.connect({
    key: ONYXKEYS.NVP_ACTIVE_POLICY_ID,
    callback: (value) => (activePolicyID = value),
});

let introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
Onyx.connect({
    key: ONYXKEYS.NVP_INTRO_SELECTED,
    callback: (value) => (introSelected = value),
});

let personalDetailsList: OnyxEntry<OnyxTypes.PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (personalDetailsList = value),
});

/**
 * Find the report preview action from given chat report and iou report
 */
function getReportPreviewAction(chatReportID: string, iouReportID: string): OnyxInputValue<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> {
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {};

    // Find the report preview action from the chat report
    return (
        Object.values(reportActions).find(
            (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> =>
                reportAction && ReportActionsUtils.isReportPreviewAction(reportAction) && ReportActionsUtils.getOriginalMessage(reportAction)?.linkedReportID === iouReportID,
        ) ?? null
    );
}

/**
 * Initialize expense info
 * @param reportID to attach the transaction to
 * @param policy
 * @param isFromGlobalCreate
 * @param iouRequestType one of manual/scan/distance
 */
function initMoneyRequest(reportID: string, policy: OnyxEntry<OnyxTypes.Policy>, isFromGlobalCreate: boolean, iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL) {
    // Generate a brand new transactionID
    const newTransactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const currency = policy?.outputCurrency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;
    // Disabling this line since currentDate can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const created = currentDate || format(new Date(), 'yyyy-MM-dd');

    const currentTransaction = allTransactionDrafts?.[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`];

    // in case we have to re-init money request, but the IOU request type is the same with the old draft transaction,
    // we should keep most of the existing data by using the ONYX MERGE operation
    if (currentTransaction?.iouRequestType === iouRequestType) {
        // so, we just need to update the reportID, isFromGlobalCreate, created, currency
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
            reportID,
            isFromGlobalCreate,
            created,
            currency,
            transactionID: newTransactionID,
        });
        return;
    }

    const comment: Comment = {};

    // Add initial empty waypoints when starting a distance expense
    if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
        comment.waypoints = {
            waypoint0: {keyForList: 'start_waypoint'},
            waypoint1: {keyForList: 'stop_waypoint'},
        };
        if (!isFromGlobalCreate) {
            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID(reportID);
            comment.customUnit = {customUnitRateID};
        }
    }

    // Store the transaction in Onyx and mark it as not saved so it can be cleaned up later
    // Use set() here so that there is no way that data will be leaked between objects when it gets reset
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
        amount: 0,
        comment,
        created,
        currency,
        iouRequestType,
        reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate,
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        splitPayerAccountIDs: currentUserPersonalDetails ? [currentUserPersonalDetails.accountID] : undefined,
    });
}

function createDraftTransaction(transaction: OnyxTypes.Transaction) {
    if (!transaction) {
        return;
    }

    const newTransaction = {
        ...transaction,
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

function clearMoneyRequest(transactionID: string, skipConfirmation = false) {
    Onyx.set(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, skipConfirmation);
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

function startMoneyRequest(iouType: ValueOf<typeof CONST.IOU.TYPE>, reportID: string, requestType?: IOURequestType, skipConfirmation = false) {
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, skipConfirmation);
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.MANUAL:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
            return;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
            return;
        default:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID));
    }
}

function setMoneyRequestAmount(transactionID: string, amount: number, currency: string, shouldShowOriginalAmount = false) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, shouldShowOriginalAmount});
}

function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
}

function setMoneyRequestCurrency(transactionID: string, currency: string, isEditing = false) {
    const fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {[fieldToUpdate]: currency});
}

function setMoneyRequestDescription(transactionID: string, comment: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {comment: comment.trim()}});
}

function setMoneyRequestMerchant(transactionID: string, merchant: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant});
}

function setMoneyRequestPendingFields(transactionID: string, pendingFields: OnyxTypes.Transaction['pendingFields']) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {pendingFields});
}

function setMoneyRequestCategory(transactionID: string, category: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {category});
}

function setMoneyRequestTag(transactionID: string, tag: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {tag});
}

function setMoneyRequestBillable(transactionID: string, billable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {billable});
}

function setMoneyRequestParticipants(transactionID: string, participants: Participant[] = []) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {participants});
}

function setSplitPayer(transactionID: string, payerAccountID: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {splitPayerAccountIDs: [payerAccountID]});
}

function setMoneyRequestReceipt(transactionID: string, source: string, filename: string, isDraft: boolean, type?: string) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        receipt: {source, type: type ?? ''},
        filename,
    });
}

/**
 * Set custom unit rateID for the transaction draft
 */
function setCustomUnitRateID(transactionID: string, customUnitRateID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {customUnitRateID}}});
}

/** Set the distance rate of a new  transaction */
function setMoneyRequestDistanceRate(transactionID: string, rateID: string, policyID: string, isDraft: boolean) {
    Onyx.merge(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {[policyID]: rateID});
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {customUnit: {customUnitRateID: rateID}}});
}

/** Helper function to get the receipt error for expenses, or the generic error if there's no receipt */
function getReceiptError(receipt: OnyxEntry<Receipt>, filename?: string, isScanRequest = true, errorKey?: number): Errors | ErrorFields {
    return isEmptyObject(receipt) || !isScanRequest
        ? ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage', errorKey)
        : ErrorUtils.getMicroSecondOnyxErrorObject({error: CONST.IOU.RECEIPT_ERROR, source: receipt.source?.toString() ?? '', filename: filename ?? ''}, errorKey);
}

/** Helper function to get optimistic fields violations onyx data */
function getFieldViolationsOnyxData(iouReport: OnyxTypes.Report): SetRequired<OnyxData, 'optimisticData' | 'failureData'> {
    const missingFields: OnyxTypes.ReportFieldsViolations = {};
    const excludedFields = Object.values(CONST.REPORT_VIOLATIONS_EXCLUDED_FIELDS) as string[];

    Object.values(iouReport.fieldList ?? {}).forEach((field) => {
        if (excludedFields.includes(field.fieldID) || !!field.value || !!field.defaultValue) {
            return;
        }
        // in case of missing field violation the empty object is indicator.
        missingFields[field.fieldID] = {};
    });

    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${iouReport.reportID}`,
                value: {
                    fieldRequired: missingFields,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${iouReport.reportID}`,
                value: null,
            },
        ],
    };
}

/** Builds the Onyx data for an expense */
function buildOnyxDataForMoneyRequest(
    chatReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    iouReport: OnyxTypes.Report,
    transaction: OnyxTypes.Transaction,
    chatCreatedAction: OptimisticCreatedReportAction,
    iouCreatedAction: OptimisticCreatedReportAction,
    iouAction: OptimisticIOUReportAction,
    optimisticPersonalDetailListAction: OnyxTypes.PersonalDetailsList,
    reportPreviewAction: ReportAction,
    optimisticPolicyRecentlyUsedCategories: string[],
    optimisticPolicyRecentlyUsedTags: OnyxTypes.RecentlyUsedTags,
    isNewChatReport: boolean,
    transactionThreadReport: OptimisticChatReport | null,
    transactionThreadCreatedReportAction: OptimisticCreatedReportAction | null,
    shouldCreateNewMoneyRequestReport: boolean,
    policy?: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyCategories>,
    optimisticNextStep?: OnyxTypes.ReportNextStep | null,
    isOneOnOneSplit = false,
    existingTransactionThreadReportID?: string,
    optimisticRecentlyUsedCurrencies?: string[],
): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const isScanRequest = TransactionUtils.isScanRequest(transaction);
    const outstandingChildRequest = ReportUtils.getOutstandingChildRequest(iouReport);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS> = isScanRequest ? CONST.QUICK_ACTIONS.REQUEST_SCAN : CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    if (TransactionUtils.isDistanceRequest(transaction)) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chatReport) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastReadTime: DateUtils.getDBTime(),
                lastMessageTranslationKey: '',
                iouReportID: iouReport.reportID,
                ...outstandingChildRequest,
                ...(isNewChatReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        });
    }

    optimisticData.push(
        {
            onyxMethod: shouldCreateNewMoneyRequestReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                lastMessageText: ReportActionsUtils.getReportActionText(iouAction),
                lastMessageHtml: ReportActionsUtils.getReportActionHtml(iouAction),
                lastVisibleActionCreated: iouAction.created,
                pendingFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        isNewChatReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                  value: {
                      [chatCreatedAction.reportActionID]: chatCreatedAction,
                      [reportPreviewAction.reportActionID]: reportPreviewAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                  value: {
                      [reportPreviewAction.reportActionID]: reportPreviewAction,
                  },
              },
        shouldCreateNewMoneyRequestReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                  value: {
                      [iouCreatedAction.reportActionID]: iouCreatedAction as OnyxTypes.ReportAction,
                      [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                  value: {
                      [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                ...transactionThreadReport,
                pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            },
        },
        // Remove the temporary transaction used during the creation flow
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (!isOneOnOneSplit) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: chatReport?.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        });
    }

    if (optimisticPolicyRecentlyUsedCategories.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport.policyID}`,
            value: optimisticPolicyRecentlyUsedCategories,
        });
    }

    if (optimisticRecentlyUsedCurrencies?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: optimisticRecentlyUsedCurrencies,
        });
    }

    if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport.policyID}`,
            value: optimisticPolicyRecentlyUsedTags,
        });
    }

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(optimisticPersonalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(optimisticPersonalDetailListAction).forEach((accountIDKey) => {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    if (!isEmptyObject(optimisticNextStep)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: optimisticNextStep,
        });
    }

    if (isNewChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
                // The routes contains the distance in meters. Clearing the routes ensures we use the distance
                // in the correct unit stored under the transaction customUnit once the request is created.
                // The route is also not saved in the backend, so we can't rely on it.
                routes: null,
            },
        },

        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chatCreatedAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iouCreatedAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                iouReportID: chatReport?.iouReportID,
                lastReadTime: chatReport?.lastReadTime,
                pendingFields: null,
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
                ...(isNewChatReport
                    ? {
                          errorFields: {
                              createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                pendingFields: null,
                errorFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: existingTransactionThreadReport
                    ? null
                    : {
                          createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                      },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                // Disabling this line since transaction.filename can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest, errorKey),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iouCreatedAction.reportActionID]: {
                              // Disabling this line since transaction.filename can be an empty string
                              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                              errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest, errorKey),
                          },
                          [iouAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                          },
                      }
                    : {
                          [iouAction.reportActionID]: {
                              // Disabling this line since transaction.filename can be an empty string
                              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                              errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest, errorKey),
                          },
                      }),
            },
        },
    ];

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !PolicyUtils.isPaidGroupPolicy(policy)) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        PolicyUtils.hasDependentTags(policy, policyTagList ?? {}),
    );

    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
    }

    return [optimisticData, successData, failureData];
}

/** Builds the Onyx data for an invoice */
function buildOnyxDataForInvoice(
    chatReport: OnyxEntry<OnyxTypes.Report>,
    iouReport: OnyxTypes.Report,
    transaction: OnyxTypes.Transaction,
    chatCreatedAction: OptimisticCreatedReportAction,
    iouCreatedAction: OptimisticCreatedReportAction,
    iouAction: OptimisticIOUReportAction,
    optimisticPersonalDetailListAction: OnyxTypes.PersonalDetailsList,
    reportPreviewAction: ReportAction,
    optimisticPolicyRecentlyUsedCategories: string[],
    optimisticPolicyRecentlyUsedTags: OnyxTypes.RecentlyUsedTags,
    isNewChatReport: boolean,
    transactionThreadReport: OptimisticChatReport,
    transactionThreadCreatedReportAction: OptimisticCreatedReportAction | null,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    optimisticRecentlyUsedCurrencies?: string[],
    companyName?: string,
    companyWebsite?: string,
): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                lastMessageText: ReportActionsUtils.getReportActionText(iouAction),
                lastMessageHtml: ReportActionsUtils.getReportActionHtml(iouAction),
                pendingFields: {
                    createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        isNewChatReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                  value: {
                      [chatCreatedAction.reportActionID]: chatCreatedAction,
                      [reportPreviewAction.reportActionID]: reportPreviewAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                  value: {
                      [reportPreviewAction.reportActionID]: reportPreviewAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [iouCreatedAction.reportActionID]: iouCreatedAction as OnyxTypes.ReportAction,
                [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: transactionThreadReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID ?? '-1']: transactionThreadCreatedReportAction,
            },
        },
        // Remove the temporary transaction used during the creation flow
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    ];
    const successData: OnyxUpdate[] = [];

    if (chatReport) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastReadTime: DateUtils.getDBTime(),
                lastMessageTranslationKey: '',
                iouReportID: iouReport.reportID,
                ...(isNewChatReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        });
    }

    if (optimisticPolicyRecentlyUsedCategories.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport.policyID}`,
            value: optimisticPolicyRecentlyUsedCategories,
        });
    }

    if (optimisticRecentlyUsedCurrencies?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: optimisticRecentlyUsedCurrencies,
        });
    }

    if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport.policyID}`,
            value: optimisticPolicyRecentlyUsedTags,
        });
    }

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(optimisticPersonalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(optimisticPersonalDetailListAction).forEach((accountIDKey) => {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chatCreatedAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [iouCreatedAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID ?? '-1']: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    );

    if (isNewChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
                isOptimisticReport: false,
            },
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                iouReportID: chatReport?.iouReportID,
                lastReadTime: chatReport?.lastReadTime,
                pendingFields: null,
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
                ...(isNewChatReport
                    ? {
                          errorFields: {
                              createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                pendingFields: null,
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage'),
                pendingAction: null,
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [iouCreatedAction.reportActionID]: {
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, false, errorKey),
                },
                [iouAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID ?? '-1']: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateInvoiceFailureMessage', errorKey),
                },
            },
        },
    ];

    if (companyName && companyWebsite) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
            value: {
                invoice: {
                    companyName,
                    companyWebsite,
                    pendingFields: {
                        companyName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        companyWebsite: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
            value: {
                invoice: {
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${policy?.id}`,
            value: {
                invoice: {
                    companyName: undefined,
                    companyWebsite: undefined,
                    pendingFields: {
                        companyName: null,
                        companyWebsite: null,
                    },
                },
            },
        });
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !PolicyUtils.isPaidGroupPolicy(policy)) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        PolicyUtils.hasDependentTags(policy, policyTagList ?? {}),
    );

    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
    }

    return [optimisticData, successData, failureData];
}

/** Builds the Onyx data for track expense */
function buildOnyxDataForTrackExpense(
    chatReport: OnyxInputValue<OnyxTypes.Report>,
    iouReport: OnyxInputValue<OnyxTypes.Report>,
    transaction: OnyxTypes.Transaction,
    iouCreatedAction: OptimisticCreatedReportAction,
    iouAction: OptimisticIOUReportAction,
    reportPreviewAction: OnyxInputValue<ReportAction>,
    transactionThreadReport: OptimisticChatReport | null,
    transactionThreadCreatedReportAction: OptimisticCreatedReportAction | null,
    shouldCreateNewMoneyRequestReport: boolean,
    policy?: OnyxInputValue<OnyxTypes.Policy>,
    policyTagList?: OnyxInputValue<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxInputValue<OnyxTypes.PolicyCategories>,
    existingTransactionThreadReportID?: string,
    actionableTrackExpenseWhisper?: OnyxInputValue<OnyxTypes.ReportAction>,
): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const isScanRequest = TransactionUtils.isScanRequest(transaction);
    const isDistanceRequest = TransactionUtils.isDistanceRequest(transaction);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS> = CONST.QUICK_ACTIONS.TRACK_MANUAL;
    if (isScanRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.TRACK_SCAN;
    } else if (isDistanceRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.TRACK_DISTANCE;
    }
    const existingTransactionThreadReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chatReport) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    ...chatReport,
                    lastMessageText: ReportActionsUtils.getReportActionText(iouAction),
                    lastMessageHtml: ReportActionsUtils.getReportActionHtml(iouAction),
                    lastReadTime: DateUtils.getDBTime(),
                    iouReportID: iouReport?.reportID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                value: {
                    action: newQuickAction,
                    chatReportID: chatReport.reportID,
                    isFirstQuickAction: isEmptyObject(quickAction),
                },
            },
        );

        if (actionableTrackExpenseWhisper && !iouReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: actionableTrackExpenseWhisper,
                },
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    lastVisibleActionCreated: actionableTrackExpenseWhisper.created,
                    lastMessageText: CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                },
            });
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: {pendingAction: null, errors: null},
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {[actionableTrackExpenseWhisper.reportActionID]: {} as ReportAction},
            });
        }
    }

    if (iouReport) {
        optimisticData.push(
            {
                onyxMethod: shouldCreateNewMoneyRequestReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                value: {
                    ...iouReport,
                    lastMessageText: ReportActionsUtils.getReportActionText(iouAction),
                    lastMessageHtml: ReportActionsUtils.getReportActionHtml(iouAction),
                    pendingFields: {
                        ...(shouldCreateNewMoneyRequestReport ? {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                    },
                },
            },
            shouldCreateNewMoneyRequestReport
                ? {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                      value: {
                          [iouCreatedAction.reportActionID]: iouCreatedAction as OnyxTypes.ReportAction,
                          [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                      },
                  }
                : {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                      value: {
                          [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                      },
                  },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: reportPreviewAction}),
                },
            },
        );
    } else {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
            },
        });
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                ...transactionThreadReport,
                pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            },
        },
        // Remove the temporary transaction used during the creation flow
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (iouReport) {
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    ...(shouldCreateNewMoneyRequestReport
                        ? {
                              [iouCreatedAction.reportActionID]: {
                                  pendingAction: null,
                                  errors: null,
                              },
                          }
                        : {}),
                    [iouAction.reportActionID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: {pendingAction: null}}),
                },
            },
        );
    } else {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
                ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: {pendingAction: null}}),
            },
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
                routes: null,
            },
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction ?? null,
    });

    if (iouReport) {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                value: {
                    pendingFields: null,
                    errorFields: {
                        ...(shouldCreateNewMoneyRequestReport ? {createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                value: {
                    ...(shouldCreateNewMoneyRequestReport
                        ? {
                              [iouCreatedAction.reportActionID]: {
                                  // Disabling this line since transaction.filename can be an empty string
                                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                  errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest),
                              },
                              [iouAction.reportActionID]: {
                                  errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                              },
                          }
                        : {
                              [iouAction.reportActionID]: {
                                  // Disabling this line since transaction.filename can be an empty string
                                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                  errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest),
                              },
                          }),
                },
            },
        );
    } else {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest),
                },
            },
        });
    }

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                lastReadTime: chatReport?.lastReadTime,
                lastMessageText: chatReport?.lastMessageText,
                lastMessageHtml: chatReport?.lastMessageHtml,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: existingTransactionThreadReport
                    ? null
                    : {
                          createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                      },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                // Disabling this line since transaction.filename can be an empty string
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID ?? '-1']: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    );

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !PolicyUtils.isPaidGroupPolicy(policy)) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        PolicyUtils.hasDependentTags(policy, policyTagList ?? {}),
    );

    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
    }

    // Show field violations only for control policies
    if (PolicyUtils.isControlPolicy(policy) && iouReport) {
        const {optimisticData: fieldViolationsOptimisticData, failureData: fieldViolationsFailureData} = getFieldViolationsOnyxData(iouReport);
        optimisticData.push(...fieldViolationsOptimisticData);
        failureData.push(...fieldViolationsFailureData);
    }

    return [optimisticData, successData, failureData];
}

function getDeleteTrackExpenseInformation(
    chatReportID: string,
    transactionID: string,
    reportAction: OnyxTypes.ReportAction,
    shouldDeleteTransactionFromOnyx = true,
    isMovingTransactionFromTrackExpense = false,
    actionableWhisperReportActionID = '',
    resolution = '',
) {
    const allReports = ReportConnection.getAllReports();
    // STEP 1: Get all collections we're updating
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] ?? null;
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread and we're not moving the transaction
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted and we're not moving the transaction
    const shouldDeleteTransactionThread = !isMovingTransactionFromTrackExpense && (transactionThreadID ? (reportAction?.childVisibleActionCount ?? 0) === 0 : false);

    const shouldShowDeletedRequestMessage = !isMovingTransactionFromTrackExpense && !!transactionThreadID && !shouldDeleteTransactionThread;

    // STEP 3: Update the IOU reportAction.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: shouldShowDeletedRequestMessage ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldShowDeletedRequestMessage,
                },
            ],
            originalMessage: {
                IOUTransactionID: null,
            },
            errors: undefined,
        },
        ...(actionableWhisperReportActionID && {[actionableWhisperReportActionID]: {originalMessage: {resolution}}}),
    } as OnyxTypes.ReportActions;
    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(chatReport?.reportID ?? '-1', updatedReportAction);
    const {lastMessageText = '', lastMessageHtml = ''} = ReportActionsUtils.getLastVisibleMessage(chatReport?.reportID ?? '-1', updatedReportAction);

    // STEP 4: Build Onyx data
    const optimisticData: OnyxUpdate[] = [];

    if (shouldDeleteTransactionFromOnyx) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        });
    }

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    if (shouldDeleteTransactionThread) {
        optimisticData.push(
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

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: updatedReportAction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                lastMessageText,
                lastVisibleActionCreated: lastVisibleAction?.created,
                lastMessageHtml: !lastMessageHtml ? lastMessageText : lastMessageHtml,
            },
        },
    );

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [];

    if (shouldDeleteTransactionFromOnyx) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction ?? null,
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: transactionViolations ?? null,
    });

    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: transactionThread,
        });
    }

    if (actionableWhisperReportActionID) {
        const actionableWhisperReportAction = ReportActionsUtils.getReportAction(chatReportID, actionableWhisperReportActionID);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [actionableWhisperReportActionID]: {
                    originalMessage: {
                        resolution: ReportActionsUtils.isActionableTrackExpense(actionableWhisperReportAction)
                            ? ReportActionsUtils.getOriginalMessage(actionableWhisperReportAction)?.resolution ?? null
                            : null,
                    },
                },
            },
        });
    }
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: chatReport,
        },
    );

    const parameters: DeleteMoneyRequestParams = {
        transactionID,
        reportActionID: reportAction.reportActionID,
    };

    return {parameters, optimisticData, successData, failureData, shouldDeleteTransactionThread, chatReport};
}

/** Gathers all the data needed to create an invoice. */
function getSendInvoiceInformation(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    currentUserAccountID: number,
    invoiceChatReport?: OnyxEntry<OnyxTypes.Report>,
    receipt?: Receipt,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    companyName?: string,
    companyWebsite?: string,
): SendInvoiceInformation {
    const {amount = 0, currency = '', created = '', merchant = '', category = '', tag = '', taxCode = '', taxAmount = 0, billable, comment, participants} = transaction ?? {};
    const trimmedComment = (comment?.comment ?? '').trim();
    const senderWorkspaceID = participants?.find((participant) => participant?.isSender)?.policyID ?? '-1';
    const receiverParticipant = participants?.find((participant) => participant?.accountID) ?? invoiceChatReport?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : -1;
    let receiver = ReportUtils.getPersonalDetailsForAccountID(receiverAccountID);
    let optimisticPersonalDetailListAction = {};

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(invoiceChatReport) && invoiceChatReport?.reportID ? invoiceChatReport : null;

    if (!chatReport) {
        chatReport = ReportUtils.getInvoiceChatByParticipants(senderWorkspaceID, receiverAccountID) ?? null;
    }

    if (!chatReport) {
        isNewChatReport = true;
        chatReport = ReportUtils.buildOptimisticChatReport([receiverAccountID, currentUserAccountID], CONST.REPORT.DEFAULT_REPORT_NAME, CONST.REPORT.CHAT_TYPE.INVOICE, senderWorkspaceID);
    }

    // STEP 2: Create a new optimistic invoice report.
    const optimisticInvoiceReport = ReportUtils.buildOptimisticInvoiceReport(chatReport.reportID, senderWorkspaceID, receiverAccountID, receiver.displayName ?? '', amount, currency);

    // STEP 3: Build optimistic receipt and transaction
    const receiptObject: Receipt = {};
    let filename;
    if (receipt?.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = receipt.state ?? CONST.IOU.RECEIPT_STATE.SCANREADY;
        filename = receipt.name;
    }
    const optimisticTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        optimisticInvoiceReport.reportID,
        trimmedComment,
        created,
        '',
        '',
        merchant,
        receiptObject,
        filename,
        undefined,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
    );

    const optimisticPolicyRecentlyUsedCategories = Category.buildOptimisticPolicyRecentlyUsedCategories(optimisticInvoiceReport.policyID, category);
    const optimisticPolicyRecentlyUsedTags = Tag.buildOptimisticPolicyRecentlyUsedTags(optimisticInvoiceReport.policyID, tag);
    const optimisticRecentlyUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(currency);

    // STEP 4: Add optimistic personal details for participant
    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[receiverAccountID];
    if (shouldCreateOptimisticPersonalDetails) {
        const receiverLogin = receiverParticipant && 'login' in receiverParticipant && receiverParticipant.login ? receiverParticipant.login : '';
        receiver = {
            accountID: receiverAccountID,
            displayName: LocalePhoneNumber.formatPhoneNumber(receiverLogin),
            login: receiverLogin,
            isOptimisticPersonalDetail: true,
        };

        optimisticPersonalDetailListAction = {[receiverAccountID]: receiver};
    }

    // STEP 5: Build optimistic reportActions.
    const reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, optimisticInvoiceReport, trimmedComment, optimisticTransaction);
    optimisticInvoiceReport.parentReportActionID = reportPreviewAction.reportActionID;
    chatReport.lastVisibleActionCreated = reportPreviewAction.created;
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        ReportUtils.buildOptimisticMoneyRequestEntities(
            optimisticInvoiceReport,
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            trimmedComment,
            receiver.login ?? '',
            [receiver],
            optimisticTransaction.transactionID,
            undefined,
            false,
            false,
            false,
        );

    // STEP 6: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForInvoice(
        chatReport,
        optimisticInvoiceReport,
        optimisticTransaction,
        optimisticCreatedActionForChat,
        optimisticCreatedActionForIOUReport,
        iouAction,
        optimisticPersonalDetailListAction,
        reportPreviewAction,
        optimisticPolicyRecentlyUsedCategories,
        optimisticPolicyRecentlyUsedTags,
        isNewChatReport,
        optimisticTransactionThread,
        optimisticCreatedActionForTransactionThread,
        policy,
        policyTagList,
        policyCategories,
        optimisticRecentlyUsedCurrencies,
        companyName,
        companyWebsite,
    );

    return {
        createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1',
        reportActionID: iouAction.reportActionID,
        senderWorkspaceID,
        receiver,
        invoiceRoom: chatReport,
        createdChatReportActionID: optimisticCreatedActionForChat.reportActionID,
        invoiceReportID: optimisticInvoiceReport.reportID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        transactionID: optimisticTransaction.transactionID,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

/**
 * Gathers all the data needed to submit an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getMoneyRequestInformation(
    parentChatReport: OnyxEntry<OnyxTypes.Report>,
    participant: Participant,
    comment: string,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    receipt: Receipt | undefined,
    existingTransactionID: string | undefined,
    category: string | undefined,
    tag: string | undefined,
    taxCode: string | undefined,
    taxAmount: number | undefined,
    billable: boolean | undefined,
    policy: OnyxEntry<OnyxTypes.Policy> | undefined,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists> | undefined,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories> | undefined,
    payeeAccountID = userAccountID,
    payeeEmail = currentUserEmail,
    moneyRequestReportID = '',
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction,
): MoneyRequestInformation {
    const payerEmail = PhoneNumber.addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    const allReports = ReportConnection.getAllReports();
    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([payerAccountID, payeeAccountID]) ?? null;
    }

    // If we still don't have a report, it likely doens't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = ReportUtils.buildOptimisticChatReport([payerAccountID, payeeAccountID]);
    }

    // STEP 2: Get the Expense/IOU report. If the moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const shouldCreateNewMoneyRequestReport = ReportUtils.shouldCreateNewMoneyRequestReport(iouReport, chatReport);

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        iouReport = isPolicyExpenseChat
            ? ReportUtils.buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID ?? '-1', payeeAccountID, amount, currency)
            : ReportUtils.buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency);
    } else if (isPolicyExpenseChat) {
        iouReport = {...iouReport};
        if (iouReport?.currency === currency && typeof iouReport.total === 'number') {
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            iouReport.total -= amount;
        }
    } else {
        iouReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
    }

    // STEP 3: Build an optimistic transaction with the receipt
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let optimisticTransaction = TransactionUtils.buildOptimisticTransaction(
        ReportUtils.isExpenseReport(iouReport) ? -amount : amount,
        currency,
        iouReport.reportID,
        comment,
        created,
        '',
        '',
        merchant,
        receipt,
        '',
        existingTransactionID,
        category,
        tag,
        taxCode,
        ReportUtils.isExpenseReport(iouReport) ? -(taxAmount ?? 0) : taxAmount,
        billable,
        isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
    );

    const optimisticPolicyRecentlyUsedCategories = Category.buildOptimisticPolicyRecentlyUsedCategories(iouReport.policyID, category);
    const optimisticPolicyRecentlyUsedTags = Tag.buildOptimisticPolicyRecentlyUsedTags(iouReport.policyID, tag);
    const optimisticPolicyRecentluUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(currency);

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest) {
        optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        ReportUtils.buildOptimisticMoneyRequestEntities(
            iouReport,
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment,
            payeeEmail,
            [participant],
            optimisticTransaction.transactionID,
            undefined,
            false,
            false,
            false,
            undefined,
            linkedTrackedExpenseReportAction?.childReportID,
            linkedTrackedExpenseReportAction,
        );

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

    if (reportPreviewAction) {
        reportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;

        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: LocalePhoneNumber.formatPhoneNumber(participant.displayName || payerEmail),
                  login: participant.login,
                  isOptimisticPersonalDetail: true,
              },
          }
        : {};

    const optimisticNextStep = NextStepUtils.buildNextStep(iouReport, CONST.REPORT.STATUS_NUM.OPEN);

    // STEP 5: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForMoneyRequest(
        chatReport,
        iouReport,
        optimisticTransaction,
        optimisticCreatedActionForChat,
        optimisticCreatedActionForIOUReport,
        iouAction,
        optimisticPersonalDetailListAction,
        reportPreviewAction,
        optimisticPolicyRecentlyUsedCategories,
        optimisticPolicyRecentlyUsedTags,
        isNewChatReport,
        optimisticTransactionThread ?? {},
        optimisticCreatedActionForTransactionThread,
        shouldCreateNewMoneyRequestReport,
        policy,
        policyTagList,
        policyCategories,
        optimisticNextStep,
        undefined,
        undefined,
        optimisticPolicyRecentluUsedCurrencies,
    );

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : '-1',
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : '-1',
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread?.reportID ?? '-1',
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1',
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

/**
 * Gathers all the data needed to make an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getTrackExpenseInformation(
    parentChatReport: OnyxEntry<OnyxTypes.Report>,
    participant: Participant,
    comment: string,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    receipt: OnyxEntry<Receipt>,
    category: string | undefined,
    tag: string | undefined,
    taxCode: string | undefined,
    taxAmount: number | undefined,
    billable: boolean | undefined,
    policy: OnyxEntry<OnyxTypes.Policy> | undefined,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists> | undefined,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories> | undefined,
    payeeEmail = currentUserEmail,
    payeeAccountID = userAccountID,
    moneyRequestReportID = '',
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction,
    existingTransactionID?: string,
): TrackExpenseInformation | null {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;
    const allReports = ReportConnection.getAllReports();
    // The chatReport always exists, and we can get it from Onyx if chatReport is null.
    if (!chatReport) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    // If we still don't have a report, it likely doesn't exist, and we will early return here as it should not happen
    // Maybe later, we can build an optimistic selfDM chat.
    if (!chatReport) {
        return null;
    }

    // Check if the report is a draft
    const isDraftReport = ReportUtils.isDraftReport(chatReport?.reportID);

    let createdWorkspaceParams: CreateWorkspaceParams | undefined;

    if (isDraftReport) {
        const workspaceData = Policy.buildPolicyData(undefined, policy?.makeMeAdmin, policy?.name, policy?.id, chatReport?.reportID);
        createdWorkspaceParams = workspaceData.params;
        optimisticData.push(...workspaceData.optimisticData);
        successData.push(...workspaceData.successData);
        failureData.push(...workspaceData.failureData);
    }

    // STEP 2: If not in the self-DM flow, we need to use the expense report.
    // For this, first use the chatReport.iouReportID property. Build a new optimistic expense report if needed.
    const shouldUseMoneyReport = !!isPolicyExpenseChat;

    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    let shouldCreateNewMoneyRequestReport = false;

    if (shouldUseMoneyReport) {
        if (moneyRequestReportID) {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
        } else {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
        }

        shouldCreateNewMoneyRequestReport = ReportUtils.shouldCreateNewMoneyRequestReport(iouReport, chatReport);
        if (!iouReport || shouldCreateNewMoneyRequestReport) {
            iouReport = ReportUtils.buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID ?? '-1', payeeAccountID, amount, currency, false);
        } else {
            iouReport = {...iouReport};
            if (iouReport?.currency === currency && typeof iouReport.total === 'number' && typeof iouReport.nonReimbursableTotal === 'number') {
                // Because of the Expense reports are stored as negative values, we subtract the total from the amount
                iouReport.total -= amount;
                iouReport.nonReimbursableTotal -= amount;
            }
        }
    }

    // If shouldUseMoneyReport is true, the iouReport was defined.
    // But we'll use the `shouldUseMoneyReport && iouReport` check further instead of `shouldUseMoneyReport` to avoid TS errors.

    // STEP 3: Build optimistic receipt and transaction
    const receiptObject: Receipt = {};
    let filename;
    if (receipt?.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = receipt.state ?? CONST.IOU.RECEIPT_STATE.SCANREADY;
        filename = receipt.name;
    }
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    if (!filename) {
        filename = existingTransaction?.filename;
    }
    const isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let optimisticTransaction = TransactionUtils.buildOptimisticTransaction(
        ReportUtils.isExpenseReport(iouReport) ? -amount : amount,
        currency,
        shouldUseMoneyReport && iouReport ? iouReport.reportID : '-1',
        comment,
        created,
        '',
        '',
        merchant,
        receiptObject,
        filename,
        existingTransactionID ?? null,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
        false,
    );

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest) {
        optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the iouReport (if tracking in the Expense chat)
    // 2. IOU action for the iouReport (if tracking in the Expense chat), otherwise – for chatReport
    // 3. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 4. REPORT_PREVIEW action for the chatReport (if tracking in the Expense chat)
    const [, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] = ReportUtils.buildOptimisticMoneyRequestEntities(
        shouldUseMoneyReport && iouReport ? iouReport : chatReport,
        CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount,
        currency,
        comment,
        payeeEmail,
        [participant],
        optimisticTransaction.transactionID,
        undefined,
        false,
        false,
        false,
        !shouldUseMoneyReport,
        linkedTrackedExpenseReportAction?.childReportID,
        linkedTrackedExpenseReportAction,
    );

    let reportPreviewAction: OnyxInputValue<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> = null;
    if (shouldUseMoneyReport && iouReport) {
        reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

        if (reportPreviewAction) {
            reportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
        } else {
            reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);
            // Generated ReportPreview action is a parent report action of the iou report.
            // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
            iouReport.parentReportActionID = reportPreviewAction.reportActionID;
        }
    }

    let actionableTrackExpenseWhisper: OnyxInputValue<OnyxTypes.ReportAction> = null;
    if (!isPolicyExpenseChat) {
        actionableTrackExpenseWhisper = ReportUtils.buildOptimisticActionableTrackExpenseWhisper(iouAction, optimisticTransaction.transactionID);
    }

    // STEP 5: Build Onyx Data
    const trackExpenseOnyxData = buildOnyxDataForTrackExpense(
        chatReport,
        iouReport,
        optimisticTransaction,
        optimisticCreatedActionForIOUReport,
        iouAction,
        reportPreviewAction,
        optimisticTransactionThread ?? {},
        optimisticCreatedActionForTransactionThread,
        shouldCreateNewMoneyRequestReport,
        policy,
        policyTagList,
        policyCategories,
        undefined,
        actionableTrackExpenseWhisper,
    );

    return {
        createdWorkspaceParams,
        chatReport,
        iouReport: iouReport ?? undefined,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: '-1',
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : '-1',
        reportPreviewAction: reportPreviewAction ?? undefined,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1',
        actionableWhisperReportActionIDParam: actionableTrackExpenseWhisper?.reportActionID ?? '',
        onyxData: {
            optimisticData: optimisticData.concat(trackExpenseOnyxData[0]),
            successData: successData.concat(trackExpenseOnyxData[1]),
            failureData: failureData.concat(trackExpenseOnyxData[2]),
        },
    };
}

/**
 * Compute the diff amount when we update the transaction
 */
function calculateDiffAmount(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
): number {
    if (!iouReport) {
        return 0;
    }
    const isExpenseReport = ReportUtils.isExpenseReport(iouReport);
    const updatedCurrency = TransactionUtils.getCurrency(updatedTransaction);
    const currentCurrency = TransactionUtils.getCurrency(transaction);

    const currentAmount = TransactionUtils.getAmount(transaction, isExpenseReport);
    const updatedAmount = TransactionUtils.getAmount(updatedTransaction, isExpenseReport);

    if (updatedCurrency === iouReport?.currency && currentCurrency !== iouReport?.currency) {
        // Add the diff to the total if we change the currency from a different currency to the currency of the IOU report
        return updatedAmount;
    }
    if (updatedCurrency !== iouReport?.currency && currentCurrency === iouReport?.currency) {
        // Subtract the diff from the total if we change the currency from the currency of IOU report to a different currency
        return -updatedAmount;
    }
    if (updatedCurrency === iouReport?.currency && updatedAmount !== currentAmount) {
        // Calculate the diff between the updated amount and the current amount if we change the amount and the currency of the transaction is the currency of the report
        return updatedAmount - currentAmount;
    }

    return 0;
}

/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 * @param policyTagList
 * @param policyCategories
 * @param onlyIncludeChangedFields
 *               When 'true', then the returned params will only include the transaction details for the fields that were changed.
 *               When `false`, then the returned params will include all the transaction details, regardless of which fields were changed.
 *               This setting is necessary while the UpdateDistanceRequest API is refactored to be fully 1:1:1 in https://github.com/Expensify/App/issues/28358
 */
function getUpdateMoneyRequestParams(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    policyTagList: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyCategories>,
    onlyIncludeChangedFields: boolean,
): UpdateMoneyRequestData {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null]));
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, {[DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericEditFailureMessage')}]));

    const allReports = ReportConnection.getAllReports();
    // Step 2: Get all the collections being updated
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const isFromExpenseReport = ReportUtils.isExpenseReport(iouReport);
    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    let updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction> = transaction
        ? TransactionUtils.getUpdatedTransaction(transaction, transactionChanges, isFromExpenseReport)
        : null;
    const transactionDetails = ReportUtils.getTransactionDetails(updatedTransaction);

    if (transactionDetails?.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> | undefined = onlyIncludeChangedFields
        ? Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => Object.keys(transactionChanges).includes(key)))
        : transactionDetails;

    const params: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: iouReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        updatedTransaction = {
            ...updatedTransaction,
            ...TransactionUtils.calculateAmountForUpdatedWaypointOrRate(updatedTransaction, transactionChanges, policy, ReportUtils.isExpenseReport(iouReport)),
        };

        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction);
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && TransactionUtils.isFetchingWaypointsFromServer(transaction))) {
        params.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.reportID}`,
            value: {
                lastVisibleActionCreated: updatedReportAction.created,
                lastReadTime: updatedReportAction.created,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.reportID}`,
            value: {
                lastVisibleActionCreated: transactionThread?.lastVisibleActionCreated,
                lastReadTime: transactionThread?.lastReadTime,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {
                    ...(updatedReportAction as OnyxTypes.ReportAction),
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                },
            },
        });
    }

    // Step 4: Compute the IOU total and update the report preview message (and report header) so LHN amount owed is correct.
    const diff = calculateDiffAmount(iouReport, updatedTransaction, transaction);

    let updatedMoneyRequestReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>;
    if (!iouReport) {
        updatedMoneyRequestReport = null;
    } else if ((ReportUtils.isExpenseReport(iouReport) || ReportUtils.isInvoiceReport(iouReport)) && typeof iouReport.total === 'number') {
        // For expense report, the amount is negative, so we should subtract total from diff
        updatedMoneyRequestReport = {
            ...iouReport,
            total: iouReport.total - diff,
        };
        if (!transaction?.reimbursable && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal -= diff;
        }
    } else {
        updatedMoneyRequestReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, updatedReportAction.actorAccountID ?? -1, diff, TransactionUtils.getCurrency(transaction), false, true);
    }

    if (updatedMoneyRequestReport) {
        updatedMoneyRequestReport.cachedTotal = CurrencyUtils.convertToDisplayString(updatedMoneyRequestReport.total, transactionDetails?.currency);
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedMoneyRequestReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
            value: ReportUtils.getOutstandingChildRequest(updatedMoneyRequestReport),
        },
    );
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
        value: {pendingAction: null},
    });

    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            pendingFields,
            isLoading: hasPendingWaypoints,
            errorFields: null,
        },
    });

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: {
            lastActorAccountID: updatedReportAction.actorAccountID,
        },
    });

    if (isScanning && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [transactionThread?.parentReportActionID ?? '-1']: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport?.parentReportActionID ?? '-1']: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            },
        );
    }

    // Update recently used categories if the category is changed
    const hasModifiedCategory = 'category' in transactionChanges;
    if (hasModifiedCategory) {
        const optimisticPolicyRecentlyUsedCategories = Category.buildOptimisticPolicyRecentlyUsedCategories(iouReport?.policyID, transactionChanges.category);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used currencies if the currency is changed
    if ('currency' in transactionChanges) {
        const optimisticRecentlyUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(transactionChanges.currency);
        if (optimisticRecentlyUsedCurrencies.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
    }

    // Update recently used categories if the tag is changed
    const hasModifiedTag = 'tag' in transactionChanges;
    if (hasModifiedTag) {
        const optimisticPolicyRecentlyUsedTags = Tag.buildOptimisticPolicyRecentlyUsedTags(iouReport?.policyID, transactionChanges.tag);
        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
        },
    });

    if (iouReport) {
        // Reset the iouReport to its original state
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: iouReport,
        });
    }

    if (policy && PolicyUtils.isPaidGroupPolicy(policy) && updatedTransaction && (hasModifiedTag || hasModifiedCategory || hasModifiedDistanceRate)) {
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        optimisticData.push(
            ViolationsUtils.getViolationsOnyxData(
                updatedTransaction,
                currentTransactionViolations,
                policy,
                policyTagList ?? {},
                policyCategories ?? {},
                PolicyUtils.hasDependentTags(policy, policyTagList ?? {}),
            ),
        );
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: transactionThread,
    });

    return {
        params,
        onyxData: {optimisticData, successData, failureData},
    };
}

/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param onlyIncludeChangedFields
 *               When 'true', then the returned params will only include the transaction details for the fields that were changed.
 *               When `false`, then the returned params will include all the transaction details, regardless of which fields were changed.
 *               This setting is necessary while the UpdateDistanceRequest API is refactored to be fully 1:1:1 in https://github.com/Expensify/App/issues/28358
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 */
function getUpdateTrackExpenseParams(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    onlyIncludeChangedFields: boolean,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
): UpdateMoneyRequestData {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null]));
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, {[DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericEditFailureMessage')}]));

    const allReports = ReportConnection.getAllReports();
    // Step 2: Get all the collections being updated
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    let updatedTransaction = transaction ? TransactionUtils.getUpdatedTransaction(transaction, transactionChanges, false) : null;
    const transactionDetails = ReportUtils.getTransactionDetails(updatedTransaction);

    if (transactionDetails?.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> | undefined = onlyIncludeChangedFields
        ? Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => Object.keys(transactionChanges).includes(key)))
        : transactionDetails;

    const params: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: chatReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        updatedTransaction = {
            ...updatedTransaction,
            ...TransactionUtils.calculateAmountForUpdatedWaypointOrRate(transaction, transactionChanges, policy, false),
        };

        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, false, policy);
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && TransactionUtils.isFetchingWaypointsFromServer(transaction))) {
        params.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {
                    ...(updatedReportAction as OnyxTypes.ReportAction),
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                },
            },
        });
    }

    // Step 4: Update the report preview message (and report header) so LHN amount tracked is correct.
    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            pendingFields,
            isLoading: hasPendingWaypoints,
            errorFields: null,
        },
    });

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: {
            lastActorAccountID: updatedReportAction.actorAccountID,
        },
    });

    if (isScanning && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [transactionThread?.parentReportActionID ?? '-1']: {
                    originalMessage: {
                        whisperedTo: [],
                    },
                },
            },
        });
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
        },
    });

    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: transactionThread,
    });

    return {
        params,
        onyxData: {optimisticData, successData, failureData},
    };
}

/** Updates the created date of an expense */
function updateMoneyRequestDate(
    transactionID: string,
    transactionThreadReportID: string,
    value: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        created: value,
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, params, onyxData);
}

/** Updates the billable field of an expense */
function updateMoneyRequestBillable(
    transactionID: string,
    transactionThreadReportID: string,
    value: boolean,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        billable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, params, onyxData);
}

/** Updates the merchant field of an expense */
function updateMoneyRequestMerchant(
    transactionID: string,
    transactionThreadReportID: string,
    value: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        merchant: value,
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, params, onyxData);
}

/** Updates the tag of an expense */
function updateMoneyRequestTag(
    transactionID: string,
    transactionThreadReportID: string,
    tag: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        tag,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, params, onyxData);
}

/** Updates the created tax amount of an expense */
function updateMoneyRequestTaxAmount(
    transactionID: string,
    optimisticReportActionID: string,
    taxAmount: number,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges = {
        taxAmount,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, optimisticReportActionID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write('UpdateMoneyRequestTaxAmount', params, onyxData);
}

type UpdateMoneyRequestTaxRateParams = {
    transactionID: string;
    optimisticReportActionID: string;
    taxCode: string;
    taxAmount: number;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
};

/** Updates the created tax rate of an expense */
function updateMoneyRequestTaxRate({transactionID, optimisticReportActionID, taxCode, taxAmount, policy, policyTagList, policyCategories}: UpdateMoneyRequestTaxRateParams) {
    const transactionChanges = {
        taxCode,
        taxAmount,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, optimisticReportActionID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write('UpdateMoneyRequestTaxRate', params, onyxData);
}

type UpdateMoneyRequestDistanceParams = {
    transactionID: string;
    transactionThreadReportID: string;
    waypoints: WaypointCollection;
    routes?: Routes;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
};

/** Updates the waypoints of a distance expense */
function updateMoneyRequestDistance({
    transactionID,
    transactionThreadReportID,
    waypoints,
    routes = undefined,
    policy = {} as OnyxTypes.Policy,
    policyTagList = {},
    policyCategories = {},
}: UpdateMoneyRequestDistanceParams) {
    const transactionChanges: TransactionChanges = {
        waypoints,
        routes,
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE, params, onyxData);
}

/** Updates the category of an expense */
function updateMoneyRequestCategory(
    transactionID: string,
    transactionThreadReportID: string,
    category: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        category,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, params, onyxData);
}

/** Updates the description of an expense */
function updateMoneyRequestDescription(
    transactionID: string,
    transactionThreadReportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        comment,
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, params, onyxData);
}

/** Updates the distance rate of an expense */
function updateMoneyRequestDistanceRate(
    transactionID: string,
    transactionThreadReportID: string,
    rateID: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
    updatedTaxAmount?: number,
    updatedTaxCode?: string,
) {
    const transactionChanges: TransactionChanges = {
        customUnitRateID: rateID,
        ...(typeof updatedTaxAmount === 'number' ? {taxAmount: updatedTaxAmount} : {}),
        ...(updatedTaxCode ? {taxCode: updatedTaxCode} : {}),
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    // `taxAmount` & `taxCode` only needs to be updated in the optimistic data, so we need to remove them from the params
    const {taxAmount, taxCode, ...paramsWithoutTaxUpdated} = params;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, paramsWithoutTaxUpdated, onyxData);
}

/** Edits an existing distance expense */
function updateDistanceRequest(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.Policy,
    policyTagList: OnyxTypes.PolicyTagLists,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, false);
    API.write(WRITE_COMMANDS.UPDATE_DISTANCE_REQUEST, params, onyxData);
}

const getConvertTrackedExpenseInformation = (
    transactionID: string,
    actionableWhisperReportActionID: string,
    moneyRequestReportID: string,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string,
    resolution: IOUAction,
) => {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // Delete the transaction from the track expense report
    const {
        optimisticData: deleteOptimisticData,
        successData: deleteSuccessData,
        failureData: deleteFailureData,
    } = getDeleteTrackExpenseInformation(linkedTrackedExpenseReportID, transactionID, linkedTrackedExpenseReportAction, false, true, actionableWhisperReportActionID, resolution);

    optimisticData?.push(...deleteOptimisticData);
    successData?.push(...deleteSuccessData);
    failureData?.push(...deleteFailureData);

    // Build modified expense report action with the transaction changes
    const modifiedExpenseReportAction = ReportUtils.buildOptimisticMovedTrackedExpenseModifiedReportAction(transactionThreadReportID, moneyRequestReportID);

    optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: modifiedExpenseReportAction as OnyxTypes.ReportAction,
        },
    });
    successData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: {pendingAction: null},
        },
    });
    failureData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: {
                ...(modifiedExpenseReportAction as OnyxTypes.ReportAction),
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
            },
        },
    });

    return {optimisticData, successData, failureData, modifiedExpenseReportActionID: modifiedExpenseReportAction.reportActionID};
};

function convertTrackedExpenseToRequest(
    payerAccountID: number,
    payerEmail: string,
    chatReportID: string,
    transactionID: string,
    actionableWhisperReportActionID: string,
    createdChatReportActionID: string,
    moneyRequestReportID: string,
    moneyRequestCreatedReportActionID: string,
    moneyRequestPreviewReportActionID: string,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string,
    reportPreviewReportActionID: string,
    onyxData: OnyxData,
    amount: number,
    currency: string,
    comment: string,
    merchant: string,
    created: string,
    receipt?: Receipt,
) {
    const {optimisticData, successData, failureData} = onyxData;

    const {
        optimisticData: moveTransactionOptimisticData,
        successData: moveTransactionSuccessData,
        failureData: moveTransactionFailureData,
        modifiedExpenseReportActionID,
    } = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SUBMIT,
    );

    optimisticData?.push(...moveTransactionOptimisticData);
    successData?.push(...moveTransactionSuccessData);
    failureData?.push(...moveTransactionFailureData);

    const parameters = {
        amount,
        currency,
        comment,
        created,
        merchant,
        receipt,
        payerAccountID,
        payerEmail,
        chatReportID,
        transactionID,
        actionableWhisperReportActionID,
        createdChatReportActionID,
        moneyRequestReportID,
        moneyRequestCreatedReportActionID,
        moneyRequestPreviewReportActionID,
        transactionThreadReportID,
        modifiedExpenseReportActionID,
        reportPreviewReportActionID,
    };
    API.write(WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, parameters, {optimisticData, successData, failureData});
}

function categorizeTrackedExpense(
    policyID: string,
    transactionID: string,
    moneyRequestPreviewReportActionID: string,
    moneyRequestReportID: string,
    moneyRequestCreatedReportActionID: string,
    actionableWhisperReportActionID: string,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string,
    reportPreviewReportActionID: string,
    onyxData: OnyxData | undefined,
    amount: number,
    currency: string,
    comment: string,
    merchant: string,
    created: string,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    receipt?: Receipt,
    createdWorkspaceParams?: CreateWorkspaceParams,
) {
    const {optimisticData, successData, failureData} = onyxData ?? {};

    const {
        optimisticData: moveTransactionOptimisticData,
        successData: moveTransactionSuccessData,
        failureData: moveTransactionFailureData,
        modifiedExpenseReportActionID,
    } = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.CATEGORIZE,
    );

    optimisticData?.push(...moveTransactionOptimisticData);
    successData?.push(...moveTransactionSuccessData);
    failureData?.push(...moveTransactionFailureData);

    const parameters = {
        policyID,
        transactionID,
        moneyRequestPreviewReportActionID,
        moneyRequestReportID,
        moneyRequestCreatedReportActionID,
        actionableWhisperReportActionID,
        modifiedExpenseReportActionID,
        reportPreviewReportActionID,
        amount,
        currency,
        comment,
        merchant,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        created,
        receipt,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        announceChatReportID: createdWorkspaceParams?.announceChatReportID,
        announceCreatedReportActionID: createdWorkspaceParams?.announceCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
    };

    API.write(WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});
}

function shareTrackedExpense(
    policyID: string,
    transactionID: string,
    moneyRequestPreviewReportActionID: string,
    moneyRequestReportID: string,
    moneyRequestCreatedReportActionID: string,
    actionableWhisperReportActionID: string,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string,
    reportPreviewReportActionID: string,
    onyxData: OnyxData | undefined,
    amount: number,
    currency: string,
    comment: string,
    merchant: string,
    created: string,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    receipt?: Receipt,
    createdWorkspaceParams?: CreateWorkspaceParams,
) {
    const {optimisticData, successData, failureData} = onyxData ?? {};

    const {
        optimisticData: moveTransactionOptimisticData,
        successData: moveTransactionSuccessData,
        failureData: moveTransactionFailureData,
        modifiedExpenseReportActionID,
    } = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SHARE,
    );

    optimisticData?.push(...moveTransactionOptimisticData);
    successData?.push(...moveTransactionSuccessData);
    failureData?.push(...moveTransactionFailureData);

    const parameters = {
        policyID,
        transactionID,
        moneyRequestPreviewReportActionID,
        moneyRequestReportID,
        moneyRequestCreatedReportActionID,
        actionableWhisperReportActionID,
        modifiedExpenseReportActionID,
        reportPreviewReportActionID,
        amount,
        currency,
        comment,
        merchant,
        created,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        receipt,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        announceChatReportID: createdWorkspaceParams?.announceChatReportID,
        announceCreatedReportActionID: createdWorkspaceParams?.announceCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
    };

    API.write(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});
}

/**
 * Submit expense to another user
 */
function requestMoney(
    report: OnyxEntry<OnyxTypes.Report>,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    payeeEmail: string | undefined,
    payeeAccountID: number,
    participant: Participant,
    comment: string,
    receipt: Receipt | undefined,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    gpsPoints?: GPSPoint,
    action?: IOUAction,
    actionableWhisperReportActionID?: string,
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID?: string,
    reimbursible?: boolean,
) {
    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? ReportUtils.getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = IOUUtils.isMovingTransactionFromTrackExpense(action);

    const {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        onyxData,
    } = getMoneyRequestInformation(
        isMovingTransactionFromTrackExpense ? undefined : currentChatReport,
        participant,
        comment,
        amount,
        currency,
        created,
        merchant,
        receipt,
        isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && ReportActionsUtils.isMoneyRequestAction(linkedTrackedExpenseReportAction)
            ? ReportActionsUtils.getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID
            : undefined,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        policy,
        policyTagList,
        policyCategories,
        payeeAccountID,
        payeeEmail,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
    );
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport.reportID;

    switch (action) {
        case CONST.IOU.ACTION.SUBMIT: {
            if (!linkedTrackedExpenseReportAction || !actionableWhisperReportActionID || !linkedTrackedExpenseReportID) {
                return;
            }

            convertTrackedExpenseToRequest(
                payerAccountID,
                payerEmail,
                chatReport.reportID,
                transaction.transactionID,
                actionableWhisperReportActionID,
                createdChatReportActionID,
                iouReport.reportID,
                createdIOUReportActionID,
                iouAction.reportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID,
                reportPreviewAction.reportActionID,
                onyxData,
                amount,
                currency,
                comment,
                merchant,
                created,
                receipt,
            );
            break;
        }
        default: {
            const parameters: RequestMoneyParams = {
                debtorEmail: payerEmail,
                debtorAccountID: payerAccountID,
                amount,
                currency,
                comment,
                created,
                merchant,
                iouReportID: iouReport.reportID,
                chatReportID: chatReport.reportID,
                transactionID: transaction.transactionID,
                reportActionID: iouAction.reportActionID,
                createdChatReportActionID,
                createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction.reportActionID,
                receipt,
                receiptState: receipt?.state,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                reimbursible,
            };

            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(WRITE_COMMANDS.REQUEST_MONEY, parameters, onyxData);
        }
    }

    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : activeReportID);
    if (activeReportID) {
        Report.notifyNewAction(activeReportID, payeeAccountID);
    }
}

function sendInvoice(
    currentUserAccountID: number,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    invoiceChatReport?: OnyxEntry<OnyxTypes.Report>,
    receiptFile?: Receipt,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    companyName?: string,
    companyWebsite?: string,
) {
    const {
        senderWorkspaceID,
        receiver,
        invoiceRoom,
        createdChatReportActionID,
        invoiceReportID,
        reportPreviewReportActionID,
        transactionID,
        transactionThreadReportID,
        createdIOUReportActionID,
        createdReportActionIDForThread,
        reportActionID,
        onyxData,
    } = getSendInvoiceInformation(transaction, currentUserAccountID, invoiceChatReport, receiptFile, policy, policyTagList, policyCategories, companyName, companyWebsite);

    const parameters: SendInvoiceParams = {
        createdIOUReportActionID,
        createdReportActionIDForThread,
        reportActionID,
        senderWorkspaceID,
        accountID: currentUserAccountID,
        amount: transaction?.amount ?? 0,
        currency: transaction?.currency ?? '',
        comment: transaction?.comment?.comment?.trim() ?? '',
        merchant: transaction?.merchant ?? '',
        category: transaction?.category,
        date: transaction?.created ?? '',
        invoiceRoomReportID: invoiceRoom.reportID,
        createdChatReportActionID,
        invoiceReportID,
        reportPreviewReportActionID,
        transactionID,
        transactionThreadReportID,
        companyName,
        companyWebsite,
        ...(invoiceChatReport?.reportID ? {receiverInvoiceRoomID: invoiceChatReport.reportID} : {receiverEmail: receiver.login ?? ''}),
    };

    API.write(WRITE_COMMANDS.SEND_INVOICE, parameters, onyxData);

    if (isSearchTopmostCentralPane()) {
        Navigation.dismissModal();
    } else {
        Navigation.dismissModalWithReport(invoiceRoom);
    }

    Report.notifyNewAction(invoiceRoom.reportID, receiver.accountID);
}

/**
 * Track an expense
 */
function trackExpense(
    report: OnyxTypes.Report,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    payeeEmail: string | undefined,
    payeeAccountID: number,
    participant: Participant,
    comment: string,
    receipt?: Receipt,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    gpsPoints?: GPSPoint,
    validWaypoints?: WaypointCollection,
    action?: IOUAction,
    actionableWhisperReportActionID?: string,
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID?: string,
    customUnitRateID?: string,
) {
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? ReportUtils.getReportOrDraftReport(report.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report.reportID : '';
    const isMovingTransactionFromTrackExpense = IOUUtils.isMovingTransactionFromTrackExpense(action);

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const trackedReceipt = validWaypoints ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN} : receipt;

    const {
        createdWorkspaceParams,
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        actionableWhisperReportActionIDParam,
        onyxData,
    } =
        getTrackExpenseInformation(
            currentChatReport,
            participant,
            comment,
            amount,
            currency,
            created,
            merchant,
            trackedReceipt,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            policy,
            policyTagList,
            policyCategories,
            payeeEmail,
            payeeAccountID,
            moneyRequestReportID,
            linkedTrackedExpenseReportAction,
            isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && ReportActionsUtils.isMoneyRequestAction(linkedTrackedExpenseReportAction)
                ? ReportActionsUtils.getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID
                : undefined,
        ) ?? {};
    const activeReportID = isMoneyRequestReport ? report.reportID : chatReport?.reportID;

    switch (action) {
        case CONST.IOU.ACTION.CATEGORIZE: {
            if (!linkedTrackedExpenseReportAction || !actionableWhisperReportActionID || !linkedTrackedExpenseReportID) {
                return;
            }
            categorizeTrackedExpense(
                chatReport?.policyID ?? '-1',
                transaction?.transactionID ?? '-1',
                iouAction?.reportActionID ?? '-1',
                iouReport?.reportID ?? '-1',
                createdIOUReportActionID ?? '-1',
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID ?? '-1',
                reportPreviewAction?.reportActionID ?? '-1',
                onyxData,
                amount,
                currency,
                comment,
                merchant,
                created,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                trackedReceipt,
                createdWorkspaceParams,
            );
            break;
        }
        case CONST.IOU.ACTION.SHARE: {
            if (!linkedTrackedExpenseReportAction || !actionableWhisperReportActionID || !linkedTrackedExpenseReportID) {
                return;
            }
            shareTrackedExpense(
                chatReport?.policyID ?? '-1',
                transaction?.transactionID ?? '-1',
                iouAction?.reportActionID ?? '-1',
                iouReport?.reportID ?? '-1',
                createdIOUReportActionID ?? '-1',
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID ?? '-1',
                reportPreviewAction?.reportActionID ?? '-1',
                onyxData,
                amount,
                currency,
                comment,
                merchant,
                created,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                trackedReceipt,
                createdWorkspaceParams,
            );
            break;
        }
        default: {
            const parameters: TrackExpenseParams = {
                amount,
                currency,
                comment,
                created,
                merchant,
                iouReportID: iouReport?.reportID,
                chatReportID: chatReport?.reportID ?? '-1',
                transactionID: transaction?.transactionID ?? '-1',
                reportActionID: iouAction?.reportActionID ?? '-1',
                createdChatReportActionID: createdChatReportActionID ?? '-1',
                createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                receipt: trackedReceipt,
                receiptState: trackedReceipt?.state,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
                transactionThreadReportID: transactionThreadReportID ?? '-1',
                createdReportActionIDForThread: createdReportActionIDForThread ?? '-1',
                waypoints: validWaypoints ? JSON.stringify(validWaypoints) : undefined,
                customUnitRateID,
            };
            if (actionableWhisperReportActionIDParam) {
                parameters.actionableWhisperReportActionID = actionableWhisperReportActionIDParam;
            }
            API.write(WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
        }
    }
    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : activeReportID);

    if (action === CONST.IOU.ACTION.SHARE) {
        Navigation.setNavigationActionToMicrotaskQueue(() => Navigation.navigate(ROUTES.ROOM_INVITE.getRoute(activeReportID ?? '-1', CONST.IOU.SHARE.ROLE.ACCOUNTANT)));
    }

    Report.notifyNewAction(activeReportID ?? '', payeeAccountID);
}

function getOrCreateOptimisticSplitChatReport(existingSplitChatReportID: string, participants: Participant[], participantAccountIDs: number[], currentUserAccountID: number) {
    // The existing chat report could be passed as reportID or exist on the sole "participant" (in this case a report option)
    const existingChatReportID = existingSplitChatReportID || participants[0].reportID;

    // Check if the report is available locally if we do have one
    let existingSplitChatReport = existingChatReportID ? ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${existingChatReportID}`] : null;

    const allParticipantsAccountIDs = [...participantAccountIDs, currentUserAccountID];
    if (!existingSplitChatReport) {
        existingSplitChatReport = ReportUtils.getChatByParticipants(allParticipantsAccountIDs, undefined, participantAccountIDs.length > 1);
    }

    // We found an existing chat report we are done...
    if (existingSplitChatReport) {
        // Yes, these are the same, but give the caller a way to identify if we created a new report or not
        return {existingSplitChatReport, splitChatReport: existingSplitChatReport};
    }

    // Create a Group Chat if we have multiple participants
    if (participants.length > 1) {
        const splitChatReport = ReportUtils.buildOptimisticChatReport(
            allParticipantsAccountIDs,
            '',
            CONST.REPORT.CHAT_TYPE.GROUP,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        );
        return {existingSplitChatReport: null, splitChatReport};
    }

    // Otherwise, create a new 1:1 chat report
    const splitChatReport = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    return {existingSplitChatReport: null, splitChatReport};
}

/**
 * Build the Onyx data and IOU split necessary for splitting a bill with 3+ users.
 * 1. Build the optimistic Onyx data for the group chat, i.e. chatReport and iouReportAction creating the former if it doesn't yet exist.
 * 2. Loop over the group chat participant list, building optimistic or updating existing chatReports, iouReports and iouReportActions between the user and each participant.
 * We build both Onyx data and the IOU split that is sent as a request param and is used by Auth to create the chatReports, iouReports and iouReportActions in the database.
 * The IOU split has the following shape:
 *  [
 *      {email: 'currentUser', amount: 100},
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230'}
 *  ]
 * @param amount - always in the smallest unit of the currency
 * @param existingSplitChatReportID - the report ID where the split expense happens, could be a group chat or a workspace chat
 */
function createSplitsAndOnyxData(
    participants: Participant[],
    currentUserLogin: string,
    currentUserAccountID: number,
    amount: number,
    comment: string,
    currency: string,
    merchant: string,
    created: string,
    category: string,
    tag: string,
    splitShares: SplitShares = {},
    existingSplitChatReportID = '',
    billable = false,
    iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
    taxCode = '',
    taxAmount = 0,
): SplitsAndOnyxData {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));

    const {splitChatReport, existingSplitChatReport} = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const receipt: Receipt | undefined = iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN} : undefined;

    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let splitTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        CONST.REPORT.SPLIT_REPORTID,
        comment,
        created,
        '',
        '',
        merchant || Localize.translateLocal('iou.expense'),
        receipt,
        undefined,
        undefined,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
    );

    // Important data is set on the draft distance transaction, such as the iouRequestType marking it as a distance request, so merge it into the optimistic split transaction
    if (isDistanceRequest) {
        splitTransaction = fastMerge(existingTransaction, splitTransaction, false);
    }

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmailForIOUSplit);
    const splitIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount,
        currency,
        comment,
        participants,
        splitTransaction.transactionID,
        undefined,
        '',
        false,
        false,
        isOwnPolicyExpenseChat,
    );

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = ReportActionsUtils.getReportActionText(splitIOUReportAction);
    splitChatReport.lastMessageHtml = ReportActionsUtils.getReportActionHtml(splitIOUReportAction);
    splitChatReport.lastActorAccountID = currentUserAccountID;
    splitChatReport.lastVisibleActionCreated = splitIOUReportAction.created;

    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: splitChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? CONST.QUICK_ACTIONS.SPLIT_DISTANCE : CONST.QUICK_ACTIONS.SPLIT_MANUAL,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitCreatedReportAction.reportActionID]: splitCreatedReportAction as OnyxTypes.ReportAction,
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: splitTransaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    ];
    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null, pendingFields: null},
        },
    ];

    const redundantParticipants: Record<number, null> = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}, participants: redundantParticipants},
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: null,
            },
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    } else {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const currentUserAmount = splitShares?.[currentUserAccountID]?.amount ?? IOUUtils.calculateAmount(participants.length, amount, currency, true);
    const currentUserTaxAmount = IOUUtils.calculateAmount(participants.length, taxAmount, currency, true);

    const splits: Split[] = [{email: currentUserEmailForIOUSplit, accountID: currentUserAccountID, amount: currentUserAmount, taxAmount: currentUserTaxAmount}];

    const hasMultipleParticipants = participants.length > 1;
    participants.forEach((participant) => {
        // In a case when a participant is a workspace, even when a current user is not an owner of the workspace
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(participant);
        const splitAmount = splitShares?.[participant.accountID ?? -1]?.amount ?? IOUUtils.calculateAmount(participants.length, amount, currency, false);
        const splitTaxAmount = IOUUtils.calculateAmount(participants.length, taxAmount, currency, false);

        // To exclude someone from a split, the amount can be 0. The scenario for this is when creating a split from a group chat, we have remove the option to deselect users to exclude them.
        // We can input '0' next to someone we want to exclude.
        if (splitAmount === 0) {
            return;
        }

        // In case the participant is a workspace, email & accountID should remain undefined and won't be used in the rest of this code
        // participant.login is undefined when the request is initiated from a group DM with an unknown user, so we need to add a default
        const email = isOwnPolicyExpenseChat || isPolicyExpenseChat ? '' : PhoneNumber.addSMSDomainIfPhoneNumber(participant.login ?? '').toLowerCase();
        const accountID = isOwnPolicyExpenseChat || isPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmailForIOUSplit) {
            return;
        }

        // STEP 1: Get existing chat report OR build a new optimistic one
        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        let oneOnOneChatReport: OnyxTypes.Report | OptimisticChatReport;
        let isNewOneOnOneChatReport = false;
        let shouldCreateOptimisticPersonalDetails = false;
        const personalDetailExists = accountID in allPersonalDetails;

        // If this is a split between two people only and the function
        // wasn't provided with an existing group chat report id
        // or, if the split is being made from the workspace chat, then the oneOnOneChatReport is the same as the splitChatReport
        // in this case existingSplitChatReport will belong to the policy expense chat and we won't be
        // entering code that creates optimistic personal details
        if ((!hasMultipleParticipants && !existingSplitChatReportID) || isOwnPolicyExpenseChat) {
            oneOnOneChatReport = splitChatReport;
            shouldCreateOptimisticPersonalDetails = !existingSplitChatReport && !personalDetailExists;
        } else {
            const existingChatReport = ReportUtils.getChatByParticipants([accountID, currentUserAccountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport && !personalDetailExists;
            oneOnOneChatReport = existingChatReport ?? ReportUtils.buildOptimisticChatReport([accountID, currentUserAccountID]);
        }

        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport.iouReportID
            ? ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`]
            : null;
        const shouldCreateNewOneOnOneIOUReport = ReportUtils.shouldCreateNewMoneyRequestReport(oneOnOneIOUReport, oneOnOneChatReport);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isOwnPolicyExpenseChat
                ? ReportUtils.buildOptimisticExpenseReport(oneOnOneChatReport.reportID, oneOnOneChatReport.policyID ?? '-1', currentUserAccountID, splitAmount, currency)
                : ReportUtils.buildOptimisticIOUReport(currentUserAccountID, accountID, splitAmount, oneOnOneChatReport.reportID, currency);
        } else if (isOwnPolicyExpenseChat) {
            if (typeof oneOnOneIOUReport?.total === 'number') {
                // Because of the Expense reports are stored as negative values, we subtract the total from the amount
                oneOnOneIOUReport.total -= splitAmount;
            }
        } else {
            oneOnOneIOUReport = IOUUtils.updateIOUOwnerAndTotal(oneOnOneIOUReport, currentUserAccountID, splitAmount, currency);
        }

        // STEP 3: Build optimistic transaction
        const oneOnOneTransaction = TransactionUtils.buildOptimisticTransaction(
            ReportUtils.isExpenseReport(oneOnOneIOUReport) ? -splitAmount : splitAmount,
            currency,
            oneOnOneIOUReport.reportID,
            comment,
            created,
            CONST.IOU.TYPE.SPLIT,
            splitTransaction.transactionID,
            merchant || Localize.translateLocal('iou.expense'),
            undefined,
            undefined,
            undefined,
            category,
            tag,
            taxCode,
            ReportUtils.isExpenseReport(oneOnOneIOUReport) ? -splitTaxAmount : splitTaxAmount,
            billable,
        );

        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. Transaction Thread and the CREATED action for it
        // 5. REPORT_PREVIEW action for the chatReport
        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            ReportUtils.buildOptimisticMoneyRequestEntities(
                oneOnOneIOUReport,
                CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                splitAmount,
                currency,
                comment,
                currentUserEmailForIOUSplit,
                [participant],
                oneOnOneTransaction.transactionID,
            );

        // Add optimistic personal details for new participants
        const oneOnOnePersonalDetailListAction: OnyxTypes.PersonalDetailsList = shouldCreateOptimisticPersonalDetails
            ? {
                  [accountID]: {
                      accountID,
                      // Disabling this line since participant.displayName can be an empty string
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      displayName: LocalePhoneNumber.formatPhoneNumber(participant.displayName || email),
                      login: participant.login,
                      isOptimisticPersonalDetail: true,
                  },
              }
            : {};

        if (shouldCreateOptimisticPersonalDetails) {
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }

        let oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = ReportUtils.updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = ReportUtils.buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport);
        }

        // Add category to optimistic policy recently used categories when a participant is a workspace
        const optimisticPolicyRecentlyUsedCategories = isPolicyExpenseChat ? Category.buildOptimisticPolicyRecentlyUsedCategories(participant.policyID, category) : [];

        const optimisticRecentlyUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(currency);

        // Add tag to optimistic policy recently used tags when a participant is a workspace
        const optimisticPolicyRecentlyUsedTags = isPolicyExpenseChat ? Tag.buildOptimisticPolicyRecentlyUsedTags(participant.policyID, tag) : {};

        // STEP 5: Build Onyx Data
        const [oneOnOneOptimisticData, oneOnOneSuccessData, oneOnOneFailureData] = buildOnyxDataForMoneyRequest(
            oneOnOneChatReport,
            oneOnOneIOUReport,
            oneOnOneTransaction,
            oneOnOneCreatedActionForChat,
            oneOnOneCreatedActionForIOU,
            oneOnOneIOUAction,
            oneOnOnePersonalDetailListAction,
            oneOnOneReportPreviewAction,
            optimisticPolicyRecentlyUsedCategories,
            optimisticPolicyRecentlyUsedTags,
            isNewOneOnOneChatReport,
            optimisticTransactionThread,
            optimisticCreatedActionForTransactionThread,
            shouldCreateNewOneOnOneIOUReport,
            null,
            null,
            null,
            null,
            true,
            undefined,
            optimisticRecentlyUsedCurrencies,
        );

        const individualSplit = {
            email,
            accountID,
            isOptimisticAccount: ReportUtils.isOptimisticPersonalDetail(accountID),
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
            taxAmount: splitTaxAmount,
        };

        splits.push(individualSplit);
        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
    });

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
        value: {
            comment: {
                splits: splits.map((split) => ({accountID: split.accountID, amount: split.amount})),
            },
        },
    });

    const splitData: SplitData = {
        chatReportID: splitChatReport.reportID,
        transactionID: splitTransaction.transactionID,
        reportActionID: splitIOUReportAction.reportActionID,
        policyID: splitChatReport.policyID,
        chatType: splitChatReport.chatType,
    };

    if (!existingSplitChatReport) {
        splitData.createdReportActionID = splitCreatedReportAction.reportActionID;
    }

    return {
        splitData,
        splits,
        onyxData: {optimisticData, successData, failureData},
    };
}

type SplitBillActionsParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    amount: number;
    comment: string;
    currency: string;
    merchant: string;
    created: string;
    category?: string;
    tag?: string;
    billable?: boolean;
    iouRequestType?: IOURequestType;
    existingSplitChatReportID?: string;
    splitShares?: SplitShares;
    splitPayerAccountIDs?: number[];
    taxCode?: string;
    taxAmount?: number;
};

/**
 * @param amount - always in smallest currency unit
 * @param existingSplitChatReportID - Either a group DM or a workspace chat
 */
function splitBill({
    participants,
    currentUserLogin,
    currentUserAccountID,
    amount,
    comment,
    currency,
    merchant,
    created,
    category = '',
    tag = '',
    billable = false,
    iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
    existingSplitChatReportID = '',
    splitShares = {},
    splitPayerAccountIDs = [],
    taxCode = '',
    taxAmount = 0,
}: SplitBillActionsParams) {
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(
        participants,
        currentUserLogin,
        currentUserAccountID,
        amount,
        comment,
        currency,
        merchant,
        created,
        category,
        tag,
        splitShares,
        existingSplitChatReportID,
        billable,
        iouRequestType,
        taxCode,
        taxAmount,
    );

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        comment,
        category,
        merchant,
        created,
        tag,
        billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        splitPayerAccountIDs,
        taxCode,
        taxAmount,
    };

    API.write(WRITE_COMMANDS.SPLIT_BILL, parameters, onyxData);

    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : existingSplitChatReportID);
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @param amount - always in the smallest currency unit
 */
function splitBillAndOpenReport({
    participants,
    currentUserLogin,
    currentUserAccountID,
    amount,
    comment,
    currency,
    merchant,
    created,
    category = '',
    tag = '',
    billable = false,
    iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
    splitShares = {},
    splitPayerAccountIDs = [],
    taxCode = '',
    taxAmount = 0,
}: SplitBillActionsParams) {
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(
        participants,
        currentUserLogin,
        currentUserAccountID,
        amount,
        comment,
        currency,
        merchant,
        created,
        category,
        tag,
        splitShares,
        '',
        billable,
        iouRequestType,
        taxCode,
        taxAmount,
    );

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        merchant,
        created,
        comment,
        category,
        tag,
        billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
        splitPayerAccountIDs,
        taxCode,
        taxAmount,
    };

    API.write(WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT, parameters, onyxData);

    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : splitData.chatReportID);
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

type StartSplitBilActionParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    comment: string;
    receipt: Receipt;
    existingSplitChatReportID?: string;
    billable?: boolean;
    category: string | undefined;
    tag: string | undefined;
    currency: string;
    taxCode: string;
    taxAmount: number;
};

/** Used exclusively for starting a split expense request that contains a receipt, the split request will be completed once the receipt is scanned
 *  or user enters details manually.
 *
 * @param existingSplitChatReportID - Either a group DM or a workspace chat
 */
function startSplitBill({
    participants,
    currentUserLogin,
    currentUserAccountID,
    comment,
    receipt,
    existingSplitChatReportID = '',
    billable = false,
    category = '',
    tag = '',
    currency,
    taxCode = '',
    taxAmount = 0,
}: StartSplitBilActionParams) {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));
    const {splitChatReport, existingSplitChatReport} = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    const {name: filename, source, state = CONST.IOU.RECEIPT_STATE.SCANREADY} = receipt;
    const receiptObject: Receipt = {state, source};

    // ReportID is -2 (aka "deleted") on the group transaction
    const splitTransaction = TransactionUtils.buildOptimisticTransaction(
        0,
        currency,
        CONST.REPORT.SPLIT_REPORTID,
        comment,
        '',
        '',
        '',
        CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        receiptObject,
        filename,
        undefined,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
    );

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitChatCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmailForIOUSplit);
    const splitIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        0,
        CONST.CURRENCY.USD,
        comment,
        participants,
        splitTransaction.transactionID,
        undefined,
        '',
        false,
        false,
        isOwnPolicyExpenseChat,
    );

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = ReportActionsUtils.getReportActionText(splitIOUReportAction);
    splitChatReport.lastMessageHtml = ReportActionsUtils.getReportActionHtml(splitIOUReportAction);

    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: splitChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: CONST.QUICK_ACTIONS.SPLIT_SCAN,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitChatCreatedReportAction.reportActionID]: splitChatCreatedReportAction,
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: splitTransaction,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitChatCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null},
        },
    ];

    const redundantParticipants: Record<number, null> = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}, participants: redundantParticipants},
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
            },
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: getReceiptError(receipt, filename),
                },
            },
        });
    } else {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitChatCreatedReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                    [splitIOUReportAction.reportActionID]: {
                        errors: getReceiptError(receipt, filename),
                    },
                },
            },
        );
    }

    const splits: Split[] = [{email: currentUserEmailForIOUSplit, accountID: currentUserAccountID}];

    participants.forEach((participant) => {
        // Disabling this line since participant.login can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const email = participant.isOwnPolicyExpenseChat ? '' : PhoneNumber.addSMSDomainIfPhoneNumber(participant.login || participant.text || '').toLowerCase();
        const accountID = participant.isOwnPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmailForIOUSplit) {
            return;
        }

        // When splitting with a workspace chat, we only need to supply the policyID and the workspace reportID as it's needed so we can update the report preview
        if (participant.isOwnPolicyExpenseChat) {
            splits.push({
                policyID: participant.policyID,
                chatReportID: splitChatReport.reportID,
            });
            return;
        }

        const participantPersonalDetails = allPersonalDetails[participant?.accountID ?? -1];
        if (!participantPersonalDetails) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [accountID]: {
                        accountID,
                        // Disabling this line since participant.displayName can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        displayName: LocalePhoneNumber.formatPhoneNumber(participant.displayName || email),
                        // Disabling this line since participant.login can be an empty string
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        login: participant.login || participant.text,
                        isOptimisticPersonalDetail: true,
                    },
                },
            });
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }

        splits.push({
            email,
            accountID,
        });
    });

    participants.forEach((participant) => {
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(participant);
        if (!isPolicyExpenseChat) {
            return;
        }

        const optimisticPolicyRecentlyUsedCategories = Category.buildOptimisticPolicyRecentlyUsedCategories(participant.policyID, category);
        const optimisticPolicyRecentlyUsedTags = Tag.buildOptimisticPolicyRecentlyUsedTags(participant.policyID, tag);
        const optimisticRecentlyUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(currency);

        if (optimisticPolicyRecentlyUsedCategories.length > 0) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${participant.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }

        if (optimisticRecentlyUsedCurrencies.length > 0) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }

        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${participant.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    });

    // Save the new splits array into the transaction's comment in case the user calls CompleteSplitBill while offline
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
        value: {
            comment: {
                splits,
            },
        },
    });

    const parameters: StartSplitBillParams = {
        chatReportID: splitChatReport.reportID,
        reportActionID: splitIOUReportAction.reportActionID,
        transactionID: splitTransaction.transactionID,
        splits: JSON.stringify(splits),
        receipt,
        comment,
        category,
        tag,
        currency,
        isFromGroupDM: !existingSplitChatReport,
        billable,
        ...(existingSplitChatReport ? {} : {createdReportActionID: splitChatCreatedReportAction.reportActionID}),
        chatType: splitChatReport?.chatType,
        taxCode,
        taxAmount,
    };

    API.write(WRITE_COMMANDS.START_SPLIT_BILL, parameters, {optimisticData, successData, failureData});

    Navigation.dismissModalWithReport(splitChatReport);
    Report.notifyNewAction(splitChatReport.reportID ?? '-1', currentUserAccountID);
}

/** Used for editing a split expense while it's still scanning or when SmartScan fails, it completes a split expense started by startSplitBill above.
 *
 * @param chatReportID - The group chat or workspace reportID
 * @param reportAction - The split action that lives in the chatReport above
 * @param updatedTransaction - The updated **draft** split transaction
 * @param sessionAccountID - accountID of the current user
 * @param sessionEmail - email of the current user
 */
function completeSplitBill(chatReportID: string, reportAction: OnyxTypes.ReportAction, updatedTransaction: OnyxEntry<OnyxTypes.Transaction>, sessionAccountID: number, sessionEmail: string) {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(sessionEmail);
    const transactionID = updatedTransaction?.transactionID ?? '-1';
    const unmodifiedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

    // Save optimistic updated transaction and action
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...updatedTransaction,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.OPEN,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [reportAction.reportActionID]: {
                    lastModified: DateUtils.getDBTime(),
                    originalMessage: {
                        whisperedTo: [],
                    },
                },
            },
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`,
            value: {pendingAction: null},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...unmodifiedTransaction,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    const splitParticipants: Split[] = updatedTransaction?.comment?.splits ?? [];
    const amount = updatedTransaction?.modifiedAmount;
    const currency = updatedTransaction?.modifiedCurrency;
    console.debug(updatedTransaction);

    // Exclude the current user when calculating the split amount, `calculateAmount` takes it into account
    const splitAmount = IOUUtils.calculateAmount(splitParticipants.length - 1, amount ?? 0, currency ?? '', false);
    const splitTaxAmount = IOUUtils.calculateAmount(splitParticipants.length - 1, updatedTransaction?.taxAmount ?? 0, currency ?? '', false);

    const splits: Split[] = [{email: currentUserEmailForIOUSplit}];
    splitParticipants.forEach((participant) => {
        // Skip creating the transaction for the current user
        if (participant.email === currentUserEmailForIOUSplit) {
            return;
        }
        const isPolicyExpenseChat = !!participant.policyID;

        if (!isPolicyExpenseChat) {
            // In case this is still the optimistic accountID saved in the splits array, return early as we cannot know
            // if there is an existing chat between the split creator and this participant
            // Instead, we will rely on Auth generating the report IDs and the user won't see any optimistic chats or reports created
            const participantPersonalDetails: OnyxTypes.PersonalDetails | null = allPersonalDetails[participant?.accountID ?? -1];
            if (!participantPersonalDetails || participantPersonalDetails.isOptimisticPersonalDetail) {
                splits.push({
                    email: participant.email,
                });
                return;
            }
        }

        let oneOnOneChatReport: OnyxEntry<OnyxTypes.Report>;
        let isNewOneOnOneChatReport = false;
        const allReports = ReportConnection.getAllReports();
        if (isPolicyExpenseChat) {
            // The workspace chat reportID is saved in the splits array when starting a split expense with a workspace
            oneOnOneChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.chatReportID}`];
        } else {
            const existingChatReport = ReportUtils.getChatByParticipants(participant.accountID ? [participant.accountID, sessionAccountID] : []);
            isNewOneOnOneChatReport = !existingChatReport;
            oneOnOneChatReport = existingChatReport ?? ReportUtils.buildOptimisticChatReport(participant.accountID ? [participant.accountID, sessionAccountID] : []);
        }

        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport?.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const shouldCreateNewOneOnOneIOUReport = ReportUtils.shouldCreateNewMoneyRequestReport(oneOnOneIOUReport, oneOnOneChatReport);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isPolicyExpenseChat
                ? ReportUtils.buildOptimisticExpenseReport(oneOnOneChatReport?.reportID ?? '-1', participant.policyID ?? '-1', sessionAccountID, splitAmount, currency ?? '')
                : ReportUtils.buildOptimisticIOUReport(sessionAccountID, participant.accountID ?? -1, splitAmount, oneOnOneChatReport?.reportID ?? '-1', currency ?? '');
        } else if (isPolicyExpenseChat) {
            if (typeof oneOnOneIOUReport?.total === 'number') {
                // Because of the Expense reports are stored as negative values, we subtract the total from the amount
                oneOnOneIOUReport.total -= splitAmount;
            }
        } else {
            oneOnOneIOUReport = IOUUtils.updateIOUOwnerAndTotal(oneOnOneIOUReport, sessionAccountID, splitAmount, currency ?? '');
        }

        const oneOnOneTransaction = TransactionUtils.buildOptimisticTransaction(
            isPolicyExpenseChat ? -splitAmount : splitAmount,
            currency ?? '',
            oneOnOneIOUReport?.reportID ?? '-1',
            updatedTransaction?.comment?.comment,
            updatedTransaction?.modifiedCreated,
            CONST.IOU.TYPE.SPLIT,
            transactionID,
            updatedTransaction?.modifiedMerchant,
            {...updatedTransaction?.receipt, state: CONST.IOU.RECEIPT_STATE.OPEN},
            updatedTransaction?.filename,
            undefined,
            updatedTransaction?.category,
            updatedTransaction?.tag,
            updatedTransaction?.taxCode,
            isPolicyExpenseChat ? -splitTaxAmount : splitAmount,
            updatedTransaction?.billable,
        );

        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            ReportUtils.buildOptimisticMoneyRequestEntities(
                oneOnOneIOUReport,
                CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                splitAmount,
                currency ?? '',
                updatedTransaction?.comment?.comment ?? '',
                currentUserEmailForIOUSplit,
                [participant],
                oneOnOneTransaction.transactionID,
                undefined,
            );

        let oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport?.reportID ?? '-1', oneOnOneIOUReport?.reportID ?? '-1');
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = ReportUtils.updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = ReportUtils.buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport, '', oneOnOneTransaction);
        }

        const [oneOnOneOptimisticData, oneOnOneSuccessData, oneOnOneFailureData] = buildOnyxDataForMoneyRequest(
            oneOnOneChatReport,
            oneOnOneIOUReport,
            oneOnOneTransaction,
            oneOnOneCreatedActionForChat,
            oneOnOneCreatedActionForIOU,
            oneOnOneIOUAction,
            {},
            oneOnOneReportPreviewAction,
            [],
            {},
            isNewOneOnOneChatReport,
            optimisticTransactionThread,
            optimisticCreatedActionForTransactionThread,
            shouldCreateNewOneOnOneIOUReport,
            null,
            null,
            null,
            null,
            true,
        );

        splits.push({
            email: participant.email,
            accountID: participant.accountID,
            policyID: participant.policyID,
            iouReportID: oneOnOneIOUReport?.reportID,
            chatReportID: oneOnOneChatReport?.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        });

        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
    });

    const {
        amount: transactionAmount,
        currency: transactionCurrency,
        created: transactionCreated,
        merchant: transactionMerchant,
        comment: transactionComment,
        category: transactionCategory,
        tag: transactionTag,
        taxCode: transactionTaxCode,
        taxAmount: transactionTaxAmount,
        billable: transactionBillable,
    } = ReportUtils.getTransactionDetails(updatedTransaction) ?? {};

    const parameters: CompleteSplitBillParams = {
        transactionID,
        amount: transactionAmount,
        currency: transactionCurrency,
        created: transactionCreated,
        merchant: transactionMerchant,
        comment: transactionComment,
        category: transactionCategory,
        tag: transactionTag,
        splits: JSON.stringify(splits),
        taxCode: transactionTaxCode,
        taxAmount: transactionTaxAmount,
        billable: transactionBillable,
    };

    API.write(WRITE_COMMANDS.COMPLETE_SPLIT_BILL, parameters, {optimisticData, successData, failureData});
    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : chatReportID);
    Report.notifyNewAction(chatReportID, sessionAccountID);
}

function setDraftSplitTransaction(transactionID: string, transactionChanges: TransactionChanges = {}) {
    let draftSplitTransaction = allDraftSplitTransactions[`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`];

    if (!draftSplitTransaction) {
        draftSplitTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    }

    const updatedTransaction = draftSplitTransaction ? TransactionUtils.getUpdatedTransaction(draftSplitTransaction, transactionChanges, false, false) : null;

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, updatedTransaction);
}

/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(
    report: OnyxEntry<OnyxTypes.Report>,
    participants: Participant[],
    comment: string,
    created: string,
    category: string | undefined,
    tag: string | undefined,
    taxCode: string | undefined,
    taxAmount: number | undefined,
    amount: number,
    currency: string,
    merchant: string,
    billable: boolean | undefined,
    validWaypoints: WaypointCollection,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    customUnitRateID = '',
    currentUserLogin = '',
    currentUserAccountID = -1,
    splitShares: SplitShares = {},
    iouType: ValueOf<typeof CONST.IOU.TYPE> = CONST.IOU.TYPE.SUBMIT,
) {
    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? ReportUtils.getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    const optimisticReceipt: Receipt = {
        source: ReceiptGeneric as ReceiptSource,
        state: CONST.IOU.RECEIPT_STATE.OPEN,
    };

    let parameters: CreateDistanceRequestParams;
    let onyxData: OnyxData;
    if (iouType === CONST.IOU.TYPE.SPLIT) {
        const {
            splitData,
            splits,
            onyxData: splitOnyxData,
        } = createSplitsAndOnyxData(
            participants,
            currentUserLogin ?? '',
            currentUserAccountID,
            amount,
            comment,
            currency,
            merchant,
            created,
            category ?? '',
            tag ?? '',
            splitShares,
            report?.reportID ?? '',
            billable,
            CONST.IOU.REQUEST_TYPE.DISTANCE,
            taxCode,
            taxAmount,
        );
        onyxData = splitOnyxData;

        // Splits don't use the IOU report param. The split transaction isn't linked to a report shown in the UI, it's linked to a special default reportID of -2.
        // Therefore, any params related to the IOU report are irrelevant and omitted below.
        parameters = {
            transactionID: splitData.transactionID,
            chatReportID: splitData.chatReportID,
            createdChatReportActionID: splitData.createdReportActionID ?? '',
            reportActionID: splitData.reportActionID,
            waypoints: JSON.stringify(validWaypoints),
            customUnitRateID,
            comment,
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            splits: JSON.stringify(splits),
            chatType: splitData.chatType,
        };
    } else {
        const participant = participants[0] ?? {};
        const {
            iouReport,
            chatReport,
            transaction,
            iouAction,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewAction,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            onyxData: moneyRequestOnyxData,
        } = getMoneyRequestInformation(
            currentChatReport,
            participant,
            comment,
            amount,
            currency,
            created,
            merchant,
            optimisticReceipt,
            undefined,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            policy,
            policyTagList,
            policyCategories,
            userAccountID,
            currentUserEmail,
            moneyRequestReportID,
        );
        onyxData = moneyRequestOnyxData;

        parameters = {
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints: JSON.stringify(validWaypoints),
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            customUnitRateID,
        };
    }

    API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    const activeReportID = isMoneyRequestReport ? report?.reportID ?? '-1' : parameters.chatReportID;
    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : activeReportID);
    Report.notifyNewAction(activeReportID, userAccountID);
}

function editRegularMoneyRequest(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.Policy,
    policyTags: OnyxTypes.PolicyTagLists,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    const allReports = ReportConnection.getAllReports();
    // STEP 1: Get all collections we're updating
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`] ?? null;
    const isFromExpenseReport = ReportUtils.isExpenseReport(iouReport);

    // STEP 2: Build new modified expense report action.
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport, policy);
    const updatedTransaction = transaction ? TransactionUtils.getUpdatedTransaction(transaction, transactionChanges, isFromExpenseReport) : null;

    // STEP 3: Compute the IOU total and update the report preview message so LHN amount owed is correct
    // Should only update if the transaction matches the currency of the report, else we wait for the update
    // from the server with the currency conversion
    let updatedMoneyRequestReport = {...iouReport};
    const updatedChatReport = {...chatReport};
    const diff = TransactionUtils.getAmount(transaction, true) - TransactionUtils.getAmount(updatedTransaction, true);
    if (updatedTransaction?.currency === iouReport?.currency && updatedTransaction?.modifiedAmount && diff !== 0) {
        if (ReportUtils.isExpenseReport(iouReport) && typeof updatedMoneyRequestReport.total === 'number') {
            updatedMoneyRequestReport.total += diff;
        } else {
            updatedMoneyRequestReport = iouReport
                ? IOUUtils.updateIOUOwnerAndTotal(iouReport, updatedReportAction.actorAccountID ?? -1, diff, TransactionUtils.getCurrency(transaction), false)
                : {};
        }

        updatedMoneyRequestReport.cachedTotal = CurrencyUtils.convertToDisplayString(updatedMoneyRequestReport.total, updatedTransaction.currency);

        // Update the last message of the IOU report
        const lastMessage = ReportUtils.getIOUReportActionMessage(
            iouReport?.reportID ?? '-1',
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            updatedMoneyRequestReport.total ?? 0,
            '',
            updatedTransaction.currency,
            '',
            false,
        );
        updatedMoneyRequestReport.lastMessageText = ReportActionsUtils.getTextFromHtml(lastMessage[0].html);
        updatedMoneyRequestReport.lastMessageHtml = lastMessage[0].html;

        // Update the last message of the chat report
        const hasNonReimbursableTransactions = ReportUtils.hasNonReimbursableTransactions(iouReport?.reportID);
        const messageText = Localize.translateLocal(hasNonReimbursableTransactions ? 'iou.payerSpentAmount' : 'iou.payerOwesAmount', {
            payer: ReportUtils.getPersonalDetailsForAccountID(updatedMoneyRequestReport.managerID ?? -1).login ?? '',
            amount: CurrencyUtils.convertToDisplayString(updatedMoneyRequestReport.total, updatedMoneyRequestReport.currency),
        });
        updatedChatReport.lastMessageText = messageText;
        updatedChatReport.lastMessageHtml = messageText;
    }

    const isScanning = TransactionUtils.hasReceipt(updatedTransaction) && TransactionUtils.isReceiptBeingScanned(updatedTransaction);

    // STEP 4: Compose the optimistic data
    const currentTime = DateUtils.getDBTime();
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: updatedTransaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedMoneyRequestReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`,
            value: updatedChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                lastReadTime: currentTime,
                lastVisibleActionCreated: currentTime,
            },
        },
    ];

    if (!isScanning) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [transactionThread?.parentReportActionID ?? '-1']: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport?.parentReportActionID ?? '-1']: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            },
        );
    }

    // Update recently used categories if the category is changed
    if ('category' in transactionChanges) {
        const optimisticPolicyRecentlyUsedCategories = Category.buildOptimisticPolicyRecentlyUsedCategories(iouReport?.policyID, transactionChanges.category);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used currencies if the currency is changed
    if ('currency' in transactionChanges) {
        const optimisticRecentlyUsedCurrencies = Policy.buildOptimisticRecentlyUsedCurrencies(transactionChanges.currency);
        if (optimisticRecentlyUsedCurrencies.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
    }

    // Update recently used categories if the tag is changed
    if ('tag' in transactionChanges) {
        const optimisticPolicyRecentlyUsedTags = Tag.buildOptimisticPolicyRecentlyUsedTags(iouReport?.policyID, transactionChanges.tag);
        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    comment: null,
                    amount: null,
                    created: null,
                    currency: null,
                    merchant: null,
                    billable: null,
                    category: null,
                    tag: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {pendingAction: null},
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...transaction,
                modifiedCreated: transaction?.modifiedCreated ? transaction.modifiedCreated : null,
                modifiedAmount: transaction?.modifiedAmount ? transaction.modifiedAmount : null,
                modifiedCurrency: transaction?.modifiedCurrency ? transaction.modifiedCurrency : null,
                modifiedMerchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : null,
                modifiedWaypoints: transaction?.modifiedWaypoints ? transaction.modifiedWaypoints : null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                ...iouReport,
                cachedTotal: iouReport?.cachedTotal ? iouReport?.cachedTotal : null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`,
            value: chatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                lastReadTime: transactionThread?.lastReadTime,
                lastVisibleActionCreated: transactionThread?.lastVisibleActionCreated,
            },
        },
    ];

    // Add transaction violations if we have a paid policy and an updated transaction
    if (policy && PolicyUtils.isPaidGroupPolicy(policy) && updatedTransaction) {
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const updatedViolationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            updatedTransaction,
            currentTransactionViolations,
            policy,
            policyTags,
            policyCategories,
            PolicyUtils.hasDependentTags(policy, policyTags),
        );
        optimisticData.push(updatedViolationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    // STEP 6: Call the API endpoint
    const {created, amount, currency, comment, merchant, category, billable, tag} = ReportUtils.getTransactionDetails(updatedTransaction) ?? {};

    const parameters: EditMoneyRequestParams = {
        transactionID,
        reportActionID: updatedReportAction.reportActionID,
        created,
        amount,
        currency,
        comment,
        merchant,
        category,
        billable,
        tag,
    };

    API.write(WRITE_COMMANDS.EDIT_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
}

function editMoneyRequest(
    transaction: OnyxTypes.Transaction,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.Policy,
    policyTags: OnyxTypes.PolicyTagLists,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    if (TransactionUtils.isDistanceRequest(transaction)) {
        updateDistanceRequest(transaction.transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories);
    } else {
        editRegularMoneyRequest(transaction.transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories);
    }
}

type UpdateMoneyRequestAmountAndCurrencyParams = {
    transactionID: string;
    transactionThreadReportID: string;
    currency: string;
    amount: number;
    taxAmount: number;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    taxCode: string;
};

/** Updates the amount and currency fields of an expense */
function updateMoneyRequestAmountAndCurrency({
    transactionID,
    transactionThreadReportID,
    currency,
    amount,
    taxAmount,
    policy,
    policyTagList,
    policyCategories,
    taxCode,
}: UpdateMoneyRequestAmountAndCurrencyParams) {
    const transactionChanges = {
        amount,
        currency,
        taxCode,
        taxAmount,
    };
    const allReports = ReportConnection.getAllReports();
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.parentReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport) && ReportUtils.isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true, policy ?? null);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy ?? null, policyTagList ?? null, policyCategories ?? null, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function prepareToCleanUpMoneyRequest(transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
    // STEP 1: Get all collections we're updating
    const allReports = ReportConnection.getAllReports();
    const iouReportID = ReportActionsUtils.isMoneyRequestAction(reportAction) ? ReportActionsUtils.getOriginalMessage(reportAction)?.IOUReportID : '-1';
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`] ?? null;
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const reportPreviewAction = getReportPreviewAction(iouReport?.chatReportID ?? '-1', iouReport?.reportID ?? '-1')!;
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted
    const shouldDeleteTransactionThread = transactionThreadID ? (reportAction?.childVisibleActionCount ?? 0) === 0 : false;
    const shouldShowDeletedRequestMessage = !!transactionThreadID && !shouldDeleteTransactionThread;

    // STEP 3: Update the IOU reportAction and decide if the iouReport should be deleted. We delete the iouReport if there are no visible comments left in the report.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: shouldShowDeletedRequestMessage ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldShowDeletedRequestMessage,
                },
            ],
            originalMessage: {
                IOUTransactionID: null,
            },
            errors: null,
        },
    } as Record<string, NullishDeep<OnyxTypes.ReportAction>>;

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(iouReport?.reportID ?? '-1', updatedReportAction);
    const iouReportLastMessageText = ReportActionsUtils.getLastVisibleMessage(iouReport?.reportID ?? '-1', updatedReportAction).lastMessageText;
    const shouldDeleteIOUReport =
        iouReportLastMessageText.length === 0 && !ReportActionsUtils.isDeletedParentAction(lastVisibleAction) && (!transactionThreadID || shouldDeleteTransactionThread);

    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    let updatedIOUReport: OnyxInputValue<OnyxTypes.Report>;
    const currency = TransactionUtils.getCurrency(transaction);
    const updatedReportPreviewAction: OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> = {...reportPreviewAction};
    updatedReportPreviewAction.pendingAction = shouldDeleteIOUReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    if (iouReport && ReportUtils.isExpenseReport(iouReport)) {
        updatedIOUReport = {...iouReport};

        if (typeof updatedIOUReport.total === 'number' && currency === iouReport?.currency) {
            // Because of the Expense reports are stored as negative values, we add the total from the amount
            const amountDiff = TransactionUtils.getAmount(transaction, true);
            updatedIOUReport.total += amountDiff;

            if (!transaction?.reimbursable && typeof updatedIOUReport.nonReimbursableTotal === 'number') {
                updatedIOUReport.nonReimbursableTotal += amountDiff;
            }
        }
    } else {
        updatedIOUReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, reportAction.actorAccountID ?? -1, TransactionUtils.getAmount(transaction, false), currency, true);
    }

    if (updatedIOUReport) {
        updatedIOUReport.lastMessageText = iouReportLastMessageText;
        updatedIOUReport.lastVisibleActionCreated = lastVisibleAction?.created;
    }

    const hasNonReimbursableTransactions = ReportUtils.hasNonReimbursableTransactions(iouReport?.reportID);
    const messageText = Localize.translateLocal(hasNonReimbursableTransactions ? 'iou.payerSpentAmount' : 'iou.payerOwesAmount', {
        payer: ReportUtils.getPersonalDetailsForAccountID(updatedIOUReport?.managerID ?? -1).login ?? '',
        amount: CurrencyUtils.convertToDisplayString(updatedIOUReport?.total, updatedIOUReport?.currency),
    });

    if (ReportActionsUtils.getReportActionMessage(updatedReportPreviewAction)) {
        if (Array.isArray(updatedReportPreviewAction?.message) && updatedReportPreviewAction.message?.[0]) {
            updatedReportPreviewAction.message[0].text = messageText;
            updatedReportPreviewAction.message[0].deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
        } else if (!Array.isArray(updatedReportPreviewAction.message) && updatedReportPreviewAction.message) {
            updatedReportPreviewAction.message.text = messageText;
            updatedReportPreviewAction.message.deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
        }
    }

    if (updatedReportPreviewAction && reportPreviewAction?.childMoneyRequestCount && reportPreviewAction?.childMoneyRequestCount > 0) {
        updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
    }

    // STEP 5: Calculate the url that the user will be navigated back to
    // This depends on which page they are on and which resources were deleted
    let reportIDToNavigateBack: string | undefined;
    if (iouReport && isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        reportIDToNavigateBack = iouReport.reportID;
    }

    if (iouReport?.chatReportID && shouldDeleteIOUReport) {
        reportIDToNavigateBack = iouReport.chatReportID;
    }

    const urlToNavigateBack = reportIDToNavigateBack ? ROUTES.REPORT_WITH_ID.getRoute(reportIDToNavigateBack) : undefined;

    return {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transactionThread,
        chatReport,
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReport,
        urlToNavigateBack,
    };
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function cleanUpMoneyRequest(transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
    const {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        chatReport,
        iouReport,
        reportPreviewAction,
        urlToNavigateBack,
    } = prepareToCleanUpMoneyRequest(transactionID, reportAction, isSingleTransactionView);

    // build Onyx data

    // Onyx operations to delete the transaction, update the IOU report action and chat report action
    const onyxUpdates: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        },
    ];

    if (reportPreviewAction?.reportActionID) {
        onyxUpdates.push({
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

    // added operations to update IOU report and chat report
    onyxUpdates.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: ReportUtils.getOutstandingChildRequest(updatedIOUReport),
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
        onyxUpdates.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
                value: {
                    hasOutstandingChildRequest: false,
                    iouReportID: null,
                    lastMessageText: ReportActionsUtils.getLastVisibleMessage(iouReport?.chatReportID ?? '-1', {[reportPreviewAction?.reportActionID ?? '-1']: null})?.lastMessageText,
                    lastVisibleActionCreated: ReportActionsUtils.getLastVisibleAction(iouReport?.chatReportID ?? '-1', {[reportPreviewAction?.reportActionID ?? '-1']: null})?.created,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: null,
            },
        );
    }

    Onyx.update(onyxUpdates);

    return urlToNavigateBack;
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function deleteMoneyRequest(transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
    // STEP 1: Calculate and prepare the data
    const {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transactionThread,
        chatReport,
        transaction,
        transactionViolations,
        iouReport,
        reportPreviewAction,
        urlToNavigateBack,
    } = prepareToCleanUpMoneyRequest(transactionID, reportAction, isSingleTransactionView);

    // STEP 2: Build Onyx data
    // The logic mostly resembles the cleanUpMoneyRequest function
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    if (shouldDeleteTransactionThread) {
        optimisticData.push(
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

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction?.reportActionID ?? '-1']: updatedReportPreviewAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: ReportUtils.getOutstandingChildRequest(updatedIOUReport),
        },
    );

    if (!shouldDeleteIOUReport && updatedReportPreviewAction?.childMoneyRequestCount === 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: false,
            },
        });
    }

    if (shouldDeleteIOUReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText: ReportActionsUtils.getLastVisibleMessage(iouReport?.chatReportID ?? '-1', {[reportPreviewAction?.reportActionID ?? '-1']: null})?.lastMessageText,
                lastVisibleActionCreated: ReportActionsUtils.getLastVisibleAction(iouReport?.chatReportID ?? '-1', {[reportPreviewAction?.reportActionID ?? '-1']: null})?.created,
            },
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        });
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction?.reportActionID ?? '-1']: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    ];

    if (shouldDeleteIOUReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: null,
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction ?? null,
        },
    ];

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: transactionViolations ?? null,
    });

    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: transactionThread,
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                    errors: {
                        [errorKey]: Localize.translateLocal('iou.error.genericDeleteFailureMessage'),
                    },
                },
            },
        },
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction?.reportActionID ?? '-1']: {
                    ...reportPreviewAction,
                    pendingAction: null,
                    errors: {
                        [errorKey]: Localize.translateLocal('iou.error.genericDeleteFailureMessage'),
                    },
                },
            },
        },
    );

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
    CachedPDFPaths.clearByKey(transactionID);

    return urlToNavigateBack;
}

function deleteTrackExpense(chatReportID: string, transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
    // STEP 1: Get all collections we're updating
    const chatReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] ?? null;
    if (!ReportUtils.isSelfDM(chatReport)) {
        return deleteMoneyRequest(transactionID, reportAction, isSingleTransactionView);
    }

    const whisperAction = ReportActionsUtils.getTrackExpenseActionableWhisper(transactionID, chatReportID);
    const actionableWhisperReportActionID = whisperAction?.reportActionID;
    const {parameters, optimisticData, successData, failureData, shouldDeleteTransactionThread} = getDeleteTrackExpenseInformation(
        chatReportID,
        transactionID,
        reportAction,
        undefined,
        undefined,
        actionableWhisperReportActionID,
        CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
    );

    // STEP 6: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    CachedPDFPaths.clearByKey(transactionID);

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    if (isSingleTransactionView && shouldDeleteTransactionThread) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        return ROUTES.REPORT_WITH_ID.getRoute(chatReport?.reportID ?? '-1');
    }
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function getSendMoneyParams(
    report: OnyxEntry<OnyxTypes.Report>,
    amount: number,
    currency: string,
    comment: string,
    paymentMethodType: PaymentMethodType,
    managerID: number,
    recipient: Participant,
): SendMoneyParamsData {
    const recipientEmail = PhoneNumber.addSMSDomainIfPhoneNumber(recipient.login ?? '');
    const recipientAccountID = Number(recipient.accountID);
    const newIOUReportDetails = JSON.stringify({
        amount,
        currency,
        requestorEmail: recipientEmail,
        requestorAccountID: recipientAccountID,
        comment,
        idempotencyKey: Str.guid(),
    });

    let chatReport = !isEmptyObject(report) && report?.reportID ? report : ReportUtils.getChatByParticipants([recipientAccountID, managerID]);
    let isNewChat = false;
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([recipientAccountID, managerID]);
        isNewChat = true;
    }
    const optimisticIOUReport = ReportUtils.buildOptimisticIOUReport(recipientAccountID, managerID, amount, chatReport.reportID, currency, true);

    const optimisticTransaction = TransactionUtils.buildOptimisticTransaction(amount, currency, optimisticIOUReport.reportID, comment);
    const optimisticTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: optimisticTransaction,
    };

    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, optimisticIOUReportAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        ReportUtils.buildOptimisticMoneyRequestEntities(
            optimisticIOUReport,
            CONST.IOU.REPORT_ACTION_TYPE.PAY,
            amount,
            currency,
            comment,
            recipientEmail,
            [recipient],
            optimisticTransaction.transactionID,
            paymentMethodType,
            false,
            true,
        );

    const reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, optimisticIOUReport);

    // Change the method to set for new reports because it doesn't exist yet, is faster,
    // and we need the data to be available when we navigate to the chat page
    const optimisticChatReportData: OnyxUpdate = isNewChat
        ? {
              onyxMethod: Onyx.METHOD.SET,
              key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
              value: {
                  ...chatReport,
                  // Set and clear pending fields on the chat report
                  pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                  lastReadTime: DateUtils.getDBTime(),
                  lastVisibleActionCreated: reportPreviewAction.created,
              },
          }
        : {
              onyxMethod: Onyx.METHOD.MERGE,
              key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
              value: {
                  ...chatReport,
                  lastReadTime: DateUtils.getDBTime(),
                  lastVisibleActionCreated: reportPreviewAction.created,
              },
          };
    const optimisticQuickActionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: {
            action: CONST.QUICK_ACTIONS.SEND_MONEY,
            chatReportID: chatReport.reportID,
            isFirstQuickAction: isEmptyObject(quickAction),
        },
    };
    const optimisticIOUReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
        value: {
            ...optimisticIOUReport,
            lastMessageText: ReportActionsUtils.getReportActionText(optimisticIOUReportAction),
            lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticIOUReportAction),
        },
    };
    const optimisticTransactionThreadData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
        value: optimisticTransactionThread,
    };
    const optimisticIOUReportActionsData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
        value: {
            [optimisticCreatedActionForIOUReport.reportActionID]: optimisticCreatedActionForIOUReport,
            [optimisticIOUReportAction.reportActionID]: {
                ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticChatReportActionsData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [reportPreviewAction.reportActionID]: reportPreviewAction,
        },
    };
    const optimisticTransactionThreadReportActionsData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
        value: {
            [optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1']: optimisticCreatedActionForTransactionThread,
        },
    };

    const successData: OnyxUpdate[] = [];

    // Add optimistic personal details for recipient
    let optimisticPersonalDetailListData: OnyxUpdate | null = null;
    const optimisticPersonalDetailListAction = isNewChat
        ? {
              [recipientAccountID]: {
                  accountID: recipientAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: recipient.displayName || recipient.login,
                  login: recipient.login,
              },
          }
        : {};

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(optimisticPersonalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        Object.keys(optimisticPersonalDetailListAction).forEach((accountIDKey) => {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        });

        optimisticPersonalDetailListData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        };
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
            value: {
                participants: redundantParticipants,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                participants: redundantParticipants,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {
                [optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1']: {
                    pendingAction: null,
                },
            },
        },
    );

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {
                [optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1']: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {pendingFields: null, participants: redundantParticipants},
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
                value: {
                    [optimisticIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );

        if (optimisticChatReportActionsData.value) {
            // Add an optimistic created action to the optimistic chat reportActions data
            optimisticChatReportActionsData.value[optimisticCreatedActionForChat.reportActionID] = optimisticCreatedActionForChat;
        }
    } else {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        });
    }

    const optimisticData: OnyxUpdate[] = [
        optimisticChatReportData,
        optimisticQuickActionData,
        optimisticIOUReportData,
        optimisticChatReportActionsData,
        optimisticIOUReportActionsData,
        optimisticTransactionData,
        optimisticTransactionThreadData,
        optimisticTransactionThreadReportActionsData,
    ];

    if (!isEmptyObject(optimisticPersonalDetailListData)) {
        optimisticData.push(optimisticPersonalDetailListData);
    }

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticTransaction.transactionID,
            newIOUReportDetails,
            createdReportActionID: isNewChat ? optimisticCreatedActionForChat.reportActionID : '-1',
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID ?? '-1',
        },
        optimisticData,
        successData,
        failureData,
    };
}

type OptimisticHoldReportExpenseActionID = {
    optimisticReportActionID: string;
    oldReportActionID: string;
};

function getHoldReportActionsAndTransactions(reportID: string) {
    const iouReportActions = ReportActionsUtils.getAllReportActions(reportID);
    const holdReportActions: Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = [];
    const holdTransactions: OnyxTypes.Transaction[] = [];

    Object.values(iouReportActions).forEach((action) => {
        const transactionID = ReportActionsUtils.isMoneyRequestAction(action) ? ReportActionsUtils.getOriginalMessage(action)?.IOUTransactionID ?? null : null;
        const transaction = getTransaction(transactionID ?? '-1');

        if (transaction?.comment?.hold) {
            holdReportActions.push(action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>);
            holdTransactions.push(transaction);
        }
    });

    return {holdReportActions, holdTransactions};
}

function getReportFromHoldRequestsOnyxData(
    chatReport: OnyxTypes.Report,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    recipient: Participant,
): {
    optimisticHoldReportID: string;
    optimisticHoldActionID: string;
    optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[];
    optimisticData: OnyxUpdate[];
    failureData: OnyxUpdate[];
} {
    const {holdReportActions, holdTransactions} = getHoldReportActionsAndTransactions(iouReport?.reportID ?? '');
    const firstHoldTransaction = holdTransactions[0];
    const newParentReportActionID = rand64();

    const optimisticExpenseReport = ReportUtils.buildOptimisticExpenseReport(
        chatReport.reportID,
        chatReport.policyID ?? iouReport?.policyID ?? '',
        recipient.accountID ?? 1,
        holdTransactions.reduce((acc, transaction) => acc + transaction.amount, 0) * (ReportUtils.isIOUReport(iouReport) ? 1 : -1),
        getCurrency(firstHoldTransaction),
        false,
        newParentReportActionID,
    );
    const optimisticExpenseReportPreview = ReportUtils.buildOptimisticReportPreview(
        chatReport,
        optimisticExpenseReport,
        '',
        firstHoldTransaction,
        optimisticExpenseReport.reportID,
        newParentReportActionID,
    );

    const updateHeldReports: Record<string, Pick<OnyxTypes.Report, 'parentReportActionID' | 'parentReportID' | 'chatReportID'>> = {};
    const addHoldReportActions: OnyxTypes.ReportActions = {};
    const deleteHoldReportActions: Record<string, Pick<OnyxTypes.ReportAction, 'message'>> = {};
    const optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[] = [];

    holdReportActions.forEach((holdReportAction) => {
        const originalMessage = ReportActionsUtils.getOriginalMessage(holdReportAction);

        deleteHoldReportActions[holdReportAction.reportActionID] = {
            message: [
                {
                    deleted: DateUtils.getDBTime(),
                    type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                    text: '',
                },
            ],
        };

        const reportActionID = rand64();
        addHoldReportActions[reportActionID] = {
            ...holdReportAction,
            reportActionID,
            originalMessage: {
                ...originalMessage,
                IOUReportID: optimisticExpenseReport.reportID,
            },
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };

        const heldReport = ReportUtils.getReportOrDraftReport(holdReportAction.childReportID);
        if (heldReport) {
            optimisticHoldReportExpenseActionIDs.push({optimisticReportActionID: reportActionID, oldReportActionID: holdReportAction.reportActionID});

            updateHeldReports[`${ONYXKEYS.COLLECTION.REPORT}${heldReport.reportID}`] = {
                parentReportActionID: reportActionID,
                parentReportID: optimisticExpenseReport.reportID,
                chatReportID: optimisticExpenseReport.reportID,
            };
        }
    });

    const updateHeldTransactions: Record<string, Pick<OnyxTypes.Transaction, 'reportID'>> = {};
    holdTransactions.forEach((transaction) => {
        updateHeldTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            reportID: optimisticExpenseReport.reportID,
        };
    });

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: optimisticExpenseReport.reportID,
            },
        },
        // add new optimistic expense report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: optimisticExpenseReport,
        },
        // add preview report action to main chat
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: optimisticExpenseReportPreview,
            },
        },
        // remove hold report actions from old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID ?? ''}`,
            value: deleteHoldReportActions,
        },
        // add hold report actions to new iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: addHoldReportActions,
        },
        // update held reports with new parentReportActionID
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.REPORT}`,
            value: updateHeldReports,
        },
        // update transactions with new iouReportID
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: updateHeldTransactions,
        },
    ];

    const bringReportActionsBack: Record<string, OnyxTypes.ReportAction> = {};
    holdReportActions.forEach((reportAction) => {
        bringReportActionsBack[reportAction.reportActionID] = reportAction;
    });

    const bringHeldTransactionsBack: Record<string, OnyxTypes.Transaction> = {};
    holdTransactions.forEach((transaction) => {
        bringHeldTransactionsBack[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    });

    const failureData: OnyxUpdate[] = [
        // remove added optimistic expense report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        // remove preview report action from the main chat
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: null,
            },
        },
        // add hold report actions back to old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID ?? ''}`,
            value: bringReportActionsBack,
        },
        // remove hold report actions from the new iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        // add hold transactions back to old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: bringHeldTransactionsBack,
        },
    ];

    return {
        optimisticData,
        optimisticHoldActionID: optimisticExpenseReportPreview.reportActionID,
        failureData,
        optimisticHoldReportID: optimisticExpenseReport.reportID,
        optimisticHoldReportExpenseActionIDs,
    };
}

function getPayMoneyRequestParams(
    initialChatReport: OnyxTypes.Report,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    recipient: Participant,
    paymentMethodType: PaymentMethodType,
    full: boolean,
    payAsBusiness?: boolean,
): PayMoneyRequestData {
    const isInvoiceReport = ReportUtils.isInvoiceReport(iouReport);
    const activePolicy = PolicyUtils.getPolicy(activePolicyID);
    let payerPolicyID = activePolicyID;
    let chatReport = initialChatReport;
    let policyParams = {};
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    const shouldCreatePolicy = !activePolicy || !PolicyUtils.isPolicyAdmin(activePolicy) || !PolicyUtils.isPaidGroupPolicy(activePolicy);

    if (ReportUtils.isIndividualInvoiceRoom(chatReport) && payAsBusiness && shouldCreatePolicy) {
        payerPolicyID = Policy.generatePolicyID();
        const {
            optimisticData: policyOptimisticData,
            failureData: policyFailureData,
            successData: policySuccessData,
            params,
        } = Policy.buildPolicyData(currentUserEmail, true, undefined, payerPolicyID);
        const {
            announceChatReportID,
            announceCreatedReportActionID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        } = params;

        policyParams = {
            policyID: payerPolicyID,
            announceChatReportID,
            announceCreatedReportActionID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };

        optimisticData.push(...policyOptimisticData, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: payerPolicyID});
        successData.push(...policySuccessData);
        failureData.push(...policyFailureData, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: activePolicyID ?? null});
    }

    if (ReportUtils.isIndividualInvoiceRoom(chatReport) && payAsBusiness && activePolicyID) {
        const existingB2BInvoiceRoom = ReportUtils.getInvoiceChatByParticipants(chatReport.policyID ?? '', activePolicyID);
        if (existingB2BInvoiceRoom) {
            chatReport = existingB2BInvoiceRoom;
        }
    }

    let total = (iouReport?.total ?? 0) - (iouReport?.nonReimbursableTotal ?? 0);
    if (ReportUtils.hasHeldExpenses(iouReport?.reportID ?? '') && !full && !!iouReport?.unheldTotal) {
        total = iouReport?.unheldTotal;
    }

    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        ReportUtils.isExpenseReport(iouReport) ? -total : total,
        iouReport?.currency ?? '',
        '',
        [recipient],
        '',
        paymentMethodType,
        iouReport?.reportID,
        true,
    );

    // In some instances, the report preview action might not be available to the payer (only whispered to the requestor)
    // hence we need to make the updates to the action safely.
    let optimisticReportPreviewAction = null;
    const reportPreviewAction = getReportPreviewAction(chatReport.reportID, iouReport?.reportID ?? '');
    if (reportPreviewAction) {
        optimisticReportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, true);
    }
    let currentNextStep = null;
    let optimisticNextStep = null;
    if (!isInvoiceReport) {
        currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID ?? ''}`] ?? null;
        optimisticNextStep = NextStepUtils.buildNextStep(iouReport, CONST.REPORT.STATUS_NUM.REIMBURSED);
    }

    const optimisticChatReport = {
        ...chatReport,
        lastReadTime: DateUtils.getDBTime(),
        lastVisibleActionCreated: optimisticIOUReportAction.created,
        hasOutstandingChildRequest: false,
        iouReportID: null,
        lastMessageText: ReportActionsUtils.getReportActionText(optimisticIOUReportAction),
        lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticIOUReportAction),
    };
    if (ReportUtils.isIndividualInvoiceRoom(chatReport) && payAsBusiness && payerPolicyID) {
        optimisticChatReport.invoiceReceiver = {
            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
            policyID: payerPolicyID,
        };
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: optimisticChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID ?? ''}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID ?? ''}`,
            value: {
                ...iouReport,
                lastMessageText: ReportActionsUtils.getReportActionText(optimisticIOUReportAction),
                lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticIOUReportAction),
                hasOutstandingChildRequest: false,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {[iouReport?.policyID ?? '-1']: paymentMethodType},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID ?? ''}`,
            value: optimisticNextStep,
        },
    );

    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID ?? ''}`,
        value: {
            pendingFields: {
                preview: null,
                reimbursed: null,
                partial: null,
            },
        },
    });

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID ?? ''}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID ?? ''}`,
            value: {
                ...iouReport,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: chatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID ?? ''}`,
            value: currentNextStep,
        },
    );

    // In case the report preview action is loaded locally, let's update it.
    if (optimisticReportPreviewAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: {
                    created: optimisticReportPreviewAction.created,
                },
            },
        });
    }

    // Optimistically unhold all transactions if we pay all requests
    if (full) {
        const reportTransactions = TransactionUtils.getAllReportTransactions(iouReport?.reportID);
        for (const transaction of reportTransactions) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: null,
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: transaction.comment?.hold,
                    },
                },
            });
        }
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    if (!full) {
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData(chatReport, iouReport, recipient);

        optimisticData.push(...holdReportOnyxData.optimisticData);
        failureData.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }

    return {
        params: {
            iouReportID: iouReport?.reportID ?? '',
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            full,
            amount: Math.abs(total),
            optimisticHoldReportID,
            optimisticHoldActionID,
            optimisticHoldReportExpenseActionIDs,
            ...policyParams,
        },
        optimisticData,
        successData,
        failureData,
    };
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyElsewhere(report: OnyxEntry<OnyxTypes.Report>, amount: number, currency: string, comment: string, managerID: number, recipient: Participant) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, managerID, recipient);

    API.write(WRITE_COMMANDS.SEND_MONEY_ELSEWHERE, params, {optimisticData, successData, failureData});

    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyWithWallet(report: OnyxEntry<OnyxTypes.Report>, amount: number, currency: string, comment: string, managerID: number, recipient: Participant | ReportUtils.OptionData) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.EXPENSIFY, managerID, recipient);

    API.write(WRITE_COMMANDS.SEND_MONEY_WITH_WALLET, params, {optimisticData, successData, failureData});

    Navigation.dismissModal(isSearchTopmostCentralPane() ? undefined : params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

function canApproveIOU(iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>, policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>) {
    // Only expense reports can be approved
    const isPaidGroupPolicy = policy && PolicyUtils.isPaidGroupPolicy(policy);
    if (!isPaidGroupPolicy) {
        return false;
    }

    const isOnSubmitAndClosePolicy = PolicyUtils.isSubmitAndClose(policy);
    if (isOnSubmitAndClosePolicy) {
        return false;
    }

    const managerID = iouReport?.managerID ?? -1;
    const isCurrentUserManager = managerID === userAccountID;
    const isOpenExpenseReport = ReportUtils.isOpenExpenseReport(iouReport);
    const isApproved = ReportUtils.isReportApproved(iouReport);
    const iouSettled = ReportUtils.isSettled(iouReport?.reportID);
    const reportNameValuePairs = ReportUtils.getReportNameValuePairs(iouReport?.reportID);
    const isArchivedReport = ReportUtils.isArchivedRoom(iouReport, reportNameValuePairs);

    return isCurrentUserManager && !isOpenExpenseReport && !isApproved && !iouSettled && !isArchivedReport;
}

function canIOUBePaid(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    chatReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    transactions?: OnyxTypes.Transaction[],
) {
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);
    const reportNameValuePairs = ReportUtils.getReportNameValuePairs(chatReport?.reportID);
    const isChatReportArchived = ReportUtils.isArchivedRoom(chatReport, reportNameValuePairs);
    const iouSettled = ReportUtils.isSettled(iouReport?.reportID);

    if (isEmptyObject(iouReport)) {
        return false;
    }

    if (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        return false;
    }

    if (ReportUtils.isInvoiceReport(iouReport)) {
        if (iouSettled) {
            return false;
        }
        if (chatReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
            return chatReport?.invoiceReceiver?.accountID === userAccountID;
        }
        return PolicyUtils.getPolicy(chatReport?.invoiceReceiver?.policyID)?.role === CONST.POLICY.ROLE.ADMIN;
    }

    const isPayer = ReportUtils.isPayer(
        {
            email: currentUserEmail,
            accountID: userAccountID,
        },
        iouReport,
    );

    const isOpenExpenseReport = isPolicyExpenseChat && ReportUtils.isOpenExpenseReport(iouReport);

    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(iouReport);
    const isAutoReimbursable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES ? false : ReportUtils.canBeAutoReimbursed(iouReport, policy);
    const shouldBeApproved = canApproveIOU(iouReport, policy);

    const isPayAtEndExpenseReport = ReportUtils.isPayAtEndExpenseReport(iouReport?.reportID, transactions);

    return (
        isPayer &&
        !isOpenExpenseReport &&
        !iouSettled &&
        !iouReport?.isWaitingOnBankAccount &&
        reimbursableSpend !== 0 &&
        !isChatReportArchived &&
        !isAutoReimbursable &&
        !shouldBeApproved &&
        !isPayAtEndExpenseReport
    );
}

function hasIOUToApproveOrPay(chatReport: OnyxEntry<OnyxTypes.Report>, excludedIOUReportID: string): boolean {
    const chatReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`] ?? {};

    return Object.values(chatReportActions).some((action) => {
        const iouReport = ReportUtils.getReportOrDraftReport(action.childReportID ?? '-1');
        const policy = PolicyUtils.getPolicy(iouReport?.policyID);
        const shouldShowSettlementButton = canIOUBePaid(iouReport, chatReport, policy) || canApproveIOU(iouReport, policy);
        return action.childReportID?.toString() !== excludedIOUReportID && action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && shouldShowSettlementButton;
    });
}

function isLastApprover(approvalChain: string[]): boolean {
    if (approvalChain.length === 0) {
        return true;
    }
    return approvalChain[approvalChain.length - 1] === currentUserEmail;
}

function approveMoneyRequest(expenseReport: OnyxEntry<OnyxTypes.Report>, full?: boolean) {
    if (expenseReport?.policyID && SubscriptionUtils.shouldRestrictUserBillableActions(expenseReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`] ?? null;
    let total = expenseReport?.total ?? 0;
    const hasHeldExpenses = ReportUtils.hasHeldExpenses(expenseReport?.reportID);
    if (hasHeldExpenses && !full && !!expenseReport?.unheldTotal) {
        total = expenseReport?.unheldTotal;
    }
    const optimisticApprovedReportAction = ReportUtils.buildOptimisticApprovedReportAction(total, expenseReport?.currency ?? '', expenseReport?.reportID ?? '-1');

    const approvalChain = ReportUtils.getApprovalChain(PolicyUtils.getPolicy(expenseReport?.policyID), expenseReport?.ownerAccountID ?? -1, expenseReport?.total ?? 0);

    const predictedNextStatus = isLastApprover(approvalChain) ? CONST.REPORT.STATUS_NUM.APPROVED : CONST.REPORT.STATUS_NUM.SUBMITTED;
    const predictedNextState = isLastApprover(approvalChain) ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED;

    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, predictedNextStatus);
    const chatReport = ReportUtils.getReportOrDraftReport(expenseReport?.chatReportID);

    const optimisticReportActionsData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
        value: {
            [optimisticApprovedReportAction.reportActionID]: {
                ...(optimisticApprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: ReportActionsUtils.getReportActionText(optimisticApprovedReportAction),
            lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticApprovedReportAction),
            stateNum: predictedNextState,
            statusNum: predictedNextStatus,
            pendingFields: {
                partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticChatReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.chatReportID}`,
        value: {
            hasOutstandingChildRequest: hasIOUToApproveOrPay(chatReport, expenseReport?.reportID ?? '-1'),
        },
    };

    const optimisticNextStepData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`,
        value: optimisticNextStep,
    };
    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData, optimisticChatReportData];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.chatReportID}`,
            value: {
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
                pendingFields: {
                    partial: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport?.reportID}`,
            value: currentNextStep,
        },
    ];

    // Clear hold reason of all transactions if we approve all requests
    if (full && hasHeldExpenses) {
        const heldTransactions = ReportUtils.getAllHeldTransactions(expenseReport?.reportID);
        heldTransactions.forEach((heldTransaction) => {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: '',
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: heldTransaction.comment?.hold,
                    },
                },
            });
        });
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    if (!full && !!chatReport && !!expenseReport) {
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData(chatReport, expenseReport, {accountID: expenseReport.ownerAccountID});

        optimisticData.push(...holdReportOnyxData.optimisticData);
        failureData.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }

    const parameters: ApproveMoneyRequestParams = {
        reportID: expenseReport?.reportID ?? '-1',
        approvedReportActionID: optimisticApprovedReportAction.reportActionID,
        full,
        optimisticHoldReportID,
        optimisticHoldActionID,
        optimisticHoldReportExpenseActionIDs,
        v2: PolicyUtils.isControlOnAdvancedApprovalMode(PolicyUtils.getPolicy(expenseReport?.policyID)),
    };

    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
}

function unapproveExpenseReport(expenseReport: OnyxEntry<OnyxTypes.Report>) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`] ?? null;

    const optimisticUnapprovedReportAction = ReportUtils.buildOptimisticUnapprovedReportAction(expenseReport.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID);
    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, CONST.REPORT.STATUS_NUM.SUBMITTED);

    const optimisticReportActionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticUnapprovedReportAction.reportActionID]: {
                ...(optimisticUnapprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: ReportActionsUtils.getReportActionText(optimisticUnapprovedReportAction),
            lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticUnapprovedReportAction),
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticNextStepData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStep,
    };

    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionData, optimisticNextStepData];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: currentNextStep,
        },
    ];

    const parameters: UnapproveExpenseReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticUnapprovedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

function submitReport(expenseReport: OnyxTypes.Report) {
    if (expenseReport.policyID && SubscriptionUtils.shouldRestrictUserBillableActions(expenseReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`] ?? null;
    const parentReport = ReportUtils.getReportOrDraftReport(expenseReport.parentReportID);
    const policy = PolicyUtils.getPolicy(expenseReport.policyID);
    const isCurrentUserManager = currentUserPersonalDetails?.accountID === expenseReport.managerID;
    const isSubmitAndClosePolicy = PolicyUtils.isSubmitAndClose(policy);
    const adminAccountID = policy?.role === CONST.POLICY.ROLE.ADMIN ? currentUserPersonalDetails?.accountID : undefined;
    const optimisticSubmittedReportAction = ReportUtils.buildOptimisticSubmittedReportAction(expenseReport?.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID, adminAccountID);
    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, isSubmitAndClosePolicy ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.SUBMITTED);

    const optimisticData: OnyxUpdate[] = !isSubmitAndClosePolicy
        ? [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                  value: {
                      [optimisticSubmittedReportAction.reportActionID]: {
                          ...(optimisticSubmittedReportAction as OnyxTypes.ReportAction),
                          pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                      },
                  },
              },
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                  value: {
                      ...expenseReport,
                      lastMessageText: ReportActionsUtils.getReportActionText(optimisticSubmittedReportAction),
                      lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticSubmittedReportAction),
                      stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                      statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                  },
              },
          ]
        : [
              {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                  value: {
                      ...expenseReport,
                      stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                      statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                  },
              },
          ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStep,
    });

    if (parentReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                ...parentReport,
                // In case its a manager who force submitted the report, they are the next user who needs to take an action
                hasOutstandingChildRequest: isCurrentUserManager,
                iouReportID: null,
            },
        });
    }

    const successData: OnyxUpdate[] = [];
    if (!isSubmitAndClosePolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: currentNextStep,
        },
    ];
    if (!isSubmitAndClosePolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        });
    }

    if (parentReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                hasOutstandingChildRequest: parentReport.hasOutstandingChildRequest,
                iouReportID: expenseReport.reportID,
            },
        });
    }

    const parameters: SubmitReportParams = {
        reportID: expenseReport.reportID,
        managerAccountID: PolicyUtils.getSubmitToAccountID(policy, expenseReport.ownerAccountID ?? -1) ?? expenseReport.managerID,
        reportActionID: optimisticSubmittedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, successData, failureData});
}

function cancelPayment(expenseReport: OnyxEntry<OnyxTypes.Report>, chatReport: OnyxTypes.Report) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticReportAction = ReportUtils.buildOptimisticCancelPaymentReportAction(expenseReport.reportID, -(expenseReport.total ?? 0), expenseReport.currency ?? '');
    const policy = PolicyUtils.getPolicy(chatReport.policyID);
    const approvalMode = policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.BASIC;
    const stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM> = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATE_NUM.SUBMITTED : CONST.REPORT.STATE_NUM.APPROVED;
    const statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM> = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.APPROVED;
    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, statusNum);
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    ...(optimisticReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                lastMessageText: ReportActionsUtils.getReportActionText(optimisticReportAction),
                lastMessageHtml: ReportActionsUtils.getReportActionHtml(optimisticReportAction),
                stateNum,
                statusNum,
            },
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStep,
    });

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID ?? '-1']: {
                    errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            },
        },
    ];

    if (chatReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                hasOutstandingChildRequest: true,
                iouReportID: expenseReport.reportID,
            },
        });
    }
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: NextStepUtils.buildNextStep(expenseReport, CONST.REPORT.STATUS_NUM.REIMBURSED),
    });

    API.write(
        WRITE_COMMANDS.CANCEL_PAYMENT,
        {
            iouReportID: expenseReport.reportID,
            chatReportID: chatReport.reportID,
            managerAccountID: expenseReport.managerID ?? -1,
            reportActionID: optimisticReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Completes onboarding for invite link flow based on the selected payment option
 *
 * @param paymentSelected based on which we choose the onboarding choice and concierge message
 */
function completePaymentOnboarding(paymentSelected: ValueOf<typeof CONST.PAYMENT_SELECTED>) {
    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;

    if (isInviteOnboardingComplete || !introSelected?.choice) {
        return;
    }

    const session = SessionUtils.getSession();

    const personalDetailsListValues = Object.values(OptionsListUtils.getPersonalDetailsForAccountIDs(session?.accountID ? [session.accountID] : [], personalDetailsList));
    const personalDetails = personalDetailsListValues[0] ?? {};

    let onboardingPurpose = introSelected.choice;
    if (introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU && paymentSelected === CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.MANAGE_TEAM;
    }

    if (introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE && paymentSelected !== CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
    }

    Report.completeOnboarding(
        onboardingPurpose,
        CONST.ONBOARDING_MESSAGES[onboardingPurpose],
        {
            firstName: personalDetails.firstName ?? '',
            lastName: personalDetails.lastName ?? '',
        },
        paymentSelected,
    );
}

function payMoneyRequest(paymentType: PaymentMethodType, chatReport: OnyxTypes.Report, iouReport: OnyxEntry<OnyxTypes.Report>, full = true) {
    if (chatReport.policyID && SubscriptionUtils.shouldRestrictUserBillableActions(chatReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(chatReport.policyID));
        return;
    }

    const paymentSelected = paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected);

    const recipient = {accountID: iouReport?.ownerAccountID ?? -1};
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, paymentType, full);

    // For now, we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : WRITE_COMMANDS.PAY_MONEY_REQUEST;

    API.write(apiCommand, params, {optimisticData, successData, failureData});
}

function payInvoice(paymentMethodType: PaymentMethodType, chatReport: OnyxTypes.Report, invoiceReport: OnyxEntry<OnyxTypes.Report>, payAsBusiness = false) {
    const recipient = {accountID: invoiceReport?.ownerAccountID ?? -1};
    const {
        optimisticData,
        successData,
        failureData,
        params: {
            reportActionID,
            policyID,
            announceChatReportID,
            announceCreatedReportActionID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        },
    } = getPayMoneyRequestParams(chatReport, invoiceReport, recipient, paymentMethodType, true, payAsBusiness);

    const paymentSelected = paymentMethodType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected);

    let params: PayInvoiceParams = {
        reportID: invoiceReport?.reportID ?? '',
        reportActionID,
        paymentMethodType,
        payAsBusiness,
    };

    if (policyID) {
        params = {
            ...params,
            policyID,
            announceChatReportID,
            announceCreatedReportActionID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };
    }

    API.write(WRITE_COMMANDS.PAY_INVOICE, params, {optimisticData, successData, failureData});
}

function detachReceipt(transactionID: string) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const newTransaction = transaction
        ? {
              ...transaction,
              filename: '',
              receipt: {
                  source: '',
              },
          }
        : null;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: newTransaction,
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...(transaction ?? null),
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.receiptDeleteFailureError'),
            },
        },
    ];

    const parameters: DetachReceiptParams = {transactionID};

    API.write(WRITE_COMMANDS.DETACH_RECEIPT, parameters, {optimisticData, failureData});
}

function replaceReceipt(transactionID: string, file: File, source: string) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const oldReceipt = transaction?.receipt ?? {};
    const receiptOptimistic = {
        source,
        state: CONST.IOU.RECEIPT_STATE.OPEN,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: receiptOptimistic,
                filename: file.name,
            },
        },
    ];
    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                filename: transaction?.filename,
                errors: getReceiptError(receiptOptimistic, file.name),
            },
        },
    ];

    const parameters: ReplaceReceiptParams = {
        transactionID,
        receipt: file,
    };

    API.write(WRITE_COMMANDS.REPLACE_RECEIPT, parameters, {optimisticData, failureData});
}

/**
 * Finds the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function setMoneyRequestParticipantsFromReport(transactionID: string, report: OnyxEntry<OnyxTypes.Report>): Participant[] {
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    const chatReport = ReportUtils.isMoneyRequestReport(report) ? ReportUtils.getReportOrDraftReport(report?.chatReportID) : report;
    const currentUserAccountID = currentUserPersonalDetails?.accountID;
    const shouldAddAsReport = !isEmptyObject(chatReport) && ReportUtils.isSelfDM(chatReport);
    let participants: Participant[] = [];

    if (ReportUtils.isPolicyExpenseChat(chatReport) || shouldAddAsReport) {
        participants = [{accountID: 0, reportID: chatReport?.reportID, isPolicyExpenseChat: ReportUtils.isPolicyExpenseChat(chatReport), selected: true}];
    } else if (ReportUtils.isInvoiceRoom(chatReport)) {
        participants = [
            {reportID: chatReport?.reportID, selected: true},
            {
                policyID: chatReport?.policyID,
                isSender: true,
                selected: false,
            },
        ];
    } else {
        const chatReportOtherParticipants = Object.keys(chatReport?.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID);
        participants = chatReportOtherParticipants.map((accountID) => ({accountID, selected: true}));
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {participants, participantsAutoAssigned: true});

    return participants;
}

function setMoneyRequestTaxRate(transactionID: string, taxCode: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxCode});
}

function setMoneyRequestTaxAmount(transactionID: string, taxAmount: number | null) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxAmount});
}

function dismissHoldUseExplanation() {
    const parameters: SetNameValuePairParams = {
        name: ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION,
        value: true,
    };

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_DISMISSED_HOLD_USE_EXPLANATION,
            value: true,
        },
    ];

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData,
    });
}

/**
 * Sets the `splitShares` map that holds individual shares of a split bill
 */
function setSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, amount: number, currency: string, newAccountIDs: number[]) {
    if (!transaction) {
        return;
    }
    const oldAccountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));

    // Create an array containing unique IDs of the current transaction participants and the new ones
    // The current userAccountID might not be included in newAccountIDs if this is called from the participants step using Global Create
    // If this is called from an existing group chat, it'll be included. So we manually add them to account for both cases.
    const accountIDs = [...new Set<number>([userAccountID, ...newAccountIDs, ...oldAccountIDs])];

    const splitShares: SplitShares = accountIDs.reduce((acc: SplitShares, accountID): SplitShares => {
        // We want to replace the contents of splitShares to contain only `newAccountIDs` entries
        // In the case of going back to the participants page and removing a participant
        // a simple merge will have the previous participant still present in the splitshares object
        // So we manually set their entry to null
        if (!newAccountIDs.includes(accountID) && accountID !== userAccountID) {
            acc[accountID] = null;
            return acc;
        }

        const isPayer = accountID === userAccountID;
        const participantsLength = newAccountIDs.includes(userAccountID) ? newAccountIDs.length - 1 : newAccountIDs.length;
        const splitAmount = IOUUtils.calculateAmount(participantsLength, amount, currency, isPayer);
        acc[accountID] = {
            amount: splitAmount,
            isModified: false,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

function resetSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, newAmount?: number, currency?: string) {
    if (!transaction) {
        return;
    }
    const accountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));
    if (!accountIDs) {
        return;
    }
    setSplitShares(transaction, newAmount ?? transaction.amount, currency ?? transaction.currency, accountIDs);
}

/**
 * Sets an individual split share of the participant accountID supplied
 */
function setIndividualShare(transactionID: string, participantAccountID: number, participantShare: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        splitShares: {
            [participantAccountID]: {amount: participantShare, isModified: true},
        },
    });
}

/**
 * Adjusts remaining unmodified shares when another share is modified
 * E.g. if total bill is $100 and split between 3 participants, when the user changes the first share to $50, the remaining unmodified shares will become $25 each.
 */
function adjustRemainingSplitShares(transaction: NonNullable<OnyxTypes.Transaction>) {
    const modifiedShares = Object.keys(transaction.splitShares ?? {}).filter((key: string) => transaction?.splitShares?.[Number(key)]?.isModified);

    if (!modifiedShares.length) {
        return;
    }

    const sumOfManualShares = modifiedShares
        .map((key: string): number => transaction?.splitShares?.[Number(key)]?.amount ?? 0)
        .reduce((prev: number, current: number): number => prev + current, 0);

    const unmodifiedSharesAccountIDs = Object.keys(transaction.splitShares ?? {})
        .filter((key: string) => !transaction?.splitShares?.[Number(key)]?.isModified)
        .map((key: string) => Number(key));

    const remainingTotal = transaction.amount - sumOfManualShares;
    if (remainingTotal < 0) {
        return;
    }

    const splitShares: SplitShares = unmodifiedSharesAccountIDs.reduce((acc: SplitShares, accountID: number, index: number): SplitShares => {
        const splitAmount = IOUUtils.calculateAmount(unmodifiedSharesAccountIDs.length - 1, remainingTotal, transaction.currency, index === 0);
        acc[accountID] = {
            amount: splitAmount,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

/**
 * Put expense on HOLD
 */
function putOnHold(transactionID: string, comment: string, reportID: string) {
    const currentTime = DateUtils.getDBTime();
    const createdReportAction = ReportUtils.buildOptimisticHoldReportAction(currentTime);
    const createdReportActionComment = ReportUtils.buildOptimisticHoldReportActionComment(comment, DateUtils.addMillisecondsFromDateTime(currentTime, 1));
    const newViolation = {name: CONST.VIOLATIONS.HOLD, type: CONST.VIOLATION_TYPES.VIOLATION};
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
    const updatedViolations = [...transactionViolations, newViolation];
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
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                comment: {
                    hold: null,
                },
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericHoldExpenseFailureMessage'),
            },
        },
    ];

    API.write(
        'HoldRequest',
        {
            transactionID,
            comment,
            reportActionID: createdReportAction.reportActionID,
            commentReportActionID: createdReportActionComment.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * Remove expense from HOLD
 */
function unholdRequest(transactionID: string, reportID: string) {
    const createdReportAction = ReportUtils.buildOptimisticUnHoldReportAction();
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

    const optimisticData: OnyxUpdate[] = [
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
            value: transactionViolations?.filter((violation) => violation.name !== CONST.VIOLATIONS.HOLD) ?? [],
        },
    ];

    const successData: OnyxUpdate[] = [
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericUnholdExpenseFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: transactionViolations ?? null,
        },
    ];

    API.write(
        'UnHoldRequest',
        {
            transactionID,
            reportActionID: createdReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
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
) {
    if (!receiptFilename || !receiptPath) {
        return;
    }

    const onFailure = () => {
        setMoneyRequestReceipt(transactionID, '', '', true);
        if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
            return;
        }
        IOUUtils.navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    };
    FileUtils.readFileAsync(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}

/** Save the preferred payment method for a policy */
function savePreferredPaymentMethod(policyID: string, paymentMethod: PaymentMethodType) {
    Onyx.merge(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {[policyID]: paymentMethod});
}

/** Get report policy id of IOU request */
function getIOURequestPolicyID(transaction: OnyxEntry<OnyxTypes.Transaction>, report: OnyxEntry<OnyxTypes.Report>): string {
    // Workspace sender will exist for invoices
    const workspaceSender = transaction?.participants?.find((participant) => participant.isSender);
    return workspaceSender?.policyID ?? report?.policyID ?? '-1';
}

/** Merge several transactions into one by updating the fields of the one we want to keep and deleting the rest */
function mergeDuplicates(params: TransactionMergeParams) {
    const originalSelectedTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`];

    const optimisticTransactionData: OnyxUpdate = {
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

    const failureTransactionData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${params.transactionID}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: originalSelectedTransaction as OnyxTypes.Transaction,
    };

    const optimisticTransactionDuplicatesData: OnyxUpdate[] = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        value: null,
    }));

    const failureTransactionDuplicatesData: OnyxUpdate[] = params.transactionIDList.map((id) => ({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${id}`,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        value: allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`] as OnyxTypes.Transaction,
    }));

    const optimisticTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
        const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? [];
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`,
            value: violations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION),
        };
    });

    const failureTransactionViolations: OnyxUpdate[] = [...params.transactionIDList, params.transactionID].map((id) => {
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

    const expenseReport = ReportConnection.getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`];
    const expenseReportOptimisticData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: (expenseReport?.total ?? 0) - duplicateTransactionTotals,
        },
    };
    const expenseReportFailureData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${params.reportID}`,
        value: {
            total: expenseReport?.total,
        },
    };

    const iouActionsToDelete = Object.values(allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`] ?? {})?.filter(
        (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
            if (!ReportActionsUtils.isMoneyRequestAction(reportAction)) {
                return false;
            }
            const message = ReportActionsUtils.getOriginalMessage(reportAction);
            if (!message?.IOUTransactionID) {
                return false;
            }
            return params.transactionIDList.includes(message.IOUTransactionID);
        },
    );

    const deletedTime = DateUtils.getDBTime();
    const expenseReportActionsOptimisticData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, PartialDeep<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>((val, reportAction) => {
            // eslint-disable-next-line no-param-reassign
            val[reportAction.reportActionID] = {
                originalMessage: {
                    deleted: deletedTime,
                },
                ...(Array.isArray(reportAction.message) &&
                    !!reportAction.message[0] && {
                        message: [
                            {
                                ...reportAction.message[0],
                                deleted: deletedTime,
                            },
                            ...reportAction.message.slice(1),
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
    const expenseReportActionsFailureData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${params.reportID}`,
        value: iouActionsToDelete.reduce<Record<string, NullishDeep<PartialDeep<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>>>>((val, reportAction) => {
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

    const optimisticData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    optimisticData.push(
        optimisticTransactionData,
        ...optimisticTransactionDuplicatesData,
        ...optimisticTransactionViolations,
        expenseReportOptimisticData,
        expenseReportActionsOptimisticData,
    );
    failureData.push(failureTransactionData, ...failureTransactionDuplicatesData, ...failureTransactionViolations, expenseReportFailureData, expenseReportActionsFailureData);

    API.write(WRITE_COMMANDS.TRANSACTION_MERGE, params, {optimisticData, failureData});
}

export {
    adjustRemainingSplitShares,
    approveMoneyRequest,
    canApproveIOU,
    cancelPayment,
    canIOUBePaid,
    cleanUpMoneyRequest,
    clearMoneyRequest,
    completeSplitBill,
    createDistanceRequest,
    createDraftTransaction,
    deleteMoneyRequest,
    deleteTrackExpense,
    detachReceipt,
    dismissHoldUseExplanation,
    editMoneyRequest,
    getIOURequestPolicyID,
    initMoneyRequest,
    navigateToStartStepIfScanFileCannotBeRead,
    completePaymentOnboarding,
    payInvoice,
    payMoneyRequest,
    putOnHold,
    replaceReceipt,
    requestMoney,
    resetSplitShares,
    savePreferredPaymentMethod,
    sendInvoice,
    sendMoneyElsewhere,
    sendMoneyWithWallet,
    setCustomUnitRateID,
    setDraftSplitTransaction,
    setIndividualShare,
    setMoneyRequestAmount,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestCreated,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestDistanceRate,
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    setMoneyRequestReceipt,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setSplitPayer,
    setSplitShares,
    splitBill,
    splitBillAndOpenReport,
    startMoneyRequest,
    startSplitBill,
    submitReport,
    trackExpense,
    unapproveExpenseReport,
    unholdRequest,
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestBillable,
    updateMoneyRequestCategory,
    updateMoneyRequestDate,
    updateMoneyRequestDescription,
    updateMoneyRequestDistance,
    updateMoneyRequestDistanceRate,
    updateMoneyRequestMerchant,
    updateMoneyRequestTag,
    updateMoneyRequestTaxAmount,
    updateMoneyRequestTaxRate,
    mergeDuplicates,
};
export type {GPSPoint as GpsPoint, IOURequestType};
