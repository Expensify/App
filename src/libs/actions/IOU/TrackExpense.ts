import {fastMerge} from 'expensify-common';
import {InteractionManager} from 'react-native';
import type {OnyxCollection, OnyxEntry, OnyxInputValue, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import * as API from '@libs/API';
import type {
    CategorizeTrackedExpenseParams as CategorizeTrackedExpenseApiParams,
    CreateWorkspaceParams,
    DeleteMoneyRequestParams,
    RequestMoneyParams,
    ShareTrackedExpenseParams,
    TrackExpenseParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import DateUtils from '@libs/DateUtils';
import {deferOrExecuteWrite} from '@libs/deferredLayoutWrite';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import GoogleTagManager from '@libs/GoogleTagManager';
import {isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils} from '@libs/IOUUtils';
import isFileUploadable from '@libs/isFileUploadable';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import * as NumberUtils from '@libs/NumberUtils';
import Parser from '@libs/Parser';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getDistanceRateCustomUnit, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
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
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    buildOptimisticActionableTrackExpenseWhisper,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticMovedTransactionAction,
    buildOptimisticReportPreview,
    buildOptimisticSelfDMReport,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    findSelfDMReportID,
    generateReportID,
    getParsedComment,
    getReportOrDraftReport,
    getReportRecipientAccountIDs,
    isDraftReport,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelfDM,
    prepareOnboardingOnyxData,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {addOptimization} from '@libs/telemetry/submitFollowUpAction';
import {
    buildOptimisticTransaction,
    getAmount,
    getCurrency,
    getMerchant,
    getRateID,
    getWaypoints,
    isCustomUnitRateIDForP2P,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isMapDistanceRequest,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isScanRequest as isScanRequestTransactionUtils,
} from '@libs/TransactionUtils';
import {clearByKey as clearPdfByOnyxKey} from '@userActions/CachedPDFPaths';
import {buildAddMembersToWorkspaceOnyxData, buildUpdateWorkspaceMembersRoleOnyxData} from '@userActions/Policy/Member';
import {buildPolicyData} from '@userActions/Policy/Policy';
import type {BuildPolicyDataKeys} from '@userActions/Policy/Policy';
import type {GuidedSetupData} from '@userActions/Report';
import {buildInviteToRoomOnyxData, notifyNewAction} from '@userActions/Report';
import {stringifyWaypointsForAPI} from '@userActions/Transaction';
import {removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import {getOnboardingMessages} from '@userActions/Welcome/OnboardingFlow';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Receipt, ReceiptSource} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {deleteMoneyRequest, getCleanUpTransactionThreadReportOnyxData, getNavigationUrlOnMoneyRequestDelete} from './DeleteMoneyRequest';
import type {BuildOnyxDataForMoneyRequestKeys, ReplaceReceipt, RequestMoneyInformation, StartSplitBilActionParams} from './index';
import {
    buildMinimalTransactionForFormula,
    getAllReports,
    getAllTransactionDrafts,
    getAllTransactions,
    getAllTransactionViolations,
    getCurrentUserEmail,
    getMoneyRequestInformation,
    getMoneyRequestPolicyTags,
    getReceiptError,
    getReportPreviewAction,
    getSearchOnyxUpdate,
    getTransactionWithPreservedLocalReceiptSource,
    getUserAccountID,
    handleNavigateAfterExpenseCreate,
    highlightTransactionOnSearchRouteIfNeeded,
} from './index';
import type BasePolicyParams from './types/BasePolicyParams';
import type {CreateTrackExpenseParams} from './types/CreateTrackExpenseParams';
import type {
    BuildOnyxDataForTrackExpenseKeys,
    TrackedExpenseParams,
    TrackedExpensePolicyParams,
    TrackedExpenseReportInformation,
    TrackedExpenseTransactionParams,
} from './types/TrackedExpenseParams';

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
    onyxData: OnyxData<BuildOnyxDataForTrackExpenseKeys | BuildPolicyDataKeys | typeof ONYXKEYS.SELF_DM_REPORT_ID>;
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
    taxValue?: string;
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
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
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
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean;
    defaultWorkspaceName?: string;
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
    currentUserAccountID: number;
    currentUserEmail: string;
};

type BuildOnyxDataForTrackExpenseParams = {
    chat: {report: OnyxInputValue<OnyxTypes.Report>; previewAction: OnyxInputValue<ReportAction>};
    iou: {report: OnyxInputValue<OnyxTypes.Report>; createdAction: OptimisticCreatedReportAction; action: OptimisticIOUReportAction};
    transactionParams: {transaction: OnyxTypes.Transaction; threadReport: OptimisticChatReport | null; threadCreatedReportAction: OptimisticCreatedReportAction | null};
    shouldCreateNewMoneyRequestReport: boolean;
    existingTransactionThreadReportID?: string;
    actionableTrackExpenseWhisper?: OnyxInputValue<OnyxTypes.ReportAction>;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    participant?: Participant;
    isASAPSubmitBetaEnabled: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

/** Builds the Onyx data for track expense */
function buildOnyxDataForTrackExpense({
    chat,
    iou,
    transactionParams,
    shouldCreateNewMoneyRequestReport,
    existingTransactionThreadReportID,
    actionableTrackExpenseWhisper,
    retryParams,
    participant,
    isASAPSubmitBetaEnabled,
    quickAction,
}: BuildOnyxDataForTrackExpenseParams): OnyxData<BuildOnyxDataForTrackExpenseKeys> {
    const {report: chatReport, previewAction: reportPreviewAction} = chat;
    const {report: iouReport, createdAction: iouCreatedAction, action: iouAction} = iou;
    const {transaction, threadReport: transactionThreadReport, threadCreatedReportAction: transactionThreadCreatedReportAction} = transactionParams;
    const isScanRequest = isScanRequestTransactionUtils(transaction);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const onyxData: OnyxData<BuildOnyxDataForTrackExpenseKeys> = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };

    const isSelfDMReport = isSelfDM(chatReport);
    let newQuickAction: QuickActionName = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_MANUAL : CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    if (isScanRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_SCAN : CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isDistanceRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_DISTANCE : CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chatReport) {
        onyxData.optimisticData?.push(
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
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: actionableTrackExpenseWhisper,
                },
            });
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    lastReadTime: actionableTrackExpenseWhisper.created,
                    lastVisibleActionCreated: actionableTrackExpenseWhisper.created,
                    lastMessageText: CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                },
            });
            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: {pendingAction: null, errors: null},
                },
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {[actionableTrackExpenseWhisper.reportActionID]: null},
            });
        }
    }

    if (iouReport) {
        onyxData.optimisticData?.push(
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
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            });
        }
    } else {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
            },
        });
    }

    onyxData.optimisticData?.push(
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: getTransactionWithPreservedLocalReceiptSource(transaction, isScanRequest),
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
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (iouReport) {
        onyxData.successData?.push(
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
            onyxData.successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            });
        }
    } else {
        onyxData.successData?.push({
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

    onyxData.successData?.push(
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
        onyxData.successData?.push({
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

    onyxData.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction ?? null,
    });

    if (iouReport) {
        onyxData.failureData?.push(
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
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                },
            },
        });
    }

    onyxData.failureData?.push(
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
        onyxData.failureData?.push({
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
            onyxData.optimisticData?.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            onyxData.successData?.push(...searchUpdate.successData);
        }
    }
    return onyxData;
}

function getDeleteTrackExpenseInformation(
    chatReport: OnyxEntry<OnyxTypes.Report>,
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
    const transaction = getAllTransactions()?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = getAllTransactionViolations()?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if we're not moving the transaction
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted and we're not moving the transaction
    const shouldDeleteTransactionThread = !isMovingTransactionFromTrackExpense && !!transactionThreadID;

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
    const lastVisibleAction = getLastVisibleAction(chatReport?.reportID, canUserPerformWriteAction, updatedReportAction);
    const {lastMessageText = '', lastMessageHtml = ''} = getLastVisibleMessage(chatReport?.reportID, canUserPerformWriteAction, updatedReportAction);

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

    const cleanUpTransactionThreadReportOnyxData = getCleanUpTransactionThreadReportOnyxData({
        transactionThreadID,
        shouldDeleteTransactionThread,
        currentUserAccountID: getUserAccountID(),
    });
    optimisticData.push(...cleanUpTransactionThreadReportOnyxData.optimisticData);

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
    successData.push(...cleanUpTransactionThreadReportOnyxData.successData);

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

    failureData.push(...cleanUpTransactionThreadReportOnyxData.failureData);

    if (actionableWhisperReportActionID) {
        const actionableWhisperReportAction = getReportAction(chatReport?.reportID, actionableWhisperReportActionID);
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
            value: chatReport ?? null,
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
function getTrackExpenseInformation(params: GetTrackExpenseInformationParams): TrackExpenseInformation {
    const {
        parentChatReport,
        moneyRequestReportID = '',
        existingTransaction,
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
        betas,
        isSelfTourViewed,
        defaultWorkspaceName,
    } = params;
    const {payeeAccountID = getUserAccountID(), payeeEmail = getCurrentUserEmail(), participant} = participantParams;
    const {policy} = policyParams;
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
        taxValue,
        billable,
        reimbursable,
        linkedTrackedExpenseReportAction,
        attendees,
        odometerStart,
        odometerEnd,
        gpsCoordinates,
    } = transactionParams;

    const onyxData: OnyxData<BuildOnyxDataForTrackExpenseKeys | BuildPolicyDataKeys | typeof ONYXKEYS.SELF_DM_REPORT_ID> = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };

    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If no chat report is passed, defaults to the self-DM report
    if (!chatReport) {
        chatReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`] ?? null;
    }

    // If we are still missing the chat report then optimistically create the self-DM report and use it
    let optimisticReportID: string | undefined;
    let optimisticReportActionID: string | undefined;
    if (!chatReport) {
        const currentTime = DateUtils.getDBTime();
        const selfDMReport = buildOptimisticSelfDMReport(currentTime);
        const selfDMCreatedReportAction = buildOptimisticCreatedReportAction(getCurrentUserEmail() ?? '', currentTime);
        optimisticReportID = selfDMReport.reportID;
        optimisticReportActionID = selfDMCreatedReportAction.reportActionID;
        chatReport = selfDMReport;

        onyxData.optimisticData?.push(
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
                key: ONYXKEYS.SELF_DM_REPORT_ID,
                value: selfDMReport.reportID,
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
        onyxData.successData?.push(
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
        onyxData.failureData?.push(
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
            policyName: policy?.name ?? defaultWorkspaceName ?? '',
            policyID: policy?.id,
            expenseReportId: chatReport?.reportID,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            currentUserAccountIDParam,
            currentUserEmailParam,
            introSelected,
            activePolicyID,
            betas,
            isSelfTourViewed,
        });
        createdWorkspaceParams = workspaceData.params;
        onyxData.optimisticData?.push(...(workspaceData.optimisticData ?? []));
        onyxData.successData?.push(...(workspaceData.successData ?? []));
        onyxData.failureData?.push(...(workspaceData.failureData ?? []));
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
            iouReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
        } else {
            iouReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
        }
        const isScanRequest = isScanRequestTransactionUtils({amount, receipt});
        shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest, betas);
        if (!iouReport || shouldCreateNewMoneyRequestReport) {
            const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticExpenseReportID, created, amount, currency, merchant);

            iouReport = buildOptimisticExpenseReport({
                chatReportID: chatReport.reportID,
                policyID: chatReport.policyID,
                payeeAccountID,
                total: amount,
                currency,
                nonReimbursableTotal: amount,
                betas,
                optimisticIOUReportID: optimisticExpenseReportID,
                reportTransactions,
            });
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
    const existingTransactionData =
        existingTransaction ?? getAllTransactionDrafts()[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransactionData && isDistanceRequestTransactionUtils(existingTransactionData);
    const isManualDistanceRequest = existingTransactionData && isManualDistanceRequestTransactionUtils(existingTransactionData);
    const isOdometerDistanceRequest = existingTransactionData && isOdometerDistanceRequestTransactionUtils(existingTransactionData);
    const isGPSDistanceRequest = existingTransactionData && isGPSDistanceRequestTransactionUtils(existingTransactionData);
    let optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        existingTransaction: existingTransactionData,
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
            taxAmount: taxAmount ? -taxAmount : undefined,
            taxValue,
            billable,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
            reimbursable,
            filename: existingTransactionData?.receipt?.filename,
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
        optimisticTransaction = fastMerge(existingTransactionData, optimisticTransaction, false);
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
        shouldCreateNewMoneyRequestReport,
        actionableTrackExpenseWhisper,
        retryParams,
        isASAPSubmitBetaEnabled,
        quickAction,
    });

    onyxData.optimisticData?.push(...(trackExpenseOnyxData.optimisticData ?? []));
    onyxData.successData?.push(...(trackExpenseOnyxData.successData ?? []));
    onyxData.failureData?.push(...(trackExpenseOnyxData.failureData ?? []));

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
        onyxData,
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
        getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${linkedTrackedExpenseReportID}`],
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

type GetConvertTrackedExpenseWorkspaceFailureDataParams = {
    iouReportID: string;
    iouCreatedReportActionID: string | undefined;
    iouReportActionID: string;
    chatReportID: string;
    chatPreviewReportActionID: string;
    transactionID: string;
    linkedTrackedExpenseReportID: string;
    linkedTrackedExpenseReportActionID: string;
    transactionThreadReportID: string | undefined;
    modifiedExpenseReportActionID: string;
};

function getConvertTrackedExpenseWorkspaceFailureData({
    iouReportID,
    iouCreatedReportActionID,
    iouReportActionID,
    chatReportID,
    chatPreviewReportActionID,
    transactionID,
    linkedTrackedExpenseReportID,
    linkedTrackedExpenseReportActionID,
    transactionThreadReportID,
    modifiedExpenseReportActionID,
}: GetConvertTrackedExpenseWorkspaceFailureDataParams): Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> {
    const additionalFailureData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
    const previousIOUReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const shouldClearOptimisticIOUReport = !previousIOUReport || previousIOUReport.pendingFields?.createChat === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD;

    if (shouldClearOptimisticIOUReport) {
        additionalFailureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReportID}`,
                value: null,
            },
        );
    } else {
        additionalFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
            value: previousIOUReport,
        });
    }

    const previousReportPreviewAction = getAllReportActions(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`)?.[chatPreviewReportActionID];
    additionalFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
        value: {
            [chatPreviewReportActionID]: previousReportPreviewAction ?? null,
        },
    });

    const previousIOUReportActions = getAllReportActions(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`);
    const previousIOUAction = previousIOUReportActions?.[iouReportActionID];
    additionalFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`,
        value: {
            [iouReportActionID]: previousIOUAction ?? null,
            ...(iouCreatedReportActionID ? {[iouCreatedReportActionID]: previousIOUReportActions?.[iouCreatedReportActionID] ?? null} : {}),
        },
    });

    additionalFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingAction: null,
            reportID: linkedTrackedExpenseReportID,
            status: CONST.TRANSACTION.STATUS.POSTED,
        },
    });

    if (transactionThreadReportID) {
        additionalFailureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
            value: {
                [modifiedExpenseReportActionID]: null,
            },
        });
    }

    additionalFailureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${linkedTrackedExpenseReportID}`,
        value: {
            [linkedTrackedExpenseReportActionID]: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
            },
        },
    });

    return additionalFailureData;
}

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
        waypoints?: string;
        customUnitRateID?: string;
        isDistance?: boolean;
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
    onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>;
    workspaceParams?: ConvertTrackedWorkspaceParams;
};

function addTrackedExpenseToPolicy(parameters: AddTrackedExpenseToPolicyParam, onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>) {
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
        waypoints,
        customUnitRateID,
        isDistance,
    } = transactionParams;
    const optimisticData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
    const successData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];
    const failureData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [];

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

    if (transactionThreadReportID) {
        const transactionThreadReport = getReportOrDraftReport(transactionThreadReportID);

        optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                parentReportActionID: iouParams.reportActionID,
                parentReportID: iouParams.reportID,
            },
        });

        failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                parentReportActionID: transactionThreadReport?.parentReportActionID,
                parentReportID: transactionThreadReport?.parentReportID,
            },
        });
    }

    if (workspaceParams) {
        const additionalFailureData = getConvertTrackedExpenseWorkspaceFailureData({
            iouReportID: iouParams.reportID,
            iouCreatedReportActionID: iouParams.createdReportActionID,
            iouReportActionID: iouParams.reportActionID,
            chatReportID: chatParams.reportID,
            chatPreviewReportActionID: chatParams.reportPreviewReportActionID,
            transactionID,
            linkedTrackedExpenseReportID,
            linkedTrackedExpenseReportActionID: linkedTrackedExpenseReportAction.reportActionID,
            transactionThreadReportID,
            modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
        });

        // Removing the ghost IOU report on API failure which can cause unexpected errors.
        failureData?.push(...additionalFailureData);

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
        isDistance,
        customUnitRateID,
        waypoints,
    };
    API.write(WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, parameters, {optimisticData, successData, failureData});
}

/**
 * Submit expense to another user
 */
function requestMoney(requestMoneyInformation: RequestMoneyInformation): {iouReport?: OnyxTypes.Report} {
    const {
        report,
        existingIOUReport,
        participantParams,
        policyParams = {},
        transactionParams,
        gpsPoint,
        action,
        shouldHandleNavigation = true,
        backToReport,
        shouldPlaySound = true,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        existingTransactionDraft,
        draftTransactionIDs = [],
        isSelfTourViewed,
        betas,
        personalDetails,
        shouldDeferAutoSubmit,
    } = requestMoneyInformation;
    const {payeeAccountID} = participantParams;
    const parsedComment = getParsedComment(transactionParams.comment ?? '');
    transactionParams.comment = parsedComment;
    const {
        amount,
        distance,
        currency,
        merchant,
        comment = '',
        receipt,
        category,
        tag,
        taxCode = '',
        taxAmount = 0,
        billable,
        reimbursable,
        created,
        attendees,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        waypoints,
        customUnitRateID,
        isTestDrive,
        isLinkedTrackedExpenseReportArchived,
        type: transactionType,
        count,
        rate,
        unit,
        isFromGlobalCreate = false,
    } = transactionParams;

    const testDriveCommentReportActionID = isTestDrive ? NumberUtils.rand64() : undefined;

    const sanitizedWaypoints = waypoints ? stringifyWaypointsForAPI(waypoints) : undefined;

    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const existingTransactionID = existingTransactionDraft?.transactionID;
    const existingTransaction = action === CONST.IOU.ACTION.SUBMIT ? existingTransactionDraft : getAllTransactions()[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`];

    const retryParams = {
        ...requestMoneyInformation,
        participantParams: {
            ...requestMoneyInformation.participantParams,
            participant: (({icons, ...rest}) => rest)(requestMoneyInformation.participantParams.participant),
        },
        transactionParams: {
            ...requestMoneyInformation.transactionParams,
            receipt: undefined,
        },
    };

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
    } = getMoneyRequestInformation({
        parentChatReport: isMovingTransactionFromTrackExpense ? undefined : currentChatReport,
        existingIOUReport,
        participantParams,
        policyParams: {
            ...policyParams,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            policyTagList: getMoneyRequestPolicyTags({
                existingIOUReport,
                moneyRequestReportID,
                parentChatReport: isMovingTransactionFromTrackExpense ? undefined : currentChatReport,
                participant: participantParams.participant,
            }),
        },
        transactionParams,
        moneyRequestReportID,
        existingTransactionID,
        existingTransaction: isDistanceRequestTransactionUtils(existingTransaction) ? existingTransaction : undefined,
        retryParams,
        testDriveCommentReportActionID,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport,
        action,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        betas,
        personalDetails,
    });
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport.reportID;

    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }

    // API.write is deferred until the Search screen's actual content (not skeleton)
    // lays out, so that Onyx optimistic updates don't block the JS thread while
    // the skeleton→content transition is in progress. The Search component flushes
    // the registered write from its content onLayout callback.
    // Only the SUBMIT and default (REQUEST_MONEY) branches wrap the write; the actual
    // deferral only activates when we navigate to Search (shouldHandleNavigation && !isRetry).
    // CATEGORIZE and SHARE navigate elsewhere and don't benefit from this deferral.
    let deferredAPIWrite: (() => void) | undefined;

    switch (action) {
        case CONST.IOU.ACTION.SUBMIT: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return {};
            }
            const customUnitParams = isDistanceRequestTransactionUtils(transaction)
                ? {
                      customUnitID: getDistanceRateCustomUnit(policyParams?.policy)?.customUnitID,
                      customUnitRateID,
                  }
                : {};
            const workspaceParams =
                isPolicyExpenseChatReportUtil(chatReport) && chatReport.policyID
                    ? {
                          receipt: isFileUploadable(receipt) ? receipt : undefined,
                          category,
                          tag,
                          taxCode,
                          taxAmount: Math.abs(taxAmount),
                          billable,
                          policyID: chatReport.policyID,
                          waypoints: sanitizedWaypoints,
                          reimbursable,
                          ...customUnitParams,
                      }
                    : undefined;
            const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
            deferredAPIWrite = () => {
                convertTrackedExpenseToRequest({
                    payerParams: {
                        accountID: payerAccountID,
                        email: payerEmail,
                    },
                    transactionParams: {
                        amount,
                        distance,
                        currency,
                        comment,
                        merchant,
                        created,
                        attendees,
                        transactionID: transaction.transactionID,
                        actionableWhisperReportActionID,
                        linkedTrackedExpenseReportAction,
                        linkedTrackedExpenseReportID,
                        transactionThreadReportID: transactionThreadReportID ?? iouAction?.childReportID,
                        isLinkedTrackedExpenseReportArchived,
                        isDistance: isDistanceRequest,
                        customUnitRateID: isDistanceRequest ? customUnitRateID : undefined,
                        waypoints: isDistanceRequest ? sanitizedWaypoints : undefined,
                    },
                    chatParams: {
                        reportID: chatReport.reportID,
                        createdReportActionID: createdChatReportActionID,
                        reportPreviewReportActionID: reportPreviewAction.reportActionID,
                    },
                    iouParams: {
                        reportID: iouReport.reportID,
                        createdReportActionID: createdIOUReportActionID,
                        reportActionID: iouAction.reportActionID,
                    },
                    onyxData,
                    workspaceParams,
                });
            };
            break;
        }
        default: {
            // This is only required when inviting admins to test drive the app
            const guidedSetupData: GuidedSetupData | undefined = isTestDrive
                ? prepareOnboardingOnyxData({
                      introSelected: {choice: CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER},
                      engagementChoice: CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER,
                      onboardingMessage: getOnboardingMessages().onboardingMessages[CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER],
                      companySize: undefined,
                      isSelfTourViewed,
                      betas,
                  })?.guidedSetupData
                : undefined;

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
                receipt: isFileUploadable(receipt) ? receipt : undefined,
                receiptState: receipt?.state,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoint ? JSON.stringify(gpsPoint) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                reimbursable,
                description: parsedComment,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                isTestDrive,
                guidedSetupData: guidedSetupData ? JSON.stringify(guidedSetupData) : undefined,
                testDriveCommentReportActionID,
                ...(transactionType === CONST.TRANSACTION.TYPE.TIME
                    ? {
                          type: transactionType,
                          count,
                          rate,
                          unit,
                      }
                    : {}),
                shouldDeferAutoSubmit,
            };
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            deferredAPIWrite = () => {
                API.write(WRITE_COMMANDS.REQUEST_MONEY, parameters, onyxData);
            };
        }
    }

    // InteractionManager defers past the synchronous multi-scan batch loop,
    // so running cleanup from every call (including intermediates) is safe.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransactionsByIDs(draftTransactionIDs));

    if (shouldHandleNavigation) {
        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction?.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }

    // Register the deferred write BEFORE navigation so the Search component's
    // hasDeferredWrite() check on mount always sees the pending channel.
    if (deferredAPIWrite) {
        deferOrExecuteWrite(deferredAPIWrite, {
            shouldDeferForSearch: shouldHandleNavigation && !requestMoneyInformation.isRetry && isFromGlobalCreate && !isReportTopmostSplitNavigator(),
            isRetry: requestMoneyInformation.isRetry,
            optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            onDeferred: () => addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE),
        });
    }

    if (!requestMoneyInformation.isRetry) {
        highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate, transaction.transactionID, CONST.SEARCH.DATA_TYPES.EXPENSE);

        if (shouldHandleNavigation) {
            handleNavigateAfterExpenseCreate({
                activeReportID: backToReport ?? activeReportID,
                transactionID: transaction.transactionID,
                isFromGlobalCreate,
            });
        }
    }

    if (activeReportID && !isMoneyRequestReport) {
        Navigation.setNavigationActionToMicrotaskQueue(() =>
            setTimeout(() => {
                notifyNewAction(activeReportID, reportPreviewAction, payeeAccountID === currentUserAccountIDParam);
            }, CONST.TIMING.NOTIFY_NEW_ACTION_DELAY),
        );
    }

    return {iouReport};
}

/**
 * Move multiple tracked expenses from self-DM to an IOU report
 */
function convertBulkTrackedExpensesToIOU({
    transactions,
    iouReport,
    chatReport,
    isASAPSubmitBetaEnabled,
    currentUserAccountIDParam,
    currentUserEmailParam,
    transactionViolations,
    policyRecentlyUsedCurrencies,
    quickAction,
    personalDetails,
    betas,
}: {
    transactions: OnyxTypes.Transaction[];
    iouReport: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    policyRecentlyUsedCurrencies: string[];
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
}) {
    const iouReportID = iouReport?.reportID;

    if (!iouReport || !isMoneyRequestReportReportUtils(iouReport)) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Invalid IOU report', {iouReportID});
        return;
    }

    if (!chatReport?.reportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No chat report found for IOU', {iouReportID});
        return;
    }

    const participantAccountIDs = getReportRecipientAccountIDs(iouReport, getUserAccountID());
    const payerAccountID = participantAccountIDs.at(0);

    if (!payerAccountID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No payer found', {iouReportID, participantAccountIDs});
        return;
    }

    const payerEmail = personalDetails?.[payerAccountID]?.login ?? '';
    const selfDMReportID = findSelfDMReportID();

    if (!selfDMReportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Self DM not found');
        return;
    }

    const selfDMReportActions = getAllReportActions(selfDMReportID);

    for (const transaction of transactions) {
        const transactionID = transaction.transactionID;
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
            payeeAccountID: getUserAccountID(),
            payeeEmail: getCurrentUserEmail(),
            participant: {
                accountID: payerAccountID,
                login: payerEmail,
            },
        };

        const transactionParams = {
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
            transactionParams,
            moneyRequestReportID: iouReportID,
            existingTransactionID: transactionID,
            existingTransaction: transaction,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam,
            currentUserEmailParam,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            betas,
            policyParams: {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                policyTagList: getMoneyRequestPolicyTags({
                    moneyRequestReportID: iouReportID,
                    parentChatReport: chatReport,
                    participant: participantParams.participant,
                }),
            },
        });

        const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
        const transactionWaypoints = getWaypoints(transaction);
        const sanitizedWaypointsForBulk = transactionWaypoints ? stringifyWaypointsForAPI(transactionWaypoints) : undefined;

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
                isDistance: isDistanceRequest,
                customUnitRateID: isDistanceRequest ? getRateID(transaction) : undefined,
                waypoints: isDistanceRequest ? sanitizedWaypointsForBulk : undefined,
                distance: isDistanceRequest ? (transaction.comment?.customUnit?.quantity ?? undefined) : undefined,
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
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, getUserAccountID());
    }
}

function shareTrackedExpense(trackedExpenseParams: TrackedExpenseParams) {
    const {onyxData: trackedExpenseOnyxData, reportInformation, transactionParams, policyParams, createdWorkspaceParams, accountantParams} = trackedExpenseParams;

    const policyID = policyParams?.policyID;
    const chatReportID = reportInformation?.chatReportID;
    const accountantEmail = addSMSDomainIfPhoneNumber(accountantParams?.accountant?.login);
    const accountantAccountID = accountantParams?.accountant?.accountID;

    if (!policyID || !chatReportID || !accountantEmail || !accountantAccountID) {
        return;
    }

    const onyxData: OnyxData<
        | BuildOnyxDataForTrackExpenseKeys
        | BuildPolicyDataKeys
        | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS
        | typeof ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE
        | typeof ONYXKEYS.GPS_DRAFT_DETAILS
        | typeof ONYXKEYS.SELF_DM_REPORT_ID
    > = {
        optimisticData: trackedExpenseOnyxData?.optimisticData ?? [],
        successData: trackedExpenseOnyxData?.successData ?? [],
        failureData: trackedExpenseOnyxData?.failureData ?? [],
    };

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

    onyxData.optimisticData?.push(...(convertTrackedExpenseInformation.optimisticData ?? []));
    onyxData.successData?.push(...(convertTrackedExpenseInformation.successData ?? []));
    onyxData.failureData?.push(...(convertTrackedExpenseInformation.failureData ?? []));

    const policyEmployeeList = policyParams?.policy?.employeeList;
    if (policyParams.policy && !policyEmployeeList?.[accountantEmail]) {
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policyEmployeeList, false, false));
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildAddMembersToWorkspaceOnyxData({[accountantEmail]: accountantAccountID}, policyParams.policy, policyMemberAccountIDs, CONST.POLICY.ROLE.ADMIN, formatPhoneNumber);
        onyxData.optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        onyxData.successData?.push(...addAccountantToWorkspaceSuccessData);
        onyxData.failureData?.push(...addAccountantToWorkspaceFailureData);
    } else if (policyEmployeeList?.[accountantEmail].role !== CONST.POLICY.ROLE.ADMIN) {
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildUpdateWorkspaceMembersRoleOnyxData(policyParams?.policy, [accountantEmail], [accountantAccountID], CONST.POLICY.ROLE.ADMIN);
        onyxData.optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        onyxData.successData?.push(...addAccountantToWorkspaceSuccessData);
        onyxData.failureData?.push(...addAccountantToWorkspaceFailureData);
    }

    const chatReport = getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    const chatReportParticipants = chatReport?.participants;
    if (chatReport && !chatReportParticipants?.[accountantAccountID]) {
        const {
            optimisticData: inviteAccountantToRoomOptimisticData,
            successData: inviteAccountantToRoomSuccessData,
            failureData: inviteAccountantToRoomFailureData,
        } = buildInviteToRoomOnyxData(chatReport, {[accountantEmail]: accountantAccountID}, formatPhoneNumber);
        onyxData.optimisticData?.push(...inviteAccountantToRoomOptimisticData);
        onyxData.successData?.push(...inviteAccountantToRoomSuccessData);
        onyxData.failureData?.push(...inviteAccountantToRoomFailureData);
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

    API.write(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, parameters, onyxData);
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
        existingTransaction,
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
        recentWaypoints = [],
        betas,
        draftTransactionIDs = [],
        isSelfTourViewed,
        defaultWorkspaceName,
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
        taxValue,
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
        isFromGlobalCreate = false,
        gpsCoordinates,
    } = transactionData;
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const trackedReceipt = validWaypoints ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN, name: 'receipt-generic.png'} : receipt;
    const sanitizedWaypoints = validWaypoints ? stringifyWaypointsForAPI(validWaypoints) : undefined;

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
            taxValue,
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
        isSelfTourViewed,
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
        onyxData: trackExpenseInformationOnyxData,
    } = getTrackExpenseInformation({
        parentChatReport: currentChatReport,
        moneyRequestReportID,
        existingTransaction,
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
            taxValue,
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
        betas,
        isSelfTourViewed,
        defaultWorkspaceName,
    }) ?? {};
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport?.reportID;
    const onyxData: TrackedExpenseParams['onyxData'] = trackExpenseInformationOnyxData;

    const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
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
            const transactionParams: TrackedExpenseTransactionParams = {
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
            const policyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
                isDraftPolicy,
            };
            const reportInformation: TrackedExpenseReportInformation = {
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
                reportInformation,
                transactionParams,
                policyParams,
                createdWorkspaceParams,
            };

            categorizeTrackedExpense(trackedExpenseParams);
            break;
        }
        case CONST.IOU.ACTION.SHARE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            const transactionParams: TrackedExpenseTransactionParams = {
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
            const policyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
            };
            const reportInformation: TrackedExpenseReportInformation = {
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
                reportInformation,
                transactionParams,
                policyParams,
                createdWorkspaceParams,
                accountantParams,
            };
            shareTrackedExpense(trackedExpenseParams);
            break;
        }
        default: {
            if (isGPSDistanceRequest) {
                onyxData?.optimisticData?.push({
                    onyxMethod: Onyx.METHOD.SET,
                    key: ONYXKEYS.GPS_DRAFT_DETAILS,
                    value: null,
                });
            }

            const parameters: TrackExpenseParams = {
                amount,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                currency,
                comment,
                distance: distance !== undefined ? roundToTwoDecimalPlaces(distance) : undefined,
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
                // Tracked expenses in the CREATE flow are unreported and not tied to a policy
                policyID: undefined,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                receiptState: trackedReceipt?.state,
                reimbursable,
                category,
                tag,
                taxCode,
                taxAmount,
                taxPolicyID: policy?.id,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoint ? JSON.stringify(gpsPoint) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                waypoints: sanitizedWaypoints,
                customUnitRateID,
                ...(policy && customUnitRateID && customUnitRateID !== CONST.CUSTOM_UNITS.FAKE_P2P_ID && {policyID: policy?.id}),
                description: parsedComment,
                gpsCoordinates,
                isDistance:
                    isGPSDistanceRequest ||
                    isMapDistanceRequest(transaction) ||
                    isManualDistanceRequestTransactionUtils(transaction) ||
                    isOdometerDistanceRequestTransactionUtils(transaction),
                odometerStart,
                odometerEnd,
            };
            if (actionableWhisperReportActionIDParam) {
                parameters.actionableWhisperReportActionID = actionableWhisperReportActionIDParam;
            }

            const apiWrite = () => {
                API.write(WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
            };

            deferOrExecuteWrite(apiWrite, {
                shouldDeferForSearch: shouldHandleNavigation && !params.isRetry && isFromGlobalCreate && !isReportTopmostSplitNavigator(),
                isRetry: params.isRetry,
                optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
                onDeferred: () => addOptimization(CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DEFERRED_WRITE),
            });
        }
    }

    // See comment in requestMoney above.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransactionsByIDs(draftTransactionIDs));

    if (!params.isRetry) {
        highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate, transaction?.transactionID, CONST.SEARCH.DATA_TYPES.EXPENSE);

        if (shouldHandleNavigation) {
            handleNavigateAfterExpenseCreate({
                activeReportID,
                transactionID: transaction?.transactionID,
                isFromGlobalCreate,
            });
        }
    }

    notifyNewAction(activeReportID, undefined, payeeAccountID === currentUserAccountIDParam);
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
    currentUserAccountID,
    currentUserEmail,
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
        isChatIOUReportArchived,
        isSingleTransactionView,
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
            currentUserAccountID,
            currentUserEmail,
        });
        return urlToNavigateBack;
    }

    const whisperAction = getTrackExpenseActionableWhisper(transactionID, chatReportID);
    const actionableWhisperReportActionID = whisperAction?.reportActionID;
    const {parameters, optimisticData, successData, failureData} = getDeleteTrackExpenseInformation(
        chatReport,
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

export {
    addTrackedExpenseToPolicy,
    buildOnyxDataForTrackExpense,
    categorizeTrackedExpense,
    convertBulkTrackedExpensesToIOU,
    convertTrackedExpenseToRequest,
    deleteTrackExpense,
    getDeleteTrackExpenseInformation,
    getNavigationUrlAfterTrackExpenseDelete,
    getTrackExpenseInformation,
    shareTrackedExpense,
    trackExpense,
    requestMoney,
};

export type {ConvertTrackedExpenseToRequestParams, CreateTrackExpenseParams, DeleteTrackExpenseParams, TrackExpenseInformation};
