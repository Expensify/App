import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
import {format} from 'date-fns';
import fastMerge from 'expensify-common/lib/fastMerge';
import Str from 'expensify-common/lib/str';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import * as API from '@libs/API';
import type {
    ApproveMoneyRequestParams,
    CompleteSplitBillParams,
    CreateDistanceRequestParams,
    DeleteMoneyRequestParams,
    DetachReceiptParams,
    EditMoneyRequestParams,
    PayMoneyRequestParams,
    ReplaceReceiptParams,
    RequestMoneyParams,
    SendMoneyParams,
    SplitBillParams,
    StartSplitBillParams,
    SubmitReportParams,
    TrackExpenseParams,
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
import Navigation from '@libs/Navigation/Navigation';
import * as NextStepUtils from '@libs/NextStepUtils';
import Permissions from '@libs/Permissions';
import * as PhoneNumber from '@libs/PhoneNumber';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction, TransactionDetails} from '@libs/ReportUtils';
import * as TransactionUtils from '@libs/TransactionUtils';
import * as UserUtils from '@libs/UserUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import type {MoneyRequestNavigatorParamList, NavigationPartialRoute} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Participant, Split} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Comment, Receipt, ReceiptSource, TaxRate, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import * as CachedPDFPaths from './CachedPDFPaths';
import * as Policy from './Policy';
import * as Report from './Report';

type MoneyRequestRoute = StackScreenProps<MoneyRequestNavigatorParamList, typeof SCREENS.MONEY_REQUEST.CONFIRMATION>['route'];

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
    iouReport?: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID: string;
    createdIOUReportActionID?: string;
    reportPreviewAction?: OnyxTypes.ReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string;
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
    params: PayMoneyRequestParams;
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

type OutstandingChildRequest = {
    hasOutstandingChildRequest?: boolean;
};

let betas: OnyxTypes.Beta[] = [];
Onyx.connect({
    key: ONYXKEYS.BETAS,
    callback: (value) => (betas = value ?? []),
});

let allPersonalDetails: OnyxTypes.PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

let allReports: OnyxCollection<OnyxTypes.Report> = null;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => (allReports = value),
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

let currentUserPersonalDetails: OnyxTypes.PersonalDetails | EmptyObject = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        currentUserPersonalDetails = value?.[userAccountID] ?? {};
    },
});

let currentDate: OnyxEntry<string> = '';
Onyx.connect({
    key: ONYXKEYS.CURRENT_DATE,
    callback: (value) => {
        currentDate = value;
    },
});

let lastSelectedDistanceRates: OnyxEntry<OnyxTypes.LastSelectedDistanceRates> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES,
    callback: (value) => {
        lastSelectedDistanceRates = value;
    },
});

let quickAction: OnyxEntry<OnyxTypes.QuickAction> = {};
Onyx.connect({
    key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
    callback: (value) => {
        quickAction = value;
    },
});

/**
 * Initialize money request info
 * @param reportID to attach the transaction to
 * @param policy
 * @param isFromGlobalCreate
 * @param iouRequestType one of manual/scan/distance
 */
function initMoneyRequest(reportID: string, policy: OnyxEntry<OnyxTypes.Policy>, isFromGlobalCreate: boolean, iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL) {
    // Generate a brand new transactionID
    const newTransactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    // Disabling this line since currentDate can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const created = currentDate || format(new Date(), 'yyyy-MM-dd');
    const comment: Comment = {};

    // Add initial empty waypoints when starting a distance request
    if (iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE) {
        comment.waypoints = {
            waypoint0: {},
            waypoint1: {},
        };
        const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? null;
        let customUnitRateID: string = CONST.CUSTOM_UNITS.FAKE_P2P_ID;
        if (ReportUtils.isPolicyExpenseChat(report)) {
            customUnitRateID = lastSelectedDistanceRates?.[policy?.id ?? ''] ?? DistanceRequestUtils.getDefaultMileageRate(policy)?.customUnitRateID ?? '';
        }
        comment.customUnit = {customUnitRateID};
    }

    // Store the transaction in Onyx and mark it as not saved so it can be cleaned up later
    // Use set() here so that there is no way that data will be leaked between objects when it gets reset
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
        amount: 0,
        comment,
        created,
        currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
        iouRequestType,
        reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate,
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
    });
}

function clearMoneyRequest(transactionID: string) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, null);
}

/**
 * Update money request-related pages IOU type params
 */
function updateMoneyRequestTypeParams(routes: StackNavigationState<ParamListBase>['routes'] | NavigationPartialRoute[], newIouType: string, tab: string) {
    routes.forEach((route) => {
        const tabList = [CONST.TAB_REQUEST.DISTANCE, CONST.TAB_REQUEST.MANUAL, CONST.TAB_REQUEST.SCAN] as string[];
        if (!route.name.startsWith('Money_Request_') && !tabList.includes(route.name)) {
            return;
        }
        const newParams: Record<string, unknown> = {iouType: newIouType};
        if (route.name === 'Money_Request_Create') {
            // Both screen and nested params are needed to properly update the nested tab navigator
            newParams.params = {...newParams};
            newParams.screen = tab;
        }
        Navigation.setParams(newParams, route.key ?? '');

        // Recursively update nested money request tab params
        updateMoneyRequestTypeParams(route.state?.routes ?? [], newIouType, tab);
    });
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function startMoneyRequest(iouType: ValueOf<typeof CONST.IOU.TYPE>, reportID: string, requestType?: ValueOf<typeof CONST.IOU.REQUEST_TYPE>) {
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
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

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestAmount_temporaryForRefactor(transactionID: string, amount: number, currency: string, removeOriginalCurrency = false) {
    if (removeOriginalCurrency) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, originalCurrency: null});
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency});
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestCurrency_temporaryForRefactor(transactionID: string, currency: string, removeOriginalCurrency = false) {
    if (removeOriginalCurrency) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {currency, originalCurrency: null});
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {currency});
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestOriginalCurrency_temporaryForRefactor(transactionID: string, originalCurrency: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {originalCurrency});
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

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestBillable_temporaryForRefactor(transactionID: string, billable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {billable});
}

// eslint-disable-next-line @typescript-eslint/naming-convention
function setMoneyRequestParticipants_temporaryForRefactor(transactionID: string, participants: Participant[]) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {participants});
}

function setMoneyRequestReceipt(transactionID: string, source: string, filename: string, isDraft: boolean, type?: string) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        receipt: {source, type: type ?? ''},
        filename,
    });
}

/** Reset money request info from the store with its initial value */
function resetMoneyRequestInfo(id = '') {
    // Disabling this line since currentDate can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const created = currentDate || format(new Date(), CONST.DATE.FNS_FORMAT_STRING);
    Onyx.merge(ONYXKEYS.IOU, {
        id,
        amount: 0,
        currency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
        comment: '',
        participants: [],
        merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        category: '',
        tag: '',
        created,
        receiptPath: '',
        receiptFilename: '',
        transactionID: '',
        billable: null,
        isSplitRequest: false,
    });
}

/** Helper function to get the receipt error for money requests, or the generic error if there's no receipt */
function getReceiptError(receipt?: Receipt, filename?: string, isScanRequest = true, errorKey?: number): Errors | ErrorFields {
    return isEmptyObject(receipt) || !isScanRequest
        ? ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage', false, errorKey)
        : ErrorUtils.getMicroSecondOnyxErrorObject({error: CONST.IOU.RECEIPT_ERROR, source: receipt.source?.toString() ?? '', filename: filename ?? ''}, errorKey);
}

function needsToBeManuallySubmitted(iouReport: OnyxTypes.Report) {
    const isPolicyExpenseChat = ReportUtils.isExpenseReport(iouReport);

    if (isPolicyExpenseChat) {
        const policy = ReportUtils.getPolicy(iouReport.policyID);
        const isFromPaidPolicy = PolicyUtils.isPaidGroupPolicy(policy);

        // If the scheduled submit is turned off on the policy, user needs to manually submit the report which is indicated by GBR in LHN
        return isFromPaidPolicy && !policy.harvesting?.enabled;
    }

    return true;
}

/**
 * Return the object to update hasOutstandingChildRequest
 */
function getOutstandingChildRequest(policy: OnyxEntry<OnyxTypes.Policy> | EmptyObject, iouReport: OnyxTypes.Report): OutstandingChildRequest {
    if (!needsToBeManuallySubmitted(iouReport)) {
        return {
            hasOutstandingChildRequest: false,
        };
    }

    if (PolicyUtils.isPolicyAdmin(policy)) {
        return {
            hasOutstandingChildRequest: true,
        };
    }

    return {
        hasOutstandingChildRequest: iouReport.managerID === userAccountID && iouReport.total !== 0,
    };
}

/** Builds the Onyx data for a money request */
function buildOnyxDataForMoneyRequest(
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
    transactionThreadCreatedReportAction: OptimisticCreatedReportAction,
    shouldCreateNewMoneyRequestReport: boolean,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    optimisticNextStep?: OnyxTypes.ReportNextStep | null,
    isOneOnOneSplit = false,
): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const isScanRequest = TransactionUtils.isScanRequest(transaction);
    const outstandingChildRequest = getOutstandingChildRequest(policy ?? {}, iouReport);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: OnyxUpdate[] = [];
    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS> = isScanRequest ? CONST.QUICK_ACTIONS.REQUEST_SCAN : CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    if (TransactionUtils.isDistanceRequest(transaction)) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }

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
                lastMessageText: iouAction.message?.[0].text,
                lastMessageHtml: iouAction.message?.[0].html,
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
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: transactionThreadReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        },

        // Remove the temporary transaction used during the creation flow
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    );

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

    if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport.policyID}`,
            value: optimisticPolicyRecentlyUsedTags,
        });
    }

    if (!isEmptyObject(optimisticPersonalDetailListAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        });
    }

    if (!isEmptyObject(optimisticNextStep)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: optimisticNextStep,
        });
    }

    const successData: OnyxUpdate[] = [];

    if (isNewChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
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
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    );

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
                              createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
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
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage')} : {}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
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
                              errors: ErrorUtils.getMicroSecondOnyxError(null),
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage', false, errorKey),
                },
            },
        },
    ];

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !PolicyUtils.isPaidGroupPolicy(policy)) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(transaction, [], !!policy.requiresTag, policyTagList ?? {}, !!policy.requiresCategory, policyCategories ?? {});

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
    chatReport: OnyxEntry<OnyxTypes.Report>,
    transaction: OnyxTypes.Transaction,
    iouAction: OptimisticIOUReportAction,
    transactionThreadReport: OptimisticChatReport,
    transactionThreadCreatedReportAction: OptimisticCreatedReportAction,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const isScanRequest = TransactionUtils.isScanRequest(transaction);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const optimisticData: OnyxUpdate[] = [];

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastMessageText: iouAction.message?.[0].text,
                lastMessageHtml: iouAction.message?.[0].html,
                lastReadTime: DateUtils.getDBTime(),
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
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
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        },

        // Remove the temporary transaction used during the creation flow
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`,
            value: null,
        },
    );

    const successData: OnyxUpdate[] = [];

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
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
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
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
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    );

    const failureData: OnyxUpdate[] = [
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
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    // Disabling this line since transaction.filename can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    errors: getReceiptError(transaction.receipt, transaction.filename || transaction.receipt?.filename, isScanRequest),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !PolicyUtils.isPaidGroupPolicy(policy)) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(transaction, [], !!policy.requiresTag, policyTagList ?? {}, !!policy.requiresCategory, policyCategories ?? {});

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

/**
 * Gathers all the data needed to make a money request. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getMoneyRequestInformation(
    parentChatReport: OnyxEntry<OnyxTypes.Report> | EmptyObject,
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
    billable: boolean | undefined,
    policy: OnyxEntry<OnyxTypes.Policy> | undefined,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList> | undefined,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories> | undefined,
    payeeAccountID = userAccountID,
    payeeEmail = currentUserEmail,
    moneyRequestReportID = '',
): MoneyRequestInformation {
    const payerEmail = PhoneNumber.addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([payerAccountID]);
    }

    // If we still don't have a report, it likely doens't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = ReportUtils.buildOptimisticChatReport([payerAccountID]);
    }

    // STEP 2: Get the money request report. If the moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic money request report.
    let iouReport: OnyxEntry<OnyxTypes.Report> = null;
    if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const shouldCreateNewMoneyRequestReport = ReportUtils.shouldCreateNewMoneyRequestReport(iouReport, chatReport);

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        iouReport = isPolicyExpenseChat
            ? ReportUtils.buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID ?? '', payeeAccountID, amount, currency)
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

    // STEP 3: Build optimistic receipt and transaction
    const receiptObject: Receipt = {};
    let filename;
    if (receipt?.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = receipt.state ?? CONST.IOU.RECEIPT_STATE.SCANREADY;
        filename = receipt.name;
    }
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
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
        receiptObject,
        filename,
        existingTransactionID,
        category,
        tag,
        billable,
        isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
    );

    const optimisticPolicyRecentlyUsedCategories = Policy.buildOptimisticPolicyRecentlyUsedCategories(iouReport.policyID, category);
    const optimisticPolicyRecentlyUsedTags = Policy.buildOptimisticPolicyRecentlyUsedTags(iouReport.policyID, tag);

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
    // 5. REPORTPREVIEW action for the chatReport
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
            receiptObject,
            false,
        );

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : ReportActionsUtils.getReportPreviewAction(chatReport.reportID, iouReport.reportID);
    if (reportPreviewAction) {
        reportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);

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
                  avatar: UserUtils.getDefaultAvatarURL(payerAccountID),
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
        optimisticTransactionThread,
        optimisticCreatedActionForTransactionThread,
        shouldCreateNewMoneyRequestReport,
        policy,
        policyTagList,
        policyCategories,
        optimisticNextStep,
    );

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : '0',
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : '0',
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread.reportActionID,
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
    parentChatReport: OnyxEntry<OnyxTypes.Report> | EmptyObject,
    participant: Participant,
    comment: string,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    receipt: Receipt | undefined,
    category: string | undefined,
    tag: string | undefined,
    billable: boolean | undefined,
    policy: OnyxEntry<OnyxTypes.Policy> | undefined,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList> | undefined,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories> | undefined,
    payeeEmail = currentUserEmail,
): TrackExpenseInformation | EmptyObject {
    // STEP 1: Get existing chat report
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // The chatReport always exist and we can get it from Onyx if chatReport is null.
    if (!chatReport) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    // If we still don't have a report, it likely doens't exist and we will early return here as it should not happen
    // Maybe later, we can build an optimistic selfDM chat.
    if (!chatReport) {
        return {};
    }

    // STEP 2: Get the money request report.
    // TODO: This is deferred to later as we are not sure if we create iouReport at all in future.
    // We can build an optimistic iouReport here if needed.

    // STEP 3: Build optimistic receipt and transaction
    const receiptObject: Receipt = {};
    let filename;
    if (receipt?.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = receipt.state ?? CONST.IOU.RECEIPT_STATE.SCANREADY;
        filename = receipt.name;
    }
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let optimisticTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        chatReport.reportID,
        comment,
        created,
        '',
        '',
        merchant,
        receiptObject,
        filename,
        null,
        category,
        tag,
        billable,
        isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
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
    // 1. IOU action for the chatReport
    // 2. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    const currentTime = DateUtils.getDBTime();
    const iouAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount,
        currency,
        comment,
        [participant],
        optimisticTransaction.transactionID,
        undefined,
        '0',
        false,
        false,
        receiptObject,
        false,
        currentTime,
    );
    const optimisticTransactionThread = ReportUtils.buildTransactionThread(iouAction, chatReport);
    const optimisticCreatedActionForTransactionThread = ReportUtils.buildOptimisticCreatedReportAction(payeeEmail);

    // The IOU action and the transactionThread are co-dependent as parent-child, so we need to link them together
    iouAction.childReportID = optimisticTransactionThread.reportID;

    // STEP 5: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForTrackExpense(
        chatReport,
        optimisticTransaction,
        iouAction,
        optimisticTransactionThread,
        optimisticCreatedActionForTransactionThread,
        policy,
        policyTagList,
        policyCategories,
    );

    return {
        chatReport,
        iouReport: undefined,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: '0',
        createdIOUReportActionID: undefined,
        reportPreviewAction: undefined,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread.reportActionID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

/** Requests money based on a distance (eg. mileage from a map) */
function createDistanceRequest(
    report: OnyxTypes.Report,
    participant: Participant,
    comment: string,
    created: string,
    category: string | undefined,
    tag: string | undefined,
    amount: number,
    currency: string,
    merchant: string,
    billable: boolean | undefined,
    validWaypoints: WaypointCollection,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? ReportUtils.getReport(report.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report.reportID : '';
    const currentCreated = DateUtils.enrichMoneyRequestTimestamp(created);

    const optimisticReceipt: Receipt = {
        source: ReceiptGeneric as ReceiptSource,
        state: CONST.IOU.RECEIPT_STATE.OPEN,
    };
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
        onyxData,
    } = getMoneyRequestInformation(
        currentChatReport,
        participant,
        comment,
        amount,
        currency,
        currentCreated,
        merchant,
        optimisticReceipt,
        undefined,
        category,
        tag,
        billable,
        policy,
        policyTagList,
        policyCategories,
        userAccountID,
        currentUserEmail,
        moneyRequestReportID,
    );

    const parameters: CreateDistanceRequestParams = {
        comment,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        waypoints: JSON.stringify(validWaypoints),
        created: currentCreated,
        category,
        tag,
        billable,
        transactionThreadReportID,
        createdReportActionIDForThread,
        payerEmail,
    };

    API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    Navigation.dismissModal(isMoneyRequestReport ? report.reportID : chatReport.reportID);
    Report.notifyNewAction(chatReport.reportID, userAccountID);
}

/**
 * Compute the diff amount when we update the transaction
 */
function calculateDiffAmount(iouReport: OnyxEntry<OnyxTypes.Report>, updatedTransaction: OnyxEntry<OnyxTypes.Transaction>, transaction: OnyxEntry<OnyxTypes.Transaction>): number {
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
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
    onlyIncludeChangedFields: boolean,
): UpdateMoneyRequestData {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null]));
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, {[DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericEditFailureMessage')}]));

    // Step 2: Get all the collections being updated
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const isFromExpenseReport = ReportUtils.isExpenseReport(iouReport);
    const isScanning = TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction);
    let updatedTransaction = transaction ? TransactionUtils.getUpdatedTransaction(transaction, transactionChanges, isFromExpenseReport) : null;
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
    if (transaction && updatedTransaction && hasPendingWaypoints) {
        updatedTransaction = {
            ...updatedTransaction,
            amount: CONST.IOU.DEFAULT_AMOUNT,
            modifiedAmount: CONST.IOU.DEFAULT_AMOUNT,
            modifiedMerchant: Localize.translateLocal('iou.routePending'),
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
    // We don't create a modified report action if we're updating the waypoints,
    // since there isn't actually any optimistic data we can create for them and the report action is created on the server
    // with the response from the MapBox API
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport);
    if (!hasPendingWaypoints) {
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
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericEditFailureMessage'),
                },
            },
        });
    }

    // Step 4: Compute the IOU total and update the report preview message (and report header) so LHN amount owed is correct.
    let updatedMoneyRequestReport = {...iouReport};
    const diff = calculateDiffAmount(iouReport, updatedTransaction, transaction);

    if (ReportUtils.isExpenseReport(iouReport) && typeof updatedMoneyRequestReport.total === 'number') {
        // For expense report, the amount is negative so we should subtract total from diff
        updatedMoneyRequestReport.total -= diff;
    } else {
        updatedMoneyRequestReport = iouReport
            ? IOUUtils.updateIOUOwnerAndTotal(iouReport, updatedReportAction.actorAccountID ?? -1, diff, TransactionUtils.getCurrency(transaction), false, true)
            : {};
    }
    updatedMoneyRequestReport.cachedTotal = CurrencyUtils.convertToDisplayString(updatedMoneyRequestReport.total, transactionDetails?.currency);

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedMoneyRequestReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
            value: {
                hasOutstandingChildRequest:
                    iouReport && needsToBeManuallySubmitted(iouReport) && updatedMoneyRequestReport.managerID === userAccountID && updatedMoneyRequestReport.total !== 0,
            },
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
                    [transactionThread?.parentReportActionID ?? '']: {
                        whisperedToAccountIDs: [],
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport?.parentReportActionID ?? '']: {
                        whisperedToAccountIDs: [],
                    },
                },
            },
        );
    }

    // Update recently used categories if the category is changed
    if ('category' in transactionChanges) {
        const optimisticPolicyRecentlyUsedCategories = Policy.buildOptimisticPolicyRecentlyUsedCategories(iouReport?.policyID, transactionChanges.category);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used categories if the tag is changed
    if ('tag' in transactionChanges) {
        const optimisticPolicyRecentlyUsedTags = Policy.buildOptimisticPolicyRecentlyUsedTags(iouReport?.policyID, transactionChanges.tag);
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

    if (policy && PolicyUtils.isPaidGroupPolicy(policy) && updatedTransaction) {
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        optimisticData.push(
            ViolationsUtils.getViolationsOnyxData(
                updatedTransaction,
                currentTransactionViolations,
                !!policy.requiresTag,
                policyTagList ?? {},
                !!policy.requiresCategory,
                policyCategories ?? {},
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
 */
function getUpdateTrackExpenseParams(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    onlyIncludeChangedFields: boolean,
): UpdateMoneyRequestData {
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null]));
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, {[DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericEditFailureMessage')}]));

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
    if (transaction && updatedTransaction && hasPendingWaypoints) {
        updatedTransaction = {
            ...updatedTransaction,
            amount: CONST.IOU.DEFAULT_AMOUNT,
            modifiedAmount: CONST.IOU.DEFAULT_AMOUNT,
            modifiedMerchant: Localize.translateLocal('iou.routePending'),
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
    // We don't create a modified report action if we're updating the waypoints,
    // since there isn't actually any optimistic data we can create for them and the report action is created on the server
    // with the response from the MapBox API
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, false);
    if (!hasPendingWaypoints) {
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
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericEditFailureMessage'),
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
                [transactionThread?.parentReportActionID ?? '']: {
                    whisperedToAccountIDs: [],
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

/** Updates the created date of a money request */
function updateMoneyRequestDate(
    transactionID: string,
    transactionThreadReportID: string,
    value: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTags: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        created: value,
    };
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, params, onyxData);
}

/** Updates the billable field of a money request */
function updateMoneyRequestBillable(
    transactionID: string,
    transactionThreadReportID: string,
    value: boolean,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        billable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, params, onyxData);
}

/** Updates the merchant field of a money request */
function updateMoneyRequestMerchant(
    transactionID: string,
    transactionThreadReportID: string,
    value: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        merchant: value,
    };
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, params, onyxData);
}

/** Updates the tag of a money request */
function updateMoneyRequestTag(
    transactionID: string,
    transactionThreadReportID: string,
    tag: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        tag,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, params, onyxData);
}

/** Updates the waypoints of a distance money request */
function updateMoneyRequestDistance(
    transactionID: string,
    transactionThreadReportID: string,
    waypoints: WaypointCollection,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        waypoints,
    };
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE, params, onyxData);
}

/** Updates the category of a money request */
function updateMoneyRequestCategory(
    transactionID: string,
    transactionThreadReportID: string,
    category: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        category,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, params, onyxData);
}

/** Updates the description of a money request */
function updateMoneyRequestDescription(
    transactionID: string,
    transactionThreadReportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges: TransactionChanges = {
        comment,
    };
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    let data: UpdateMoneyRequestData;
    if (ReportUtils.isTrackExpenseReport(transactionThreadReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReportID, transactionChanges, true);
    } else {
        data = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, params, onyxData);
}

/** Edits an existing distance request */
function updateDistanceRequest(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.Policy,
    policyTagList: OnyxTypes.PolicyTagList,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, false);
    API.write(WRITE_COMMANDS.UPDATE_DISTANCE_REQUEST, params, onyxData);
}

/**
 * Request money from another user
 */
function requestMoney(
    report: OnyxTypes.Report,
    amount: number,
    currency: string,
    created: string,
    merchant: string,
    payeeEmail: string,
    payeeAccountID: number,
    participant: Participant,
    comment: string,
    receipt: Receipt,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    gpsPoints = undefined,
) {
    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
    const currentChatReport = isMoneyRequestReport ? ReportUtils.getReport(report.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report.reportID : '';
    const currentCreated = DateUtils.enrichMoneyRequestTimestamp(created);
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
        currentChatReport,
        participant,
        comment,
        amount,
        currency,
        currentCreated,
        merchant,
        receipt,
        undefined,
        category,
        tag,
        billable,
        policy,
        policyTagList,
        policyCategories,
        payeeAccountID,
        payeeEmail,
        moneyRequestReportID,
    );
    const activeReportID = isMoneyRequestReport ? report.reportID : chatReport.reportID;

    const parameters: RequestMoneyParams = {
        debtorEmail: payerEmail,
        debtorAccountID: payerAccountID,
        amount,
        currency,
        comment,
        created: currentCreated,
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
        gpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
        transactionThreadReportID,
        createdReportActionIDForThread,
    };

    API.write(WRITE_COMMANDS.REQUEST_MONEY, parameters, onyxData);
    resetMoneyRequestInfo();
    Navigation.dismissModal(activeReportID);
    Report.notifyNewAction(activeReportID, payeeAccountID);
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
    payeeEmail: string,
    payeeAccountID: number,
    participant: Participant,
    comment: string,
    receipt: Receipt,
    category?: string,
    tag?: string,
    taxCode = '',
    taxAmount = 0,
    billable?: boolean,
    policy?: OnyxEntry<OnyxTypes.Policy>,
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
    gpsPoints = undefined,
) {
    const currentCreated = DateUtils.enrichMoneyRequestTimestamp(created);
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
        onyxData,
    } = getTrackExpenseInformation(
        report,
        participant,
        comment,
        amount,
        currency,
        currentCreated,
        merchant,
        receipt,
        category,
        tag,
        billable,
        policy,
        policyTagList,
        policyCategories,
        payeeEmail,
    );
    const activeReportID = report.reportID;

    const parameters: TrackExpenseParams = {
        amount,
        currency,
        comment,
        created: currentCreated,
        merchant,
        iouReportID: iouReport?.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction?.reportActionID,
        receipt,
        receiptState: receipt?.state,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
        gpsPoints: gpsPoints ? JSON.stringify(gpsPoints) : undefined,
        transactionThreadReportID,
        createdReportActionIDForThread,
    };

    API.write(WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
    resetMoneyRequestInfo();
    Navigation.dismissModal(activeReportID);
    Report.notifyNewAction(activeReportID, payeeAccountID);
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
 * @param existingSplitChatReportID - the report ID where the split bill happens, could be a group chat or a workspace chat
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
    existingSplitChatReportID = '',
    billable = false,
    iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
): SplitsAndOnyxData {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));

    const existingChatReportID = existingSplitChatReportID || participants[0].reportID;
    let existingSplitChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingChatReportID}`];
    if (!existingSplitChatReport) {
        existingSplitChatReport = participants.length < 2 ? ReportUtils.getChatByParticipants(participantAccountIDs) : null;
    }
    let newChat: ReportUtils.OptimisticChatReport | EmptyObject = {};
    const allParticipantsAccountIDs = [...participantAccountIDs, currentUserAccountID];
    if (!existingSplitChatReport && participants.length > 1) {
        newChat = ReportUtils.buildOptimisticChatReport(
            allParticipantsAccountIDs,
            '',
            CONST.REPORT.CHAT_TYPE.GROUP,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        );
    }
    if (isEmptyObject(newChat)) {
        newChat = ReportUtils.buildOptimisticChatReport(allParticipantsAccountIDs);
    }
    const splitChatReport = existingSplitChatReport ?? newChat;
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    const splitTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        CONST.REPORT.SPLIT_REPORTID,
        comment,
        created,
        '',
        '',
        merchant || Localize.translateLocal('iou.request'),
        undefined,
        undefined,
        undefined,
        category,
        tag,
        billable,
    );

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
        {},
        isOwnPolicyExpenseChat,
    );

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = splitIOUReportAction.message?.[0].text;
    splitChatReport.lastMessageHtml = splitIOUReportAction.message?.[0].html;

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
            value: {pendingAction: null},
        },
    ];

    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}},
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
            },
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
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
                        createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError(null),
                    },
                },
            },
        );
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const splitAmount = IOUUtils.calculateAmount(participants.length, amount, currency, false);
    const splits: Split[] = [{email: currentUserEmailForIOUSplit, accountID: currentUserAccountID, amount: IOUUtils.calculateAmount(participants.length, amount, currency, true)}];

    const hasMultipleParticipants = participants.length > 1;
    participants.forEach((participant) => {
        // In a case when a participant is a workspace, even when a current user is not an owner of the workspace
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(participant);

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
            const existingChatReport = ReportUtils.getChatByParticipants([accountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport && !personalDetailExists;
            oneOnOneChatReport = existingChatReport ?? ReportUtils.buildOptimisticChatReport([accountID]);
        }

        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const shouldCreateNewOneOnOneIOUReport = ReportUtils.shouldCreateNewMoneyRequestReport(oneOnOneIOUReport, oneOnOneChatReport);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isOwnPolicyExpenseChat
                ? ReportUtils.buildOptimisticExpenseReport(oneOnOneChatReport.reportID, oneOnOneChatReport.policyID ?? '', currentUserAccountID, splitAmount, currency)
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
            merchant || Localize.translateLocal('iou.request'),
            undefined,
            undefined,
            undefined,
            category,
            tag,
            billable,
        );

        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. Transaction Thread and the CREATED action for it
        // 5. REPORTPREVIEW action for the chatReport
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
                      avatar: UserUtils.getDefaultAvatarURL(accountID),
                      // Disabling this line since participant.displayName can be an empty string
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      displayName: LocalePhoneNumber.formatPhoneNumber(participant.displayName || email),
                      login: participant.login,
                      isOptimisticPersonalDetail: true,
                  },
              }
            : {};

        let oneOnOneReportPreviewAction = ReportActionsUtils.getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = ReportUtils.updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = ReportUtils.buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport);
        }

        // Add category to optimistic policy recently used categories when a participant is a workspace
        const optimisticPolicyRecentlyUsedCategories = isPolicyExpenseChat ? Policy.buildOptimisticPolicyRecentlyUsedCategories(participant.policyID, category) : [];

        // Add tag to optimistic policy recently used tags when a participant is a workspace
        const optimisticPolicyRecentlyUsedTags = isPolicyExpenseChat ? Policy.buildOptimisticPolicyRecentlyUsedTags(participant.policyID, tag) : {};

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
        );

        const individualSplit = {
            email,
            accountID,
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread.reportActionID,
        };

        splits.push(individualSplit);
        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
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

/**
 * @param amount - always in smallest currency unit
 * @param existingSplitChatReportID - Either a group DM or a workspace chat
 */
function splitBill(
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
    existingSplitChatReportID = '',
    billable = false,
    iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
) {
    const currentCreated = DateUtils.enrichMoneyRequestTimestamp(created);
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(
        participants,
        currentUserLogin,
        currentUserAccountID,
        amount,
        comment,
        currency,
        merchant,
        currentCreated,
        category,
        tag,
        existingSplitChatReportID,
        billable,
        iouRequestType,
    );

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        comment,
        category,
        merchant,
        created: currentCreated,
        tag,
        billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
    };

    API.write(WRITE_COMMANDS.SPLIT_BILL, parameters, onyxData);

    resetMoneyRequestInfo();
    Navigation.dismissModal();
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @param amount - always in the smallest currency unit
 */
function splitBillAndOpenReport(
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
    billable: boolean,
    iouRequestType: IOURequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
) {
    const currentCreated = DateUtils.enrichMoneyRequestTimestamp(created);
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(
        participants,
        currentUserLogin,
        currentUserAccountID,
        amount,
        comment,
        currency,
        merchant,
        currentCreated,
        category,
        tag,
        '',
        billable,
        iouRequestType,
    );

    const parameters: SplitBillParams = {
        reportID: splitData.chatReportID,
        amount,
        splits: JSON.stringify(splits),
        currency,
        merchant,
        created: currentCreated,
        comment,
        category,
        tag,
        billable,
        transactionID: splitData.transactionID,
        reportActionID: splitData.reportActionID,
        createdReportActionID: splitData.createdReportActionID,
        policyID: splitData.policyID,
        chatType: splitData.chatType,
    };

    API.write(WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT, parameters, onyxData);

    resetMoneyRequestInfo();
    Navigation.dismissModal(splitData.chatReportID);
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/** Used exclusively for starting a split bill request that contains a receipt, the split request will be completed once the receipt is scanned
 *  or user enters details manually.
 *
 * @param existingSplitChatReportID - Either a group DM or a workspace chat
 */
function startSplitBill(
    participants: Participant[],
    currentUserLogin: string,
    currentUserAccountID: number,
    comment: string,
    category: string,
    tag: string,
    receipt: Receipt,
    existingSplitChatReportID = '',
    billable = false,
) {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));
    const existingSplitChatReport =
        existingSplitChatReportID || participants[0].reportID
            ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingSplitChatReportID || participants[0].reportID}`]
            : ReportUtils.getChatByParticipants(participantAccountIDs);
    const splitChatReport = existingSplitChatReport ?? ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    const {name: filename, source, state = CONST.IOU.RECEIPT_STATE.SCANREADY} = receipt;
    const receiptObject: Receipt = {state, source};

    // ReportID is -2 (aka "deleted") on the group transaction
    const splitTransaction = TransactionUtils.buildOptimisticTransaction(
        0,
        CONST.CURRENCY.USD,
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
        receiptObject,
        isOwnPolicyExpenseChat,
    );

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = splitIOUReportAction.message?.[0].text;
    splitChatReport.lastMessageHtml = splitIOUReportAction.message?.[0].html;

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

    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}},
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
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
                        createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitChatCreatedReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
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
                        avatar: UserUtils.getDefaultAvatarURL(accountID),
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

        const optimisticPolicyRecentlyUsedCategories = Policy.buildOptimisticPolicyRecentlyUsedCategories(participant.policyID, category);
        const optimisticPolicyRecentlyUsedTags = Policy.buildOptimisticPolicyRecentlyUsedTags(participant.policyID, tag);

        if (optimisticPolicyRecentlyUsedCategories.length > 0) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${participant.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
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
        isFromGroupDM: !existingSplitChatReport,
        billable,
        ...(existingSplitChatReport ? {} : {createdReportActionID: splitChatCreatedReportAction.reportActionID}),
    };

    API.write(WRITE_COMMANDS.START_SPLIT_BILL, parameters, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModalWithReport(splitChatReport);
    Report.notifyNewAction(splitChatReport.chatReportID ?? '', currentUserAccountID);
}

/** Used for editing a split bill while it's still scanning or when SmartScan fails, it completes a split bill started by startSplitBill above.
 *
 * @param chatReportID - The group chat or workspace reportID
 * @param reportAction - The split action that lives in the chatReport above
 * @param updatedTransaction - The updated **draft** split transaction
 * @param sessionAccountID - accountID of the current user
 * @param sessionEmail - email of the current user
 */
function completeSplitBill(chatReportID: string, reportAction: OnyxTypes.ReportAction, updatedTransaction: OnyxTypes.Transaction, sessionAccountID: number, sessionEmail: string) {
    const currentUserEmailForIOUSplit = PhoneNumber.addSMSDomainIfPhoneNumber(sessionEmail);
    const {transactionID} = updatedTransaction;
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
                    whisperedToAccountIDs: [],
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
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    const splitParticipants: Split[] = updatedTransaction.comment.splits ?? [];
    const {modifiedAmount: amount, modifiedCurrency: currency} = updatedTransaction;

    // Exclude the current user when calculating the split amount, `calculateAmount` takes it into account
    const splitAmount = IOUUtils.calculateAmount(splitParticipants.length - 1, amount ?? 0, currency ?? '', false);

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
            const participantPersonalDetails: OnyxTypes.PersonalDetails | EmptyObject = allPersonalDetails[participant?.accountID ?? -1] ?? {};
            if (!participantPersonalDetails || participantPersonalDetails.isOptimisticPersonalDetail) {
                splits.push({
                    email: participant.email,
                });
                return;
            }
        }

        let oneOnOneChatReport: OnyxTypes.Report | null;
        let isNewOneOnOneChatReport = false;
        if (isPolicyExpenseChat) {
            // The workspace chat reportID is saved in the splits array when starting a split bill with a workspace
            oneOnOneChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.chatReportID}`] ?? null;
        } else {
            const existingChatReport = ReportUtils.getChatByParticipants(participant.accountID ? [participant.accountID] : []);
            isNewOneOnOneChatReport = !existingChatReport;
            oneOnOneChatReport = existingChatReport ?? ReportUtils.buildOptimisticChatReport(participant.accountID ? [participant.accountID] : []);
        }

        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport?.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const shouldCreateNewOneOnOneIOUReport = ReportUtils.shouldCreateNewMoneyRequestReport(oneOnOneIOUReport, oneOnOneChatReport);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            oneOnOneIOUReport = isPolicyExpenseChat
                ? ReportUtils.buildOptimisticExpenseReport(oneOnOneChatReport?.reportID ?? '', participant.policyID ?? '', sessionAccountID, splitAmount, currency ?? '')
                : ReportUtils.buildOptimisticIOUReport(sessionAccountID, participant.accountID ?? -1, splitAmount, oneOnOneChatReport?.reportID ?? '', currency ?? '');
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
            oneOnOneIOUReport?.reportID ?? '',
            updatedTransaction.comment.comment,
            updatedTransaction.modifiedCreated,
            CONST.IOU.TYPE.SPLIT,
            transactionID,
            updatedTransaction.modifiedMerchant,
            {...updatedTransaction.receipt, state: CONST.IOU.RECEIPT_STATE.OPEN},
            updatedTransaction.filename,
            undefined,
            updatedTransaction.category,
            updatedTransaction.tag,
            updatedTransaction.billable,
        );

        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            ReportUtils.buildOptimisticMoneyRequestEntities(
                oneOnOneIOUReport,
                CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                splitAmount,
                currency ?? '',
                updatedTransaction.comment.comment ?? '',
                currentUserEmailForIOUSplit,
                [participant],
                oneOnOneTransaction.transactionID,
                undefined,
            );

        let oneOnOneReportPreviewAction = ReportActionsUtils.getReportPreviewAction(oneOnOneChatReport?.reportID ?? '', oneOnOneIOUReport?.reportID ?? '');
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
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread.reportActionID,
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
    };

    API.write(WRITE_COMMANDS.COMPLETE_SPLIT_BILL, parameters, {optimisticData, successData, failureData});
    Navigation.dismissModal(chatReportID);
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

function editRegularMoneyRequest(
    transactionID: string,
    transactionThreadReportID: string,
    transactionChanges: TransactionChanges,
    policy: OnyxTypes.Policy,
    policyTags: OnyxTypes.PolicyTagList,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    // STEP 1: Get all collections we're updating
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`] ?? null;
    const isFromExpenseReport = ReportUtils.isExpenseReport(iouReport);

    // STEP 2: Build new modified expense report action.
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport);
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
            iouReport?.reportID ?? '',
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            updatedMoneyRequestReport.total ?? 0,
            '',
            updatedTransaction.currency,
            '',
            false,
        );
        updatedMoneyRequestReport.lastMessageText = lastMessage[0].text;
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
                    [transactionThread?.parentReportActionID ?? '']: {
                        whisperedToAccountIDs: [],
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport?.parentReportActionID ?? '']: {
                        whisperedToAccountIDs: [],
                    },
                },
            },
        );
    }

    // Update recently used categories if the category is changed
    if ('category' in transactionChanges) {
        const optimisticPolicyRecentlyUsedCategories = Policy.buildOptimisticPolicyRecentlyUsedCategories(iouReport?.policyID, transactionChanges.category);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used categories if the tag is changed
    if ('tag' in transactionChanges) {
        const optimisticPolicyRecentlyUsedTags = Policy.buildOptimisticPolicyRecentlyUsedTags(iouReport?.policyID, transactionChanges.tag);
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
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericEditFailureMessage'),
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
            !!policy.requiresTag,
            policyTags,
            !!policy.requiresCategory,
            policyCategories,
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
    policyTags: OnyxTypes.PolicyTagList,
    policyCategories: OnyxTypes.PolicyCategories,
) {
    if (TransactionUtils.isDistanceRequest(transaction)) {
        updateDistanceRequest(transaction.transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories);
    } else {
        editRegularMoneyRequest(transaction.transactionID, transactionThreadReportID, transactionChanges, policy, policyTags, policyCategories);
    }
}

/** Updates the amount and currency fields of a money request */
function updateMoneyRequestAmountAndCurrency(
    transactionID: string,
    transactionThreadReportID: string,
    currency: string,
    amount: number,
    policy: OnyxEntry<OnyxTypes.Policy>,
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagList>,
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
    const transactionChanges = {
        amount,
        currency,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams(transactionID, transactionThreadReportID, transactionChanges, policy, policyTagList, policyCategories, true);
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}

function deleteMoneyRequest(transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
    // STEP 1: Get all collections we're updating
    const iouReportID = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? reportAction.originalMessage.IOUReportID : '';
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`] ?? null;
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
    const reportPreviewAction = ReportActionsUtils.getReportPreviewAction(iouReport?.chatReportID ?? '', iouReport?.reportID ?? '');
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted request] - update if the transactionThread exists AND it isn't being deleted
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
            errors: undefined,
        },
    } as OnyxTypes.ReportActions;

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(iouReport?.reportID ?? '', updatedReportAction);
    const iouReportLastMessageText = ReportActionsUtils.getLastVisibleMessage(iouReport?.reportID ?? '', updatedReportAction).lastMessageText;
    const shouldDeleteIOUReport =
        iouReportLastMessageText.length === 0 && !ReportActionsUtils.isDeletedParentAction(lastVisibleAction) && (!transactionThreadID || shouldDeleteTransactionThread);

    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    let updatedIOUReport: OnyxTypes.Report | null;
    const currency = TransactionUtils.getCurrency(transaction);
    const updatedReportPreviewAction: OnyxTypes.ReportAction | EmptyObject = {...reportPreviewAction};
    updatedReportPreviewAction.pendingAction = shouldDeleteIOUReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
    if (iouReport && ReportUtils.isExpenseReport(iouReport)) {
        updatedIOUReport = {...iouReport};

        if (typeof updatedIOUReport.total === 'number' && currency === iouReport?.currency) {
            // Because of the Expense reports are stored as negative values, we add the total from the amount
            updatedIOUReport.total += TransactionUtils.getAmount(transaction, true);
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

    if (updatedReportPreviewAction?.message?.[0]) {
        updatedReportPreviewAction.message[0].text = messageText;
        updatedReportPreviewAction.message[0].deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
    }

    if (updatedReportPreviewAction && reportPreviewAction?.childMoneyRequestCount && reportPreviewAction?.childMoneyRequestCount > 0) {
        updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
    }

    // STEP 5: Build Onyx data
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];

    if (Permissions.canUseViolations(betas)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: null,
        });
    }

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
                [reportPreviewAction?.reportActionID ?? '']: updatedReportPreviewAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: iouReport && needsToBeManuallySubmitted(iouReport) && updatedIOUReport?.managerID === userAccountID && updatedIOUReport.total !== 0,
            },
        },
    );

    if (!shouldDeleteIOUReport && updatedReportPreviewAction.childMoneyRequestCount === 0) {
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
                lastMessageText: ReportActionsUtils.getLastVisibleMessage(iouReport?.chatReportID ?? '', {[reportPreviewAction?.reportActionID ?? '']: null})?.lastMessageText,
                lastVisibleActionCreated: ReportActionsUtils.getLastVisibleAction(iouReport?.chatReportID ?? '', {[reportPreviewAction?.reportActionID ?? '']: null})?.created,
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
                [reportPreviewAction?.reportActionID ?? '']: {
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
            value: transaction,
        },
    ];

    if (Permissions.canUseViolations(betas)) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: transactionViolations,
        });
    }

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
                        [errorKey]: ['iou.error.genericDeleteFailureMessage', {isTranslated: false}],
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
                [reportPreviewAction?.reportActionID ?? '']: {
                    ...reportPreviewAction,
                    pendingAction: null,
                    errors: {
                        [errorKey]: ['iou.error.genericDeleteFailureMessage', {isTranslated: false}],
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

    if (!shouldDeleteIOUReport && updatedReportPreviewAction.childMoneyRequestCount === 0) {
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

    // STEP 6: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    CachedPDFPaths.clearByKey(transactionID);

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    if (iouReport && isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(iouReport.reportID));
        return;
    }

    if (iouReport?.chatReportID && shouldDeleteIOUReport) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(iouReport.chatReportID));
    }
}

function deleteTrackExpense(chatReportID: string, transactionID: string, reportAction: OnyxTypes.ReportAction, isSingleTransactionView = false) {
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
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted request] - update if the transactionThread exists AND it isn't being deleted
    const shouldDeleteTransactionThread = transactionThreadID ? (reportAction?.childVisibleActionCount ?? 0) === 0 : false;
    const shouldShowDeletedRequestMessage = !!transactionThreadID && !shouldDeleteTransactionThread;

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
    } as OnyxTypes.ReportActions;

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(chatReport?.reportID ?? '', updatedReportAction);
    const reportLastMessageText = ReportActionsUtils.getLastVisibleMessage(chatReport?.reportID ?? '', updatedReportAction).lastMessageText;

    // STEP 4: Build Onyx data
    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];

    if (Permissions.canUseViolations(betas)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: null,
        });
    }

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
                lastMessageText: reportLastMessageText,
                lastVisibleActionCreated: lastVisibleAction?.created,
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

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction,
        },
    ];

    if (Permissions.canUseViolations(betas)) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: transactionViolations,
        });
    }

    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: transactionThread,
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
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericDeleteFailureMessage'),
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

    // STEP 6: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    CachedPDFPaths.clearByKey(transactionID);

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    if (isSingleTransactionView && shouldDeleteTransactionThread) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(chatReport?.reportID ?? ''));
    }
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function getSendMoneyParams(
    report: OnyxTypes.Report,
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

    let chatReport = report.reportID ? report : null;
    let isNewChat = false;
    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([recipientAccountID]);
    }
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([recipientAccountID]);
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
            lastMessageText: optimisticIOUReportAction.message?.[0].text,
            lastMessageHtml: optimisticIOUReportAction.message?.[0].html,
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
            [optimisticCreatedActionForTransactionThread.reportActionID]: optimisticCreatedActionForTransactionThread,
        },
    };

    const successData: OnyxUpdate[] = [
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
                [optimisticCreatedActionForTransactionThread.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticTransactionThread.reportID}`,
            value: {
                errorFields: {
                    createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticTransactionThread.reportID}`,
            value: {
                [optimisticCreatedActionForTransactionThread.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    let optimisticPersonalDetailListData: OnyxUpdate | EmptyObject = {};

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {pendingFields: null},
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
                value: {
                    [optimisticIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError(null),
                    },
                },
            },
        );

        // Add optimistic personal details for recipient
        optimisticPersonalDetailListData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [recipientAccountID]: {
                    accountID: recipientAccountID,
                    avatar: UserUtils.getDefaultAvatarURL(recipient.accountID),
                    // Disabling this line since participant.displayName can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    displayName: recipient.displayName || recipient.login,
                    login: recipient.login,
                },
            },
        };

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
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
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
            createdReportActionID: isNewChat ? optimisticCreatedActionForChat.reportActionID : '0',
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            createdIOUReportActionID: optimisticCreatedActionForIOUReport.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread.reportActionID,
        },
        optimisticData,
        successData,
        failureData,
    };
}

function getPayMoneyRequestParams(
    chatReport: OnyxTypes.Report,
    iouReport: OnyxTypes.Report,
    recipient: Participant,
    paymentMethodType: PaymentMethodType,
    full: boolean,
): PayMoneyRequestData {
    let total = iouReport.total ?? 0;
    if (ReportUtils.hasHeldExpenses(iouReport.reportID) && !full && !!iouReport.unheldTotal) {
        total = iouReport.unheldTotal;
    }

    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        ReportUtils.isExpenseReport(iouReport) ? -total : total,
        iouReport.currency ?? '',
        '',
        [recipient],
        '',
        paymentMethodType,
        iouReport.reportID,
        true,
    );

    // In some instances, the report preview action might not be available to the payer (only whispered to the requestor)
    // hence we need to make the updates to the action safely.
    let optimisticReportPreviewAction = null;
    const reportPreviewAction = ReportActionsUtils.getReportPreviewAction(chatReport.reportID, iouReport.reportID);
    if (reportPreviewAction) {
        optimisticReportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, true);
    }

    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`] ?? null;
    const optimisticNextStep = NextStepUtils.buildNextStep(iouReport, CONST.REPORT.STATUS_NUM.REIMBURSED, {isPaidWithExpensify: paymentMethodType === CONST.IOU.PAYMENT_TYPE.VBBA});

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: optimisticIOUReportAction.created,
                hasOutstandingChildRequest: false,
                iouReportID: null,
                lastMessageText: optimisticIOUReportAction.message?.[0].text,
                lastMessageHtml: optimisticIOUReportAction.message?.[0].html,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                lastMessageText: optimisticIOUReportAction.message?.[0].text,
                lastMessageHtml: optimisticIOUReportAction.message?.[0].html,
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
            value: {[iouReport.policyID ?? '']: paymentMethodType},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: optimisticNextStep,
        },
    ];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                pendingFields: {
                    preview: null,
                    reimbursed: null,
                    partial: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
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
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport.reportID}`,
            value: currentNextStep,
        },
    ];

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

    return {
        params: {
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            full,
            amount: Math.abs(total),
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
function sendMoneyElsewhere(report: OnyxTypes.Report, amount: number, currency: string, comment: string, managerID: number, recipient: Participant) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, managerID, recipient);

    API.write(WRITE_COMMANDS.SEND_MONEY_ELSEWHERE, params, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModal(params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

/**
 * @param managerID - Account ID of the person sending the money
 * @param recipient - The user receiving the money
 */
function sendMoneyWithWallet(report: OnyxTypes.Report, amount: number, currency: string, comment: string, managerID: number, recipient: Participant) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.EXPENSIFY, managerID, recipient);

    API.write(WRITE_COMMANDS.SEND_MONEY_WITH_WALLET, params, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModal(params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

function canApproveIOU(iouReport: OnyxEntry<OnyxTypes.Report> | EmptyObject, chatReport: OnyxEntry<OnyxTypes.Report> | EmptyObject, policy: OnyxEntry<OnyxTypes.Policy> | EmptyObject) {
    if (isEmptyObject(chatReport)) {
        return false;
    }
    const isPaidGroupPolicy = ReportUtils.isPaidGroupPolicyExpenseChat(chatReport);
    if (!isPaidGroupPolicy) {
        return false;
    }

    const isOnInstantSubmitPolicy = PolicyUtils.isInstantSubmitEnabled(policy);
    const isOnSubmitAndClosePolicy = PolicyUtils.isSubmitAndClose(policy);
    if (isOnInstantSubmitPolicy && isOnSubmitAndClosePolicy) {
        return false;
    }

    const managerID = iouReport?.managerID ?? 0;
    const isCurrentUserManager = managerID === userAccountID;
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);

    const isOpenExpenseReport = isPolicyExpenseChat && ReportUtils.isOpenExpenseReport(iouReport);
    const isApproved = ReportUtils.isReportApproved(iouReport);
    const iouSettled = ReportUtils.isSettled(iouReport?.reportID);

    return isCurrentUserManager && !isOpenExpenseReport && !isApproved && !iouSettled;
}

function canIOUBePaid(iouReport: OnyxEntry<OnyxTypes.Report> | EmptyObject, chatReport: OnyxEntry<OnyxTypes.Report> | EmptyObject, policy: OnyxEntry<OnyxTypes.Policy> | EmptyObject) {
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(chatReport);
    const iouCanceled = ReportUtils.isArchivedRoom(chatReport);

    if (isEmptyObject(iouReport)) {
        return false;
    }

    if (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        return false;
    }

    const isPayer = ReportUtils.isPayer(
        {
            email: currentUserEmail,
            accountID: userAccountID,
        },
        iouReport,
    );

    const isOpenExpenseReport = isPolicyExpenseChat && ReportUtils.isOpenExpenseReport(iouReport);
    const iouSettled = ReportUtils.isSettled(iouReport?.reportID);

    const {reimbursableSpend} = ReportUtils.getMoneyRequestSpendBreakdown(iouReport);
    const isAutoReimbursable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES ? false : ReportUtils.canBeAutoReimbursed(iouReport, policy);
    const shouldBeApproved = canApproveIOU(iouReport, chatReport, policy);

    return isPayer && !isOpenExpenseReport && !iouSettled && !iouReport?.isWaitingOnBankAccount && reimbursableSpend !== 0 && !iouCanceled && !isAutoReimbursable && !shouldBeApproved;
}

function hasIOUToApproveOrPay(chatReport: OnyxEntry<OnyxTypes.Report> | EmptyObject, excludedIOUReportID: string): boolean {
    const chatReportActions = ReportActionsUtils.getAllReportActions(chatReport?.reportID ?? '');

    return Object.values(chatReportActions).some((action) => {
        const iouReport = ReportUtils.getReport(action.childReportID ?? '');
        const policy = ReportUtils.getPolicy(iouReport?.policyID);

        const shouldShowSettlementButton = canIOUBePaid(iouReport, chatReport, policy) || canApproveIOU(iouReport, chatReport, policy);
        return action.childReportID?.toString() !== excludedIOUReportID && action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && shouldShowSettlementButton;
    });
}

function approveMoneyRequest(expenseReport: OnyxTypes.Report | EmptyObject, full?: boolean) {
    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`] ?? null;
    let total = expenseReport.total ?? 0;
    if (ReportUtils.hasHeldExpenses(expenseReport.reportID) && !full && !!expenseReport.unheldTotal) {
        total = expenseReport.unheldTotal;
    }
    const optimisticApprovedReportAction = ReportUtils.buildOptimisticApprovedReportAction(total, expenseReport.currency ?? '', expenseReport.reportID);
    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, CONST.REPORT.STATUS_NUM.APPROVED);
    const chatReport = ReportUtils.getReport(expenseReport.chatReportID);

    const optimisticReportActionsData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticApprovedReportAction.reportActionID]: {
                ...(optimisticApprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: optimisticApprovedReportAction.message?.[0].text,
            lastMessageHtml: optimisticApprovedReportAction.message?.[0].html,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            pendingFields: {
                partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticChatReportData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport?.chatReportID}`,
        value: {
            hasOutstandingChildRequest: hasIOUToApproveOrPay(chatReport, expenseReport?.reportID ?? ''),
        },
    };

    const optimisticNextStepData: OnyxUpdate = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStep,
    };
    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData, optimisticChatReportData];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
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
                [optimisticApprovedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
                pendingFields: {
                    partial: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: currentNextStep,
        },
    ];

    const parameters: ApproveMoneyRequestParams = {
        reportID: expenseReport.reportID,
        approvedReportActionID: optimisticApprovedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
}

function submitReport(expenseReport: OnyxTypes.Report) {
    const currentNextStep = allNextSteps[`${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`] ?? null;
    const optimisticSubmittedReportAction = ReportUtils.buildOptimisticSubmittedReportAction(expenseReport?.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID);
    const parentReport = ReportUtils.getReport(expenseReport.parentReportID);
    const policy = ReportUtils.getPolicy(expenseReport.policyID);
    const isCurrentUserManager = currentUserPersonalDetails.accountID === expenseReport.managerID;
    const optimisticNextStep = NextStepUtils.buildNextStep(expenseReport, CONST.REPORT.STATUS_NUM.SUBMITTED);

    const optimisticData: OnyxUpdate[] = [
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
                lastMessageText: optimisticSubmittedReportAction.message?.[0].text ?? '',
                lastMessageHtml: optimisticSubmittedReportAction.message?.[0].html ?? '',
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStep,
        },
    ];

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

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
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
                [optimisticSubmittedReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
                },
            },
        },
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
        managerAccountID: policy.submitsTo ?? expenseReport.managerID,
        reportActionID: optimisticSubmittedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, successData, failureData});
}

function cancelPayment(expenseReport: OnyxTypes.Report, chatReport: OnyxTypes.Report) {
    const optimisticReportAction = ReportUtils.buildOptimisticCancelPaymentReportAction(expenseReport.reportID, -(expenseReport.total ?? 0), expenseReport.currency ?? '');
    const policy = ReportUtils.getPolicy(chatReport.policyID);
    const isFree = policy && policy.type === CONST.POLICY.TYPE.FREE;
    const approvalMode = policy.approvalMode ?? CONST.POLICY.APPROVAL_MODE.BASIC;
    let stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM> = CONST.REPORT.STATE_NUM.SUBMITTED;
    let statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM> = CONST.REPORT.STATUS_NUM.SUBMITTED;
    if (!isFree) {
        stateNum = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATE_NUM.SUBMITTED : CONST.REPORT.STATE_NUM.APPROVED;
        statusNum = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.APPROVED;
    }
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
                lastMessageText: optimisticReportAction.message?.[0].text,
                lastMessageHtml: optimisticReportAction.message?.[0].html,
                stateNum,
                statusNum,
            },
        },
    ];

    if (!isFree) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStep,
        });
    }

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
                [optimisticReportAction.reportActionID ?? '']: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
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
    if (!isFree) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: NextStepUtils.buildNextStep(expenseReport, CONST.REPORT.STATUS_NUM.REIMBURSED),
        });
    }

    API.write(
        WRITE_COMMANDS.CANCEL_PAYMENT,
        {
            iouReportID: expenseReport.reportID,
            chatReportID: chatReport.reportID,
            managerAccountID: expenseReport.managerID ?? 0,
            reportActionID: optimisticReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
}

function payMoneyRequest(paymentType: PaymentMethodType, chatReport: OnyxTypes.Report, iouReport: OnyxTypes.Report, full = true) {
    const recipient = {accountID: iouReport.ownerAccountID};
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, paymentType, full);

    // For now we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : WRITE_COMMANDS.PAY_MONEY_REQUEST;

    API.write(apiCommand, params, {optimisticData, successData, failureData});
    Navigation.dismissModalWithReport(chatReport);
}

function detachReceipt(transactionID: string) {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const newTransaction = transaction ? {...transaction, filename: '', receipt: {}} : null;

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
            value: transaction,
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
                receipt: oldReceipt,
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
function setMoneyRequestParticipantsFromReport(transactionID: string, report: OnyxTypes.Report) {
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    const chatReport = ReportUtils.isMoneyRequestReport(report) ? ReportUtils.getReport(report.chatReportID) : report;
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const shouldAddAsReport = !isEmptyObject(chatReport) && ReportUtils.isSelfDM(chatReport);
    const participants: Participant[] =
        ReportUtils.isPolicyExpenseChat(chatReport) || shouldAddAsReport
            ? [{accountID: 0, reportID: chatReport?.reportID, isPolicyExpenseChat: ReportUtils.isPolicyExpenseChat(chatReport), selected: true}]
            : (chatReport?.participantAccountIDs ?? []).filter((accountID) => currentUserAccountID !== accountID).map((accountID) => ({accountID, selected: true}));

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {participants, participantsAutoAssigned: true});
}

function setMoneyRequestId(id: string) {
    Onyx.merge(ONYXKEYS.IOU, {id});
}

function setMoneyRequestAmount(amount: number) {
    Onyx.merge(ONYXKEYS.IOU, {amount});
}

function setMoneyRequestCurrency(currency: string) {
    Onyx.merge(ONYXKEYS.IOU, {currency});
}

function setMoneyRequestTaxRate(transactionID: string, taxRate: TaxRate) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxRate});
}

function setMoneyRequestTaxAmount(transactionID: string, taxAmount: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxAmount});
}

function setMoneyRequestBillable(billable: boolean) {
    Onyx.merge(ONYXKEYS.IOU, {billable});
}

function setMoneyRequestParticipants(participants: Participant[], isSplitRequest?: boolean) {
    Onyx.merge(ONYXKEYS.IOU, {participants, isSplitRequest});
}

function setShownHoldUseExplanation() {
    Onyx.set(ONYXKEYS.NVP_HOLD_USE_EXPLAINED, true);
}

/** Navigates to the next IOU page based on where the IOU request was started */
function navigateToNextPage(iou: OnyxEntry<OnyxTypes.IOU>, iouType: string, report?: OnyxTypes.Report, path = '') {
    const moneyRequestID = `${iouType}${report?.reportID ?? ''}`;
    const shouldReset = iou?.id !== moneyRequestID && !!report?.reportID;

    // If the money request ID in Onyx does not match the ID from params, we want to start a new request
    // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
    if (shouldReset) {
        resetMoneyRequestInfo(moneyRequestID);
    }

    // If we're adding a receipt, that means the user came from the confirmation page and we need to navigate back to it.
    if (path.slice(1) === ROUTES.MONEY_REQUEST_RECEIPT.getRoute(iouType, report?.reportID)) {
        Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report?.reportID));
        return;
    }

    // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
    if (report?.reportID) {
        // If the report is iou or expense report, we should get the chat report to set participant for request money
        const chatReport = ReportUtils.isMoneyRequestReport(report) ? ReportUtils.getReport(report.chatReportID) : report;
        // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
        if (!iou?.participants?.length || shouldReset) {
            const currentUserAccountID = currentUserPersonalDetails.accountID;
            const participants: Participant[] = ReportUtils.isPolicyExpenseChat(chatReport)
                ? [{reportID: chatReport?.reportID, isPolicyExpenseChat: true, selected: true}]
                : (chatReport?.participantAccountIDs ?? []).filter((accountID) => currentUserAccountID !== accountID).map((accountID) => ({accountID, selected: true}));
            setMoneyRequestParticipants(participants);
        }
        Navigation.navigate(ROUTES.MONEY_REQUEST_CONFIRMATION.getRoute(iouType, report.reportID));
        return;
    }
    Navigation.navigate(ROUTES.MONEY_REQUEST_PARTICIPANTS.getRoute(iouType));
}

/**
 *  When the money request or split bill creation flow is initialized via FAB, the reportID is not passed as a navigation
 * parameter.
 * Gets a report id from the first participant of the IOU object stored in Onyx.
 */
function getIOUReportID(iou?: OnyxTypes.IOU, route?: MoneyRequestRoute): string {
    // Disabling this line for safeness as nullish coalescing works only if the value is undefined or null
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return route?.params.reportID || iou?.participants?.[0]?.reportID || '';
}

/**
 * Put money request on HOLD
 */
function putOnHold(transactionID: string, comment: string, reportID: string) {
    const createdReportAction = ReportUtils.buildOptimisticHoldReportAction();
    const createdReportActionComment = ReportUtils.buildOptimisticHoldReportActionComment(comment);

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
 * Remove money request from HOLD
 */
function unholdRequest(transactionID: string, reportID: string) {
    const createdReportAction = ReportUtils.buildOptimisticUnHoldReportAction();

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
            },
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
    receiptFilename: string,
    receiptPath: string,
    onSuccess: (file: File) => void,
    requestType: ValueOf<typeof CONST.IOU.REQUEST_TYPE>,
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    transactionID: string,
    reportID: string,
    receiptType: string,
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
    FileUtils.readFileAsync(receiptPath, receiptFilename, onSuccess, onFailure, receiptType);
}

/** Save the preferred payment method for a policy */
function savePreferredPaymentMethod(policyID: string, paymentMethod: PaymentMethodType) {
    Onyx.merge(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {[policyID]: paymentMethod});
}

export {
    setMoneyRequestParticipants,
    createDistanceRequest,
    deleteMoneyRequest,
    deleteTrackExpense,
    splitBill,
    splitBillAndOpenReport,
    setDraftSplitTransaction,
    startSplitBill,
    completeSplitBill,
    requestMoney,
    sendMoneyElsewhere,
    approveMoneyRequest,
    submitReport,
    payMoneyRequest,
    sendMoneyWithWallet,
    initMoneyRequest,
    startMoneyRequest,
    resetMoneyRequestInfo,
    clearMoneyRequest,
    updateMoneyRequestTypeParams,
    setMoneyRequestAmount_temporaryForRefactor,
    setMoneyRequestBillable_temporaryForRefactor,
    setMoneyRequestCreated,
    setMoneyRequestCurrency_temporaryForRefactor,
    setMoneyRequestDescription,
    setMoneyRequestOriginalCurrency_temporaryForRefactor,
    setMoneyRequestParticipants_temporaryForRefactor,
    setMoneyRequestPendingFields,
    setMoneyRequestReceipt,
    setMoneyRequestAmount,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestCurrency,
    setMoneyRequestId,
    setMoneyRequestMerchant,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setShownHoldUseExplanation,
    navigateToNextPage,
    updateMoneyRequestDate,
    updateMoneyRequestBillable,
    updateMoneyRequestMerchant,
    updateMoneyRequestTag,
    updateMoneyRequestDistance,
    updateMoneyRequestCategory,
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestDescription,
    replaceReceipt,
    detachReceipt,
    getIOUReportID,
    editMoneyRequest,
    putOnHold,
    unholdRequest,
    cancelPayment,
    navigateToStartStepIfScanFileCannotBeRead,
    savePreferredPaymentMethod,
    trackExpense,
    canIOUBePaid,
    canApproveIOU,
};
