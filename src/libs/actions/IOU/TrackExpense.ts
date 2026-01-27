import {fastMerge} from 'expensify-common';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxInputValue, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import * as API from '@libs/API';
import type {
    CategorizeTrackedExpenseParams as CategorizeTrackedExpenseApiParams,
    CreateWorkspaceParams,
    DeleteMoneyRequestParams,
    ShareTrackedExpenseParams,
    TrackExpenseParams,
    UpdateMoneyRequestParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import GoogleTagManager from '@libs/GoogleTagManager';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils} from '@libs/IOUUtils';
import isFileUploadable from '@libs/isFileUploadable';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getMemberAccountIDsForWorkspace, hasDependentTags, isControlPolicy, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {
    getAllReportActions,
    getLastVisibleAction,
    getLastVisibleMessage,
    getOriginalMessage,
    getReportAction,
    getReportActionHtml,
    getReportActionText,
    getTrackExpenseActionableWhisper,
    isActionableTrackExpense,
    isMoneyRequestAction,
} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction, TransactionDetails} from '@libs/ReportUtils';
import {
    buildInviteToRoomOnyxData,
    buildOptimisticActionableTrackExpenseWhisper,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticModifiedExpenseReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticMovedTransactionAction,
    buildOptimisticReportPreview,
    buildOptimisticSelfDMReport,
    buildOptimisticTransaction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    findSelfDMReportID,
    generateReportID,
    getParsedComment,
    getReportOrDraftReport,
    getReportRecipientAccountIDs,
    getTransactionDetails,
    isDraftReport,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isSelfDM,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    shouldEnableNegative,
    updateReportPreview,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {
    getAmount,
    getClearedPendingFields,
    getCurrency,
    getMerchant,
    getUpdatedTransaction,
    isCustomUnitRateIDForP2P,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isFetchingWaypointsFromServer,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isMapDistanceRequest,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanning,
    isScanRequest as isScanRequestTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {clearByKey as clearPdfByOnyxKey} from '@userActions/CachedPDFPaths';
import {buildAddMembersToWorkspaceOnyxData, buildUpdateWorkspaceMembersRoleOnyxData} from '@userActions/Policy/Member';
import {buildPolicyData} from '@userActions/Policy/Policy';
import {notifyNewAction} from '@userActions/Report';
import {sanitizeRecentWaypoints} from '@userActions/Transaction';
import {removeDraftTransactions} from '@userActions/TransactionEdit';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt, ReceiptSource, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {BasePolicyParams, CreateTrackExpenseParams, GpsPoint, ReplaceReceipt, RequestMoneyInformation, StartSplitBilActionParams} from '.';
import {
    buildMinimalTransactionForFormula,
    deleteMoneyRequest,
    dismissModalAndOpenReportInInboxTab,
    getMoneyRequestInformation,
    getNavigationUrlOnMoneyRequestDelete,
    getReceiptError,
    getRecentWaypoints,
    getReportPreviewAction,
    getSearchOnyxUpdate,
} from '.';

// ============ Types ============

type TrackExpenseInformation = {
    createdWorkspaceParams?: CreateWorkspaceParams;
    iouReport?: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewAction?: OnyxTypes.ReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
    actionableWhisperReportActionIDParam?: string;
    optimisticReportID: string | undefined;
    optimisticReportActionID: string | undefined;
    onyxData: OnyxData<OnyxKey>;
};

type TrackedExpenseTransactionParams = Omit<BaseTransactionParams, 'taxCode' | 'taxAmount'> & {
    waypoints?: string;
    distance?: number;
    transactionID: string | undefined;
    receipt?: Receipt;
    taxCode: string;
    taxAmount: number;
    attendees?: Attendee[];
};

type BaseTransactionParams = {
    amount: number;
    modifiedAmount?: number;
    currency: string;
    created: string;
    merchant: string;
    comment: string;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    customUnitRateID?: string;
};

type TrackedExpensePolicyParams = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyID: string | undefined;
    isDraftPolicy?: boolean;
};
type TrackedExpenseReportInformation = {
    moneyRequestPreviewReportActionID: string | undefined;
    moneyRequestReportID: string | undefined;
    moneyRequestCreatedReportActionID: string | undefined;
    actionableWhisperReportActionID: string | undefined;
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID: string;
    transactionThreadReportID: string | undefined;
    reportPreviewReportActionID: string | undefined;
    chatReportID: string | undefined;
    isLinkedTrackedExpenseReportArchived: boolean | undefined;
};
type TrackedExpenseParams = {
    onyxData?: OnyxData<OnyxKey>;
    reportInformation: TrackedExpenseReportInformation;
    transactionParams: TrackedExpenseTransactionParams;
    policyParams: TrackedExpensePolicyParams;
    createdWorkspaceParams?: CreateWorkspaceParams;
    accountantParams?: TrackExpenseAccountantParams;
};

type TrackExpenseTransactionParams = {
    amount: number;
    currency: string;
    created: string | undefined;
    merchant?: string;
    comment?: string;
    distance?: number;
    receipt?: Receipt;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    validWaypoints?: WaypointCollection;
    gpsPoint?: GpsPoint;
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    customUnitRateID?: string;
    attendees?: Attendee[];
    isLinkedTrackedExpenseReportArchived?: boolean;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
};

type TrackExpenseAccountantParams = {
    accountant?: Accountant;
};

type GetTrackExpenseInformationTransactionParams = {
    comment: string;
    amount: number;
    currency: string;
    created: string;
    merchant: string;
    receipt: OnyxEntry<Receipt>;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    attendees?: Attendee[];
    distance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
};

type GetTrackExpenseInformationParticipantParams = {
    payeeEmail?: string;
    payeeAccountID?: number;
    participant: Participant;
};

type GetTrackExpenseInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    moneyRequestReportID?: string;
    existingTransactionID?: string;
    participantParams: GetTrackExpenseInformationParticipantParams;
    policyParams: BasePolicyParams;
    transactionParams: GetTrackExpenseInformationTransactionParams;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

type DeleteTrackExpenseParams = {
    chatReportID: string | undefined;
    chatReport: OnyxEntry<OnyxTypes.Report> | undefined;
    transactionID: string | undefined;
    reportAction: OnyxTypes.ReportAction;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    chatIOUReport: OnyxEntry<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    violations: OnyxCollection<OnyxTypes.TransactionViolations>;
    isSingleTransactionView: boolean | undefined;
    isChatReportArchived: boolean | undefined;
    isChatIOUReportArchived: boolean | undefined;
    allTransactionViolationsParam: OnyxCollection<OnyxTypes.TransactionViolations>;
};

type BuildOnyxDataForTrackExpenseParams = {
    chat: {report: OnyxInputValue<OnyxTypes.Report>; previewAction: OnyxInputValue<ReportAction>};
    iou: {report: OnyxInputValue<OnyxTypes.Report>; createdAction: OptimisticCreatedReportAction; action: OptimisticIOUReportAction};
    transactionParams: {transaction: OnyxTypes.Transaction; threadReport: OptimisticChatReport | null; threadCreatedReportAction: OptimisticCreatedReportAction | null};
    policyParams: {policy?: OnyxInputValue<OnyxTypes.Policy>; tagList?: OnyxInputValue<OnyxTypes.PolicyTagLists>; categories?: OnyxInputValue<OnyxTypes.PolicyCategories>};
    shouldCreateNewMoneyRequestReport: boolean;
    existingTransactionThreadReportID?: string;
    actionableTrackExpenseWhisper?: OnyxInputValue<OnyxTypes.ReportAction>;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    participant?: Participant;
    isASAPSubmitBetaEnabled: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

type ConvertTrackedWorkspaceParams = {
    category: string | undefined;
    tag: string | undefined;
    taxCode: string;
    taxAmount: number;
    billable: boolean | undefined;
    policyID: string;
    receipt: Receipt | undefined;
    waypoints?: string;
    customUnitID?: string;
    customUnitRateID?: string;
    reimbursable?: boolean;
};

type AddTrackedExpenseToPolicyParam = {
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    transactionID: string;
    reimbursable: boolean;
    actionableWhisperReportActionID: string | undefined;
    moneyRequestReportID: string;
    reportPreviewReportActionID: string;
    modifiedExpenseReportActionID: string;
    moneyRequestCreatedReportActionID: string | undefined;
    moneyRequestPreviewReportActionID: string;
    distance: number | undefined;
    attendees: string | undefined;
} & ConvertTrackedWorkspaceParams;

type ConvertTrackedExpenseToRequestParams = {
    payerParams: {
        accountID: number;
        email: string;
    };
    transactionParams: {
        transactionID: string;
        actionableWhisperReportActionID: string | undefined;
        linkedTrackedExpenseReportAction: OnyxTypes.ReportAction;
        linkedTrackedExpenseReportID: string;
        amount: number;
        currency: string;
        comment: string;
        merchant: string;
        created: string;
        attendees?: Attendee[];
        transactionThreadReportID?: string;
        distance?: number;
        isLinkedTrackedExpenseReportArchived: boolean | undefined;
    };
    chatParams: {
        reportID: string;
        createdReportActionID: string | undefined;
        reportPreviewReportActionID: string;
    };
    iouParams: {
        reportID: string;
        createdReportActionID: string | undefined;
        reportActionID: string;
    };
    onyxData: OnyxData<OnyxKey>;
    workspaceParams?: ConvertTrackedWorkspaceParams;
};

// ============ Module-level variables ============

let allTransactionDrafts: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

let userAccountID = -1;
let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        userAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

// ============ Helper to access index.ts module-level getFieldViolationsOnyxData ============
// getFieldViolationsOnyxData is defined in index.ts and not exported. We need to import it.
// Since it's not exported, we replicate the reference via the module-level allReports variable.

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
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

// ============ Functions ============

/** Builds the Onyx data for track expense */
function buildOnyxDataForTrackExpense({
    chat,
    iou,
    transactionParams,
    policyParams = {},
    shouldCreateNewMoneyRequestReport,
    existingTransactionThreadReportID,
    actionableTrackExpenseWhisper,
    retryParams,
    participant,
    isASAPSubmitBetaEnabled,
    quickAction,
}: BuildOnyxDataForTrackExpenseParams): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const {report: chatReport, previewAction: reportPreviewAction} = chat;
    const {report: iouReport, createdAction: iouCreatedAction, action: iouAction} = iou;
    const {transaction, threadReport: transactionThreadReport, threadCreatedReportAction: transactionThreadCreatedReportAction} = transactionParams;
    const {policy, tagList: policyTagList, categories: policyCategories} = policyParams;

    const isScanRequest = isScanRequestTransactionUtils(transaction);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const isSelfDMReport = isSelfDM(chatReport);
    let newQuickAction: QuickActionName = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_MANUAL : CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    if (isScanRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_SCAN : CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isDistanceRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_DISTANCE : CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chatReport) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    ...chatReport,
                    lastMessageText: getReportActionText(iouAction),
                    lastMessageHtml: getReportActionHtml(iouAction),
                    lastReadTime: DateUtils.getDBTime(),
                    // do not update iouReportID if auto submit beta is enabled and it is a scan request
                    iouReportID: isASAPSubmitBetaEnabled && isScanRequest ? null : iouReport?.reportID,
                    lastVisibleActionCreated: shouldCreateNewMoneyRequestReport ? reportPreviewAction?.created : chatReport.lastVisibleActionCreated,
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
                    lastReadTime: actionableTrackExpenseWhisper.created,
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
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {[actionableTrackExpenseWhisper.reportActionID]: null},
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
                    lastMessageText: getReportActionText(iouAction),
                    lastMessageHtml: getReportActionHtml(iouAction),
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
        if (shouldCreateNewMoneyRequestReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            });
        }
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
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
        if (shouldCreateNewMoneyRequestReport) {
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            });
        }
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
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
            value: {
                isOptimisticReport: false,
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
                        ...(shouldCreateNewMoneyRequestReport ? {createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
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
                                  errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                              },
                              [iouAction.reportActionID]: {
                                  errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                              },
                          }
                        : {
                              [iouAction.reportActionID]: {
                                  errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
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
                    errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
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
                          createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                      },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                pendingFields: clearedPendingFields,
            },
        },
    );

    if (transactionThreadCreatedReportAction?.reportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    }

    const searchUpdate = getSearchOnyxUpdate({
        transaction,
        participant,
        transactionThreadReportID: transactionThreadReport?.reportID,
    });

    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push(...searchUpdate.successData);
        }
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !isPaidGroupPolicy(policy) || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        hasDependentTags(policy, policyTagList ?? {}),
        false,
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
    if (isControlPolicy(policy) && iouReport) {
        const {optimisticData: fieldViolationsOptimisticData, failureData: fieldViolationsFailureData} = getFieldViolationsOnyxData(iouReport);
        optimisticData.push(...fieldViolationsOptimisticData);
        failureData.push(...fieldViolationsFailureData);
    }

    return [optimisticData, successData, failureData];
}

function getDeleteTrackExpenseInformation(
    chatReportID: string,
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    isChatReportArchived: boolean | undefined,
    shouldDeleteTransactionFromOnyx = true,
    isMovingTransactionFromTrackExpense = false,
    actionableWhisperReportActionID = '',
    resolution = '',
    shouldRemoveIOUTransaction = true,
) {
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
                IOUTransactionID: shouldRemoveIOUTransaction ? null : transactionID,
            },
            errors: undefined,
        },
        ...(actionableWhisperReportActionID && {[actionableWhisperReportActionID]: {originalMessage: {resolution}}}),
    } as OnyxTypes.ReportActions;
    let canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatReportArchived);
    }
    const lastVisibleAction = getLastVisibleAction(chatReportID, canUserPerformWriteAction, updatedReportAction);
    const {lastMessageText = '', lastMessageHtml = ''} = getLastVisibleMessage(chatReportID, canUserPerformWriteAction, updatedReportAction);

    // STEP 4: Build Onyx data
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        });
    }

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    if (shouldDeleteTransactionThread) {
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
                        [userAccountID]: {
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

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
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

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    if (shouldDeleteTransactionThread && transactionThread) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: null,
        });
    }

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction ?? null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
            },
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
        const actionableWhisperReportAction = getReportAction(chatReportID, actionableWhisperReportActionID);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [actionableWhisperReportActionID]: {
                    originalMessage: {
                        resolution: isActionableTrackExpense(actionableWhisperReportAction) ? (getOriginalMessage(actionableWhisperReportAction)?.resolution ?? null) : null,
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
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage'),
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

/**
 * Gathers all the data needed to make an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getTrackExpenseInformation(params: GetTrackExpenseInformationParams): TrackExpenseInformation | null {
    const {
        parentChatReport,
        moneyRequestReportID = '',
        existingTransactionID,
        participantParams,
        policyParams,
        transactionParams,
        retryParams,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
        activePolicyID,
        quickAction,
    } = params;
    const {payeeAccountID = userAccountID, payeeEmail = currentUserEmail, participant} = participantParams;
    const {policy, policyCategories, policyTagList} = policyParams;
    const {
        comment,
        amount,
        currency,
        created,
        distance,
        merchant,
        receipt,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        reimbursable,
        linkedTrackedExpenseReportAction,
        attendees,
        odometerStart,
        odometerEnd,
        gpsCoordinates,
    } = transactionParams;

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If no chat report is passed, defaults to the self-DM report
    if (!chatReport) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`] ?? null;
    }

    // If we are still missing the chat report then optimistically create the self-DM report and use it
    let optimisticReportID: string | undefined;
    let optimisticReportActionID: string | undefined;
    if (!chatReport) {
        const currentTime = DateUtils.getDBTime();
        const selfDMReport = buildOptimisticSelfDMReport(currentTime);
        const selfDMCreatedReportAction = buildOptimisticCreatedReportAction(currentUserEmail ?? '', currentTime);
        optimisticReportID = selfDMReport.reportID;
        optimisticReportActionID = selfDMCreatedReportAction.reportActionID;
        chatReport = selfDMReport;

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: {
                    ...selfDMReport,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: {isOptimisticReport: true},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: {
                    [optimisticReportActionID]: selfDMCreatedReportAction,
                },
            },
        );
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: {isOptimisticReport: false},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: {
                    [optimisticReportActionID]: {
                        pendingAction: null,
                    },
                },
            },
        );
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: null,
            },
        );
    }

    // Check if the report is a draft
    const isDraftReportLocal = isDraftReport(chatReport?.reportID);

    let createdWorkspaceParams: CreateWorkspaceParams | undefined;

    if (isDraftReportLocal) {
        const workspaceData = buildPolicyData({
            policyOwnerEmail: undefined,
            makeMeAdmin: policy?.makeMeAdmin,
            policyName: policy?.name,
            policyID: policy?.id,
            expenseReportId: chatReport?.reportID,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            currentUserAccountIDParam,
            currentUserEmailParam,
            introSelected,
            activePolicyID,
        });
        createdWorkspaceParams = workspaceData.params;
        optimisticData.push(...workspaceData.optimisticData);
        successData.push(...workspaceData.successData);
        failureData.push(...workspaceData.failureData);
    }

    // STEP 2: If not in the self-DM flow, we need to use the expense report.
    // For this, first use the chatReport.iouReportID property. Build a new optimistic expense report if needed.
    const shouldUseMoneyReport = !!isPolicyExpenseChat && chatReport.chatType !== CONST.REPORT.CHAT_TYPE.SELF_DM;

    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    let shouldCreateNewMoneyRequestReport = false;

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = existingTransactionID ?? NumberUtils.rand64();
    const optimisticExpenseReportID = generateReportID();

    if (shouldUseMoneyReport) {
        if (moneyRequestReportID) {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
        } else {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
        }
        const isScanRequest = isScanRequestTransactionUtils({amount, receipt});
        shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest);
        if (!iouReport || shouldCreateNewMoneyRequestReport) {
            const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticExpenseReportID, created, amount, currency, merchant);

            iouReport = buildOptimisticExpenseReport(
                chatReport.reportID,
                chatReport.policyID,
                payeeAccountID,
                amount,
                currency,
                amount,
                undefined,
                optimisticExpenseReportID,
                reportTransactions,
            );
        } else {
            iouReport = {...iouReport};
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if (iouReport?.currency === currency) {
                if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined && typeof iouReport.nonReimbursableTotal === 'number') {
                    iouReport.total -= amount;
                    iouReport.nonReimbursableTotal -= amount;
                }

                if (typeof iouReport.unheldTotal === 'number' && typeof iouReport.unheldNonReimbursableTotal === 'number') {
                    iouReport.unheldTotal -= amount;
                    iouReport.unheldNonReimbursableTotal -= amount;
                }
            }
        }
    }

    // If shouldUseMoneyReport is true, the iouReport was defined.
    // But we'll use the `shouldUseMoneyReport && iouReport` check further instead of `shouldUseMoneyReport` to avoid TS errors.

    // STEP 3: Build optimistic receipt and transaction
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && isDistanceRequestTransactionUtils(existingTransaction);
    const isManualDistanceRequest = existingTransaction && isManualDistanceRequestTransactionUtils(existingTransaction);
    const isOdometerDistanceRequest = existingTransaction && isOdometerDistanceRequestTransactionUtils(existingTransaction);
    const isGPSDistanceRequest = existingTransaction && isGPSDistanceRequestTransactionUtils(existingTransaction);
    let optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        existingTransaction,
        policy,
        transactionParams: {
            amount: -amount,
            currency,
            reportID: shouldUseMoneyReport && iouReport ? iouReport.reportID : CONST.REPORT.UNREPORTED_REPORT_ID,
            comment,
            distance,
            created,
            merchant,
            receipt,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
            reimbursable,
            filename: existingTransaction?.receipt?.filename,
            attendees,
            odometerStart: isOdometerDistanceRequest ? odometerStart : undefined,
            odometerEnd: isOdometerDistanceRequest ? odometerEnd : undefined,
            gpsCoordinates: isGPSDistanceRequest ? gpsCoordinates : undefined,
        },
    });
    if (iouReport) {
        iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;
    }

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
    const [, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] = buildOptimisticMoneyRequestEntities({
        iouReport: shouldUseMoneyReport && iouReport ? iouReport : chatReport,
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount,
        currency,
        comment,
        payeeEmail,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
        isPersonalTrackingExpense: !shouldUseMoneyReport,
        existingTransactionThreadReportID: linkedTrackedExpenseReportAction?.childReportID,
        linkedTrackedExpenseReportAction,
    });

    let reportPreviewAction: OnyxInputValue<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> = null;
    if (shouldUseMoneyReport && iouReport) {
        reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

        if (reportPreviewAction) {
            reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
        } else {
            reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);
            // Generated ReportPreview action is a parent report action of the iou report.
            // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
            iouReport.parentReportActionID = reportPreviewAction.reportActionID;
        }
    }

    let actionableTrackExpenseWhisper: OnyxInputValue<OnyxTypes.ReportAction> = null;
    if (!isPolicyExpenseChat) {
        actionableTrackExpenseWhisper = buildOptimisticActionableTrackExpenseWhisper(iouAction, optimisticTransaction.transactionID);
    }

    // STEP 5: Build Onyx Data
    const trackExpenseOnyxData = buildOnyxDataForTrackExpense({
        participant,
        chat: {report: chatReport, previewAction: reportPreviewAction},
        iou: {report: iouReport, action: iouAction, createdAction: optimisticCreatedActionForIOUReport},
        transactionParams: {
            transaction: optimisticTransaction,
            threadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            threadReport: optimisticTransactionThread ?? {},
        },
        policyParams: {policy, tagList: policyTagList, categories: policyCategories},
        shouldCreateNewMoneyRequestReport,
        actionableTrackExpenseWhisper,
        retryParams,
        isASAPSubmitBetaEnabled,
        quickAction,
    });

    return {
        createdWorkspaceParams,
        chatReport,
        iouReport: iouReport ?? undefined,
        transaction: optimisticTransaction,
        iouAction,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction: reportPreviewAction ?? undefined,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        actionableWhisperReportActionIDParam: actionableTrackExpenseWhisper?.reportActionID,
        optimisticReportID,
        optimisticReportActionID,
        onyxData: {
            optimisticData: optimisticData.concat(trackExpenseOnyxData[0]),
            successData: successData.concat(trackExpenseOnyxData[1]),
            failureData: failureData.concat(trackExpenseOnyxData[2]),
        },
    };
}

/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 * @param [shouldBuildOptimisticModifiedExpenseReportAction=true] When true, build an optimistic MODIFIED_EXPENSE report action.
 */
function getUpdateTrackExpenseParams(
    transactionID: string | undefined,
    transactionThreadReportID: string | undefined,
    transactionChanges: TransactionChanges,
    policy: OnyxEntry<OnyxTypes.Policy>,
    shouldBuildOptimisticModifiedExpenseReportAction = true,
): UpdateMoneyRequestData {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = getClearedPendingFields(transactionChanges);
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

    // Step 2: Get all the collections being updated
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const updatedTransaction = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport: false,
              policy,
          })
        : null;
    const transactionDetails = getTransactionDetails(updatedTransaction);

    if (transactionDetails?.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: chatReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
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
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const allowNegative = shouldEnableNegative(transactionThread ?? undefined);
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, false, policy, updatedTransaction, allowNegative)
        : null;
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
        apiParams.reportActionID = updatedReportAction.reportActionID;

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
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
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
            errorFields: null,
        },
    });

    if (updatedReportAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                lastActorAccountID: updatedReportAction.actorAccountID,
            },
        });
    }

    if (isScanning(transaction) && transactionThread?.parentReportActionID && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {[transactionThread.parentReportActionID]: {originalMessage: {whisperedTo: []}}},
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
            ...transaction,
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
        params: apiParams,
        onyxData: {optimisticData, successData, failureData},
    };
}

const getConvertTrackedExpenseInformation = (
    transactionID: string | undefined,
    actionableWhisperReportActionID: string | undefined,
    moneyRequestReportID: string | undefined,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string | undefined,
    resolution: IOUAction,
    isLinkedTrackedExpenseReportArchived: boolean | undefined,
) => {
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    // Delete the transaction from the track expense report
    const {
        optimisticData: deleteOptimisticData,
        successData: deleteSuccessData,
        failureData: deleteFailureData,
    } = getDeleteTrackExpenseInformation(
        linkedTrackedExpenseReportID,
        transactionID,
        linkedTrackedExpenseReportAction,
        isLinkedTrackedExpenseReportArchived,
        false,
        true,
        actionableWhisperReportActionID,
        resolution,
        true,
    );

    optimisticData?.push(...deleteOptimisticData);
    successData?.push(...deleteSuccessData);
    failureData?.push(...deleteFailureData);

    // Build modified expense report action with the transaction changes
    const modifiedExpenseReportAction = buildOptimisticMovedTransactionAction(transactionThreadReportID, linkedTrackedExpenseReportID ?? CONST.REPORT.UNREPORTED_REPORT_ID);

    optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: modifiedExpenseReportAction,
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
                ...modifiedExpenseReportAction,
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
            },
        },
    });

    return {optimisticData, successData, failureData, modifiedExpenseReportActionID: modifiedExpenseReportAction.reportActionID};
};

function addTrackedExpenseToPolicy(parameters: AddTrackedExpenseToPolicyParam, onyxData: OnyxData<OnyxKey>) {
    API.write(WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY, parameters, onyxData);
}

function convertTrackedExpenseToRequest(convertTrackedExpenseParams: ConvertTrackedExpenseToRequestParams) {
    const {payerParams, transactionParams, chatParams, iouParams, onyxData, workspaceParams} = convertTrackedExpenseParams;
    const {accountID: payerAccountID, email: payerEmail} = payerParams;
    const {
        transactionID,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        amount,
        distance,
        currency,
        comment,
        merchant,
        created,
        attendees,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = transactionParams;
    const optimisticData: Array<OnyxUpdate<OnyxKey>> = [];
    const successData: Array<OnyxUpdate<OnyxKey>> = [];
    const failureData: Array<OnyxUpdate<OnyxKey>> = [];

    optimisticData?.push(...(onyxData.optimisticData ?? []));
    successData?.push(...(onyxData.successData ?? []));
    failureData?.push(...(onyxData.failureData ?? []));

    const convertTrackedExpenseInformation = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        iouParams.reportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SUBMIT,
        isLinkedTrackedExpenseReportArchived,
    );
    optimisticData?.push(...(convertTrackedExpenseInformation.optimisticData ?? []));
    successData?.push(...(convertTrackedExpenseInformation.successData ?? []));
    failureData?.push(...(convertTrackedExpenseInformation.failureData ?? []));

    if (workspaceParams) {
        const params = {
            amount,
            distance,
            currency,
            comment,
            created,
            merchant,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
            reimbursable: true,
            transactionID,
            actionableWhisperReportActionID,
            moneyRequestReportID: iouParams.reportID,
            moneyRequestCreatedReportActionID: iouParams.createdReportActionID,
            moneyRequestPreviewReportActionID: iouParams.reportActionID,
            modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
            reportPreviewReportActionID: chatParams.reportPreviewReportActionID,
            ...workspaceParams,
        };

        addTrackedExpenseToPolicy(params, {optimisticData, successData, failureData});
        return;
    }

    const parameters = {
        attendees,
        amount,
        distance,
        currency,
        comment,
        created,
        merchant,
        payerAccountID,
        payerEmail,
        chatReportID: chatParams.reportID,
        transactionID,
        actionableWhisperReportActionID,
        createdChatReportActionID: chatParams.createdReportActionID,
        moneyRequestReportID: iouParams.reportID,
        moneyRequestCreatedReportActionID: iouParams.createdReportActionID,
        moneyRequestPreviewReportActionID: iouParams.reportActionID,
        transactionThreadReportID,
        modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
        reportPreviewReportActionID: chatParams.reportPreviewReportActionID,
    };
    API.write(WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, parameters, {optimisticData, successData, failureData});
}

/**
 * Move multiple tracked expenses from self-DM to an IOU report
 */
function convertBulkTrackedExpensesToIOU(
    transactionIDs: string[],
    targetReportID: string,
    isASAPSubmitBetaEnabled: boolean,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    policyRecentlyUsedCurrencies: string[],
    quickAction: OnyxEntry<OnyxTypes.QuickAction>,
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>,
) {
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`];

    if (!iouReport || !isMoneyRequestReportReportUtils(iouReport)) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Invalid IOU report', {targetReportID});
        return;
    }

    const chatReportID = iouReport.chatReportID;
    if (!chatReportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No chat report found for IOU', {targetReportID});
        return;
    }

    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    if (!chatReport) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Chat report not found', {chatReportID});
        return;
    }

    const participantAccountIDs = getReportRecipientAccountIDs(iouReport, userAccountID);
    const payerAccountID = participantAccountIDs.at(0);

    if (!payerAccountID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No payer found', {targetReportID, participantAccountIDs});
        return;
    }

    const payerEmail = personalDetails?.[payerAccountID]?.login ?? '';
    const selfDMReportID = findSelfDMReportID();

    if (!selfDMReportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Self DM not found');
        return;
    }

    const selfDMReportActions = getAllReportActions(selfDMReportID);

    for (const transactionID of transactionIDs) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            Log.warn('[convertBulkTrackedExpensesToIOU] Transaction not found', {transactionID});
            continue;
        }

        const linkedTrackedExpenseReportAction = Object.values(selfDMReportActions).find((action) => {
            if (!isMoneyRequestAction(action)) {
                return false;
            }
            const originalMessage = getOriginalMessage(action);
            return originalMessage?.IOUTransactionID === transactionID;
        });

        if (!linkedTrackedExpenseReportAction) {
            Log.warn('[convertBulkTrackedExpensesToIOU] Tracked expense IOU action not found', {transactionID});
            continue;
        }

        const actionableWhisperReportActionID = getTrackExpenseActionableWhisper(transactionID, selfDMReportID)?.reportActionID;

        const commentText = typeof transaction.comment === 'string' ? transaction.comment : (transaction.comment?.comment ?? '');
        const parsedComment = getParsedComment(Parser.htmlToMarkdown(commentText));

        const attendees = transaction.comment?.attendees;

        const transactionThreadReportID = (linkedTrackedExpenseReportAction as OnyxTypes.ReportAction).childReportID;

        if (!transactionThreadReportID) {
            Log.warn('[convertBulkTrackedExpensesToIOU] No transaction thread found for tracked expense, skipping', {
                transactionID,
                actionReportActionID: (linkedTrackedExpenseReportAction as OnyxTypes.ReportAction).reportActionID,
            });
            continue;
        }

        const participantParams = {
            payeeAccountID: userAccountID,
            payeeEmail: currentUserEmail,
            participant: {
                accountID: payerAccountID,
                login: payerEmail,
            },
        };

        const transactionParamsLocal = {
            amount: getAmount(transaction),
            currency: getCurrency(transaction),
            comment: parsedComment,
            merchant: getMerchant(transaction),
            created: transaction.created,
            attendees,
            actionableWhisperReportActionID,
            linkedTrackedExpenseReportAction,
            linkedTrackedExpenseReportID: selfDMReportID,
            isLinkedTrackedExpenseReportArchived: false,
        };

        const {
            payerAccountID: moneyRequestPayerAccountID,
            payerEmail: moneyRequestPayerEmail,
            iouReport: moneyRequestIOUReport,
            chatReport: moneyRequestChatReport,
            transaction: moneyRequestTransaction,
            iouAction,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewAction,
            transactionThreadReportID: moneyRequestTransactionThreadReportID,
            onyxData,
        } = getMoneyRequestInformation({
            parentChatReport: chatReport,
            participantParams,
            transactionParams: transactionParamsLocal,
            moneyRequestReportID: targetReportID,
            existingTransactionID: transactionID,
            existingTransaction: transaction,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam,
            currentUserEmailParam,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
        });

        const convertParams: ConvertTrackedExpenseToRequestParams = {
            payerParams: {
                accountID: moneyRequestPayerAccountID,
                email: moneyRequestPayerEmail,
            },
            transactionParams: {
                amount: getAmount(transaction),
                currency: getCurrency(transaction),
                comment: parsedComment,
                merchant: getMerchant(transaction),
                created: transaction.created,
                attendees,
                transactionID: moneyRequestTransaction.transactionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: selfDMReportID,
                transactionThreadReportID: moneyRequestTransactionThreadReportID,
                isLinkedTrackedExpenseReportArchived: false,
            },
            chatParams: {
                reportID: moneyRequestChatReport.reportID,
                createdReportActionID: createdChatReportActionID,
                reportPreviewReportActionID: reportPreviewAction.reportActionID,
            },
            iouParams: {
                reportID: moneyRequestIOUReport.reportID,
                createdReportActionID: createdIOUReportActionID,
                reportActionID: iouAction.reportActionID,
            },
            onyxData,
        };

        convertTrackedExpenseToRequest(convertParams);
    }
}

function categorizeTrackedExpense(trackedExpenseParams: TrackedExpenseParams) {
    const {onyxData, reportInformation, transactionParams, policyParams, createdWorkspaceParams} = trackedExpenseParams;
    const {optimisticData, successData, failureData} = onyxData ?? {};
    const {transactionID} = transactionParams;
    const {isDraftPolicy} = policyParams;
    const {
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = reportInformation;
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
        isLinkedTrackedExpenseReportArchived,
    );

    optimisticData?.push(...moveTransactionOptimisticData);
    successData?.push(...moveTransactionSuccessData);
    failureData?.push(...moveTransactionFailureData);

    const parameters: CategorizeTrackedExpenseApiParams = {
        ...{
            ...reportInformation,
            linkedTrackedExpenseReportAction: undefined,
        },
        ...policyParams,
        ...transactionParams,
        modifiedExpenseReportActionID,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
        engagementChoice: createdWorkspaceParams?.engagementChoice,
        guidedSetupData: createdWorkspaceParams?.guidedSetupData,
        description: transactionParams.comment,
        customUnitID: createdWorkspaceParams?.customUnitID,
        customUnitRateID: createdWorkspaceParams?.customUnitRateID ?? transactionParams.customUnitRateID,
        attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined,
    };

    API.write(WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});

    // If a draft policy was used, then the CategorizeTrackedExpense command will create a real one
    // so let's track that conversion here
    if (isDraftPolicy) {
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, userAccountID);
    }
}

function shareTrackedExpense(trackedExpenseParams: TrackedExpenseParams) {
    const {onyxData, reportInformation, transactionParams, policyParams, createdWorkspaceParams, accountantParams} = trackedExpenseParams;

    const policyID = policyParams?.policyID;
    const chatReportID = reportInformation?.chatReportID;
    const accountantEmail = addSMSDomainIfPhoneNumber(accountantParams?.accountant?.login);
    const accountantAccountID = accountantParams?.accountant?.accountID;

    if (!policyID || !chatReportID || !accountantEmail || !accountantAccountID) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<OnyxKey>> = [];
    const successData: Array<OnyxUpdate<OnyxKey>> = [];
    const failureData: Array<OnyxUpdate<OnyxKey>> = [];

    const {optimisticData: shareTrackedExpenseOptimisticData = [], successData: shareTrackedExpenseSuccessData = [], failureData: shareTrackedExpenseFailureData = []} = onyxData ?? {};

    optimisticData?.push(...shareTrackedExpenseOptimisticData);
    successData?.push(...shareTrackedExpenseSuccessData);
    failureData?.push(...shareTrackedExpenseFailureData);

    const {transactionID} = transactionParams;
    const {
        actionableWhisperReportActionID,
        moneyRequestPreviewReportActionID,
        moneyRequestCreatedReportActionID,
        reportPreviewReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = reportInformation;

    const convertTrackedExpenseInformation = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SHARE,
        isLinkedTrackedExpenseReportArchived,
    );

    optimisticData?.push(...(convertTrackedExpenseInformation.optimisticData ?? []));
    successData?.push(...(convertTrackedExpenseInformation.successData ?? []));
    failureData?.push(...(convertTrackedExpenseInformation.failureData ?? []));

    const policyEmployeeList = policyParams?.policy?.employeeList;
    if (!policyEmployeeList?.[accountantEmail]) {
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policyEmployeeList, false, false));
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildAddMembersToWorkspaceOnyxData({[accountantEmail]: accountantAccountID}, policyID, policyMemberAccountIDs, CONST.POLICY.ROLE.ADMIN, formatPhoneNumber);
        optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        successData?.push(...addAccountantToWorkspaceSuccessData);
        failureData?.push(...addAccountantToWorkspaceFailureData);
    } else if (policyEmployeeList?.[accountantEmail].role !== CONST.POLICY.ROLE.ADMIN) {
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildUpdateWorkspaceMembersRoleOnyxData(policyID, [accountantEmail], [accountantAccountID], CONST.POLICY.ROLE.ADMIN);
        optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        successData?.push(...addAccountantToWorkspaceSuccessData);
        failureData?.push(...addAccountantToWorkspaceFailureData);
    }

    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    const chatReportParticipants = chatReport?.participants;
    if (chatReport && !chatReportParticipants?.[accountantAccountID]) {
        const {
            optimisticData: inviteAccountantToRoomOptimisticData,
            successData: inviteAccountantToRoomSuccessData,
            failureData: inviteAccountantToRoomFailureData,
        } = buildInviteToRoomOnyxData(chatReport, {[accountantEmail]: accountantAccountID}, formatPhoneNumber);
        optimisticData?.push(...inviteAccountantToRoomOptimisticData);
        successData?.push(...inviteAccountantToRoomSuccessData);
        failureData?.push(...inviteAccountantToRoomFailureData);
    }

    const parameters: ShareTrackedExpenseParams = {
        ...transactionParams,
        policyID,
        moneyRequestPreviewReportActionID,
        moneyRequestReportID,
        moneyRequestCreatedReportActionID,
        actionableWhisperReportActionID,
        modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
        reportPreviewReportActionID,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
        engagementChoice: createdWorkspaceParams?.engagementChoice,
        guidedSetupData: createdWorkspaceParams?.guidedSetupData,
        policyName: createdWorkspaceParams?.policyName,
        description: transactionParams.comment,
        customUnitID: createdWorkspaceParams?.customUnitID,
        customUnitRateID: createdWorkspaceParams?.customUnitRateID ?? transactionParams.customUnitRateID,
        attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined,
        accountantEmail,
    };

    API.write(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});
}

/**
 * Track an expense
 */
function trackExpense(params: CreateTrackExpenseParams) {
    const {
        report,
        action,
        isDraftPolicy,
        participantParams,
        policyParams: policyData = {},
        transactionParams: transactionData,
        accountantParams,
        shouldHandleNavigation = true,
        shouldPlaySound = true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
        activePolicyID,
        quickAction,
    } = params;
    const {participant, payeeAccountID, payeeEmail} = participantParams;
    const {policy, policyCategories, policyTagList} = policyData;
    const parsedComment = getParsedComment(transactionData.comment ?? '');
    transactionData.comment = parsedComment;
    const {
        amount,
        currency,
        created = '',
        merchant = '',
        comment = '',
        distance,
        receipt,
        category,
        tag,
        taxCode = '',
        taxAmount = 0,
        billable,
        reimbursable,
        gpsPoint,
        validWaypoints,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        customUnitRateID,
        attendees,
        odometerStart,
        odometerEnd,
        gpsCoordinates,
    } = transactionData;
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const trackedReceipt = validWaypoints ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN, name: 'receipt-generic.png'} : receipt;
    const sanitizedWaypoints = validWaypoints ? JSON.stringify(sanitizeRecentWaypoints(validWaypoints)) : undefined;

    const retryParams: CreateTrackExpenseParams = {
        ...params,
        report,
        isDraftPolicy,
        action,
        participantParams: {
            participant,
            payeeAccountID,
            payeeEmail,
        },
        transactionParams: {
            amount,
            currency,
            created,
            merchant,
            comment,
            distance,
            receipt: undefined,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            validWaypoints,
            gpsPoint,
            actionableWhisperReportActionID,
            linkedTrackedExpenseReportAction,
            linkedTrackedExpenseReportID,
            customUnitRateID,
        },
        quickAction,
    };

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
        optimisticReportID,
        optimisticReportActionID,
        onyxData,
    } =
        getTrackExpenseInformation({
            parentChatReport: currentChatReport,
            moneyRequestReportID,
            existingTransactionID:
                isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && isMoneyRequestAction(linkedTrackedExpenseReportAction)
                    ? getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID
                    : undefined,
            participantParams: {
                participant,
                payeeAccountID,
                payeeEmail,
            },
            transactionParams: {
                comment,
                amount,
                distance,
                currency,
                created,
                merchant,
                receipt: trackedReceipt,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                reimbursable,
                linkedTrackedExpenseReportAction,
                attendees,
                odometerStart,
                odometerEnd,
                gpsCoordinates,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTagList,
            },
            retryParams,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam,
            currentUserEmailParam,
            introSelected,
            activePolicyID,
            quickAction,
        }) ?? {};
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport?.reportID;

    const recentServerValidatedWaypoints = getRecentWaypoints().filter((item) => !item.pendingAction);
    onyxData?.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
        value: recentServerValidatedWaypoints,
    });

    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);

    const isDistanceRequest =
        isMapDistanceRequest(transaction) || isManualDistanceRequestTransactionUtils(transaction) || isOdometerDistanceRequestTransactionUtils(transaction) || isGPSDistanceRequest;

    if (isDistanceRequest) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        onyxData?.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
            value: transaction?.iouRequestType,
        });
    }

    const mileageRate = isCustomUnitRateIDForP2P(transaction) ? undefined : customUnitRateID;
    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }

    switch (action) {
        case CONST.IOU.ACTION.CATEGORIZE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            const categorizeTransactionParams: TrackedExpenseTransactionParams = {
                transactionID: transaction?.transactionID,
                amount,
                currency,
                comment,
                distance,
                merchant,
                created,
                taxCode,
                taxAmount,
                category,
                tag,
                billable,
                reimbursable,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees,
            };
            const categorizePolicyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
                isDraftPolicy,
            };
            const categorizeReportInformation: TrackedExpenseReportInformation = {
                moneyRequestPreviewReportActionID: iouAction?.reportActionID,
                moneyRequestReportID: iouReport?.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                chatReportID: chatReport?.reportID,
                isLinkedTrackedExpenseReportArchived: transactionData.isLinkedTrackedExpenseReportArchived,
            };
            const trackedExpenseParams: TrackedExpenseParams = {
                onyxData,
                reportInformation: categorizeReportInformation,
                transactionParams: categorizeTransactionParams,
                policyParams: categorizePolicyParams,
                createdWorkspaceParams,
            };

            categorizeTrackedExpense(trackedExpenseParams);
            break;
        }
        case CONST.IOU.ACTION.SHARE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            const shareTransactionParams: TrackedExpenseTransactionParams = {
                transactionID: transaction?.transactionID,
                amount,
                currency,
                comment,
                distance,
                merchant,
                created,
                taxCode: taxCode ?? '',
                taxAmount: taxAmount ?? 0,
                category,
                tag,
                billable,
                reimbursable,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees,
            };
            const sharePolicyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
            };
            const shareReportInformation: TrackedExpenseReportInformation = {
                moneyRequestPreviewReportActionID: iouAction?.reportActionID,
                moneyRequestReportID: iouReport?.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                chatReportID: chatReport?.reportID,
                isLinkedTrackedExpenseReportArchived: transactionData.isLinkedTrackedExpenseReportArchived,
            };
            const trackedExpenseParams: TrackedExpenseParams = {
                onyxData,
                reportInformation: shareReportInformation,
                transactionParams: shareTransactionParams,
                policyParams: sharePolicyParams,
                createdWorkspaceParams,
                accountantParams,
            };
            shareTrackedExpense(trackedExpenseParams);
            break;
        }
        default: {
            const parameters: TrackExpenseParams = {
                amount,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                currency,
                comment,
                distance,
                created,
                merchant,
                iouReportID: iouReport?.reportID,
                // If we are passing an optimisticReportID then we are creating a new chat (selfDM) and we don't have an *existing* chatReportID
                chatReportID: optimisticReportID ? undefined : chatReport?.reportID,
                transactionID: transaction?.transactionID,
                reportActionID: iouAction?.reportActionID,
                createdChatReportActionID,
                createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                optimisticReportID,
                optimisticReportActionID,
                policyID: isDistanceRequest ? undefined : policy?.id,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                receiptState: trackedReceipt?.state,
                reimbursable,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoint ? JSON.stringify(gpsPoint) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                waypoints: sanitizedWaypoints,
                customUnitRateID,
                description: parsedComment,
                gpsCoordinates,
                isDistance: isGPSDistanceRequest || isMapDistanceRequest(transaction) || isManualDistanceRequestTransactionUtils(transaction),
            };
            if (actionableWhisperReportActionIDParam) {
                parameters.actionableWhisperReportActionID = actionableWhisperReportActionIDParam;
            }

            API.write(WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
        }
    }

    if (shouldHandleNavigation) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => removeDraftTransactions());

        if (!params.isRetry) {
            dismissModalAndOpenReportInInboxTab(activeReportID);
        }
    }

    notifyNewAction(activeReportID, payeeAccountID);
}

/**
 * Calculate the URL to navigate to after a track expense deletion
 * @param chatReportID - The ID of the chat report containing the track expense
 * @param transactionID - The ID of the track expense being deleted
 * @param reportAction - The report action associated with the track expense
 * @param isSingleTransactionView - Whether we're in single transaction view
 * @returns The URL to navigate to
 */
function getNavigationUrlAfterTrackExpenseDelete(
    chatReportID: string | undefined,
    chatReport: OnyxEntry<OnyxTypes.Report> | undefined,
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatIOUReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    isSingleTransactionView = false,
): Route | undefined {
    if (!chatReportID || !transactionID) {
        return undefined;
    }

    // If not a self DM, handle it as a regular money request
    if (!isSelfDM(chatReport)) {
        return getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatIOUReport, isChatReportArchived, isSingleTransactionView);
    }

    // Only navigate if in single transaction view and the thread will be deleted
    if (isSingleTransactionView && chatReport?.reportID) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        return ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID);
    }

    return undefined;
}

function deleteTrackExpense({
    chatReportID,
    chatReport,
    transactionID,
    reportAction,
    iouReport,
    chatIOUReport,
    transactions,
    violations,
    isSingleTransactionView = false,
    isChatReportArchived,
    isChatIOUReportArchived,
    allTransactionViolationsParam,
}: DeleteTrackExpenseParams) {
    if (!chatReportID || !transactionID) {
        return;
    }

    const urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(
        chatReportID,
        chatReport,
        transactionID,
        reportAction,
        iouReport,
        chatIOUReport,
        isSingleTransactionView,
        isChatIOUReportArchived,
    );

    // STEP 1: Get all collections we're updating
    if (!isSelfDM(chatReport)) {
        deleteMoneyRequest({
            transactionID,
            reportAction,
            transactions,
            violations,
            iouReport,
            chatReport: chatIOUReport,
            isChatIOUReportArchived,
            isSingleTransactionView,
            allTransactionViolationsParam,
        });
        return urlToNavigateBack;
    }

    const whisperAction = getTrackExpenseActionableWhisper(transactionID, chatReportID);
    const actionableWhisperReportActionID = whisperAction?.reportActionID;
    const {parameters, optimisticData, successData, failureData} = getDeleteTrackExpenseInformation(
        chatReportID,
        transactionID,
        reportAction,
        isChatReportArchived,
        undefined,
        undefined,
        actionableWhisperReportActionID,
        CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
        false,
    );

    // STEP 6: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    clearPdfByOnyxKey(transactionID);

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    return urlToNavigateBack;
}

// ============ getFieldViolationsOnyxData (copied from index.ts since it's not exported) ============

function getFieldViolationsOnyxData(iouReport: OnyxTypes.Report) {
    const missingFields: OnyxTypes.ReportFieldsViolations = {};
    const excludedFields = Object.values(CONST.REPORT_VIOLATIONS_EXCLUDED_FIELDS) as string[];

    for (const field of Object.values(iouReport.fieldList ?? {})) {
        if (excludedFields.includes(field.fieldID) || !!field.value || !!field.defaultValue) {
            continue;
        }
        // in case of missing field violation the empty object is indicator.
        missingFields[field.fieldID] = {};
    }

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

// ============ UpdateMoneyRequestData type (needed for getUpdateTrackExpenseParams return type) ============
type UpdateMoneyRequestData = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData<OnyxKey>;
};

// ============ Exports ============

export {
    buildOnyxDataForTrackExpense,
    getDeleteTrackExpenseInformation,
    getTrackExpenseInformation,
    getUpdateTrackExpenseParams,
    getConvertTrackedExpenseInformation,
    addTrackedExpenseToPolicy,
    convertTrackedExpenseToRequest,
    convertBulkTrackedExpensesToIOU,
    categorizeTrackedExpense,
    shareTrackedExpense,
    trackExpense,
    getNavigationUrlAfterTrackExpenseDelete,
    deleteTrackExpense,
};
export type {CreateTrackExpenseParams};
