import {fastMerge} from 'expensify-common';
import type {OnyxCollection, OnyxEntry, OnyxInputValue, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import DateUtils from '@libs/DateUtils';
import {getMicroSecondOnyxErrorObject, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import type {MinimalTransaction} from '@libs/Formula';
import {updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import {translateLocal} from '@libs/Localize';
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {rand64} from '@libs/NumberUtils';
import {getManagerMcTestParticipant} from '@libs/OptionsListUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {hasDependentTags, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getOriginalMessage, isReportPreviewAction} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    buildOptimisticAddCommentReportAction,
    buildOptimisticChatReport,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    generateReportID,
    getChatByParticipants,
    getOutstandingChildRequest,
    hasViolations as hasViolationsReportUtils,
    isDeprecatedGroupDM,
    isExpenseReport,
    isGroupChat,
    isInvoiceReport as isInvoiceReportReportUtils,
    isOneTransactionReport,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelectedManagerMcTest,
    isSelfDM,
    isTestTransactionReport,
    populateOptimisticReportFormula,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import {
    buildOptimisticTransaction,
    getAmount,
    getCurrency,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanRequest as isScanRequestTransactionUtils,
    isTimeRequest as isTimeRequestTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import type {IOUAction, IOUActionParams} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt, TransactionChanges, TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getAllPersonalDetails, getAllReportActionsFromIOU, getAllReportNameValuePairs, getAllReports, getCurrentUserPersonalDetails, getSearchOnyxUpdate, getUserAccountID} from './index';
import type {ReplaceReceipt, StartSplitBilActionParams} from './index';
import type BasePolicyParams from './types/BasePolicyParams';
import type BaseTransactionParams from './types/BaseTransactionParams';
import type {CreateTrackExpenseParams} from './types/CreateTrackExpenseParams';
import type RequestMoneyParticipantParams from './types/RequestMoneyParticipantParams';
import type {GPSPoint} from './types/TrackExpenseTransactionParams';

type OneOnOneIOUReport = OnyxTypes.Report | undefined | null;

type BuildOnyxDataForMoneyRequestKeys =
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
    | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS
    | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
    | typeof ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING
    | typeof ONYXKEYS.COLLECTION.NEXT_STEP
    | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT;

type MoneyRequestInformation = {
    payerAccountID: number;
    payerEmail: string;
    iouReport: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewAction: OnyxTypes.ReportAction;
    transactionThreadReportID?: string;
    createdReportActionIDForThread: string | undefined;
    onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>;
    billable?: boolean;
    reimbursable?: boolean;
};

type RequestMoneyTransactionParams = Omit<BaseTransactionParams, 'comment'> & {
    attendees?: Attendee[];
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    receipt?: Receipt;
    waypoints?: WaypointCollection;
    comment?: string;
    originalTransactionID?: string;
    isTestDrive?: boolean;
    source?: string;
    pendingAction?: PendingAction;
    pendingFields?: PendingFields<string>;
    distance?: number;
    isLinkedTrackedExpenseReportArchived?: boolean;
    customUnit?: TransactionCustomUnit;
    odometerStart?: number;
    odometerEnd?: number;

    /** Transaction type (e.g., 'time' for time tracking expenses) */
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;

    /** Number of hours for time tracking expenses */
    count?: number;

    /** Hourly rate in cents. Use convertToBackendAmount() to convert from policy rate (which is stored as a float) */
    rate?: number;

    /** Unit for time tracking (e.g., 'h' for hours) */
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;
};

type RequestMoneyInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    gpsPoint?: GPSPoint;
    action?: IOUAction;
    transactionParams: RequestMoneyTransactionParams;
    isRetry?: boolean;
    shouldPlaySound?: boolean;
    shouldHandleNavigation?: boolean;
    backToReport?: string;
    optimisticChatReportID?: string;
    optimisticCreatedReportActionID?: string;
    optimisticIOUReportID?: string;
    optimisticReportPreviewActionID?: string;
    shouldGenerateTransactionThreadReport: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    existingTransactionDraft: OnyxEntry<OnyxTypes.Transaction>;
    draftTransactionIDs: string[] | undefined;
    isSelfTourViewed: boolean;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    shouldDeferAutoSubmit?: boolean;
};

type MoneyRequestInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    transactionParams: RequestMoneyTransactionParams;
    participantParams: RequestMoneyParticipantParams;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    policyParams?: BasePolicyParams;
    moneyRequestReportID?: string;
    existingTransactionID?: string;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    newReportTotal?: number;
    newNonReimbursableTotal?: number;
    testDriveCommentReportActionID?: string;
    optimisticChatReportID?: string;
    optimisticCreatedReportActionID?: string;
    optimisticIOUReportID?: string;
    optimisticReportPreviewActionID?: string;
    shouldGenerateTransactionThreadReport?: boolean;
    isSplitExpense?: boolean;
    action?: IOUAction;
    currentReportActionID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type MoneyRequestOptimisticParams = {
    chat: {
        report: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>;
        createdAction: OptimisticCreatedReportAction;
        reportPreviewAction: ReportAction;
    };
    iou: {
        report: OnyxTypes.Report;
        createdAction: OptimisticCreatedReportAction;
        action: OptimisticIOUReportAction;
    };
    transactionParams: {
        transaction: OnyxTypes.Transaction;
        transactionThreadReport?: OptimisticChatReport | null;
        transactionThreadCreatedReportAction: OptimisticCreatedReportAction | null;
    };
    policyRecentlyUsed: {
        categories?: string[];
        tags?: OnyxTypes.RecentlyUsedTags;
        currencies?: string[];
        destinations?: string[];
    };
    personalDetailListAction?: OnyxTypes.PersonalDetailsList;
    nextStepDeprecated?: OnyxTypes.ReportNextStepDeprecated | null;
    nextStep?: ReportNextStep | null;
    testDriveCommentReportActionID?: string;
};

type BuildOnyxDataForMoneyRequestParams = {
    isNewChatReport: boolean;
    shouldCreateNewMoneyRequestReport: boolean;
    isOneOnOneSplit?: boolean;
    existingTransactionThreadReportID?: string;
    policyParams?: BasePolicyParams;
    optimisticParams: MoneyRequestOptimisticParams;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    participant?: Participant;
    shouldGenerateTransactionThreadReport?: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type BuildOnyxDataForTestDriveIOUParams = {
    transaction: OnyxTypes.Transaction;
    iouOptimisticParams: MoneyRequestOptimisticParams['iou'];
    chatOptimisticParams: MoneyRequestOptimisticParams['chat'];
    testDriveCommentReportActionID?: string;
};

function buildMinimalTransactionForFormula(
    transactionID: string,
    reportID: string,
    created?: string,
    amount?: number,
    currency?: string,
    merchant?: string,
): Record<string, MinimalTransaction> {
    return {
        [transactionID]: {
            transactionID,
            reportID,
            created,
            amount,
            currency,
            merchant,
        } as MinimalTransaction,
    };
}

function getReportPreviewAction(chatReportID: string | undefined, iouReportID: string | undefined): OnyxInputValue<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> {
    const allReportActions = getAllReportActionsFromIOU();
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {};

    // Find the report preview action from the chat report
    return (
        Object.values(reportActions).find(
            (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> =>
                reportAction && isReportPreviewAction(reportAction) && getOriginalMessage(reportAction)?.linkedReportID === iouReportID,
        ) ?? null
    );
}

function getReceiptError(
    receipt: OnyxEntry<Receipt>,
    filename?: string,
    isScanRequest = true,
    errorKey?: number,
    action?: IOUActionParams,
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt,
): Errors | ErrorFields {
    const formattedRetryParams = typeof retryParams === 'string' ? retryParams : JSON.stringify(retryParams);

    return isEmptyObject(receipt) || !isScanRequest
        ? getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage', errorKey)
        : getMicroSecondOnyxErrorObject(
              {
                  error: CONST.IOU.RECEIPT_ERROR,
                  source: receipt.source?.toString() ?? '',
                  filename: filename ?? '',
                  action: action ?? '',
                  retryParams: formattedRetryParams,
              },
              errorKey,
          );
}

function buildOnyxDataForTestDriveIOU(
    testDriveIOUParams: BuildOnyxDataForTestDriveIOUParams,
): OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT> {
    const deprecatedUserAccountID = getUserAccountID();
    const deprecatedCurrentUserPersonalDetails = getCurrentUserPersonalDetails();
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT>> = [];

    const optimisticIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: testDriveIOUParams.transaction.amount,
        currency: testDriveIOUParams.transaction.currency,
        comment: testDriveIOUParams.transaction.comment?.comment ?? '',
        participants: testDriveIOUParams.transaction.participants ?? [],
        paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        iouReportID: testDriveIOUParams.iouOptimisticParams.report.reportID,
        transactionID: testDriveIOUParams.transaction.transactionID,
        reportActionID: testDriveIOUParams.iouOptimisticParams.action.reportActionID,
    });
    const text = translateLocal('testDrive.employeeInviteMessage', getAllPersonalDetails()?.[deprecatedUserAccountID]?.firstName ?? '');
    // delegateAccountIDParam: will be threaded in PR 15; buildOptimisticAddCommentReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)
    const textComment = buildOptimisticAddCommentReportAction({
        text,
        actorAccountID: deprecatedUserAccountID,
        reportActionID: testDriveIOUParams.testDriveCommentReportActionID,
        delegateAccountIDParam: undefined,
    });
    textComment.reportAction.created = DateUtils.subtractMillisecondsFromDateTime(testDriveIOUParams.iouOptimisticParams.createdAction.created, 1);

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${testDriveIOUParams.chatOptimisticParams.report?.reportID}`,
            value: {
                [textComment.reportAction.reportActionID]: textComment.reportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${testDriveIOUParams.iouOptimisticParams.report.reportID}`,
            value: {
                ...{lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED},
                hasOutstandingChildRequest: false,
                lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${testDriveIOUParams.iouOptimisticParams.report.reportID}`,
            value: {
                [testDriveIOUParams.iouOptimisticParams.action.reportActionID]: optimisticIOUReportAction,
            },
        },
    );

    return {
        optimisticData,
        successData,
        failureData,
    };
}

function getTransactionWithPreservedLocalReceiptSource(transaction: OnyxTypes.Transaction, isScanRequest: boolean): OnyxTypes.Transaction {
    if (isScanRequest && isLocalFile(transaction.receipt?.source)) {
        return {...transaction, receipt: {...transaction.receipt, localSource: String(transaction.receipt?.source)}};
    }
    return transaction;
}

function buildOnyxDataForMoneyRequest(moneyRequestParams: BuildOnyxDataForMoneyRequestParams): OnyxData<BuildOnyxDataForMoneyRequestKeys> {
    const allReports = getAllReports();
    const deprecatedCurrentUserPersonalDetails = getCurrentUserPersonalDetails();
    const {
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        isOneOnOneSplit = false,
        existingTransactionThreadReportID,
        policyParams = {},
        optimisticParams,
        retryParams,
        participant,
        shouldGenerateTransactionThreadReport = true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        personalDetails,
    } = moneyRequestParams;
    const {policy, policyCategories, policyTagList} = policyParams;
    const {
        chat,
        iou,
        transactionParams: {transaction, transactionThreadReport, transactionThreadCreatedReportAction},
        policyRecentlyUsed,
        personalDetailListAction,
        nextStep,
        nextStepDeprecated,
        testDriveCommentReportActionID,
    } = optimisticParams;

    const isScanRequest = isScanRequestTransactionUtils(transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const isTimeRequest = isTimeRequestTransactionUtils(transaction);
    const outstandingChildRequest = getOutstandingChildRequest(iou.report);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const isMoneyRequestToManagerMcTest = isTestTransactionReport(iou.report);
    const onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys> = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };

    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS>;
    if (isScanRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isPerDiemRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.PER_DIEM;
    } else if (isTimeRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_TIME;
    } else {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    }

    if (isDistanceRequestTransactionUtils(transaction)) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chat.report) {
        onyxData.optimisticData?.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report.reportID}`,
            value: {
                ...chat.report,
                lastReadTime: DateUtils.getDBTime(),
                ...(shouldCreateNewMoneyRequestReport ? {lastVisibleActionCreated: chat.reportPreviewAction.created} : {}),
                // do not update iouReportID if auto submit beta is enabled and it is a scan request
                ...(isASAPSubmitBetaEnabled && isScanRequest ? {} : {iouReportID: iou.report.reportID}),
                ...outstandingChildRequest,
                ...(isNewChatReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        });
    }

    onyxData.optimisticData?.push(
        {
            onyxMethod: shouldCreateNewMoneyRequestReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                ...iou.report,
                lastVisibleActionCreated: iou.action.created,
                pendingFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: getTransactionWithPreservedLocalReceiptSource(transaction, isScanRequest),
        },
        isNewChatReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.createdAction.reportActionID]: chat.createdAction,
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              },
        shouldCreateNewMoneyRequestReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                  value: {
                      [iou.createdAction.reportActionID]: iou.createdAction as OnyxTypes.ReportAction,
                      [iou.action.reportActionID]: iou.action as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                  value: {
                      [iou.action.reportActionID]: iou.action as OnyxTypes.ReportAction,
                  },
              },
    );

    if (shouldGenerateTransactionThreadReport) {
        onyxData.optimisticData?.push(
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
    }

    if (isNewChatReport) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
    }

    if (shouldCreateNewMoneyRequestReport) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${iou.report?.reportID}`,
            value: {
                hasOnceLoadedReportActions: true,
            },
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (policyRecentlyUsed.categories?.length) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iou.report.policyID}`,
            value: policyRecentlyUsed.categories,
        });
    }

    if (policyRecentlyUsed.currencies?.length) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: policyRecentlyUsed.currencies,
        });
    }

    if (!isEmptyObject(policyRecentlyUsed.tags)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iou.report.policyID}`,
            value: policyRecentlyUsed.tags,
        });
    }

    if (policyRecentlyUsed.destinations?.length) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${iou.report.policyID}`,
            value: policyRecentlyUsed.destinations,
        });
    }

    if (transaction.receipt?.isTestDriveReceipt) {
        const {
            optimisticData: testDriveOptimisticData = [],
            successData: testDriveSuccessData = [],
            failureData: testDriveFailureData = [],
        } = buildOnyxDataForTestDriveIOU({
            transaction,
            iouOptimisticParams: iou,
            chatOptimisticParams: chat,
            testDriveCommentReportActionID,
        });
        onyxData.optimisticData?.push(...testDriveOptimisticData);
        onyxData.successData?.push(...testDriveSuccessData);
        onyxData.failureData?.push(...testDriveFailureData);
    }

    let iouAction = iou.action;
    let iouReport = iou.report;
    if (isMoneyRequestToManagerMcTest) {
        const isTestReceipt = transaction.receipt?.isTestReceipt ?? false;
        const managerMcTestParticipant = getManagerMcTestParticipant(currentUserAccountIDParam, personalDetails) ?? {};
        const optimisticIOUReportAction = buildOptimisticIOUReportAction({
            type: isScanRequest && !isTestReceipt ? CONST.IOU.REPORT_ACTION_TYPE.CREATE : CONST.IOU.REPORT_ACTION_TYPE.PAY,
            amount: iou.report?.total ?? 0,
            currency: iou.report?.currency ?? '',
            comment: '',
            participants: [managerMcTestParticipant],
            paymentType: isScanRequest && !isTestReceipt ? undefined : CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            iouReportID: iou.report.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iou.action.reportActionID,
        });
        iouAction = optimisticIOUReportAction;
        iouReport = {
            ...iouReport,
            ...(!isScanRequest || isTestReceipt
                ? {lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}
                : undefined),
            hasOutstandingChildRequest: false,
            lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
        };

        onyxData.optimisticData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
                value: {
                    ...iou.report,
                    ...(!isScanRequest || isTestReceipt
                        ? {lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}
                        : undefined),
                    hasOutstandingChildRequest: false,
                    lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                value: {
                    [iou.action.reportActionID]: {
                        ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    ...transaction,
                },
            },
        );
    }

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(personalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        for (const accountIDKey of Object.keys(personalDetailListAction)) {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        }

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: personalDetailListAction,
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    if (!isEmptyObject(nextStepDeprecated)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iou.report.reportID}`,
            value: nextStepDeprecated,
        });
    }
    if (!isEmptyObject(nextStep)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                nextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                nextStep: iou.report.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    if (isNewChatReport) {
        onyxData.successData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
                value: {
                    participants: redundantParticipants,
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );
    }

    onyxData.successData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report.reportID}`,
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
                // The routes contains the distance in meters. Clearing the routes ensures we use the distance
                // in the correct unit stored under the transaction customUnit once the request is created.
                // The route is also not saved in the backend, so we can't rely on it.
                routes: null,
            },
        },

        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chat.createdAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                              isOptimisticAction: null,
                          },
                      }
                    : {}),
                [chat.reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                    isOptimisticAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iou.createdAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                              isOptimisticAction: null,
                          },
                      }
                    : {}),
                [iou.action.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                    isOptimisticAction: null,
                },
            },
        },
    );

    if (shouldGenerateTransactionThreadReport) {
        onyxData.successData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
                value: {
                    participants: redundantParticipants,
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
        );
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                    isOptimisticAction: null,
                },
            },
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    onyxData.failureData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
            value: {
                iouReportID: chat.report?.iouReportID,
                lastReadTime: chat.report?.lastReadTime,
                lastVisibleActionCreated: chat.report?.lastVisibleActionCreated,
                pendingFields: null,
                hasOutstandingChildRequest: chat.report?.hasOutstandingChildRequest,
                ...(isNewChatReport
                    ? {
                          errorFields: {
                              createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: null,
                errorFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iou.createdAction.reportActionID]: {
                              errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                          },
                          [iou.action.reportActionID]: {
                              errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                          },
                      }
                    : {
                          [iou.action.reportActionID]: {
                              errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                          },
                      }),
            },
        },
    );

    if (shouldGenerateTransactionThreadReport) {
        onyxData.failureData?.push({
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
        });
    }

    if (!isOneOnOneSplit) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: chat.report?.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    }

    const searchUpdate = getSearchOnyxUpdate({
        transaction,
        participant,
        iouReport,
        iouAction,
        policy,
        transactionThreadReportID: transactionThreadReport?.reportID,
        isFromOneTransactionReport: isOneTransactionReport(iou.report),
    });

    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            onyxData.optimisticData?.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            onyxData.successData?.push(...searchUpdate.successData);
        }
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !isPaidGroupPolicy(policy) || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return onyxData;
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
        const shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
        const optimisticNextStep = buildOptimisticNextStep({
            report: iou.report,
            predictedNextStatus: iou.report.statusNum ?? CONST.REPORT.STATE_NUM.OPEN,
            shouldFixViolations,
            policy,
            currentUserAccountIDParam,
            currentUserEmailParam,
            hasViolations,
            isASAPSubmitBetaEnabled,
        });
        onyxData.optimisticData?.push(violationsOnyxData, {
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.SET,
            // buildOptimisticNextStep is used in parallel
            value: buildNextStepNew({
                report: iou.report,
                predictedNextStatus: iou.report.statusNum ?? CONST.REPORT.STATE_NUM.OPEN,
                shouldFixViolations,
                policy,
                currentUserAccountIDParam,
                currentUserEmailParam,
                hasViolations,
                isASAPSubmitBetaEnabled,
            }),
        });
        onyxData.optimisticData?.push({
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
        onyxData.failureData?.push({
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                nextStep: iou.report.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    return onyxData;
}

function recalculateOptimisticReportName(iouReport: OnyxTypes.Report, policy: OnyxEntry<OnyxTypes.Policy>): string | undefined {
    if (!policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]) {
        return undefined;
    }
    const titleFormula = policy.fieldList[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.defaultValue ?? '';
    if (!titleFormula) {
        return undefined;
    }
    return populateOptimisticReportFormula(titleFormula, iouReport as Parameters<typeof populateOptimisticReportFormula>[1], policy);
}

function maybeUpdateReportNameForFormulaTitle(iouReport: OnyxTypes.Report, policy: OnyxEntry<OnyxTypes.Policy>): OnyxTypes.Report {
    const allReportNameValuePairs = getAllReportNameValuePairs();
    const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport.reportID}`];
    const titleField = reportNameValuePairs?.expensify_text_title;
    if (titleField?.type !== CONST.REPORT_FIELD_TYPES.FORMULA) {
        return iouReport;
    }

    const updatedReportName = recalculateOptimisticReportName(iouReport, policy);
    if (!updatedReportName) {
        return iouReport;
    }

    return {...iouReport, reportName: updatedReportName};
}

function getMoneyRequestInformation(moneyRequestInformation: MoneyRequestInformationParams): MoneyRequestInformation {
    const allReports = getAllReports();
    const allPersonalDetails = getAllPersonalDetails();
    const {
        parentChatReport,
        existingIOUReport,
        transactionParams,
        participantParams,
        policyParams = {},
        existingTransaction,
        existingTransactionID,
        moneyRequestReportID = '',
        retryParams,
        newReportTotal,
        newNonReimbursableTotal,
        testDriveCommentReportActionID,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport = true,
        isSplitExpense,
        action,
        currentReportActionID,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        personalDetails,
        betas,
    } = moneyRequestInformation;
    const {payeeAccountID = currentUserAccountIDParam, payeeEmail = currentUserEmailParam, participant} = participantParams;
    const {policy, policyCategories, policyTagList, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;

    const {
        attendees,
        amount,
        distance,
        modifiedAmount,
        comment = '',
        currency,
        source = '',
        created,
        merchant,
        receipt,
        category,
        tag,
        taxCode,
        taxAmount,
        taxValue,
        billable,
        reimbursable = true,
        linkedTrackedExpenseReportAction,
        pendingAction,
        pendingFields = {},
        type,
        count,
        rate,
        unit,
        customUnit,
        waypoints,
        odometerStart,
        odometerEnd,
    } = transactionParams;

    const payerEmail = addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If the participant is not a policy expense chat, we need to ensure the chatReport matches the participant.
    // This can happen when submit frequency is disabled and the user selects a different participant on the confirm page.
    // We verify that the chatReport participants match the expected participants. If it's a workspace chat or
    // the participants don't match, we'll find/create the correct 1:1 DM chat report.
    // We also check if the chatReport itself is a Policy Expense Chat to avoid incorrectly validating Policy Expense Chats.
    // We also skip validation for self-DM reports since they use accountID 0 for the participant (representing the report itself).
    // We also skip validation for group chats and deprecated group DMs since they can have more than 2 participants.
    if (chatReport && !isPolicyExpenseChat && !isPolicyExpenseChatReportUtil(chatReport) && !isSelfDM(chatReport) && !isGroupChat(chatReport) && !isDeprecatedGroupDM(chatReport)) {
        const parentChatReportParticipants = Object.keys(chatReport.participants ?? {}).map(Number);
        const expectedParticipants = [payerAccountID, payeeAccountID].sort();
        const sortedParentChatReportParticipants = parentChatReportParticipants.sort();

        const participantsMatch =
            expectedParticipants.length === sortedParentChatReportParticipants.length && expectedParticipants.every((id, index) => id === sortedParentChatReportParticipants.at(index));

        if (!participantsMatch) {
            chatReport = null;
        }
    }

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = getChatByParticipants([payerAccountID, payeeAccountID]) ?? null;
    }

    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = buildOptimisticChatReport({
            participantList: [payerAccountID, payeeAccountID],
            optimisticReportID: optimisticChatReportID,
            currentUserAccountID: currentUserAccountIDParam,
        });
    }

    // STEP 2: Get the Expense/IOU report. If the existingIOUReport or moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    if (existingIOUReport) {
        iouReport = existingIOUReport;
    } else if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else if (!allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`]?.errorFields?.createChat) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const isScanRequest = isScanRequestTransactionUtils({
        amount,
        receipt,
        ...(existingTransaction && {
            iouRequestType: existingTransaction.iouRequestType,
        }),
    });

    const shouldCreateNewMoneyRequestReport = isSplitExpense ? false : shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest, betas, action);

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = existingTransactionID ?? rand64();
    const optimisticReportID = optimisticIOUReportID ?? generateReportID();

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        const nonReimbursableTotal = reimbursable ? 0 : amount;
        const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticReportID, created, amount, currency, merchant);

        iouReport = isPolicyExpenseChat
            ? buildOptimisticExpenseReport({
                  chatReportID: chatReport.reportID,
                  policyID: chatReport.policyID,
                  payeeAccountID,
                  total: amount,
                  currency,
                  nonReimbursableTotal,
                  optimisticIOUReportID: optimisticReportID,
                  reportTransactions,
                  betas,
              })
            : buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency, undefined, undefined, optimisticReportID);
    } else if (isPolicyExpenseChat) {
        iouReport = {...iouReport};
        // Because of the Expense reports are stored as negative values, we subtract the total from the amount
        if (iouReport?.currency === currency) {
            if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                // Use newReportTotal in scenarios where the total is based on more than just the current transaction, and we need to override it manually
                if (newReportTotal) {
                    iouReport.total = newReportTotal;
                } else {
                    iouReport.total -= amount;
                }

                if (!reimbursable) {
                    if (newNonReimbursableTotal !== undefined) {
                        iouReport.nonReimbursableTotal = newNonReimbursableTotal;
                    } else {
                        iouReport.nonReimbursableTotal = (iouReport.nonReimbursableTotal ?? 0) - amount;
                    }
                }

                iouReport = maybeUpdateReportNameForFormulaTitle(iouReport, policy);
            }
            if (typeof iouReport.unheldTotal === 'number') {
                // Use newReportTotal in scenarios where the total is based on more than just the current transaction amount, and we need to override it manually
                if (newReportTotal) {
                    iouReport.unheldTotal = newReportTotal;
                } else {
                    iouReport.unheldTotal -= amount;
                }
            }
        }
    } else {
        iouReport = updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
    }

    // STEP 3: Build an optimistic transaction with the receipt
    const isDistanceRequest = existingTransaction && isDistanceRequestTransactionUtils(existingTransaction);
    const isManualDistanceRequest = existingTransaction && isManualDistanceRequestTransactionUtils(existingTransaction);
    let optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        existingTransaction,
        originalTransactionID: transactionParams.originalTransactionID,
        policy,
        transactionParams: {
            amount: isExpenseReport(iouReport) ? -amount : amount,
            distance,
            ...(modifiedAmount !== undefined && {modifiedAmount: isExpenseReport(iouReport) ? -modifiedAmount : modifiedAmount}),
            currency,
            reportID: iouReport.reportID,
            comment,
            attendees,
            created,
            merchant,
            receipt,
            category,
            tag,
            taxCode,
            source,
            taxAmount: isExpenseReport(iouReport) ? -(taxAmount ?? 0) : taxAmount,
            taxValue,
            billable,
            pendingAction,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, ...pendingFields} : pendingFields,
            reimbursable: isPolicyExpenseChat ? reimbursable : true,
            type,
            count,
            rate,
            unit,
            customUnit,
            waypoints,
            odometerStart,
            odometerEnd,
        },
        isDemoTransactionParam: isSelectedManagerMcTest(participant.login) || transactionParams.receipt?.isTestDriveReceipt,
    });

    iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;

    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        policyTags: policyTagList ?? {},
        policyRecentlyUsedTags,
        transactionTags: tag,
    });
    const optimisticPolicyRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest && existingTransaction) {
        // For split expenses, exclude merchant from merge to preserve merchant from splitExpense
        if (isSplitExpense) {
            // Preserve merchant from transactionParams (splitExpense.merchant) before merge
            const preservedMerchant = merchant || optimisticTransaction.merchant;
            const {merchant: omittedMerchant, ...existingTransactionWithoutMerchant} = existingTransaction;
            optimisticTransaction = fastMerge(existingTransactionWithoutMerchant, optimisticTransaction, false) as OnyxTypes.Transaction;

            // Explicitly set merchant from splitExpense to ensure it's not overwritten
            optimisticTransaction.merchant = preservedMerchant;
        } else {
            optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
        }
    }

    if (isSplitExpense && existingTransaction) {
        const {convertedAmount: originalConvertedAmount, ...existingTransactionWithoutConvertedAmount} = existingTransaction;
        optimisticTransaction = fastMerge(existingTransactionWithoutConvertedAmount, optimisticTransaction, false);

        // Calculate proportional convertedAmount for the split based on the original conversion rate

        const originalAmount = Number(existingTransaction.modifiedAmount) || existingTransaction.amount;

        const splitAmount = Number(optimisticTransaction.modifiedAmount) || optimisticTransaction.amount;
        if (originalConvertedAmount && originalAmount && splitAmount) {
            optimisticTransaction.convertedAmount = Math.round((originalConvertedAmount * splitAmount) / originalAmount);
        }
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment,
            payeeEmail,
            participants: [participant],
            transactionID: optimisticTransaction.transactionID,
            paymentType: isSelectedManagerMcTest(participant.login) || transactionParams.receipt?.isTestDriveReceipt ? CONST.IOU.PAYMENT_TYPE.ELSEWHERE : undefined,
            existingTransactionThreadReportID: linkedTrackedExpenseReportAction?.childReportID,
            optimisticCreatedReportActionID,
            linkedTrackedExpenseReportAction,
            shouldGenerateTransactionThreadReport,
            reportActionID: currentReportActionID,
            currentUserAccountID: currentUserAccountIDParam,
        });

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

    if (reportPreviewAction) {
        reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction, undefined, optimisticReportPreviewActionID);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;

        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !(personalDetails?.[payerAccountID] ?? allPersonalDetails[payerAccountID]);
    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: formatPhoneNumber(participant.displayName || payerEmail),
                  login: participant.login,
                  isOptimisticPersonalDetail: true,
              },
          }
        : {};

    const predictedNextStatus =
        iouReport.statusNum ?? (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN);
    const hasViolations = hasViolationsReportUtils(iouReport.reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam);
    // buildOptimisticNextStep is used in parallel
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: iouReport,
        predictedNextStatus,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });

    const optimisticNextStep = buildOptimisticNextStep({
        report: iouReport,
        predictedNextStatus,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });

    // STEP 5: Build Onyx Data
    const {optimisticData, successData, failureData} = buildOnyxDataForMoneyRequest({
        participant,
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        shouldGenerateTransactionThreadReport,
        isOneOnOneSplit: isSplitExpense,
        policyParams: {
            policy,
            policyCategories,
            policyTagList,
        },
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStepDeprecated: optimisticNextStepDeprecated,
            nextStep: optimisticNextStep,
            testDriveCommentReportActionID,
        },
        retryParams,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        personalDetails,
    });

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread?.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

function calculateDiffAmount(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
): number | null {
    if (!iouReport) {
        return 0;
    }
    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const updatedCurrency = getCurrency(updatedTransaction);
    const currentCurrency = getCurrency(transaction);

    const currentAmount = getAmount(transaction, isExpenseReportLocal);
    const updatedAmount = getAmount(updatedTransaction, isExpenseReportLocal);

    if (updatedCurrency === currentCurrency && currentAmount === updatedAmount) {
        return 0;
    }

    if (updatedCurrency === iouReport.currency && currentCurrency === iouReport.currency) {
        return updatedAmount - currentAmount;
    }

    return null;
}

function getUpdatedMoneyRequestReportData(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    isTransactionOnHold: boolean,
    policy: OnyxEntry<OnyxTypes.Policy>,
    actorAccountID?: number,
    transactionChanges?: TransactionChanges,
) {
    const calculatedDiffAmount = calculateDiffAmount(iouReport, updatedTransaction, transaction);
    const isTotalIndeterminate = calculatedDiffAmount === null;
    const diff = calculatedDiffAmount ?? 0;

    let updatedMoneyRequestReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>;
    if (!iouReport) {
        updatedMoneyRequestReport = null;
    } else if ((isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport)) && !Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
        updatedMoneyRequestReport = {
            ...iouReport,
            total: iouReport.total - diff,
        };
        if (!transaction?.reimbursable && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal -= diff;
        }
        if (updatedTransaction && transaction?.reimbursable !== updatedTransaction?.reimbursable && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal += updatedTransaction.reimbursable ? -updatedTransaction.amount : updatedTransaction.amount;
        }
        if (!isTransactionOnHold) {
            if (typeof updatedMoneyRequestReport.unheldTotal === 'number') {
                updatedMoneyRequestReport.unheldTotal -= diff;
            }
            if (!transaction?.reimbursable && typeof updatedMoneyRequestReport.unheldNonReimbursableTotal === 'number') {
                updatedMoneyRequestReport.unheldNonReimbursableTotal -= diff;
            }
            if (updatedTransaction && transaction?.reimbursable !== updatedTransaction?.reimbursable && typeof updatedMoneyRequestReport.unheldNonReimbursableTotal === 'number') {
                updatedMoneyRequestReport.unheldNonReimbursableTotal += updatedTransaction.reimbursable ? -updatedTransaction.amount : updatedTransaction.amount;
            }
        }
        if (transactionChanges && 'reimbursable' in transactionChanges) {
            updatedMoneyRequestReport = maybeUpdateReportNameForFormulaTitle(updatedMoneyRequestReport, policy);
        }
    } else {
        updatedMoneyRequestReport = updateIOUOwnerAndTotal(iouReport, actorAccountID ?? CONST.DEFAULT_NUMBER_ID, diff, getCurrency(transaction), false, true, isTransactionOnHold);
    }

    return {updatedMoneyRequestReport, isTotalIndeterminate};
}

function mergePolicyRecentlyUsedCategories(category: string | undefined, policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>) {
    let mergedCategories: string[];
    if (category) {
        const categoriesArray = Array.isArray(policyRecentlyUsedCategories) ? policyRecentlyUsedCategories : [];
        const categoriesWithNew = [category, ...categoriesArray];
        mergedCategories = Array.from(new Set(categoriesWithNew));
    } else {
        mergedCategories = policyRecentlyUsedCategories ?? [];
    }
    return mergedCategories;
}

function mergePolicyRecentlyUsedCurrencies(currency: string | undefined, policyRecentlyUsedCurrencies: string[]) {
    let mergedCurrencies: string[];
    const currenciesArray = policyRecentlyUsedCurrencies ?? [];
    if (currency) {
        const currenciesWithNew = [currency, ...currenciesArray];
        mergedCurrencies = Array.from(new Set(currenciesWithNew));
    } else {
        mergedCurrencies = currenciesArray;
    }
    return mergedCurrencies.slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
}

export {
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    buildOnyxDataForTestDriveIOU,
    calculateDiffAmount,
    getMoneyRequestInformation,
    getReceiptError,
    getReportPreviewAction,
    getTransactionWithPreservedLocalReceiptSource,
    getUpdatedMoneyRequestReportData,
    maybeUpdateReportNameForFormulaTitle,
    mergePolicyRecentlyUsedCategories,
    mergePolicyRecentlyUsedCurrencies,
    recalculateOptimisticReportName,
};
export type {BuildOnyxDataForMoneyRequestKeys, MoneyRequestInformation, MoneyRequestInformationParams, OneOnOneIOUReport, RequestMoneyInformation};
