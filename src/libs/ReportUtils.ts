/* eslint-disable max-lines */
import {findFocusedRoute} from '@react-navigation/native';
import {format} from 'date-fns';
import {Str} from 'expensify-common';
import {deepEqual} from 'fast-equals';
import lodashEscape from 'lodash/escape';
import lodashIntersection from 'lodash/intersection';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import mapValues from 'lodash/mapValues';
import lodashMaxBy from 'lodash/maxBy';
import type {ColorValue} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SvgProps} from 'react-native-svg';
import type {SetRequired, TupleToUnion, ValueOf} from 'type-fest';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
// eslint-disable-next-line no-restricted-imports
import {FallbackAvatar, Plus} from '@components/Icon/Expensicons';
import * as defaultGroupAvatars from '@components/Icon/GroupDefaultAvatars';
import * as defaultWorkspaceAvatars from '@components/Icon/WorkspaceDefaultAvatars';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {MoneyRequestAmountInputProps} from '@components/MoneyRequestAmountInput';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow';
import type PolicyData from '@hooks/usePolicyData/types';
import type {PolicyTagList} from '@pages/workspace/tags/types';
import type {ThemeColors} from '@styles/theme/types';
import type {IOUAction, IOUType, OnboardingAccounting} from '@src/CONST';
import CONST, {TASK_TO_FEATURE} from '@src/CONST';
import type {ParentNavigationSummaryParams} from '@src/languages/params';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {
    BankAccountList,
    Beta,
    IntroSelected,
    NewGroupChatDraft,
    OnyxInputOrEntry,
    OutstandingReportsByPolicyIDDerivedValue,
    PersonalDetails,
    PersonalDetailsList,
    Policy,
    PolicyCategories,
    PolicyCategory,
    PolicyReportField,
    PolicyTagLists,
    PolicyTags,
    Report,
    ReportAction,
    ReportAttributesDerivedValue,
    ReportMetadata,
    ReportNameValuePairs,
    ReportViolationName,
    ReportViolations,
    Task,
    Transaction,
    TransactionViolation,
    TransactionViolations,
} from '@src/types/onyx';
import type {ReportTransactionsAndViolations} from '@src/types/onyx/DerivedValues';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {OriginalMessageExportedToIntegration} from '@src/types/onyx/OldDotAction';
import type Onboarding from '@src/types/onyx/Onboarding';
import type {ErrorFields, Errors, Icon, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {
    OriginalMessageChangeLog,
    OriginalMessageChangePolicy,
    OriginalMessageExportIntegration,
    OriginalMessageModifiedExpense,
    OriginalMessageMovedTransaction,
    PaymentMethodType,
} from '@src/types/onyx/OriginalMessage';
import type {Status, Timezone} from '@src/types/onyx/PersonalDetails';
import type {AllConnectionName, ConnectionName} from '@src/types/onyx/Policy';
import type {NotificationPreference, Participants, Participant as ReportParticipant} from '@src/types/onyx/Report';
import type {Message, OldDotReportAction, ReportActions} from '@src/types/onyx/ReportAction';
import type {PendingChatMember} from '@src/types/onyx/ReportMetadata';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Comment, TransactionChanges, WaypointCollection} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject, isEmptyValueObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import {getBankAccountFromID} from './actions/BankAccounts';
import {
    canApproveIOU,
    canIOUBePaid,
    canSubmitReport,
    createDraftTransaction,
    getIOUReportActionToApproveOrPay,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestReportID,
    startDistanceRequest,
    startMoneyRequest,
} from './actions/IOU';
import type {IOURequestType} from './actions/IOU';
import {unholdRequest} from './actions/IOU/Hold';
import {isApprover as isApproverUtils} from './actions/Policy/Member';
import {createDraftWorkspace} from './actions/Policy/Policy';
import {hasCreditBankAccount} from './actions/ReimbursementAccount/store';
import {openUnreportedExpense} from './actions/Report';
import type {GuidedSetupData, TaskForParameters} from './actions/Report';
import {isAnonymousUser as isAnonymousUserSession} from './actions/Session';
import {removeDraftTransactions} from './actions/TransactionEdit';
import {getOnboardingMessages} from './actions/Welcome/OnboardingFlow';
import type {OnboardingCompanySize, OnboardingMessage, OnboardingPurpose, OnboardingTaskLinks} from './actions/Welcome/OnboardingFlow';
import type {AddCommentOrAttachmentParams} from './API/parameters';
import {convertToDisplayString} from './CurrencyUtils';
import DateUtils from './DateUtils';
import {getEnvironmentURL} from './Environment/Environment';
import getEnvironment from './Environment/getEnvironment';
import type EnvironmentType from './Environment/getEnvironment/types';
import {getMicroSecondOnyxErrorWithTranslationKey, isReceiptError} from './ErrorUtils';
import getAttachmentDetails from './fileDownload/getAttachmentDetails';
import type {FormulaContext} from './Formula';
import getBase62ReportID from './getBase62ReportID';
import {isReportMessageAttachment} from './isReportMessageAttachment';
import {formatPhoneNumber as formatPhoneNumberPhoneUtils} from './LocalePhoneNumber';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import Log from './Log';
import {isEmailPublicDomain} from './LoginUtils';
// eslint-disable-next-line import/no-cycle
import {getForReportAction, getMovedReportID} from './ModifiedExpenseMessage';
import getReportURLForCurrentContext from './Navigation/helpers/getReportURLForCurrentContext';
import getStateFromPath from './Navigation/helpers/getStateFromPath';
import {isFullScreenName} from './Navigation/helpers/isNavigatorName';
import {linkingConfig} from './Navigation/linkingConfig';
import Navigation, {navigationRef} from './Navigation/Navigation';
import type {MoneyRequestNavigatorParamList, ReportsSplitNavigatorParamList} from './Navigation/types';
import NetworkConnection from './NetworkConnection';
import {rand64} from './NumberUtils';
import Parser from './Parser';
import {getParsedMessageWithShortMentions} from './ParsingUtils';
import Permissions from './Permissions';
import {
    getAccountIDsByLogins,
    getDisplayNameOrDefault,
    getEffectiveDisplayName,
    getLoginsByAccountIDs,
    getPersonalDetailByEmail,
    getPersonalDetailsByIDs,
    getShortMentionIfFound,
} from './PersonalDetailsUtils';
import {
    canSendInvoiceFromWorkspace,
    getActivePolicies,
    getCleanedTagName,
    getConnectedIntegration,
    getCorrectedAutoReportingFrequency,
    getForwardsToAccount,
    getManagerAccountEmail,
    getManagerAccountID,
    getPolicyEmployeeListByIdWithoutCurrentUser,
    getPolicyNameByID,
    getPolicyRole,
    getRuleApprovers,
    getSubmitToAccountID,
    hasDependentTags as hasDependentTagsPolicyUtils,
    isExpensifyTeam,
    isInstantSubmitEnabled,
    isPaidGroupPolicy as isPaidGroupPolicyPolicyUtils,
    isPolicyAdmin as isPolicyAdminPolicyUtils,
    isPolicyAuditor,
    isPolicyMember,
    isPolicyOwner,
    isSubmitAndClose,
    shouldShowPolicy,
} from './PolicyUtils';
import {
    formatLastMessageText,
    getActionableCardFraudAlertResolutionMessage,
    getActionableJoinRequestPendingReportAction,
    getAllReportActions,
    getCardIssuedMessage,
    getChangedApproverActionMessage,
    getCompanyAddressUpdateMessage,
    getCompanyCardConnectionBrokenMessage,
    getCreatedReportForUnapprovedTransactionsMessage,
    getDefaultApproverUpdateMessage,
    getDismissedViolationMessageText,
    getExportIntegrationLastMessageText,
    getForwardsToUpdateMessage,
    getIntegrationSyncFailedMessage,
    getInvoiceCompanyNameUpdateMessage,
    getInvoiceCompanyWebsiteUpdateMessage,
    getIOUActionForTransactionID,
    getIOUReportIDFromReportActionPreview,
    getJoinRequestMessage,
    getLastVisibleAction,
    getLastVisibleAction as getLastVisibleActionReportActionsUtils,
    getLastVisibleMessage as getLastVisibleMessageActionUtils,
    getLastVisibleMessage as getLastVisibleMessageReportActionsUtils,
    getMarkedReimbursedMessage,
    getMessageOfOldDotReportAction,
    getMostRecentActiveDEWSubmitFailedAction,
    getNumberOfMoneyRequests,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDefaultTitleMessage,
    getPolicyChangeLogMaxExpenseAgeMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getReimburserUpdateMessage,
    getRenamedAction,
    getReportAction,
    getReportActionActorAccountID,
    getReportActionHtml,
    getReportActionMessage as getReportActionMessageReportUtils,
    getReportActionMessageText,
    getReportActionText,
    getSortedReportActions,
    getSubmitsToUpdateMessage,
    getTravelUpdateMessage,
    getUpdateACHAccountMessage,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceFeatureEnabledMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableJoinRequestPending,
    isActionableTrackExpense,
    isActionOfType,
    isApprovedOrSubmittedReportAction,
    isCardIssuedAction,
    isCreatedTaskReportAction,
    isCurrentActionUnread,
    isDeletedAction,
    isDeletedParentAction,
    isDynamicExternalWorkflowSubmitFailedAction,
    isExportIntegrationAction,
    isIntegrationMessageAction,
    isMarkAsClosedAction,
    isModifiedExpenseAction,
    isMoneyRequestAction,
    isMovedAction,
    isOldDotReportAction,
    isPendingRemove,
    isPolicyChangeLogAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isReopenedAction,
    isReportActionAttachment,
    isReportPreviewAction,
    isRetractedAction,
    isReversedTransaction,
    isRoomChangeLogAction,
    isSentMoneyReportAction,
    isSplitBillAction as isSplitBillReportAction,
    isSubmittedAction,
    isTagModificationAction,
    isThreadParentMessage,
    isTrackExpenseAction,
    isTransactionThread,
    isTripPreview,
    isUnapprovedAction,
    isWhisperAction,
    shouldReportActionBeVisible,
    wasActionTakenByCurrentUser,
} from './ReportActionsUtils';
import type {LastVisibleMessage} from './ReportActionsUtils';
// This cycle import is safe because ReportNameUtils was extracted from ReportUtils to separate report name computation logic.
// The functions imported here are pure utility functions that don't create initialization-time dependencies.
// ReportNameUtils imports helper functions from ReportUtils, and ReportUtils imports name generation functions from ReportNameUtils.
// eslint-disable-next-line import/no-cycle
import {
    buildReportNameFromParticipantNames,
    computeReportName,
    generateArchivedReportName,
    getGroupChatName,
    getInvoicePayerName,
    getInvoiceReportName,
    getInvoicesChatName,
    getMoneyRequestReportName,
    getPolicyExpenseChatName,
} from './ReportNameUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';
import {
    getAttendees,
    getBillable,
    getCardID,
    getCardName,
    getCategory,
    getConvertedAmount,
    getCurrency,
    getDescription,
    getDistanceInMeters,
    getFormattedCreated,
    getFormattedPostedDate,
    getMCCGroup,
    getMerchant,
    getMerchantOrDescription,
    getOriginalAmount,
    getOriginalCurrency,
    getRateID,
    getRecentTransactions,
    getReimbursable,
    getTag,
    getTaxAmount,
    getTaxCode,
    getAmount as getTransactionAmount,
    getWaypoints,
    hasMissingSmartscanFields as hasMissingSmartscanFieldsTransactionUtils,
    hasNoticeTypeViolation,
    hasReceipt as hasReceiptTransactionUtils,
    hasViolation,
    hasWarningTypeViolation,
    isManagedCardTransaction as isCardTransactionTransactionUtils,
    isDemoTransaction,
    isDistanceRequest,
    isExpensifyCardTransaction,
    isFetchingWaypointsFromServer,
    isManagedCardTransaction,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isMapDistanceRequest,
    isOnHold as isOnHoldTransactionUtils,
    isPayAtEndExpense,
    isPending,
    isPerDiemRequest,
    isReceiptBeingScanned,
    isScanning,
    isScanRequest as isScanRequestTransactionUtils,
} from './TransactionUtils';
import addTrailingForwardSlash from './UrlUtils';
import type {AvatarSource} from './UserAvatarUtils';
import {getDefaultAvatarURL} from './UserAvatarUtils';
import {generateAccountID} from './UserUtils';
import ViolationsUtils from './Violations/ViolationsUtils';

type AvatarRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18;

type SpendBreakdown = {
    nonReimbursableSpend: number;
    reimbursableSpend: number;
    totalDisplaySpend: number;
};

type OptimisticAddCommentReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT>,
    | 'reportActionID'
    | 'reportID'
    | 'actionName'
    | 'actorAccountID'
    | 'person'
    | 'automatic'
    | 'avatar'
    | 'created'
    | 'message'
    | 'isFirstItem'
    | 'isAttachmentOnly'
    | 'isAttachmentWithText'
    | 'pendingAction'
    | 'shouldShow'
    | 'originalMessage'
    | 'childReportID'
    | 'parentReportID'
    | 'childType'
    | 'childReportName'
    | 'childManagerAccountID'
    | 'childStatusNum'
    | 'childStateNum'
    | 'errors'
    | 'childVisibleActionCount'
    | 'childCommenterCount'
    | 'childLastVisibleActionCreated'
    | 'childOldestFourAccountIDs'
    | 'delegateAccountID'
> & {isOptimisticAction: boolean};

type OptimisticReportAction = {
    commentText: string;
    reportAction: OptimisticAddCommentReportAction;
};

type UpdateOptimisticParentReportAction = {
    childVisibleActionCount: number;
    childCommenterCount: number;
    childLastVisibleActionCreated: string;
    childOldestFourAccountIDs: string | undefined;
};

type OptimisticExpenseReport = Pick<
    Report,
    | 'reportID'
    | 'chatReportID'
    | 'policyID'
    | 'type'
    | 'ownerAccountID'
    | 'managerID'
    | 'currency'
    | 'reportName'
    | 'stateNum'
    | 'statusNum'
    | 'total'
    | 'unheldTotal'
    | 'nonReimbursableTotal'
    | 'unheldNonReimbursableTotal'
    | 'parentReportID'
    | 'created'
    | 'lastVisibleActionCreated'
    | 'parentReportActionID'
    | 'participants'
    | 'fieldList'
>;

type OptimisticNewReport = Pick<
    Report,
    | 'reportID'
    | 'policyID'
    | 'type'
    | 'ownerAccountID'
    | 'reportName'
    | 'stateNum'
    | 'statusNum'
    | 'currency'
    | 'total'
    | 'nonReimbursableTotal'
    | 'parentReportID'
    | 'created'
    | 'lastVisibleActionCreated'
    | 'parentReportActionID'
    | 'participants'
    | 'managerID'
    | 'pendingFields'
    | 'chatReportID'
    | 'nextStep'
> & {reportName: string};

type BuildOptimisticIOUReportActionParams = {
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;
    amount: number;
    currency: string;
    comment: string;
    participants: Participant[];
    transactionID: string;
    paymentType?: PaymentMethodType;
    iouReportID?: string;
    isSettlingUp?: boolean;
    isSendMoneyFlow?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    created?: string;
    linkedExpenseReportAction?: OnyxEntry<ReportAction>;
    payAsBusiness?: boolean;
    bankAccountID?: number | undefined;
    isPersonalTrackingExpense?: boolean;
    reportActionID?: string;
};

type OptimisticIOUReportAction = Pick<
    ReportAction,
    | 'actionName'
    | 'actorAccountID'
    | 'automatic'
    | 'avatar'
    | 'isAttachmentOnly'
    | 'originalMessage'
    | 'message'
    | 'person'
    | 'reportActionID'
    | 'shouldShow'
    | 'created'
    | 'pendingAction'
    | 'receipt'
    | 'childReportID'
    | 'childVisibleActionCount'
    | 'childCommenterCount'
    | 'delegateAccountID'
>;

type PartialReportAction =
    | OnyxInputOrEntry<ReportAction>
    | Partial<ReportAction>
    | OptimisticIOUReportAction
    | OptimisticApprovedReportAction
    | OptimisticSubmittedReportAction
    | OptimisticConciergeCategoryOptionsAction
    | undefined;

type ReportRouteParams = {
    reportID: string;
    isSubReportPageRoute: boolean;
};

type ReportOfflinePendingActionAndErrors = {
    reportPendingAction: PendingAction | undefined;
    reportErrors: Errors | null | undefined;
};

type OptimisticApprovedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.APPROVED>,
    | 'actionName'
    | 'actorAccountID'
    | 'automatic'
    | 'avatar'
    | 'isAttachmentOnly'
    | 'originalMessage'
    | 'message'
    | 'person'
    | 'reportActionID'
    | 'shouldShow'
    | 'created'
    | 'pendingAction'
    | 'delegateAccountID'
>;

type OptimisticUnapprovedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNAPPROVED>,
    | 'actionName'
    | 'actorAccountID'
    | 'automatic'
    | 'avatar'
    | 'isAttachmentOnly'
    | 'originalMessage'
    | 'message'
    | 'person'
    | 'reportActionID'
    | 'shouldShow'
    | 'created'
    | 'pendingAction'
    | 'delegateAccountID'
>;

type OptimisticSubmittedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED>,
    | 'actionName'
    | 'actorAccountID'
    | 'adminAccountID'
    | 'automatic'
    | 'avatar'
    | 'isAttachmentOnly'
    | 'originalMessage'
    | 'message'
    | 'person'
    | 'reportActionID'
    | 'shouldShow'
    | 'created'
    | 'pendingAction'
    | 'delegateAccountID'
>;

type OptimisticHoldReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'isAttachmentOnly' | 'originalMessage' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'created' | 'pendingAction'
>;

type OptimisticRejectReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'isAttachmentOnly' | 'originalMessage' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'created' | 'pendingAction'
>;

type OptimisticReopenedReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'isAttachmentOnly' | 'originalMessage' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'created' | 'pendingAction'
>;

type OptimisticRetractedReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'isAttachmentOnly' | 'originalMessage' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'created' | 'pendingAction'
>;

type OptimisticCancelPaymentReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'message' | 'originalMessage' | 'person' | 'reportActionID' | 'shouldShow' | 'created' | 'pendingAction'
>;

type OptimisticChangeFieldAction = Pick<
    OldDotReportAction & ReportAction,
    'actionName' | 'actorAccountID' | 'originalMessage' | 'person' | 'reportActionID' | 'created' | 'pendingAction' | 'message'
>;

type OptimisticEditedTaskReportAction = Pick<
    ReportAction,
    'reportActionID' | 'actionName' | 'pendingAction' | 'actorAccountID' | 'automatic' | 'avatar' | 'created' | 'shouldShow' | 'message' | 'person' | 'delegateAccountID'
>;

type OptimisticClosedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CLOSED>,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'created' | 'message' | 'originalMessage' | 'pendingAction' | 'person' | 'reportActionID' | 'shouldShow'
>;

type OptimisticCardAssignedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED>,
    'actionName' | 'actorAccountID' | 'automatic' | 'avatar' | 'created' | 'message' | 'originalMessage' | 'pendingAction' | 'person' | 'reportActionID' | 'shouldShow'
>;

type OptimisticDismissedViolationReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'avatar' | 'created' | 'message' | 'originalMessage' | 'person' | 'reportActionID' | 'shouldShow' | 'pendingAction'
>;

type OptimisticCreatedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CREATED>,
    'actorAccountID' | 'automatic' | 'avatar' | 'created' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'pendingAction' | 'actionName' | 'delegateAccountID'
>;

type OptimisticConciergeCategoryOptionsAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS>,
    'reportActionID' | 'actionName' | 'actorAccountID' | 'person' | 'automatic' | 'avatar' | 'created' | 'message' | 'pendingAction' | 'shouldShow' | 'originalMessage' | 'errors'
> & {isOptimisticAction: boolean};

type OptimisticRenamedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.RENAMED>,
    'actorAccountID' | 'automatic' | 'avatar' | 'created' | 'message' | 'person' | 'reportActionID' | 'shouldShow' | 'pendingAction' | 'actionName' | 'originalMessage'
>;

type OptimisticRoomDescriptionUpdatedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION>,
    'actorAccountID' | 'created' | 'message' | 'person' | 'reportActionID' | 'pendingAction' | 'actionName' | 'originalMessage'
>;

type OptimisticRoomAvatarUpdatedReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR>,
    'actorAccountID' | 'created' | 'message' | 'person' | 'reportActionID' | 'pendingAction' | 'actionName' | 'originalMessage'
>;

type OptimisticChatReport = Pick<
    Report,
    | 'type'
    | 'chatType'
    | 'chatReportID'
    | 'iouReportID'
    | 'isOwnPolicyExpenseChat'
    | 'isPinned'
    | 'lastActorAccountID'
    | 'lastMessageHtml'
    | 'lastMessageText'
    | 'lastReadTime'
    | 'lastVisibleActionCreated'
    | 'oldPolicyName'
    | 'ownerAccountID'
    | 'pendingFields'
    | 'parentReportActionID'
    | 'parentReportID'
    | 'participants'
    | 'policyID'
    | 'reportID'
    | 'reportName'
    | 'stateNum'
    | 'statusNum'
    | 'visibility'
    | 'description'
    | 'writeCapability'
    | 'avatarUrl'
    | 'invoiceReceiver'
>;

type OptimisticExportIntegrationAction = OriginalMessageExportedToIntegration &
    Pick<
        ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION>,
        'reportActionID' | 'actorAccountID' | 'avatar' | 'created' | 'lastModified' | 'message' | 'person' | 'shouldShow' | 'pendingAction' | 'errors' | 'automatic'
    >;

type OptimisticTaskReportAction = Pick<
    ReportAction,
    | 'reportActionID'
    | 'actionName'
    | 'actorAccountID'
    | 'automatic'
    | 'avatar'
    | 'created'
    | 'isAttachmentOnly'
    | 'message'
    | 'originalMessage'
    | 'person'
    | 'pendingAction'
    | 'shouldShow'
    | 'isFirstItem'
    | 'previousMessage'
    | 'errors'
    | 'linkMetadata'
    | 'delegateAccountID'
>;

type AnnounceRoomOnyxData = {
    onyxOptimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    onyxSuccessData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    onyxFailureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
};

type OptimisticAnnounceChat = {
    announceChatReportID: string;
    announceChatReportActionID: string;
    announceChatData: AnnounceRoomOnyxData;
};

type OptimisticWorkspaceChats = {
    adminsChatReportID: string;
    adminsChatData: OptimisticChatReport;
    adminsReportActionData: Record<string, OptimisticCreatedReportAction>;
    adminsCreatedReportActionID: string;
    expenseChatReportID: string;
    expenseChatData: OptimisticChatReport;
    expenseReportActionData: Record<string, OptimisticCreatedReportAction>;
    expenseCreatedReportActionID: string;
    pendingChatMembers: PendingChatMember[];
};

type OptimisticModifiedExpenseReportAction = Pick<
    ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE>,
    | 'actionName'
    | 'actorAccountID'
    | 'automatic'
    | 'avatar'
    | 'created'
    | 'isAttachmentOnly'
    | 'message'
    | 'originalMessage'
    | 'person'
    | 'pendingAction'
    | 'reportActionID'
    | 'shouldShow'
    | 'delegateAccountID'
> & {reportID?: string};

type BaseOptimisticMoneyRequestEntities = {
    iouReport: Report;
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;
    amount: number;
    currency: string;
    comment: string;
    payeeEmail: string;
    participants: Participant[];
    transactionID: string;
    paymentType?: PaymentMethodType;
    isSettlingUp?: boolean;
    isSendMoneyFlow?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    isPersonalTrackingExpense?: boolean;
    existingTransactionThreadReportID?: string;
    linkedTrackedExpenseReportAction?: ReportAction;
    optimisticCreatedReportActionID?: string;
    reportActionID?: string;
};

type OptimisticMoneyRequestEntities = BaseOptimisticMoneyRequestEntities & {shouldGenerateTransactionThreadReport?: boolean};
type OptimisticMoneyRequestEntitiesWithTransactionThreadFlag = BaseOptimisticMoneyRequestEntities & {shouldGenerateTransactionThreadReport: boolean};
type OptimisticMoneyRequestEntitiesWithoutTransactionThreadFlag = BaseOptimisticMoneyRequestEntities;

type OptimisticTaskReport = SetRequired<
    Pick<
        Report,
        | 'reportID'
        | 'reportName'
        | 'description'
        | 'ownerAccountID'
        | 'participants'
        | 'managerID'
        | 'type'
        | 'parentReportID'
        | 'policyID'
        | 'stateNum'
        | 'statusNum'
        | 'parentReportActionID'
        | 'lastVisibleActionCreated'
        | 'hasParentAccess'
    >,
    'parentReportID'
>;

type TransactionDetails = {
    created: string;
    amount: number;
    attendees: Attendee[] | string;
    taxAmount?: number;
    taxCode?: string;
    currency: string;
    merchant: string;
    waypoints?: WaypointCollection | string;
    customUnitRateID?: string;
    comment: string;
    category: string;
    reimbursable: boolean;
    billable: boolean;
    tag: string;
    mccGroup?: ValueOf<typeof CONST.MCC_GROUPS>;
    description?: string;
    cardID: number;
    cardName?: string;
    originalAmount: number;
    originalCurrency: string;
    postedDate: string;
    transactionID: string;
    distance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    convertedAmount: number;
    gpsCoordinates?: string;
};

type OptimisticIOUReport = Pick<
    Report,
    | 'type'
    | 'chatReportID'
    | 'currency'
    | 'managerID'
    | 'policyID'
    | 'ownerAccountID'
    | 'participants'
    | 'reportID'
    | 'stateNum'
    | 'statusNum'
    | 'total'
    | 'unheldTotal'
    | 'nonReimbursableTotal'
    | 'unheldNonReimbursableTotal'
    | 'reportName'
    | 'parentReportID'
    | 'created'
    | 'lastVisibleActionCreated'
    | 'fieldList'
    | 'parentReportActionID'
>;

type OptimisticChangedApproverReportAction = Pick<
    ReportAction,
    'actionName' | 'actorAccountID' | 'avatar' | 'created' | 'message' | 'originalMessage' | 'person' | 'reportActionID' | 'shouldShow' | 'pendingAction' | 'isOptimisticAction'
>;

type DisplayNameWithTooltips = Array<Pick<PersonalDetails, 'accountID' | 'pronouns' | 'displayName' | 'login' | 'avatar'>>;

type CustomIcon = {
    src: IconAsset;
    color?: string;
};

type OptionData = {
    text?: string;
    alternateText?: string;
    allReportErrors?: Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | '' | null;
    tooltipText?: string | null;
    alternateTextMaxLines?: number;
    boldStyle?: boolean;
    customIcon?: CustomIcon;
    subtitle?: string;
    login?: string;
    accountID?: number;
    pronouns?: string;
    status?: Status | null;
    phoneNumber?: string;
    isUnread?: boolean | null;
    isUnreadWithMention?: boolean | null;
    hasDraftComment?: boolean | null;
    keyForList?: string;
    searchText?: string;
    isIOUReportOwner?: boolean | null;
    shouldShowSubscript?: boolean | null;
    isPolicyExpenseChat?: boolean;
    isMoneyRequestReport?: boolean | null;
    isInvoiceReport?: boolean;
    isExpenseRequest?: boolean | null;
    isAllowedToComment?: boolean | null;
    isThread?: boolean | null;
    isTaskReport?: boolean | null;
    parentReportAction?: OnyxEntry<ReportAction>;
    displayNamesWithTooltips?: DisplayNameWithTooltips | null;
    isDefaultRoom?: boolean;
    isInvoiceRoom?: boolean;
    isExpenseReport?: boolean;
    isDM?: boolean;
    isOptimisticPersonalDetail?: boolean;
    selected?: boolean;
    isOptimisticAccount?: boolean;
    isSelected?: boolean;
    descriptiveText?: string;
    notificationPreference?: NotificationPreference | null;
    isDisabled?: boolean | null;
    name?: string | null;
    isSelfDM?: boolean;
    isOneOnOneChat?: boolean;
    reportID?: string;
    enabled?: boolean;
    code?: string;
    transactionThreadReportID?: string | null;
    shouldShowAmountInput?: boolean;
    amountInputProps?: MoneyRequestAmountInputProps;
    tabIndex?: 0 | -1;
    isConciergeChat?: boolean;
    isBold?: boolean;
    lastIOUCreationDate?: string;
    isChatRoom?: boolean;
    participantsList?: PersonalDetails[];
    icons?: Icon[];
    iouReportAmount?: number;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    avatar?: AvatarSource;
    timezone?: Timezone;
} & Report &
    ReportNameValuePairs;

type OnyxDataTaskAssigneeChat = {
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    >;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>>;
    optimisticAssigneeAddComment?: OptimisticReportAction;
    optimisticChatCreatedReportAction?: OptimisticCreatedReportAction;
};

type Ancestor = {
    report: Report;
    reportAction: ReportAction;
    shouldDisplayNewMarker: boolean;
};

type AncestorIDs = {
    reportIDs: string[];
    reportActionsIDs: string[];
};

type MissingPaymentMethod = 'bankAccount' | 'wallet';

type OutstandingChildRequest = {
    hasOutstandingChildRequest?: boolean;
};

type ParsingDetails = {
    reportID?: string;
    policyID?: string;
};

type NonHeldAndFullAmount = {
    nonHeldAmount: string;
    fullAmount: string;
    /**
     * nonHeldAmount is valid if not negative;
     * It can be negative if the unheld transaction comes from the current user
     */
    hasValidNonHeldAmount: boolean;
};

type Thread = {
    parentReportID: string;
    parentReportActionID: string;
} & Report;

type SelfDMParameters = {
    reportID?: string;
    createdReportActionID?: string;
};

type GetPolicyNameParams = {
    report: OnyxInputOrEntry<Report>;
    returnEmptyIfNotFound?: boolean;
    policy?: OnyxInputOrEntry<Policy>;
    policies?: Policy[];
    reports?: Report[];
};

type GetReportNameParams = {
    report: OnyxEntry<Report>;
    policy?: OnyxEntry<Policy>;
    parentReportActionParam?: OnyxInputOrEntry<ReportAction>;
    personalDetails?: Partial<PersonalDetailsList>;
    invoiceReceiverPolicy?: OnyxEntry<Policy>;
    transactions?: Transaction[];
    reports?: Report[];
    policies?: Policy[];
    isReportArchived?: boolean;
};

type GetReportStatusParams = {
    stateNum?: number;
    statusNum?: number;
    translate: LocaleContextProps['translate'];
};

type ReportByPolicyMap = Record<string, OnyxCollection<Report>>;

let currentUserEmail: string | undefined;
let currentUserPrivateDomain: string | undefined;
let currentUserAccountID: number | undefined;
let isAnonymousUser = false;

let environmentURL: string;
getEnvironmentURL().then((url: string) => (environmentURL = url));
let environment: EnvironmentType;
getEnvironment().then((env) => {
    environment = env;
});

// This cache is used to save parse result of report action html message into text
// to prevent unnecessary parsing when the report action is not changed/modified.
// Example case: when we need to get a report name of a thread which is dependent on a report action message.
const parsedReportActionMessageCache: Record<string, string> = {};

let conciergeReportIDOnyxConnect: OnyxEntry<string>;
Onyx.connectWithoutView({
    key: ONYXKEYS.CONCIERGE_REPORT_ID,
    callback: (value) => {
        conciergeReportIDOnyxConnect = value;
    },
});

const defaultAvatarBuildingIconTestID = 'SvgDefaultAvatarBuilding Icon';
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        // When signed out, val is undefined
        if (!value) {
            return;
        }

        currentUserEmail = value.email;
        currentUserAccountID = value.accountID;
        isAnonymousUser = value.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
        currentUserPrivateDomain = isEmailPublicDomain(currentUserEmail ?? '') ? '' : Str.extractEmailDomain(currentUserEmail ?? '');
    },
});

let allPersonalDetails: OnyxEntry<PersonalDetailsList>;
let allPersonalDetailLogins: string[];
let currentUserPersonalDetails: OnyxEntry<PersonalDetails>;
Onyx.connectWithoutView({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        if (currentUserAccountID) {
            currentUserPersonalDetails = value?.[currentUserAccountID] ?? undefined;
        }
        allPersonalDetails = value ?? {};
        allPersonalDetailLogins = Object.values(allPersonalDetails).map((personalDetail) => personalDetail?.login ?? '');
    },
});

let allReportsDraft: OnyxCollection<Report>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => (allReportsDraft = value),
});

let allPolicies: OnyxCollection<Policy>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

let allPolicyDrafts: OnyxCollection<Policy>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.POLICY_DRAFTS,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicyDrafts = value),
});

let allReports: OnyxCollection<Report>;
let reportsByPolicyID: ReportByPolicyMap;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;

        if (!value) {
            return;
        }

        reportsByPolicyID = Object.entries(value).reduce<ReportByPolicyMap>((acc, [reportID, report]) => {
            if (!report) {
                return acc;
            }

            // Get all reports, which are the ones that are:
            // - Owned by the same user
            // - Are either open or submitted
            // - Belong to the same workspace
            if (report.policyID && report.ownerAccountID === currentUserAccountID && (report.stateNum ?? 0) <= 1) {
                if (!acc[report.policyID]) {
                    acc[report.policyID] = {};
                }

                acc[report.policyID] = {
                    ...acc[report.policyID],
                    [reportID]: report,
                };
            }

            return acc;
        }, {});
    },
});

let allBetas: OnyxEntry<Beta[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => (allBetas = value),
});

let allTransactions: OnyxCollection<Transaction> = {};
let reportsTransactions: Record<string, Transaction[]> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(Object.entries(value).filter(([, transaction]) => transaction));

        reportsTransactions = Object.values(value).reduce<Record<string, Transaction[]>>((all, transaction) => {
            const reportsMap = all;
            if (!transaction?.reportID) {
                return reportsMap;
            }

            if (!reportsMap[transaction.reportID]) {
                reportsMap[transaction.reportID] = [];
            }
            reportsMap[transaction.reportID].push(transaction);

            return all;
        }, {});
    },
});

let allReportActions: OnyxCollection<ReportActions>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});

let allReportMetadata: OnyxCollection<ReportMetadata>;
const allReportMetadataKeyValue: Record<string, ReportMetadata> = {};
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_METADATA,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allReportMetadata = value;

        for (const [reportID, reportMetadata] of Object.entries(value)) {
            if (!reportMetadata) {
                continue;
            }

            const [, id] = reportID.split('_');
            allReportMetadataKeyValue[id] = reportMetadata;
        }
    },
});

let allReportNameValuePair: OnyxCollection<ReportNameValuePairs>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allReportNameValuePair = value;
    },
});

let allReportsViolations: OnyxCollection<ReportViolations>;
Onyx.connectWithoutView({
    key: ONYXKEYS.COLLECTION.REPORT_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allReportsViolations = value;
    },
});

let onboarding: OnyxEntry<Onboarding>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => (onboarding = value),
});

let delegateEmail = '';
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        delegateEmail = value?.delegatedAccess?.delegate ?? '';
    },
});

let reportAttributesDerivedValue: ReportAttributesDerivedValue['reports'];
Onyx.connectWithoutView({
    key: ONYXKEYS.DERIVED.REPORT_ATTRIBUTES,
    callback: (value) => {
        reportAttributesDerivedValue = value?.reports ?? {};
    },
});

let newGroupChatDraft: OnyxEntry<NewGroupChatDraft>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NEW_GROUP_CHAT_DRAFT,
    callback: (value) => (newGroupChatDraft = value),
});

let cachedSelfDMReportID: OnyxEntry<string>;
Onyx.connectWithoutView({
    key: ONYXKEYS.SELF_DM_REPORT_ID,
    callback: (value) => (cachedSelfDMReportID = value),
});

let hiddenTranslation = '';
let unavailableTranslation = '';

Onyx.connectWithoutView({
    key: ONYXKEYS.ARE_TRANSLATIONS_LOADING,
    initWithStoredValues: false,
    callback: (value) => {
        if (value ?? true) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        hiddenTranslation = translateLocal('common.hidden');
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        unavailableTranslation = translateLocal('workspace.common.unavailable');
    },
});

function getCurrentUserAvatar(): AvatarSource | undefined {
    return currentUserPersonalDetails?.avatar;
}

function getCurrentUserDisplayNameOrEmail(): string | undefined {
    return currentUserPersonalDetails?.displayName ?? currentUserEmail;
}

function getChatType(report: OnyxInputOrEntry<Report> | Participant): ValueOf<typeof CONST.REPORT.CHAT_TYPE> | undefined {
    return report?.chatType;
}

/**
 * Get the report or draft report given a reportID
 */
function getReportOrDraftReport(reportID: string | undefined, searchReports?: Array<OnyxEntry<Report>>, fallbackReport?: Report, reportDrafts?: OnyxCollection<Report>): OnyxEntry<Report> {
    const searchReport = searchReports?.find((report) => report?.reportID === reportID);
    const onyxReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    return searchReport ?? onyxReport ?? (reportDrafts ?? allReportsDraft)?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`] ?? fallbackReport;
}

function reportTransactionsSelector(transactions: OnyxCollection<Transaction>, reportID: string | undefined): Transaction[] {
    if (!transactions || !reportID) {
        return [];
    }

    return Object.values(transactions).filter((transaction): transaction is Transaction => !!transaction && transaction.reportID === reportID);
}

function getReportTransactions(reportID: string | undefined, allReportsTransactions: Record<string, Transaction[]> = reportsTransactions): Transaction[] {
    if (!reportID) {
        return [];
    }

    return allReportsTransactions[reportID] ?? [];
}

/**
 * Check if a report is a draft report
 */
function isDraftReport(reportID: string | undefined): boolean {
    const draftReport = allReportsDraft?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`];

    return !!draftReport;
}

/**
 * @private
 */
function isSearchReportArray(object: Report[] | OnyxCollection<Report>): object is Report[] {
    if (!Array.isArray(object)) {
        return false;
    }
    const firstItem = object.at(0);
    return firstItem !== undefined && 'private_isArchived' in firstItem;
}

/**
 * @private
 * Returns the report
 */
function getReport(reportID: string, reports: Report[] | OnyxCollection<Report>): OnyxEntry<Report> | Report {
    if (isSearchReportArray(reports)) {
        reports?.find((report) => report.reportID === reportID);
    } else {
        return reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    }
}

/**
 * Returns the parentReport if the given report is a thread
 */
function getParentReport(report: OnyxEntry<Report>): OnyxEntry<Report> {
    if (!report?.parentReportID) {
        return undefined;
    }
    return getReport(report.parentReportID, allReports);
}

/**
 * Returns the appropriate report to use for display.
 * For invoice chat threads, returns the parent invoice report.
 * For other cases, returns the provided report.
 */
function getReportForHeader(report: OnyxEntry<Report>): OnyxEntry<Report> {
    const parentReport = getParentReport(report);
    const isParentInvoiceAndIsChatThread = isChatThread(report) && isInvoiceReport(parentReport);
    return isParentInvoiceAndIsChatThread ? parentReport : report;
}

/**
 * Returns the root parentReport if the given report is nested.
 * Uses recursion to iterate any depth of nested reports.
 */

function getRootParentReport({
    report,
    reports,
    visitedReportIDs = new Set<string>(),
}: {
    report: OnyxEntry<Report>;

    reports?: Report[];
    visitedReportIDs?: Set<string>;
}): OnyxEntry<Report> {
    if (!report) {
        return undefined;
    }

    // Returns the current report as the root report, because it does not have a parentReportID
    if (!report?.parentReportID) {
        return report;
    }

    // Detect and prevent an infinite loop caused by a cycle in the ancestry. This should normally
    // never happen
    if (visitedReportIDs.has(report.reportID)) {
        Log.alert('Report ancestry cycle detected.', {reportID: report.reportID, ancestry: Array.from(visitedReportIDs)});
        return undefined;
    }
    visitedReportIDs.add(report.reportID);

    const parentReport = getReportOrDraftReport(report?.parentReportID, reports);

    // Runs recursion to iterate a parent report
    return getRootParentReport({report: !isEmptyObject(parentReport) ? parentReport : undefined, visitedReportIDs, reports});
}

/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID: string | undefined): OnyxEntry<Policy> {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/**
 * Get the policy type from a given report
 * @param policies must have Onyxkey prefix (i.e 'policy_') for keys
 */
function getPolicyType(report: OnyxInputOrEntry<Report>, policies: OnyxCollection<Policy>): string {
    return policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`]?.type ?? '';
}

/**
 * Get the policy name from a given report
 */
function getPolicyName({report, returnEmptyIfNotFound = false, policy, policies, reports}: GetPolicyNameParams): string {
    const noPolicyFound = returnEmptyIfNotFound ? '' : unavailableTranslation;
    const parentReport = report ? getRootParentReport({report, reports}) : undefined;

    if (isEmptyObject(report) || (isEmptyObject(policies) && isEmptyObject(allPolicies) && !report?.policyName && !parentReport?.policyName)) {
        return noPolicyFound;
    }
    const finalPolicy = (() => {
        if (isEmptyObject(policy)) {
            if (policies) {
                return policies.find((p) => p.id === report.policyID);
            }
            return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
        }
        return policy ?? policies?.find((p) => p.id === report.policyID);
    })();

    // Rooms send back the policy name with the reportSummary,
    // since they can also be accessed by people who aren't in the workspace
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const policyName = finalPolicy?.name || report?.policyName || report?.oldPolicyName || parentReport?.policyName || parentReport?.oldPolicyName || noPolicyFound;

    return policyName;
}

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 */
function getReportParticipantsTitle(accountIDs: number[]): string {
    // Somehow it's possible for the logins coming from report.participantAccountIDs to contain undefined values so we use .filter(Boolean) to remove them.
    return accountIDs.filter(Boolean).join(', ');
}

/**
 * Checks if a report is a chat report.
 */
function isChatReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.CHAT;
}

function isInvoiceReport(reportOrID: OnyxInputOrEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, allReports) ?? null) : reportOrID;
    return report?.type === CONST.REPORT.TYPE.INVOICE;
}

function isFinancialReportsForBusinesses(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.EXPENSE || report?.type === CONST.REPORT.TYPE.INVOICE;
}

function isNewDotInvoice(invoiceRoomID: string | undefined): boolean {
    if (!invoiceRoomID) {
        return false;
    }

    return isInvoiceRoom(getReport(invoiceRoomID, allReports));
}

/**
 * Checks if the report with supplied ID has been approved or not
 */
function isReportIDApproved(reportID: string | undefined) {
    if (!reportID) {
        return;
    }
    const report = getReport(reportID, allReports);
    if (!report) {
        return;
    }
    return isReportApproved({report});
}

/**
 * Checks if a report is an Expense report.
 */
function isExpenseReport(reportOrID: OnyxInputOrEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, allReports) ?? null) : reportOrID;
    return report?.type === CONST.REPORT.TYPE.EXPENSE;
}

/**
 * Checks if a report is an IOU report using report or reportID
 */
function isIOUReport(reportOrID: OnyxInputOrEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, allReports) ?? null) : reportOrID;
    return report?.type === CONST.REPORT.TYPE.IOU;
}

/**
 * Checks if a report is an IOU report using report
 */
function isIOUReportUsingReport(report: OnyxEntry<Report>): report is Report {
    return report?.type === CONST.REPORT.TYPE.IOU;
}

/**
 * Checks if a report is a task report.
 */
function isTaskReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.TASK;
}

/**
 * Checks if a task has been cancelled
 * When a task is deleted, the parentReportAction is updated to have a isDeletedParentAction deleted flag
 * This is because when you delete a task, we still allow you to chat on the report itself
 * There's another situation where you don't have access to the parentReportAction (because it was created in a chat you don't have access to)
 * In this case, we have added the key to the report itself
 */
function isCanceledTaskReport(report: OnyxInputOrEntry<Report>, parentReportAction: OnyxInputOrEntry<ReportAction> = null): boolean {
    if (!isEmptyObject(parentReportAction) && (getReportActionMessageReportUtils(parentReportAction)?.isDeletedParentAction ?? false)) {
        return true;
    }

    if (!isEmptyObject(report) && report?.isDeletedParentAction) {
        return true;
    }

    return false;
}

/**
 * Checks if a report is an open task report.
 *
 * @param parentReportAction - The parent report action of the report (Used to check if the task has been canceled)
 */
function isOpenTaskReport(report: OnyxInputOrEntry<Report>, parentReportAction: OnyxInputOrEntry<ReportAction> = null): boolean {
    return (
        isTaskReport(report) && !isCanceledTaskReport(report, parentReportAction) && report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN
    );
}

/**
 * Checks if a report is a completed task report.
 */
function isCompletedTaskReport(report: OnyxEntry<Report>): boolean {
    return isTaskReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;
}

/**
 * Checks if the current user is the manager of the supplied report
 */
function isReportManager(report: OnyxEntry<Report>): boolean {
    return !!(report && report.managerID === currentUserAccountID);
}

/**
 * Checks if the supplied report has been approved
 */
function isReportApproved({report, parentReportAction = undefined}: {report: OnyxInputOrEntry<Report>; parentReportAction?: OnyxEntry<ReportAction> | undefined}): boolean {
    if (!report) {
        return parentReportAction?.childStateNum === CONST.REPORT.STATE_NUM.APPROVED && parentReportAction?.childStatusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    }
    return report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;
}

/**
 * Checks if the supplied report has been manually reimbursed
 */
function isReportManuallyReimbursed(report: OnyxEntry<Report>): boolean {
    return report?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
}

/**
 * Checks if the supplied report is an expense report in Open state and status.
 */
function isOpenExpenseReport(report: OnyxInputOrEntry<Report>): boolean {
    return isExpenseReport(report) && report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN;
}

/**
 * Checks if the supplied report has a member with the array passed in params.
 */
function hasParticipantInArray(report: OnyxEntry<Report>, memberAccountIDs: number[]) {
    if (!report?.participants) {
        return false;
    }

    const memberAccountIDsSet = new Set(memberAccountIDs);

    for (const accountID in report.participants) {
        if (memberAccountIDsSet.has(Number(accountID))) {
            return true;
        }
    }

    return false;
}

/**
 * Whether the Money Request report is settled
 */
function isSettled(reportOrID: OnyxInputOrEntry<Report> | string | undefined, reports?: Report[] | OnyxCollection<Report>): boolean {
    if (!reportOrID) {
        return false;
    }
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, reports ?? allReports) ?? null) : reportOrID;
    if (!report) {
        return false;
    }

    if (isEmptyObject(report)) {
        return false;
    }

    // In case the payment is scheduled and we are waiting for the payee to set up their wallet,
    // consider the report as paid as well.
    if (report.isWaitingOnBankAccount && report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return false;
    }

    return report?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;
}

/**
 * Whether the current user is the submitter of the report
 */
function isCurrentUserSubmitter(report: OnyxEntry<Report>): boolean {
    return !!report && report.ownerAccountID === currentUserAccountID;
}

/**
 * Whether the provided report is an Admin room
 */
function isAdminRoom(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
}

/**
 * Whether the provided report is an Admin-only posting room
 */
function isAdminsOnlyPostingRoom(report: OnyxEntry<Report>): boolean {
    return report?.writeCapability === CONST.REPORT.WRITE_CAPABILITIES.ADMINS;
}

/**
 * Whether the provided report is a Announce room
 */
function isAnnounceRoom(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE;
}

/**
 * Whether the provided report is a default room
 */
function isDefaultRoom(report: OnyxEntry<Report>): boolean {
    return CONST.DEFAULT_POLICY_ROOM_CHAT_TYPES.some((type) => type === getChatType(report));
}

/**
 * Whether the provided report is a Domain room
 */
function isDomainRoom(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL;
}

/**
 * Whether the provided report is a user created policy room
 */
function isUserCreatedPolicyRoom(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
}

/**
 * Whether the provided report is a Policy Expense chat.
 */
function isPolicyExpenseChat(option: OnyxInputOrEntry<Report> | OptionData | Participant): boolean {
    return getChatType(option) === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT || !!(option && typeof option === 'object' && 'isPolicyExpenseChat' in option && option.isPolicyExpenseChat);
}

function isInvoiceRoom(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.INVOICE;
}

function isInvoiceRoomWithID(reportID?: string): boolean {
    if (!reportID) {
        return false;
    }
    const report = getReport(reportID, allReports);
    return isInvoiceRoom(report);
}

/**
 * Checks if a report is a completed task report.
 */
function isTripRoom(report: OnyxEntry<Report>): boolean {
    return isChatReport(report) && getChatType(report) === CONST.REPORT.CHAT_TYPE.TRIP_ROOM;
}

function isIndividualInvoiceRoom(report: OnyxEntry<Report>): boolean {
    return isInvoiceRoom(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;
}

function isBusinessInvoiceRoom(reportOrID: OnyxEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, allReports) ?? null) : reportOrID;
    return !isEmptyObject(report) && isInvoiceRoom(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS;
}

function isCurrentUserInvoiceReceiver(report: OnyxEntry<Report>): boolean {
    if (report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return currentUserAccountID === report.invoiceReceiver.accountID;
    }

    if (report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = getPolicy(report.invoiceReceiver.policyID);
        return isPolicyAdminPolicyUtils(policy);
    }

    return false;
}

/**
 * Checks if an invoice report's receiver matches a given participant.
 * Used to validate that an invoice chat report corresponds to the correct recipient
 * when the recipient may have been changed (e.g., while offline).
 */
function doesReportReceiverMatchParticipant(report: OnyxEntry<Report>, receiverParticipantAccountID: number | undefined): boolean {
    return !!(report?.invoiceReceiver && receiverParticipantAccountID && 'accountID' in report.invoiceReceiver && report.invoiceReceiver.accountID === receiverParticipantAccountID);
}

/**
 * Whether the provided report belongs to a Control policy and is an expense chat
 */
function isControlPolicyExpenseChat(report: OnyxEntry<Report>): boolean {
    return isPolicyExpenseChat(report) && getPolicyType(report, allPolicies) === CONST.POLICY.TYPE.CORPORATE;
}

/**
 * Whether the provided policyType is a Free, Collect or Control policy type
 */
function isGroupPolicy(policyType: string): boolean {
    return policyType === CONST.POLICY.TYPE.CORPORATE || policyType === CONST.POLICY.TYPE.TEAM;
}

/**
 * Whether the provided report belongs to a Free, Collect or Control policy
 */
function isReportInGroupPolicy(report: OnyxInputOrEntry<Report>, policy?: OnyxInputOrEntry<Policy>): boolean {
    const policyType = policy?.type ?? getPolicyType(report, allPolicies);
    return isGroupPolicy(policyType);
}

/**
 * Whether the provided report belongs to a Control or Collect policy
 */
function isPaidGroupPolicy(report: OnyxEntry<Report>): boolean {
    const policyType = getPolicyType(report, allPolicies);
    return policyType === CONST.POLICY.TYPE.CORPORATE || policyType === CONST.POLICY.TYPE.TEAM;
}

/**
 * Whether the provided report belongs to a Control or Collect policy and is an expense chat
 */
function isPaidGroupPolicyExpenseChat(report: OnyxEntry<Report>): boolean {
    return isPolicyExpenseChat(report) && isPaidGroupPolicy(report);
}

/**
 * Whether the provided report belongs to a Control policy and is an expense report
 */
function isControlPolicyExpenseReport(report: OnyxEntry<Report>): boolean {
    return isExpenseReport(report) && getPolicyType(report, allPolicies) === CONST.POLICY.TYPE.CORPORATE;
}

/**
 * Whether the provided report belongs to a Control or Collect policy and is an expense report
 */
function isPaidGroupPolicyExpenseReport(report: OnyxEntry<Report>): boolean {
    return isExpenseReport(report) && isPaidGroupPolicy(report);
}

/**
 * Checks if the supplied report is an invoice report in Open state and status.
 */
function isOpenInvoiceReport(report: OnyxEntry<Report>): boolean {
    return isInvoiceReport(report) && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN;
}

/**
 * Whether the provided report is a chat room
 */
function isChatRoom(report: OnyxEntry<Report>): boolean {
    return isUserCreatedPolicyRoom(report) || isDefaultRoom(report) || isInvoiceRoom(report) || isTripRoom(report);
}

/**
 * Whether the provided report is a public room
 */
function isPublicRoom(report: OnyxEntry<Report>): boolean {
    return report?.visibility === CONST.REPORT.VISIBILITY.PUBLIC || report?.visibility === CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}

/**
 * Whether the provided report is a public announce room
 */
function isPublicAnnounceRoom(report: OnyxEntry<Report>): boolean {
    return report?.visibility === CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}

/**
 * If the report is a policy expense, the route should be for adding bank account for that policy
 * else since the report is a personal IOU, the route should be for personal bank account.
 */
function getBankAccountRoute(report: OnyxEntry<Report>): Route {
    if (isPolicyExpenseChat(report)) {
        return ROUTES.BANK_ACCOUNT_WITH_STEP_TO_OPEN.getRoute(report?.policyID, undefined, Navigation.getActiveRoute());
    }

    if (isInvoiceRoom(report) && report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS) {
        const invoiceReceiverPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.invoiceReceiver?.policyID}`];
        if (invoiceReceiverPolicy?.areInvoicesEnabled) {
            return ROUTES.WORKSPACE_INVOICES.getRoute(report?.invoiceReceiver?.policyID);
        }
    }

    return ROUTES.SETTINGS_ADD_BANK_ACCOUNT.route;
}

/**
 * Check if personal detail of accountID is empty or optimistic data
 */
function isOptimisticPersonalDetail(accountID: number): boolean {
    return isEmptyObject(allPersonalDetails?.[accountID]) || !!allPersonalDetails?.[accountID]?.isOptimisticPersonalDetail;
}

/**
 * Checks if a report is a task report from a policy expense chat.
 */
function isWorkspaceTaskReport(report: OnyxEntry<Report>): boolean {
    if (!isTaskReport(report)) {
        return false;
    }
    const parentReport = report?.parentReportID ? getReport(report?.parentReportID, allReports) : undefined;
    return isPolicyExpenseChat(parentReport);
}

/**
 * Returns true if report has a parent
 */
function isThread(report: OnyxInputOrEntry<Report>): report is Thread {
    return !!(report?.parentReportID && report?.parentReportActionID);
}

/**
 * Returns true if report is of type chat and has a parent and is therefore a Thread.
 */
function isChatThread(report: OnyxInputOrEntry<Report>): report is Thread {
    return isThread(report) && report?.type === CONST.REPORT.TYPE.CHAT;
}

function isDM(report: OnyxEntry<Report>): boolean {
    return isChatReport(report) && !getChatType(report) && !isThread(report);
}

function isSelfDM(report: OnyxInputOrEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.SELF_DM;
}

function isGroupChat(report: OnyxEntry<Report> | Partial<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.GROUP;
}

/**
 * Only returns true if this is the Expensify DM report.
 *
 * Note that this chat is no longer used for new users. We still need this function for users who have this chat.
 */
function isSystemChat(report: OnyxEntry<Report>): boolean {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.SYSTEM;
}

function getDefaultNotificationPreferenceForReport(report: OnyxEntry<Report>): ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE> {
    if (isAnnounceRoom(report)) {
        return CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isPublicRoom(report)) {
        return CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY;
    }
    if (!getChatType(report) || isGroupChat(report)) {
        return CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isAdminRoom(report) || isPolicyExpenseChat(report) || isInvoiceRoom(report)) {
        return CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }
    if (isSelfDM(report)) {
        return CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE;
    }
    return CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY;
}

/**
 * Get the notification preference given a report. This should ALWAYS default to 'hidden'. Do not change this!
 */
function getReportNotificationPreference(report: OnyxEntry<Report>): ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE> {
    const participant = currentUserAccountID ? report?.participants?.[currentUserAccountID] : undefined;
    return participant?.notificationPreference ?? CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}

/**
 * Only returns true if this is our main 1:1 DM report with Concierge.
 */
function isConciergeChatReport(report: OnyxInputOrEntry<Report>, conciergeReportID?: string): boolean {
    return !!report && report?.reportID === (conciergeReportID ?? conciergeReportIDOnyxConnect);
}

function findSelfDMReportID(): string | undefined {
    if (cachedSelfDMReportID) {
        return cachedSelfDMReportID;
    }
    if (!allReports) {
        return;
    }

    const selfDMReport = Object.values(allReports).find((report) => isSelfDM(report) && !isThread(report));
    return selfDMReport?.reportID;
}

/**
 * Checks if the supplied report is from a policy or is an invoice report from a policy
 */
function isPolicyRelatedReport(report: OnyxEntry<Report>, policyID?: string) {
    return report?.policyID === policyID || !!(report?.invoiceReceiver && 'policyID' in report.invoiceReceiver && report.invoiceReceiver.policyID === policyID);
}

/**
 * Checks if the supplied report belongs to workspace based on the provided params. If the report's policyID is _FAKE_ or has no value, it means this report is a DM.
 * In this case report and workspace members must be compared to determine whether the report belongs to the workspace.
 */
function doesReportBelongToWorkspace(report: OnyxEntry<Report>, policyMemberAccountIDs: number[], policyID: string | undefined, conciergeReportID: string) {
    return (
        isConciergeChatReport(report, conciergeReportID) ||
        (report?.policyID === CONST.POLICY.ID_FAKE || !report?.policyID ? hasParticipantInArray(report, policyMemberAccountIDs) : isPolicyRelatedReport(report, policyID))
    );
}

/**
 * Checks if a report is a self-DM or belongs to a self-DM context
 * (including moved reports and threads within self-DMs)
 */
function isSelfDMOrSelfDMThread(report: OnyxEntry<Report>): boolean {
    if (!report || !currentUserAccountID) {
        return false;
    }

    // Standard self-DM check
    if (isSelfDM(report)) {
        return true;
    }

    // Check if it's a chat with only the current user as participant
    // BUT only if it's not a thread report (threads should be checked against parent)
    if (report.type === CONST.REPORT.TYPE.CHAT && report.participants && !report.parentReportID) {
        const participantIds = Object.keys(report.participants).map(Number);
        const otherParticipants = participantIds.filter((id) => id !== currentUserAccountID);

        // If only current user is participant, it's a self-DM
        if (otherParticipants.length === 0 && participantIds.includes(currentUserAccountID)) {
            return true;
        }
    }

    // For thread reports, check the parent
    if (report.parentReportID) {
        const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
        return isSelfDMOrSelfDMThread(parentReport);
    }

    return false;
}

/**
 * Returns true if the report is an expense report, a group policy, a self-DM, or the iouType is create, and the iouType is not split or invoice.
 */
function shouldEnableNegative(report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>, iouType?: string, participants?: Participant[]) {
    const isSelfDMReport = isSelfDMOrSelfDMThread(report);

    const isUserInRecipients = participants?.some((participant) => !participant.isSender && !participant.isPolicyExpenseChat && participant.accountID);
    const isFirstTimeCreatingReport = !report && !policy && iouType === CONST.IOU.TYPE.SUBMIT && !isUserInRecipients;

    const isExpenseReportType = isExpenseReport(report);
    const isGroupPolicyType = isGroupPolicy(policy?.type ?? '');
    const isCreatingNewIOU = iouType === CONST.IOU.TYPE.CREATE;
    const supportsNegativeAmounts = isExpenseReportType || isGroupPolicyType || isSelfDMReport || isCreatingNewIOU || isFirstTimeCreatingReport;

    const isExcludedType = iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.INVOICE;

    return supportsNegativeAmounts && !isExcludedType;
}

/**
 * Given an array of reports, return them filtered by a policyID and policyMemberAccountIDs.
 */
function filterReportsByPolicyIDAndMemberAccountIDs(reports: Array<OnyxEntry<Report>>, policyMemberAccountIDs: number[] = [], policyID?: string) {
    return reports.filter((report) => !!report && doesReportBelongToWorkspace(report, policyMemberAccountIDs, policyID, conciergeReportIDOnyxConnect ?? ''));
}

/**
 * Returns true if report is still being processed
 */
function isProcessingReport(report: OnyxEntry<Report>): boolean {
    return report?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function isOpenReport(report: OnyxEntry<Report>): boolean {
    return report?.stateNum === CONST.REPORT.STATE_NUM.OPEN && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN;
}

/**
 * Determines if a report requires manual submission based on policy settings and report state
 */
function requiresManualSubmission(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>): boolean {
    const isManualSubmitEnabled = getCorrectedAutoReportingFrequency(policy) === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;

    // The report needs manual submission if manual submit is enabled in the policy or the report is open in a Submit & Close policy with no approvers
    return isManualSubmitEnabled || (isOpenReport(report) && isInstantSubmitEnabled(policy) && isSubmitAndClose(policy));
}

function isAwaitingFirstLevelApproval(report: OnyxEntry<Report>): boolean {
    if (!report) {
        return false;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const submitsToAccountID = getSubmitToAccountID(getPolicy(report.policyID), report);

    return isProcessingReport(report) && submitsToAccountID === report.managerID;
}

/**
 * Updates optimistic transaction violations to OnyxData for the given policy and categories onyx update.
 *
 * @param onyxData - The OnyxData object to push updates to
 * @param policyData - The current policy Data
 * @param policyUpdate - Changed policy properties, if none pass empty object
 * @param categoriesUpdate - Changed categories properties, if none pass empty object
 * @param tagListsUpdate - Changed tag properties, if none pass empty object
 */
function pushTransactionViolationsOnyxData(
    onyxData: OnyxData<
        typeof ONYXKEYS.COLLECTION.POLICY_CATEGORIES | typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.COLLECTION.POLICY_TAGS | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    >,
    policyData: PolicyData,
    policyUpdate: Partial<Policy> = {},
    categoriesUpdate: Record<string, Partial<PolicyCategory>> = {},
    tagListsUpdate: Record<string, Partial<PolicyTagList>> = {},
) {
    const nonInvoiceReportTransactionsAndViolations = policyData.reports.reduce<ReportTransactionsAndViolations[]>((acc, report) => {
        // Skipping invoice reports since they should not have any category or tag violations
        if (isInvoiceReport(report)) {
            return acc;
        }
        const reportTransactionsAndViolations = policyData.transactionsAndViolations[report.reportID];
        if (!isEmptyObject(reportTransactionsAndViolations) && !isEmptyObject(reportTransactionsAndViolations.transactions)) {
            acc.push(reportTransactionsAndViolations);
        }
        return acc;
    }, []);

    if (nonInvoiceReportTransactionsAndViolations.length === 0) {
        return;
    }

    const updatedTagListsNames = Object.keys(tagListsUpdate);
    const updatedCategoriesNames = Object.keys(categoriesUpdate);

    // If there are no updates to policy, categories or tags, return early
    const isPolicyUpdateEmpty = isEmptyObject(policyUpdate);
    const isTagListsUpdateEmpty = updatedTagListsNames.length === 0;
    const isCategoriesUpdateEmpty = updatedCategoriesNames.length === 0;
    if (isPolicyUpdateEmpty && isTagListsUpdateEmpty && isCategoriesUpdateEmpty) {
        return;
    }

    // Merge the existing policy with the optimistic updates
    const optimisticPolicy = isPolicyUpdateEmpty ? policyData.policy : {...policyData.policy, ...policyUpdate};

    // Merge the existing categories with the optimistic updates
    const optimisticCategories = isCategoriesUpdateEmpty
        ? policyData.categories
        : {
              ...Object.fromEntries(Object.entries(policyData.categories).filter(([categoryName]) => !(categoryName in categoriesUpdate) || !!categoriesUpdate[categoryName])),
              ...Object.entries(categoriesUpdate).reduce<PolicyCategories>((acc, [categoryName, categoryUpdate]) => {
                  if (!categoryUpdate) {
                      return acc;
                  }
                  acc[categoryName] = {
                      ...(policyData.categories?.[categoryName] ?? {}),
                      ...categoryUpdate,
                  };
                  return acc;
              }, {}),
          };

    // Merge the existing tag lists with the optimistic updates
    const optimisticTagLists = isTagListsUpdateEmpty
        ? policyData.tags
        : {
              ...Object.fromEntries(Object.entries(policyData.tags ?? {}).filter(([tagListName]) => !(tagListName in tagListsUpdate) || !!tagListsUpdate[tagListName])),
              ...Object.entries(tagListsUpdate).reduce<PolicyTagLists>((acc, [tagListName, tagListUpdate]) => {
                  if (!tagListUpdate) {
                      return acc;
                  }

                  const tagList = policyData.tags?.[tagListName];
                  const tags = tagList?.tags ?? {};
                  const tagsUpdate = tagListUpdate?.tags ?? {};

                  acc[tagListName] = {
                      ...tagList,
                      ...tagListUpdate,
                      tags: {
                          ...((): PolicyTags => {
                              const optimisticTags: PolicyTags = Object.fromEntries(Object.entries(tags).filter(([tagName]) => !(tagName in tagsUpdate) || !!tagsUpdate[tagName]));
                              for (const [tagName, tagUpdate] of Object.entries(tagsUpdate)) {
                                  if (!tagUpdate) {
                                      continue;
                                  }
                                  optimisticTags[tagName] = {
                                      ...(tags[tagName] ?? {}),
                                      ...tagUpdate,
                                  };
                              }
                              return optimisticTags;
                          })(),
                      },
                  };
                  return acc;
              }, {}),
          };

    const hasDependentTags = hasDependentTagsPolicyUtils(optimisticPolicy, optimisticTagLists);

    // Iterate through all policy reports to find transactions that need optimistic violations
    for (const {transactions, violations} of nonInvoiceReportTransactionsAndViolations) {
        for (const transaction of Object.values(transactions)) {
            const existingViolations = violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
            const optimisticViolations = ViolationsUtils.getViolationsOnyxData(
                transaction,
                existingViolations ?? [],
                optimisticPolicy,
                optimisticTagLists,
                optimisticCategories,
                hasDependentTags,
                false,
            );

            if (!isEmptyObject(optimisticViolations)) {
                onyxData.optimisticData?.push(optimisticViolations);
                onyxData.failureData?.push({
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                    value: existingViolations ?? null,
                });
            }
        }
    }
}

/**
 * Check if the report is a single chat report that isn't a thread
 * and personal detail of participant is optimistic data
 */
function shouldDisableDetailPage(report: OnyxEntry<Report>): boolean {
    if (isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report)) {
        return false;
    }
    if (isOneOnOneChat(report)) {
        const participantAccountIDs = Object.keys(report?.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID);
        return isOptimisticPersonalDetail(participantAccountIDs.at(0) ?? -1);
    }
    return false;
}

/**
 * Returns true if this report has only one participant and it's an Expensify account.
 */
function isExpensifyOnlyParticipantInReport(report: OnyxEntry<Report>): boolean {
    const otherParticipants = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserAccountID);
    return otherParticipants.length === 1 && otherParticipants.some((accountID) => CONST.EXPENSIFY_ACCOUNT_IDS.includes(accountID));
}

/**
 * Returns whether a given report can have tasks created in it.
 * We only prevent the task option if it's a DM/group-DM and the other users are all special Expensify accounts
 *
 */
function canCreateTaskInReport(report: OnyxEntry<Report>): boolean {
    const otherParticipants = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserAccountID);
    const areExpensifyAccountsOnlyOtherParticipants = otherParticipants.length >= 1 && otherParticipants.every((accountID) => CONST.EXPENSIFY_ACCOUNT_IDS.includes(accountID));
    if (areExpensifyAccountsOnlyOtherParticipants && isDM(report)) {
        return false;
    }

    return true;
}

/**
 * For all intents and purposes a report that has no notificationPreference at all should be considered "hidden".
 * We will remove the 'hidden' field entirely once the backend changes for https://github.com/Expensify/Expensify/issues/450891 are done.
 */
function isHiddenForCurrentUser(notificationPreference: string | null | undefined): boolean;
function isHiddenForCurrentUser(report: OnyxEntry<Report>): boolean;
function isHiddenForCurrentUser(reportOrPreference: OnyxEntry<Report> | string | null | undefined): boolean {
    if (typeof reportOrPreference === 'object' && reportOrPreference !== null) {
        const notificationPreference = getReportNotificationPreference(reportOrPreference);
        return isHiddenForCurrentUser(notificationPreference);
    }
    if (reportOrPreference === undefined || reportOrPreference === null || reportOrPreference === '') {
        return true;
    }
    return reportOrPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}

/**
 * Returns true if there are any guides accounts (team.expensify.com) in a list of accountIDs
 * by cross-referencing the accountIDs with personalDetails since guides that are participants
 * of the user's chats should have their personal details in Onyx.
 */
function hasExpensifyGuidesEmails(accountIDs: number[]): boolean {
    return accountIDs.some((accountID) => Str.extractEmailDomain(allPersonalDetails?.[accountID]?.login ?? '') === CONST.EMAIL.GUIDES_DOMAIN);
}

function getMostRecentlyVisitedReport(reports: Array<OnyxEntry<Report>>, reportMetadata: OnyxCollection<ReportMetadata>): OnyxEntry<Report> {
    const filteredReports = reports.filter((report) => {
        const shouldKeep = !isChatThread(report) || !isHiddenForCurrentUser(report);
        return shouldKeep && !!report?.reportID && !!(reportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${report.reportID}`]?.lastVisitTime ?? report?.lastReadTime);
    });
    return lodashMaxBy(filteredReports, (a) => [reportMetadata?.[`${ONYXKEYS.COLLECTION.REPORT_METADATA}${a?.reportID}`]?.lastVisitTime ?? '', a?.lastReadTime ?? '']);
}

/**
 * This function is used to find the last accessed report and we don't need to subscribe the data in the UI.
 * So please use `Onyx.connectWithoutView()` to get the necessary data when we remove the `Onyx.connect()`
 */
function findLastAccessedReport(ignoreDomainRooms: boolean, openOnAdminRoom = false, policyID?: string, excludeReportID?: string): OnyxEntry<Report> {
    // If it's the user's first time using New Expensify, then they could either have:
    //   - just a Concierge report, if so we'll return that
    //   - their Concierge report, and a separate report that must have deeplinked them to the app before they created their account.
    // If it's the latter, we'll use the deeplinked report over the Concierge report,
    // since the Concierge report would be incorrectly selected over the deep-linked report in the logic below.

    const policyMemberAccountIDs = getPolicyEmployeeListByIdWithoutCurrentUser(allPolicies, policyID, currentUserAccountID);

    let reportsValues = Object.values(allReports ?? {});

    if (!!policyID || policyMemberAccountIDs.length > 0) {
        reportsValues = filterReportsByPolicyIDAndMemberAccountIDs(reportsValues, policyMemberAccountIDs, policyID);
    }

    let adminReport: OnyxEntry<Report>;
    if (openOnAdminRoom) {
        adminReport = reportsValues.find((report) => {
            const chatType = getChatType(report);
            return chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
        });
    }
    if (adminReport) {
        return adminReport;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldFilter = excludeReportID || ignoreDomainRooms;
    if (shouldFilter) {
        reportsValues = reportsValues.filter((report) => {
            if (excludeReportID && report?.reportID === excludeReportID) {
                return false;
            }

            // We allow public announce rooms, admins, and announce rooms through since we bypass the default rooms beta for them.
            // Check where findLastAccessedReport is called in MainDrawerNavigator.js for more context.
            // Domain rooms are now the only type of default room that are on the defaultRooms beta.
            if (ignoreDomainRooms && isDomainRoom(report) && !hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number))) {
                return false;
            }

            return true;
        });
    }

    // Filter out the system chat (Expensify chat) because the composer is disabled in it,
    // and it prompts the user to use the Concierge chat instead.
    reportsValues =
        reportsValues.filter((report) => {
            const reportNameValuePairs = allReportNameValuePair?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report?.reportID}`];
            return !isSystemChat(report) && !isArchivedReport(reportNameValuePairs);
        }) ?? [];

    // At least two reports remain: self DM and Concierge chat.
    // Return the most recently visited report. Get the last read report from the report metadata.
    // If allReportMetadata is empty we'll return most recent report owned by user
    if (isEmptyObject(allReportMetadata)) {
        const ownedReports = reportsValues.filter((report) => report?.ownerAccountID === currentUserAccountID);
        if (ownedReports.length > 0) {
            return lodashMaxBy(ownedReports, (a) => a?.lastReadTime ?? '');
        }
        return lodashMaxBy(reportsValues, (a) => a?.lastReadTime ?? '');
    }
    return getMostRecentlyVisitedReport(reportsValues, allReportMetadata);
}

/**
 * Whether the provided report has expenses
 */
function hasExpenses(reportID?: string, transactions?: Array<OnyxEntry<Transaction>>): boolean {
    if (transactions) {
        return !!transactions?.find((transaction) => transaction?.reportID === reportID);
    }
    return !!Object.values(allTransactions ?? {}).find((transaction) => transaction?.reportID === reportID);
}

/**
 * Whether the provided report is a closed expense report with no expenses
 */
function isClosedExpenseReportWithNoExpenses(report: OnyxEntry<Report>, transactions?: Array<OnyxEntry<Transaction>>): boolean {
    if (!report?.statusNum || report.statusNum !== CONST.REPORT.STATUS_NUM.CLOSED || !isExpenseReport(report)) {
        return false;
    }

    // If the report has a total amount, it definitely has expenses
    if (report.total && report.total !== 0) {
        return false;
    }

    if (report.transactionCount) {
        return false;
    }

    // If the report has non-reimbursable total, it has expenses even if total is 0
    // (reimbursable and non-reimbursable totals can cancel each other out)
    if (report.nonReimbursableTotal && report.nonReimbursableTotal !== 0) {
        return false;
    }

    return !hasExpenses(report.reportID, transactions);
}

/**
 * Whether the provided report is an archived room
 */
function isArchivedNonExpenseReport(report: OnyxInputOrEntry<Report>, isReportArchived = false): boolean {
    return isReportArchived && !(isExpenseReport(report) || isExpenseRequest(report));
}

/**
 * Whether the provided report is an archived report
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isArchivedReport(reportNameValuePairs?: OnyxInputOrEntry<ReportNameValuePairs>): boolean {
    return !!reportNameValuePairs?.private_isArchived;
}

/**
 * Whether the report was created during harvesting
 */
function isHarvestCreatedExpenseReport(origin?: string, originalID?: string): boolean {
    return !!originalID && origin === 'harvest';
}

/**
 * Returns the original reportID for a harvest-created report
 */
function getHarvestOriginalReportID(origin?: string, originalID?: string): string | undefined {
    if (!originalID || !isHarvestCreatedExpenseReport(origin, originalID)) {
        return undefined;
    }

    return originalID;
}

/**
 * Whether the report with the provided reportID is an archived non-expense report
 */
function isArchivedNonExpenseReportWithID(report?: OnyxInputOrEntry<Report>, isReportArchived = false) {
    if (!report) {
        return false;
    }
    return !(isExpenseReport(report) || isExpenseRequest(report)) && isReportArchived;
}

/**
 * Whether the provided report is a closed report
 */
function isClosedReport(report: OnyxInputOrEntry<Report>): boolean {
    return report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED;
}

/**
 * Whether the provided report is the admin's room
 */
function isJoinRequestInAdminRoom(report: OnyxEntry<Report>): boolean {
    if (!report) {
        return false;
    }
    // If this policy isn't owned by Expensify,
    // Account manager/guide should not have the workspace join request pinned to their LHN,
    // since they are not a part of the company, and should not action it on their behalf.
    if (report.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = getPolicy(report.policyID);
        if (!isExpensifyTeam(policy?.owner) && isExpensifyTeam(currentUserPersonalDetails?.login)) {
            return false;
        }
    }
    return isActionableJoinRequestPending(report.reportID);
}

/**
 * Checks if the user has auditor permission in the provided report
 */
function isAuditor(report: OnyxEntry<Report>): boolean {
    if (report?.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = getPolicy(report.policyID);
        return isPolicyAuditor(policy);
    }

    if (Array.isArray(report?.permissions) && report?.permissions.length > 0) {
        return report?.permissions?.includes(CONST.REPORT.PERMISSIONS.AUDITOR);
    }

    return false;
}

/**
 * Checks if the user can write in the provided report
 */
function canWriteInReport(report: OnyxEntry<Report>): boolean {
    if (Array.isArray(report?.permissions) && report?.permissions.length > 0 && !report?.permissions?.includes(CONST.REPORT.PERMISSIONS.AUDITOR)) {
        return report?.permissions?.includes(CONST.REPORT.PERMISSIONS.WRITE);
    }

    return true;
}

/**
 * Checks if the current user is allowed to comment on the given report.
 */
function isAllowedToComment(report: OnyxEntry<Report>): boolean {
    if (!canWriteInReport(report)) {
        return false;
    }

    // Default to allowing all users to post
    const capability = report?.writeCapability ?? CONST.REPORT.WRITE_CAPABILITIES.ALL;

    if (capability === CONST.REPORT.WRITE_CAPABILITIES.ALL) {
        return true;
    }

    // If unauthenticated user opens public chat room using deeplink, they do not have policies available and they cannot comment
    if (!allPolicies) {
        return false;
    }

    // If we've made it here, commenting on this report is restricted.
    // If the user is an admin, allow them to post.
    const policy = allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    return policy?.role === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Checks if the current user is the admin of the policy given the policy expense chat.
 */
function isPolicyExpenseChatAdmin(report: OnyxEntry<Report>, policies: OnyxCollection<Policy>): boolean {
    if (!isPolicyExpenseChat(report)) {
        return false;
    }

    const policyRole = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`]?.role;

    return policyRole === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Checks if the current user is the admin of the policy.
 */
function isPolicyAdmin(policy: OnyxEntry<Policy>): boolean {
    if (!policy || !policy.id) {
        return false;
    }

    const policyRole = policy?.role;

    return policyRole === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Checks whether all the transactions linked to the IOU report are of the Distance Request type with pending routes
 */
function hasOnlyTransactionsWithPendingRoutes(iouReportID: string | undefined): boolean {
    const transactions = getReportTransactions(iouReportID);

    // Early return false in case not having any transaction
    if (!transactions || transactions.length === 0) {
        return false;
    }

    return transactions.every((transaction) => isFetchingWaypointsFromServer(transaction));
}

/**
 * If the report is a thread and has a chat type set, it is a expense chat.
 */
function isWorkspaceThread(report: OnyxEntry<Report>): boolean {
    const chatType = getChatType(report);
    return isThread(report) && isChatReport(report) && CONST.WORKSPACE_ROOM_TYPES.some((type) => chatType === type);
}

/**
 * Checks if a report is a child report.
 */
function isChildReport(report: OnyxEntry<Report>): boolean {
    return isThread(report) || isTaskReport(report);
}

/**
 * An Expense Request is a thread where the parent report is an Expense Report and
 * the parentReportAction is a transaction.
 */
function isExpenseRequest(report: OnyxInputOrEntry<Report>): report is Thread {
    if (isThread(report)) {
        const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
        const parentReport = getReport(report?.parentReportID, allReports);
        return isExpenseReport(parentReport) && !isEmptyObject(parentReportAction) && isTransactionThread(parentReportAction);
    }
    return false;
}

/**
 * An IOU Request is a thread where the parent report is an IOU Report and
 * the parentReportAction is a transaction.
 */
function isIOURequest(report: OnyxInputOrEntry<Report>): boolean {
    if (isThread(report)) {
        const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
        const parentReport = getReport(report?.parentReportID, allReports);
        return isIOUReport(parentReport) && !isEmptyObject(parentReportAction) && isTransactionThread(parentReportAction);
    }
    return false;
}

/**
 * @warning Use isTrackExpenseReportNew function instead
 *
 */
function isTrackExpenseReport(report: OnyxInputOrEntry<Report>): boolean {
    if (isThread(report)) {
        const selfDMReportID = findSelfDMReportID();
        const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
        return !isEmptyObject(parentReportAction) && selfDMReportID === report.parentReportID && isTrackExpenseAction(parentReportAction);
    }
    return false;
}

/**
 * A Track Expense Report is a thread where the parent the parentReportAction is a transaction, and
 * parentReportAction has type of track.
 */
function isTrackExpenseReportNew(report: OnyxInputOrEntry<Report>, parentReport: OnyxInputOrEntry<Report>, parentReportAction: OnyxInputOrEntry<ReportAction>): boolean {
    if (isThread(report)) {
        return !isEmptyObject(parentReportAction) && isSelfDM(parentReport) && isTrackExpenseAction(parentReportAction);
    }
    return false;
}

/**
 * Checks if a report is an IOU or expense request.
 */
function isMoneyRequest(reportOrID: OnyxEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, allReports) ?? null) : reportOrID;
    return isIOURequest(report) || isExpenseRequest(report);
}

/**
 * Checks if a report is an IOU or expense report.
 */
function isMoneyRequestReport(reportOrID: OnyxInputOrEntry<Report> | string, reports?: Report[] | OnyxCollection<Report>): boolean {
    const report = typeof reportOrID === 'string' ? (getReport(reportOrID, reports ?? allReports) ?? null) : reportOrID;
    return isIOUReport(report) || isExpenseReport(report);
}

/**
 * Determines the Help Panel report type based on the given report.
 */
function getHelpPaneReportType(report: OnyxEntry<Report>, conciergeReportID: string): ValueOf<typeof CONST.REPORT.HELP_TYPE> | undefined {
    if (!report) {
        return undefined;
    }

    if (isConciergeChatReport(report, conciergeReportID)) {
        return CONST.REPORT.HELP_TYPE.CHAT_CONCIERGE;
    }

    if (report?.chatType) {
        return getChatType(report);
    }

    switch (report?.type) {
        case CONST.REPORT.TYPE.EXPENSE:
            return CONST.REPORT.HELP_TYPE.EXPENSE_REPORT;
        case CONST.REPORT.TYPE.CHAT:
            return CONST.REPORT.HELP_TYPE.CHAT;
        case CONST.REPORT.TYPE.IOU:
            return CONST.REPORT.HELP_TYPE.IOU;
        case CONST.REPORT.TYPE.INVOICE:
            return CONST.REPORT.HELP_TYPE.INVOICE;
        case CONST.REPORT.TYPE.TASK:
            return CONST.REPORT.HELP_TYPE.TASK;
        default:
            return undefined;
    }
}

/**
 * Checks if a report contains only Non-Reimbursable transactions
 */
function hasOnlyNonReimbursableTransactions(iouReportID: string | undefined): boolean {
    const transactions = getReportTransactions(iouReportID);
    if (!transactions || transactions.length === 0) {
        return false;
    }

    return transactions.every((transaction) => !getReimbursable(transaction));
}

/**
 * Checks if a report has only one transaction associated with it
 */
function isOneTransactionReport(report: OnyxEntry<Report>): boolean {
    return report?.transactionCount === 1;
}

/**
 * Checks if a report has only one transaction associated with it
 * @deprecated - Use isOneTransactionReport instead
 */
function isOneTransactionReportDeprecated(report: OnyxEntry<Report>): boolean {
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`] ?? ([] as ReportAction[]);
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    return !!getOneTransactionThreadReportID(report, chatReport, reportActions);
}

/*
 * Whether the report contains only one expense and the expense should be paid later
 */
function isPayAtEndExpenseReport(report: OnyxEntry<Report>, transactions: Transaction[] | undefined): boolean {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if ((!!transactions && transactions.length !== 1) || !isOneTransactionReportDeprecated(report)) {
        return false;
    }

    return isPayAtEndExpense(transactions?.[0] ?? getReportTransactions(report?.reportID).at(0));
}

/**
 * Checks if a report is a transaction thread associated with a report that has only one transaction
 */
function isOneTransactionThread(report: OnyxEntry<Report>, parentReport: OnyxEntry<Report>, threadParentReportAction: OnyxEntry<ReportAction>) {
    if (!report || !parentReport) {
        return false;
    }

    const parentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport?.reportID}`] ?? ([] as ReportAction[]);

    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReport?.chatReportID}`];
    const transactionThreadReportID = getOneTransactionThreadReportID(parentReport, chatReport, parentReportActions);
    return report?.reportID === transactionThreadReportID && !isSentMoneyReportAction(threadParentReportAction);
}

/**
 * Checks if given report is a transaction thread
 */
function isReportTransactionThread(report: OnyxEntry<Report>) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return isMoneyRequest(report) || isTrackExpenseReport(report);
}

/**
 * Get displayed report ID, it will be parentReportID if the report is one transaction thread
 */
function getDisplayedReportID(reportID: string): string {
    const report = getReport(reportID, allReports);
    const parentReportID = report?.parentReportID;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`];
    const parentReportAction = getReportAction(parentReportID, report?.parentReportActionID);
    return parentReportID && isOneTransactionThread(report, parentReport, parentReportAction) ? parentReportID : reportID;
}

/**
 * Should return true only for personal 1:1 report
 *
 */
function isOneOnOneChat(report: OnyxEntry<Report>): boolean {
    const participants = report?.participants ?? {};
    const participant = currentUserAccountID ? participants[currentUserAccountID] : undefined;
    const isCurrentUserParticipant = participant ? 1 : 0;
    const participantAmount = Object.keys(participants).length - isCurrentUserParticipant;
    if (participantAmount !== 1) {
        return false;
    }
    return (
        (report?.policyID === CONST.POLICY.ID_FAKE || !report?.policyID) &&
        !isChatRoom(report) &&
        !isExpenseRequest(report) &&
        !isMoneyRequestReport(report) &&
        !isPolicyExpenseChat(report) &&
        !isTaskReport(report) &&
        isDM(report) &&
        !isIOUReport(report)
    );
}

/**
 * Checks if the current user is a payer of the expense
 */

function isPayer(
    currentAccountID: number | undefined,
    currentUserEmailParam: string | undefined,
    iouReport: OnyxEntry<Report>,
    bankAccountList: OnyxEntry<BankAccountList>,
    reportPolicy?: OnyxInputOrEntry<Policy>,
    onlyShowPayElsewhere = false,
) {
    const policy = reportPolicy ?? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport?.policyID}`] ?? null;
    const policyType = policy?.type;
    const isAdmin = policyType !== CONST.POLICY.TYPE.PERSONAL && policy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = iouReport?.managerID === currentAccountID;
    const reimbursementChoice = policy?.reimbursementChoice;

    if (isPaidGroupPolicy(iouReport)) {
        if (reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
            if (!policy?.achAccount?.reimburser) {
                return isAdmin;
            }

            // If user is the reimburser, or a policy admin with access to the business bank account via sharees, they can pay.
            const isReimburser = currentUserEmailParam === policy?.achAccount?.reimburser;

            // Check if the current user has access to the bank account via sharees
            const bankAccountID = policy?.achAccount?.bankAccountID;
            const bankAccount = bankAccountID ? bankAccountList?.[bankAccountID] : null;
            const hasAccessToBankAccount = currentUserEmailParam && bankAccount?.accountData?.sharees ? bankAccount.accountData.sharees.includes(currentUserEmailParam) : false;

            return isReimburser || (isAdmin && hasAccessToBankAccount);
        }
        if (reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL || onlyShowPayElsewhere) {
            return isAdmin;
        }
        return false;
    }
    return isAdmin || (isMoneyRequestReport(iouReport) && isManager);
}

/**
 * Checks if the current user is the action's author
 */
function isActionCreator(reportAction: OnyxInputOrEntry<ReportAction> | Partial<ReportAction>): boolean {
    return reportAction?.actorAccountID === currentUserAccountID;
}

/**
 * Returns the notification preference of the action's child report if it exists.
 * Otherwise, calculates it based on the action's authorship.
 */
function getChildReportNotificationPreference(reportAction: OnyxInputOrEntry<ReportAction> | Partial<ReportAction>): NotificationPreference {
    const childReportNotificationPreference = reportAction?.childReportNotificationPreference ?? '';
    if (childReportNotificationPreference) {
        return childReportNotificationPreference;
    }

    return isActionCreator(reportAction) ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
}

function canAddOrDeleteTransactions(moneyRequestReport: OnyxEntry<Report>, isReportArchived = false): boolean {
    if (!isMoneyRequestReport(moneyRequestReport) || isReportArchived) {
        return false;
    }

    // Adding or deleting transactions is not allowed on a closed report
    if (moneyRequestReport?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED && !isOpenReport(moneyRequestReport)) {
        return false;
    }

    if (isProcessingReport(moneyRequestReport) && isExpenseReport(moneyRequestReport)) {
        return isAwaitingFirstLevelApproval(moneyRequestReport);
    }

    if (isReportApproved({report: moneyRequestReport}) || isClosedReport(moneyRequestReport) || isSettled(moneyRequestReport?.reportID)) {
        return false;
    }

    return true;
}

/**
 * Checks whether the supplied report supports adding more transactions to it.
 * Return true if:
 * - report is a non-settled IOU
 * - report is a draft
 * Returns false if:
 * - if current user is not the submitter of an expense report
 */
function canAddTransaction(moneyRequestReport: OnyxEntry<Report>, isReportArchived = false, isMovingTransaction = false): boolean {
    if (!isMoneyRequestReport(moneyRequestReport)) {
        return false;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(moneyRequestReport?.policyID);

    if (isExpenseReport(moneyRequestReport) && (!isCurrentUserSubmitter(moneyRequestReport) || !isPaidGroupPolicyPolicyUtils(policy))) {
        return false;
    }

    if (
        isInstantSubmitEnabled(policy) &&
        isSubmitAndClose(policy) &&
        (hasOnlyNonReimbursableTransactions(moneyRequestReport?.reportID) ||
            (!isMovingTransaction && !isOpenExpenseReport(moneyRequestReport) && policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO))
    ) {
        return false;
    }

    return canAddOrDeleteTransactions(moneyRequestReport, isReportArchived);
}

/**
 * Checks whether the supplied report supports deleting more transactions from it.
 * Return true if:
 * - report is a non-settled IOU
 * - report is a non-approved IOU
 */
function canDeleteTransaction(moneyRequestReport: OnyxEntry<Report>, isReportArchived = false): boolean {
    return canAddOrDeleteTransactions(moneyRequestReport, isReportArchived);
}

/**
 * Determines whether a money request report is eligible for merging transactions based on the user's role and permissions.
 * Rules:
 * - **Admins**: reports that are in "Open" or "Processing" status
 * - **Submitters**: IOUs, unreported expenses, and expenses on Open or Processing reports at the first level of approval
 * - **Managers**: Expenses on Open or Processing reports
 *
 * @param reportOrReportID - The ID of the money request report to check for merge eligibility
 * @param isAdmin - Whether the current user is an admin of the policy associated with the target report
 *
 * @returns True if the report is eligible for merging transactions, false otherwise
 */
function isMoneyRequestReportEligibleForMerge(reportOrReportID: Report | string, isAdmin: boolean): boolean {
    const report = typeof reportOrReportID === 'string' ? getReportOrDraftReport(reportOrReportID) : reportOrReportID;

    if (!isMoneyRequestReport(report) || isIOUReport(report)) {
        return false;
    }

    const isManager = isReportManager(report);
    const isSubmitter = isReportOwner(report);

    if (isAdmin) {
        return isOpenReport(report) || isProcessingReport(report);
    }

    if (isSubmitter) {
        return isOpenReport(report) || isAwaitingFirstLevelApproval(report);
    }

    return isManager && isExpenseReport(report) && isProcessingReport(report);
}

function hasOutstandingChildRequest(
    chatReport: Report,
    iouReportOrID: OnyxEntry<Report> | string,
    currentUserEmailParam: string,
    allTransactionViolations: OnyxCollection<TransactionViolations>,
    bankAccountList: OnyxEntry<BankAccountList>,
) {
    const reportActions = getAllReportActions(chatReport.reportID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(chatReport.policyID);
    return Object.values(reportActions).some((action) => {
        const iouReportID = getIOUReportIDFromReportActionPreview(action);
        if (
            !iouReportID ||
            action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
            isDeletedAction(action) ||
            (typeof iouReportOrID === 'string' && iouReportID === iouReportOrID)
        ) {
            return false;
        }

        const iouReport = typeof iouReportOrID !== 'string' && iouReportOrID?.reportID === iouReportID ? iouReportOrID : getReportOrDraftReport(iouReportID);
        const transactions = getReportTransactions(iouReportID);

        const hasAutoRejectedTransactionsForManager =
            !!iouReport &&
            iouReport.managerID === currentUserAccountID &&
            transactions.length > 0 &&
            transactions.every((transaction) => {
                const transactionID = transaction?.transactionID;
                if (!transactionID) {
                    return false;
                }
                const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
                return transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
            });
        const canSubmit = !hasAutoRejectedTransactionsForManager && canSubmitReport(iouReport, policy, transactions, undefined, false, currentUserEmailParam);
        return canIOUBePaid(iouReport, chatReport, policy, bankAccountList, transactions) || canApproveIOU(iouReport, policy, transactions) || canSubmit;
    });
}

/**
 * Returns the dropdown options for the add expense button
 * @param iouReport - The IOU report to add an expense to
 * @param policy - The policy of the IOU report
 * @param backToReport - The report to return to after adding an expense
 * @returns The dropdown options for the add expense button
 */
function getAddExpenseDropdownOptions(
    icons: Record<'Location' | 'ReceiptPlus', IconAsset>,
    iouReportID: string | undefined,
    policy: OnyxEntry<Policy>,
    iouRequestBackToReport?: string,
    unreportedExpenseBackToReport?: string,
    lastDistanceExpenseType?: IOURequestType,
): Array<DropdownOption<ValueOf<typeof CONST.REPORT.ADD_EXPENSE_OPTIONS>>> {
    return [
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.CREATE_NEW_EXPENSE,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('iou.createExpense'),
            icon: Plus,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_CREATE,
            onSelected: () => {
                if (!iouReportID) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startMoneyRequest(CONST.IOU.TYPE.SUBMIT, iouReportID, undefined, false, iouRequestBackToReport);
            },
        },
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.TRACK_DISTANCE_EXPENSE,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('iou.trackDistance'),
            icon: icons.Location,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_TRACK_DISTANCE,
            onSelected: () => {
                if (!iouReportID) {
                    return;
                }
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                startDistanceRequest(CONST.IOU.TYPE.SUBMIT, iouReportID, lastDistanceExpenseType, false, iouRequestBackToReport);
            },
        },
        {
            value: CONST.REPORT.ADD_EXPENSE_OPTIONS.ADD_UNREPORTED_EXPENSE,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            text: translateLocal('iou.addUnreportedExpense'),
            icon: icons.ReceiptPlus,
            sentryLabel: CONST.SENTRY_LABEL.MORE_MENU.ADD_EXPENSE_UNREPORTED,
            onSelected: () => {
                if (policy && shouldRestrictUserBillableActions(policy.id)) {
                    Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(policy.id));
                    return;
                }
                openUnreportedExpense(iouReportID, unreportedExpenseBackToReport);
            },
        },
    ];
}

/**
 * Checks whether the card transaction support deleting based on liability type
 */
function canDeleteCardTransactionByLiabilityType(transaction: OnyxEntry<Transaction>): boolean {
    const isCardTransaction = isCardTransactionTransactionUtils(transaction);
    if (!isCardTransaction) {
        return true;
    }
    return transaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.ALLOW;
}

function canDeleteMoneyRequestReport(report: Report, reportTransactions: Transaction[], reportActions: ReportAction[]): boolean {
    const transaction = reportTransactions.at(0);
    const transactionID = transaction?.transactionID;
    const isOwner = transactionID ? getIOUActionForTransactionID(reportActions, transactionID)?.actorAccountID === currentUserAccountID : false;
    const isReportOpenOrProcessing = isOpenReport(report) || isProcessingReport(report);
    const isSingleTransaction = reportTransactions.length === 1;

    if (reportTransactions.length > 0 && reportTransactions.every((t) => isDemoTransaction(t))) {
        return true;
    }

    const isUnreported = isSelfDM(report) || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const canCardTransactionBeDeleted = canDeleteCardTransactionByLiabilityType(transaction);
    if (isUnreported) {
        return isOwner && canCardTransactionBeDeleted;
    }

    if (isInvoiceReport(report)) {
        return report?.ownerAccountID === currentUserAccountID && isReportOpenOrProcessing;
    }

    // Users cannot delete a report in the unreported or IOU cases, but they can delete individual transactions.
    // So we check if the reportTransactions length is 1 which means they're viewing a single transaction and thus can delete it.
    if (isIOUReport(report)) {
        return isSingleTransaction && isOwner && isReportOpenOrProcessing;
    }

    if (isExpenseReport(report)) {
        if (isSingleTransaction && !canCardTransactionBeDeleted) {
            return false;
        }

        const isReportSubmitter = isCurrentUserSubmitter(report);
        return isReportSubmitter && (isOpenReport(report) || (isProcessingReport(report) && isAwaitingFirstLevelApproval(report)));
    }

    return false;
}

/**
 * Can only delete if the author is this user and the action is an ADD_COMMENT action or an IOU action in an unsettled report, or if the user is a
 * policy admin
 */
function canDeleteReportAction(
    reportAction: OnyxInputOrEntry<ReportAction>,
    reportID: string | undefined,
    transaction: OnyxEntry<Transaction> | undefined,
    transactions: OnyxCollection<Transaction>,
    childReportActions: OnyxCollection<ReportAction>,
): boolean {
    const report = getReportOrDraftReport(reportID);
    const isActionOwner = reportAction?.actorAccountID === currentUserAccountID;
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`] ?? null;

    if (isDemoTransaction(transaction)) {
        return true;
    }

    if (isMoneyRequestAction(reportAction)) {
        const canCardTransactionBeDeleted = canDeleteCardTransactionByLiabilityType(transaction);
        // For now, users cannot delete split actions
        const isSplitAction = getOriginalMessage(reportAction)?.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;

        if (isSplitAction) {
            return false;
        }

        if (isActionOwner) {
            if (!isEmptyObject(report) && (isMoneyRequestReport(report) || isInvoiceReport(report))) {
                return canDeleteTransaction(report) && canCardTransactionBeDeleted;
            }
            if (isTrackExpenseAction(reportAction)) {
                return canCardTransactionBeDeleted;
            }
            return true;
        }
    }

    if (report && isReportPreviewAction(reportAction)) {
        return canDeleteMoneyRequestReport(
            report,
            Object.values(transactions ?? {}).filter((t): t is Transaction => !!t),
            Object.values(childReportActions ?? {}).filter((action): action is ReportAction => !!action),
        );
    }

    if (
        reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT ||
        reportAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        isCreatedTaskReportAction(reportAction) ||
        reportAction?.actorAccountID === CONST.ACCOUNT_ID.CONCIERGE
    ) {
        return false;
    }

    const isAdmin = policy?.type !== CONST.POLICY.TYPE.PERSONAL && policy?.role === CONST.POLICY.ROLE.ADMIN && !isEmptyObject(report);

    return isActionOwner || isAdmin;
}

/**
 * Returns true if Concierge is one of the chat participants (1:1 as well as group chats)
 */
function chatIncludesConcierge(report: Partial<OnyxEntry<Report>>): boolean {
    const participantAccountIDs = Object.keys(report?.participants ?? {}).map(Number);
    return participantAccountIDs.includes(CONST.ACCOUNT_ID.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account `in accountIDs
 */
function hasAutomatedExpensifyAccountIDs(accountIDs: number[]): boolean {
    return accountIDs.some((accountID) => CONST.EXPENSIFY_ACCOUNT_IDS.includes(accountID));
}

function getReportRecipientAccountIDs(report: OnyxEntry<Report>, currentLoginAccountID: number): number[] {
    let finalReport: OnyxEntry<Report> = report;
    // In 1:1 chat threads, the participants will be the same as parent report. If a report is specifically a 1:1 chat thread then we will
    // get parent report and use its participants array.
    if (isThread(report) && !(isTaskReport(report) || isMoneyRequestReport(report))) {
        const parentReport = getReport(report?.parentReportID, allReports);
        if (isOneOnOneChat(parentReport)) {
            finalReport = parentReport;
        }
    }

    let finalParticipantAccountIDs: number[] = [];
    if (isTaskReport(report)) {
        // Task reports `managerID` will change when assignee is changed, in that case the old `managerID` is still present in `participants`
        // along with the new one. We only need the `managerID` as a participant here.
        finalParticipantAccountIDs = report?.managerID ? [report?.managerID] : [];
    } else {
        finalParticipantAccountIDs = Object.keys(finalReport?.participants ?? {}).map(Number);
    }

    const otherParticipantsWithoutExpensifyAccountIDs = finalParticipantAccountIDs.filter((accountID) => {
        if (accountID === currentLoginAccountID) {
            return false;
        }
        if (CONST.EXPENSIFY_ACCOUNT_IDS.includes(accountID)) {
            return false;
        }
        return true;
    });

    return otherParticipantsWithoutExpensifyAccountIDs;
}

/**
 * Whether the time row should be shown for a report.
 */
function canShowReportRecipientLocalTime(personalDetails: OnyxEntry<PersonalDetailsList>, report: OnyxEntry<Report>, accountID: number): boolean {
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, accountID);
    const hasMultipleParticipants = reportRecipientAccountIDs.length > 1;
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];
    const reportRecipientTimezone = reportRecipient?.timezone ?? CONST.DEFAULT_TIME_ZONE;
    const isReportParticipantValidated = reportRecipient?.validated ?? false;
    return !!(
        !hasMultipleParticipants &&
        !isChatRoom(report) &&
        !isPolicyExpenseChat(getRootParentReport({report})) &&
        reportRecipient &&
        reportRecipientTimezone?.selected &&
        isReportParticipantValidated
    );
}

/**
 * Shorten last message text to fixed length and trim spaces.
 */
function formatReportLastMessageText(lastMessageText: string | undefined, isModifiedExpenseMessage = false): string {
    if (isModifiedExpenseMessage) {
        return String(lastMessageText).trim().replaceAll(CONST.REGEX.LINE_BREAK, '').trim();
    }

    return formatLastMessageText(lastMessageText);
}

/**
 * Helper method to return the default avatar associated with the given login
 */
function getDefaultWorkspaceAvatar(workspaceName?: string): React.FC<SvgProps> {
    if (!workspaceName) {
        return defaultWorkspaceAvatars.WorkspaceBuilding;
    }

    // Remove all chars not A-Z or 0-9 including underscore
    const alphaNumeric = workspaceName
        .normalize('NFD')
        .replaceAll(/[^0-9a-z]/gi, '')
        .toUpperCase();

    const workspace = `Workspace${alphaNumeric[0]}` as keyof typeof defaultWorkspaceAvatars;
    const defaultWorkspaceAvatar = defaultWorkspaceAvatars[workspace];

    return !alphaNumeric ? defaultWorkspaceAvatars.WorkspaceBuilding : defaultWorkspaceAvatar;
}

/**
 * Helper method to return the default avatar testID associated with the given login
 */
function getDefaultWorkspaceAvatarTestID(workspaceName: string): string {
    if (!workspaceName) {
        return defaultAvatarBuildingIconTestID;
    }

    // Remove all chars not A-Z or 0-9 including underscore
    const alphaNumeric = workspaceName
        .normalize('NFD')
        .replaceAll(/[^0-9a-z]/gi, '')
        .toLowerCase();

    return !alphaNumeric ? defaultAvatarBuildingIconTestID : `SvgDefaultAvatar_${alphaNumeric[0]} Icon`;
}

/**
 * Helper method to return the default avatar associated with the given reportID
 */
function getDefaultGroupAvatar(reportID?: string): IconAsset {
    if (!reportID) {
        return defaultGroupAvatars.Avatar1;
    }
    const reportIDHashBucket: AvatarRange = ((Number(reportID) % CONST.DEFAULT_GROUP_AVATAR_COUNT) + 1) as AvatarRange;
    return defaultGroupAvatars[`Avatar${reportIDHashBucket}`];
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 */
function getIconsForParticipants(participants: number[], personalDetails: OnyxInputOrEntry<PersonalDetailsList>): Icon[] {
    const participantsList = participants || [];
    const avatars: Icon[] = [];

    for (const accountID of participantsList) {
        const avatarSource = personalDetails?.[accountID]?.avatar ?? FallbackAvatar;
        const displayNameLogin = personalDetails?.[accountID]?.displayName ? personalDetails?.[accountID]?.displayName : personalDetails?.[accountID]?.login;
        const userIcon = {
            id: accountID,
            source: avatarSource,
            type: CONST.ICON_TYPE_AVATAR,
            name: displayNameLogin ?? '',
            fallbackIcon: personalDetails?.[accountID]?.fallbackIcon ?? '',
        };
        avatars.push(userIcon);
    }

    return avatars;
}

/**
 * Cache the workspace icons
 */
const workSpaceIconsCache = new Map<string, {name: string; icon: Icon}>();

/**
 * Given a report, return the associated workspace icon.
 */
function getWorkspaceIcon(report: OnyxInputOrEntry<Report>, policy?: OnyxInputOrEntry<Policy>): Icon {
    const workspaceName = getPolicyName({report, policy});
    const cacheKey = report?.policyID ?? workspaceName;
    const iconFromCache = workSpaceIconsCache.get(cacheKey);
    const reportPolicy = policy ?? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    const policyAvatarURL = reportPolicy ? reportPolicy?.avatarURL : report?.policyAvatar;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const policyExpenseChatAvatarSource = policyAvatarURL || getDefaultWorkspaceAvatar(workspaceName);

    const isSameAvatarURL = iconFromCache?.icon?.source === policyExpenseChatAvatarSource;
    const hasWorkSpaceNameChanged = iconFromCache?.name !== workspaceName;

    if (iconFromCache && (isSameAvatarURL || policyAvatarURL === undefined) && !hasWorkSpaceNameChanged) {
        return iconFromCache.icon;
    }

    const workspaceIcon: Icon = {
        source: policyExpenseChatAvatarSource ?? '',
        type: CONST.ICON_TYPE_WORKSPACE,
        name: workspaceName,
        id: report?.policyID,
    };
    workSpaceIconsCache.set(cacheKey, {name: workspaceName, icon: workspaceIcon});
    return workspaceIcon;
}

/**
 * Gets the personal details for a login by looking in the ONYXKEYS.PERSONAL_DETAILS_LIST Onyx key (stored in the local variable, allPersonalDetails). If it doesn't exist in Onyx,
 * then a default object is constructed.
 */
function getPersonalDetailsForAccountID(accountID: number | undefined, personalDetailsData?: Partial<PersonalDetailsList>): Partial<PersonalDetails> {
    if (!accountID) {
        return {};
    }

    const defaultDetails = {
        isOptimisticPersonalDetail: true,
    };

    if (!personalDetailsData) {
        return allPersonalDetails?.[accountID] ?? defaultDetails;
    }

    return personalDetailsData?.[accountID] ?? defaultDetails;
}

/**
 * Returns the personal details or a default object if the personal details are not available.
 */
function getPersonalDetailsOrDefault(personalDetails: Partial<PersonalDetails> | undefined | null): Partial<PersonalDetails> {
    return personalDetails ?? {isOptimisticPersonalDetail: true};
}

const phoneNumberCache: Record<string, string> = {};

/**
 * Get the displayName for a single report participant.
 */
function getDisplayNameForParticipant({
    accountID,
    shouldUseShortForm = false,
    shouldFallbackToHidden = true,
    shouldAddCurrentUserPostfix = false,
    personalDetailsData = allPersonalDetails,
    shouldRemoveDomain = false,
    formatPhoneNumber,
}: {
    accountID?: number;
    shouldUseShortForm?: boolean;
    shouldFallbackToHidden?: boolean;
    shouldAddCurrentUserPostfix?: boolean;
    personalDetailsData?: Partial<PersonalDetailsList>;
    shouldRemoveDomain?: boolean;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
}): string {
    if (!accountID) {
        return '';
    }

    const personalDetails = getPersonalDetailsOrDefault(personalDetailsData?.[accountID]);
    if (!personalDetails) {
        return '';
    }

    const login = personalDetails.login ?? '';

    // Check if the phone number is already cached
    let formattedLogin = phoneNumberCache[login];
    if (!formattedLogin) {
        formattedLogin = formatPhoneNumber(login);
        // Store the formatted phone number in the cache
        phoneNumberCache[login] = formattedLogin;
    }

    // This is to check if account is an invite/optimistically created one
    // and prevent from falling back to 'Hidden', so a correct value is shown
    // when searching for a new user
    if (personalDetails.isOptimisticPersonalDetail === true) {
        return formattedLogin;
    }

    // For selfDM, we display the user's displayName followed by '(you)' as a postfix
    const shouldAddPostfix = shouldAddCurrentUserPostfix && accountID === currentUserAccountID;

    let longName = getDisplayNameOrDefault(personalDetails, formattedLogin, shouldFallbackToHidden, shouldAddPostfix);

    if (shouldRemoveDomain && longName === formattedLogin) {
        longName = longName.split('@').at(0) ?? '';
    }

    // If the user's personal details (first name) should be hidden, make sure we return "hidden" instead of the short name
    if (shouldFallbackToHidden && longName === hiddenTranslation) {
        return longName;
    }

    const shortName = personalDetails.firstName ? personalDetails.firstName : longName;
    return shouldUseShortForm ? shortName : longName;
}

function excludeParticipantsForDisplay(
    participantsIDs: number[],
    allReportParticipants: Participants,
    reportMetadata?: OnyxEntry<ReportMetadata>,
    excludeOptions?: {
        shouldExcludeHidden?: boolean;
        shouldExcludeDeleted?: boolean;
        shouldExcludeCurrentUser?: boolean;
    },
): number[] {
    if (!excludeOptions) {
        return participantsIDs;
    }

    const {shouldExcludeHidden = false, shouldExcludeDeleted = false, shouldExcludeCurrentUser = false} = excludeOptions;

    return participantsIDs.filter((accountID) => {
        if (shouldExcludeCurrentUser && accountID === currentUserAccountID) {
            return false;
        }

        if (shouldExcludeHidden && isHiddenForCurrentUser(allReportParticipants[accountID]?.notificationPreference)) {
            return false;
        }

        if (
            shouldExcludeDeleted &&
            reportMetadata?.pendingChatMembers?.findLast((member) => Number(member.accountID) === accountID)?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
        ) {
            return false;
        }

        return true;
    });
}

function getParticipantsAccountIDsForDisplay(
    report: OnyxEntry<Report>,
    shouldExcludeHidden = false,
    shouldExcludeDeleted = false,
    shouldForceExcludeCurrentUser = false,
    reportMetadataParam?: OnyxEntry<ReportMetadata>,
): number[] {
    const reportParticipants = report?.participants ?? {};
    const reportMetadata = reportMetadataParam ?? getReportMetadata(report?.reportID);
    let participantsEntries = Object.entries(reportParticipants);

    // We should not show participants that have an optimistic entry with the same login in the personal details
    const nonOptimisticLoginMap: Record<string, boolean | undefined> = {};

    for (const entry of participantsEntries) {
        const [accountID] = entry;
        const personalDetail = allPersonalDetails?.[accountID];
        if (personalDetail?.login && !personalDetail.isOptimisticPersonalDetail) {
            nonOptimisticLoginMap[personalDetail.login] = true;
        }
    }

    participantsEntries = participantsEntries.filter(([accountID]) => {
        const personalDetail = allPersonalDetails?.[accountID];
        if (personalDetail?.login && personalDetail.isOptimisticPersonalDetail) {
            return !nonOptimisticLoginMap[personalDetail.login];
        }
        return true;
    });

    let participantsIds = participantsEntries.map(([accountID]) => Number(accountID));

    // For 1:1 chat, we don't want to include the current user as a participant in order to not mark 1:1 chats as having multiple participants
    // For system chat, we want to display Expensify as the only participant
    const shouldExcludeCurrentUser = isOneOnOneChat(report) || isSystemChat(report) || shouldForceExcludeCurrentUser;

    if (shouldExcludeCurrentUser || shouldExcludeHidden || shouldExcludeDeleted) {
        participantsIds = excludeParticipantsForDisplay(participantsIds, reportParticipants, reportMetadata, {shouldExcludeHidden, shouldExcludeDeleted, shouldExcludeCurrentUser});
    }

    return participantsIds.filter((accountID) => isNumber(accountID));
}

function getParticipantsList(report: Report, personalDetails: OnyxEntry<PersonalDetailsList>, isRoomMembersList = false, reportMetadata: OnyxEntry<ReportMetadata> = undefined): number[] {
    const isReportGroupChat = isGroupChat(report);
    const shouldExcludeHiddenParticipants = !isReportGroupChat && !isInvoiceReport(report) && !isMoneyRequestReport(report) && !isMoneyRequest(report);
    const chatParticipants = getParticipantsAccountIDsForDisplay(report, isRoomMembersList || shouldExcludeHiddenParticipants, false, false, reportMetadata);

    return chatParticipants.filter((accountID) => {
        const details = personalDetails?.[accountID];

        if (!isRoomMembersList) {
            if (!details) {
                Log.hmmm(`[ReportParticipantsPage] no personal details found for Group chat member with accountID: ${accountID}`);
                return false;
            }
        } else {
            // When adding a new member to a room (whose personal detail does not exist in Onyx), an optimistic personal detail
            // is created. However, when the real personal detail is returned from the backend, a duplicate member may appear
            // briefly before the optimistic personal detail is deleted. To address this, we filter out the optimistically created
            // member here.
            const isDuplicateOptimisticDetail =
                details?.isOptimisticPersonalDetail && chatParticipants.some((accID) => accID !== accountID && details.login === personalDetails?.[accID]?.login);

            if (!details || isDuplicateOptimisticDetail) {
                Log.hmmm(`[RoomMembersPage] no personal details found for room member with accountID: ${accountID}`);
                return false;
            }
        }
        return true;
    });
}

function buildParticipantsFromAccountIDs(accountIDs: number[]): Participants {
    const finalParticipants: Participants = {};
    return accountIDs.reduce((participants, accountID) => {
        // eslint-disable-next-line no-param-reassign
        participants[accountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
        return participants;
    }, finalParticipants);
}

function getParticipants(reportID: string) {
    const report = getReportOrDraftReport(reportID);
    if (!report) {
        return {};
    }

    return report.participants;
}

function getParticipantIcon(accountID: number | undefined, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, shouldUseShortForm = false): Icon {
    if (!accountID) {
        return {
            id: CONST.DEFAULT_NUMBER_ID,
            source: FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: '',
        };
    }
    const details = personalDetails?.[accountID];
    const displayName = getDisplayNameOrDefault(details, '', shouldUseShortForm);

    return {
        id: accountID,
        source: details?.avatar ?? FallbackAvatar,
        type: CONST.ICON_TYPE_AVATAR,
        name: displayName,
        fallbackIcon: details?.fallbackIcon,
    };
}

/**
 * Helper function to get the icons for the invoice receiver. Only to be used in getIcons().
 */
function getInvoiceReceiverIcons(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, invoiceReceiverPolicy: OnyxInputOrEntry<Policy>): Icon[] {
    if (report?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return getIconsForParticipants([report?.invoiceReceiver.accountID], personalDetails);
    }

    const receiverPolicyID = report?.invoiceReceiver?.policyID;

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const receiverPolicy = invoiceReceiverPolicy ?? getPolicy(receiverPolicyID);
    if (!isEmptyObject(receiverPolicy)) {
        return [
            {
                source: receiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(receiverPolicy.name),
                type: CONST.ICON_TYPE_WORKSPACE,
                name: receiverPolicy.name,
                id: receiverPolicyID,
            },
        ];
    }
    return [];
}

/**
 * Helper function to get the icons for an expense request. Only to be used in getIcons().
 */
function getIconsForExpenseRequest(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, policy: OnyxInputOrEntry<Policy>): Icon[] {
    if (!report || !report?.parentReportID || !report?.parentReportActionID) {
        return [];
    }
    const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
    const workspaceIcon = getWorkspaceIcon(report, policy);
    const actorDetails = parentReportAction?.actorAccountID ? personalDetails?.[parentReportAction.actorAccountID] : undefined;
    const memberIcon = {
        source: actorDetails?.avatar ?? FallbackAvatar,
        id: parentReportAction?.actorAccountID,
        type: CONST.ICON_TYPE_AVATAR,
        name: actorDetails?.displayName ?? '',
        fallbackIcon: actorDetails?.fallbackIcon,
    };
    return [memberIcon, workspaceIcon];
}

/**
 * Helper function to get the icons for a chat thread. Only to be used in getIcons().
 */
function getIconsForChatThread(
    report: OnyxInputOrEntry<Report>,
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    policy: OnyxInputOrEntry<Policy>,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
): Icon[] {
    if (!report || !report?.parentReportID || !report?.parentReportActionID) {
        return [];
    }
    const parentReportAction = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID];
    const actorAccountID = getReportActionActorAccountID(parentReportAction, report as OnyxEntry<Report>, report as OnyxEntry<Report>);
    const actorDetails = actorAccountID ? personalDetails?.[actorAccountID] : undefined;
    const actorDisplayName = getDisplayNameOrDefault(actorDetails, '', false);
    const actorIcon = {
        id: actorAccountID,
        source: actorDetails?.avatar ?? FallbackAvatar,
        name: formatPhoneNumber(actorDisplayName),
        type: CONST.ICON_TYPE_AVATAR,
        fallbackIcon: actorDetails?.fallbackIcon,
    };

    if (isWorkspaceThread(report)) {
        const workspaceIcon = getWorkspaceIcon(report, policy);
        return [actorIcon, workspaceIcon];
    }
    return [actorIcon];
}

/**
 * Helper function to get the icons for a task report. Only to be used in getIcons().
 */
function getIconsForTaskReport(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, policy: OnyxInputOrEntry<Policy>): Icon[] {
    const ownerIcon = getParticipantIcon(report?.ownerAccountID, personalDetails, true);
    if (report && isWorkspaceTaskReport(report)) {
        const workspaceIcon = getWorkspaceIcon(report, policy);
        return [ownerIcon, workspaceIcon];
    }
    return [ownerIcon];
}

/**
 * Helper function to get the icons for a domain room. Only to be used in getIcons().
 */
function getIconsForDomainRoom(report: OnyxInputOrEntry<Report>): Icon[] {
    const domainName = report?.reportName?.substring(1);
    const policyExpenseChatAvatarSource = getDefaultWorkspaceAvatar(domainName);
    const domainIcon: Icon = {
        source: policyExpenseChatAvatarSource,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: domainName ?? '',
        id: report?.policyID,
    };
    return [domainIcon];
}

/**
 * Helper function to get the icons for a policy room. Only to be used in getIcons().
 */
function getIconsForPolicyRoom(
    report: OnyxInputOrEntry<Report>,
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    policy: OnyxInputOrEntry<Policy>,
    invoiceReceiverPolicy: OnyxInputOrEntry<Policy>,
): Icon[] {
    if (!report) {
        return [];
    }
    const icons = [getWorkspaceIcon(report, policy)];
    if (report && isInvoiceRoom(report)) {
        icons.push(...getInvoiceReceiverIcons(report, personalDetails, invoiceReceiverPolicy));
    }
    return icons;
}

/**
 * Helper function to get the icons for a policy expense chat. Only to be used in getIcons().
 */
function getIconsForPolicyExpenseChat(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, policy: OnyxInputOrEntry<Policy>): Icon[] {
    if (!report) {
        return [];
    }
    const workspaceIcon = getWorkspaceIcon(report, policy);
    const memberIcon = getParticipantIcon(report?.ownerAccountID, personalDetails, true);
    return [workspaceIcon, memberIcon];
}

/**
 * Helper function to get the icons for an expense report. Only to be used in getIcons().
 */
function getIconsForExpenseReport(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>, policy: OnyxInputOrEntry<Policy>): Icon[] {
    if (!report) {
        return [];
    }
    const workspaceIcon = getWorkspaceIcon(report, policy);
    const memberIcon = getParticipantIcon(report?.ownerAccountID, personalDetails, true);
    return [memberIcon, workspaceIcon];
}

/**
 * Helper function to get the icons for an iou report. Only to be used in getIcons().
 */
function getIconsForIOUReport(report: OnyxInputOrEntry<Report>, personalDetails: OnyxInputOrEntry<PersonalDetailsList>): Icon[] {
    if (!report) {
        return [];
    }

    const managerDetails = report?.managerID ? personalDetails?.[report.managerID] : undefined;
    const ownerDetails = report?.ownerAccountID ? personalDetails?.[report.ownerAccountID] : undefined;
    const managerIcon = {
        source: managerDetails?.avatar ?? FallbackAvatar,
        id: report?.managerID,
        type: CONST.ICON_TYPE_AVATAR,
        name: managerDetails?.displayName ?? '',
        fallbackIcon: managerDetails?.fallbackIcon,
    };
    const ownerIcon = {
        id: report?.ownerAccountID,
        source: ownerDetails?.avatar ?? FallbackAvatar,
        type: CONST.ICON_TYPE_AVATAR,
        name: ownerDetails?.displayName ?? '',
        fallbackIcon: ownerDetails?.fallbackIcon,
    };
    const isManager = currentUserAccountID === report?.managerID;

    // For one transaction IOUs, display a simplified report icon
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isOneTransactionReportDeprecated(report)) {
        return [ownerIcon];
    }

    return isManager ? [managerIcon, ownerIcon] : [ownerIcon, managerIcon];
}

/**
 * Helper function to get the icons for a group chat. Only to be used in getIcons().
 */
function getIconsForGroupChat(report: OnyxInputOrEntry<Report>, formatPhoneNumber: LocaleContextProps['formatPhoneNumber']): Icon[] {
    if (!report) {
        return [];
    }
    const groupChatIcon = {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        source: report.avatarUrl || getDefaultGroupAvatar(report.reportID),
        id: -1,
        type: CONST.ICON_TYPE_AVATAR,
        name: getGroupChatName(formatPhoneNumber, undefined, true, report),
    };
    return [groupChatIcon];
}

/**
 * Helper function to get the icons for an invoice report. Only to be used in getIcons().
 */
function getIconsForInvoiceReport(
    report: OnyxInputOrEntry<Report>,
    personalDetails: OnyxInputOrEntry<PersonalDetailsList>,
    policy: OnyxInputOrEntry<Policy>,
    invoiceReceiverPolicy: OnyxInputOrEntry<Policy>,
): Icon[] {
    if (!report) {
        return [];
    }
    const invoiceRoomReport = getReportOrDraftReport(report.chatReportID);
    const icons = [getWorkspaceIcon(invoiceRoomReport, policy)];

    if (invoiceRoomReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        icons.push(...getIconsForParticipants([invoiceRoomReport?.invoiceReceiver.accountID], personalDetails));
        return icons;
    }

    const receiverPolicyID = invoiceRoomReport?.invoiceReceiver?.policyID;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const receiverPolicy = invoiceReceiverPolicy ?? getPolicy(receiverPolicyID);

    if (!isEmptyObject(receiverPolicy)) {
        icons.push({
            source: receiverPolicy?.avatarURL ?? getDefaultWorkspaceAvatar(receiverPolicy.name),
            type: CONST.ICON_TYPE_WORKSPACE,
            name: receiverPolicy.name,
            id: receiverPolicyID,
        });
    }

    return icons;
}

/**
 * Helper function to get the icons for a user-created policy room. Only to be used in getIcons().
 */
function getIconsForUserCreatedPolicyRoom(report: OnyxInputOrEntry<Report>, policy: OnyxInputOrEntry<Policy>): Icon[] {
    if (!report) {
        return [];
    }
    if (report?.avatarUrl) {
        return [
            {
                source: report.avatarUrl,
                type: CONST.ICON_TYPE_WORKSPACE,
                name: getPolicyName({report, policy}),
                id: report?.policyID,
            },
        ];
    }
    return [getWorkspaceIcon(report, policy)];
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 */
function getIcons(
    report: OnyxInputOrEntry<Report>,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    personalDetails: OnyxInputOrEntry<PersonalDetailsList> = allPersonalDetails,
    defaultIcon: AvatarSource | null = null,
    defaultName = '',
    defaultAccountID = -1,
    policy?: OnyxInputOrEntry<Policy>,
    invoiceReceiverPolicy?: OnyxInputOrEntry<Policy>,
    isReportArchived = false,
): Icon[] {
    if (isEmptyObject(report)) {
        return [
            {
                source: defaultIcon ?? FallbackAvatar,
                type: CONST.ICON_TYPE_AVATAR,
                name: defaultName,
                id: defaultAccountID,
            },
        ];
    }
    if (isExpenseRequest(report)) {
        return getIconsForExpenseRequest(report, personalDetails, policy);
    }
    if (isChatThread(report)) {
        return getIconsForChatThread(report, personalDetails, policy, formatPhoneNumber);
    }
    if (isTaskReport(report)) {
        return getIconsForTaskReport(report, personalDetails, policy);
    }
    if (isDomainRoom(report)) {
        return getIconsForDomainRoom(report);
    }
    if (isUserCreatedPolicyRoom(report)) {
        return getIconsForUserCreatedPolicyRoom(report, policy);
    }
    if (isAdminRoom(report) || isAnnounceRoom(report) || isChatRoom(report) || (isArchivedNonExpenseReport(report, isReportArchived) && !chatIncludesConcierge(report))) {
        return getIconsForPolicyRoom(report, personalDetails, policy, invoiceReceiverPolicy);
    }
    if (isPolicyExpenseChat(report)) {
        return getIconsForPolicyExpenseChat(report, personalDetails, policy);
    }
    if (isExpenseReport(report)) {
        return getIconsForExpenseReport(report, personalDetails, policy);
    }
    if (isIOUReport(report)) {
        return getIconsForIOUReport(report, personalDetails);
    }
    if (isSelfDM(report)) {
        return getIconsForParticipants(currentUserAccountID ? [currentUserAccountID] : [], personalDetails);
    }
    if (isSystemChat(report)) {
        return getIconsForParticipants([CONST.ACCOUNT_ID.NOTIFICATIONS ?? 0], personalDetails);
    }
    if (isGroupChat(report)) {
        return getIconsForGroupChat(report, formatPhoneNumber);
    }
    if (isInvoiceReport(report)) {
        return getIconsForInvoiceReport(report, personalDetails, policy, invoiceReceiverPolicy);
    }
    if (isOneOnOneChat(report)) {
        const otherParticipantsAccountIDs = Object.keys(report.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID);
        return getIconsForParticipants(otherParticipantsAccountIDs, personalDetails);
    }
    const participantAccountIDs = Object.keys(report.participants ?? {}).map(Number);
    return getIconsForParticipants(participantAccountIDs, personalDetails);
}

const getIconDisplayName = (icon: Icon, personalDetails: OnyxInputOrEntry<PersonalDetailsList>) =>
    icon.id ? (personalDetails?.[icon.id]?.displayName ?? personalDetails?.[icon.id]?.login ?? '') : '';

function sortIconsByName(icons: Icon[], personalDetails: OnyxInputOrEntry<PersonalDetailsList>, localeCompare: LocaleContextProps['localeCompare']) {
    return icons.sort((first, second) => {
        // First sort by displayName/login
        const displayNameLoginOrder = localeCompare(getIconDisplayName(first, personalDetails), getIconDisplayName(second, personalDetails));
        if (displayNameLoginOrder !== 0) {
            return displayNameLoginOrder;
        }

        // Then fallback on accountID as the final sorting criteria.
        // This will ensure that the order of avatars with same login/displayName
        // stay consistent across all users and devices
        return Number(first?.id) - Number(second?.id);
    });
}

function getDisplayNamesWithTooltips(
    personalDetailsList: PersonalDetails[] | PersonalDetailsList | OptionData[],
    shouldUseShortForm: boolean,
    localeCompare: LocaleContextProps['localeCompare'],
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    shouldFallbackToHidden = true,
    shouldAddCurrentUserPostfix = false,
): DisplayNameWithTooltips {
    const personalDetailsListArray = Array.isArray(personalDetailsList) ? personalDetailsList : Object.values(personalDetailsList);

    return personalDetailsListArray
        .map((user) => {
            const accountID = Number(user?.accountID);
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const displayName =
                getDisplayNameForParticipant({accountID, shouldUseShortForm, shouldFallbackToHidden, shouldAddCurrentUserPostfix, formatPhoneNumber}) ||
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                user?.login ||
                '';
            const avatar = user && 'avatar' in user ? user.avatar : undefined;

            let pronouns = user?.pronouns ?? undefined;
            if (pronouns?.startsWith(CONST.PRONOUNS.PREFIX)) {
                const pronounTranslationKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                pronouns = translateLocal(`pronouns.${pronounTranslationKey}` as TranslationPaths);
            }

            return {
                displayName,
                avatar,
                login: user?.login ?? '',
                accountID,
                pronouns,
            };
        })
        .sort((first, second) => {
            // First sort by displayName/login
            const displayNameLoginOrder = localeCompare(first.displayName, second.displayName);
            if (displayNameLoginOrder !== 0) {
                return displayNameLoginOrder;
            }

            // Then fallback on accountID as the final sorting criteria.
            return first.accountID - second.accountID;
        });
}

/**
 * Returns the the display names of the given user accountIDs
 */
function getUserDetailTooltipText(accountID: number, formatPhoneNumber: LocaleContextProps['formatPhoneNumber'], fallbackUserDisplayName = ''): string {
    const displayNameForParticipant = getDisplayNameForParticipant({accountID, formatPhoneNumber});
    return displayNameForParticipant || fallbackUserDisplayName;
}

/**
 * For a deleted parent report action within a chat report,
 * let us return the appropriate display message
 *
 * @param reportAction - The deleted report action of a chat report for which we need to return message.
 */
function getDeletedParentActionMessageForChatReport(reportAction: OnyxEntry<ReportAction>): string {
    // By default, let us display [Deleted message]
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    let deletedMessageText = translateLocal('parentReportAction.deletedMessage');
    if (isCreatedTaskReportAction(reportAction)) {
        // For canceled task report, let us display [Deleted task]
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        deletedMessageText = translateLocal('parentReportAction.deletedTask');
    }
    return deletedMessageText;
}

/**
 * Returns the preview message for `REIMBURSEMENT_QUEUED` action
 */
function getReimbursementQueuedActionMessage({
    reportAction,
    report,
    translate,
    formatPhoneNumber,
    shouldUseShortDisplayName = true,
    personalDetails,
}: {
    reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED>>;
    report: OnyxEntry<Report>;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    shouldUseShortDisplayName?: boolean;
    personalDetails?: Partial<PersonalDetailsList>;
}): string {
    const submitterDisplayName =
        getDisplayNameForParticipant({
            accountID: report?.ownerAccountID,
            shouldUseShortForm: shouldUseShortDisplayName,
            personalDetailsData: personalDetails,
            formatPhoneNumber,
        }) ?? '';
    const originalMessage = getOriginalMessage(reportAction);
    let messageKey: TranslationPaths;
    if (originalMessage?.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
        messageKey = 'iou.waitingOnEnabledWallet';
    } else {
        messageKey = 'iou.waitingOnBankAccount';
    }
    return translate(messageKey, {submitterDisplayName});
}

/**
 * Returns the preview message for `REIMBURSEMENT_DEQUEUED` or `REIMBURSEMENT_ACH_CANCELED` action
 */
function getReimbursementDeQueuedOrCanceledActionMessage(
    translate: LocalizedTranslate,
    reportAction: OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED | typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED>>,
    report: OnyxEntry<Report>,
): string {
    const originalMessage = getOriginalMessage(reportAction);
    const amount = originalMessage?.amount;
    const currency = originalMessage?.currency;
    const formattedAmount = convertToDisplayString(amount, currency);
    if (originalMessage?.cancellationReason === CONST.REPORT.CANCEL_PAYMENT_REASONS.ADMIN || originalMessage?.cancellationReason === CONST.REPORT.CANCEL_PAYMENT_REASONS.USER) {
        return translate('iou.adminCanceledRequest');
    }
    const submitterDisplayName = getDisplayNameForParticipant({accountID: report?.ownerAccountID, shouldUseShortForm: true, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '';
    return translate('iou.canceledRequest', formattedAmount, submitterDisplayName);
}

/**
 * Builds an optimistic REIMBURSEMENT_DEQUEUED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticChangeFieldAction(reportField: PolicyReportField, previousReportField: PolicyReportField): OptimisticChangeFieldAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: 'TEXT',
                style: 'strong',
                text: 'You',
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: ` modified field '${reportField.name}'.`,
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: ` New value is '${reportField.value}'`,
            },
            {
                type: 'TEXT',
                style: 'normal',
                text: ` (previously '${previousReportField.value}').`,
            },
        ],
        originalMessage: {
            fieldName: reportField.name,
            newType: reportField.type,
            newValue: reportField.value,
            oldType: previousReportField.type,
            oldValue: previousReportField.value,
        },
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Builds an optimistic REIMBURSEMENT_DEQUEUED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticCancelPaymentReportAction(expenseReportID: string, amount: number, currency: string): OptimisticCancelPaymentReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED,
        actorAccountID: currentUserAccountID,
        message: [
            {
                cancellationReason: CONST.REPORT.CANCEL_PAYMENT_REASONS.ADMIN,
                expenseReportID,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: '',
                amount,
                currency,
            },
        ],
        originalMessage: {
            cancellationReason: CONST.REPORT.CANCEL_PAYMENT_REASONS.ADMIN,
            expenseReportID,
            amount,
            currency,
        },
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Returns the last visible message for a given report after considering the given optimistic actions
 *
 * @param reportID - the report for which last visible message has to be fetched
 * @param [actionsToMerge] - the optimistic merge actions that needs to be considered while fetching last visible message

 */
function getLastVisibleMessage(
    reportID: string | undefined,
    isReportArchived: boolean | undefined,
    actionsToMerge: Record<string, NullishDeep<ReportAction> | null> = {},
): LastVisibleMessage {
    const report = getReportOrDraftReport(reportID);
    const lastVisibleAction = getLastVisibleActionReportActionsUtils(reportID, canUserPerformWriteAction(report, isReportArchived), actionsToMerge);

    // For Chat Report with deleted parent actions, let us fetch the correct message
    if (isDeletedParentAction(lastVisibleAction) && !isEmptyObject(report) && isChatReport(report)) {
        const lastMessageText = getDeletedParentActionMessageForChatReport(lastVisibleAction);
        return {
            lastMessageText,
        };
    }

    // Fetch the last visible message for report represented by reportID and based on actions to merge.
    return getLastVisibleMessageReportActionsUtils(reportID, canUserPerformWriteAction(report, isReportArchived), actionsToMerge);
}

/**
 * Checks if a report is waiting for the manager to complete an action.
 * Example: the assignee of an open task report or the manager of a processing expense report.
 *
 * @param [parentReportAction] - The parent report action of the report (Used to check if the task has been canceled)
 */
function isWaitingForAssigneeToCompleteAction(report: OnyxEntry<Report>, parentReportAction: OnyxEntry<ReportAction>): boolean {
    if (report?.hasOutstandingChildTask) {
        return true;
    }

    if (report?.hasParentAccess === false && isReportManager(report)) {
        if (isOpenTaskReport(report, parentReportAction)) {
            return true;
        }

        if (isProcessingReport(report) && isExpenseReport(report)) {
            return true;
        }
    }

    return false;
}

function isUnreadWithMention(reportOrOption: OnyxEntry<Report> | OptionData): boolean {
    if (!reportOrOption) {
        return false;
    }
    // lastMentionedTime and lastReadTime are both datetime strings and can be compared directly
    const lastMentionedTime = reportOrOption.lastMentionedTime ?? '';
    const lastReadTime = reportOrOption.lastReadTime ?? '';
    return !!('isUnreadWithMention' in reportOrOption && reportOrOption.isUnreadWithMention) || lastReadTime < lastMentionedTime;
}

type ReasonAndReportActionThatRequiresAttention = {
    reason: ValueOf<typeof CONST.REQUIRES_ATTENTION_REASONS>;
    reportAction?: OnyxEntry<ReportAction>;
};

/**
 * Returns the unresolved card fraud alert action for a given report.
 */
function getUnresolvedCardFraudAlertAction(reportID: string): OnyxEntry<ReportAction> {
    const reportActions = getAllReportActions(reportID);
    return Object.values(reportActions).find((action): action is ReportAction => isActionableCardFraudAlert(action) && !getOriginalMessage(action)?.resolution);
}

/**
 * Checks if a given report or option has an unresolved card fraud alert.
 */
function hasUnresolvedCardFraudAlert(reportOrOption: OnyxEntry<Report> | OptionData): boolean {
    if (!reportOrOption?.reportID) {
        return false;
    }
    return !!getUnresolvedCardFraudAlertAction(reportOrOption.reportID);
}

function getReasonAndReportActionThatRequiresAttention(
    optionOrReport: OnyxEntry<Report> | OptionData,
    parentReportAction?: OnyxEntry<ReportAction>,
    isReportArchived = false,
): ReasonAndReportActionThatRequiresAttention | null {
    if (!optionOrReport) {
        return null;
    }

    const reportActions = getAllReportActions(optionOrReport.reportID);

    if (hasUnresolvedCardFraudAlert(optionOrReport)) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_UNRESOLVED_CARD_FRAUD_ALERT,
            reportAction: getUnresolvedCardFraudAlertAction(optionOrReport.reportID),
        };
    }

    if (isReportArchived) {
        return null;
    }

    if (isJoinRequestInAdminRoom(optionOrReport)) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_JOIN_REQUEST,
            reportAction: getActionableJoinRequestPendingReportAction(optionOrReport.reportID),
        };
    }

    if (isUnreadWithMention(optionOrReport)) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.IS_UNREAD_WITH_MENTION,
        };
    }

    if (isWaitingForAssigneeToCompleteAction(optionOrReport, parentReportAction)) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION,
            reportAction: Object.values(reportActions).find((action) => action.childType === CONST.REPORT.TYPE.TASK),
        };
    }

    const iouReportActionToApproveOrPay = getIOUReportActionToApproveOrPay(optionOrReport, undefined);
    const iouReportID = getIOUReportIDFromReportActionPreview(iouReportActionToApproveOrPay);
    const transactions = getReportTransactions(iouReportID);
    const hasOnlyPendingTransactions = transactions.length > 0 && transactions.every((t) => isExpensifyCardTransaction(t) && isPending(t));

    // Has a child report that is awaiting action (e.g. approve, pay, add bank account) from current user
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(optionOrReport.policyID);
    if (
        (optionOrReport.hasOutstandingChildRequest === true || iouReportActionToApproveOrPay?.reportActionID) &&
        (policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO || !hasOnlyPendingTransactions)
    ) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION,
            reportAction: iouReportActionToApproveOrPay,
        };
    }

    if (hasMissingInvoiceBankAccount(optionOrReport.reportID) && !isSettled(optionOrReport.reportID)) {
        return {
            reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_MISSING_INVOICE_BANK_ACCOUNT,
        };
    }

    if (isInvoiceRoom(optionOrReport)) {
        const reportAction = Object.values(reportActions).find(
            (action) =>
                action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
                action.childReportID &&
                hasMissingInvoiceBankAccount(action.childReportID) &&
                !isSettled(action.childReportID),
        );

        return reportAction
            ? {
                  reason: CONST.REQUIRES_ATTENTION_REASONS.HAS_MISSING_INVOICE_BANK_ACCOUNT,
                  reportAction,
              }
            : null;
    }

    return null;
}

/**
 * Determines if the option requires action from the current user. This can happen when it:
 *  - is unread and the user was mentioned in one of the unread comments
 *  - is for an outstanding task waiting on the user
 *  - has an outstanding child expense that is waiting for an action from the current user (e.g. pay, approve, add bank account)
 *  - is either the system or concierge chat, the user free trial has ended and it didn't add a payment card yet
 *
 * @param option (report or optionItem)
 * @param parentReportAction (the report action the current report is a thread of)
 */
function requiresAttentionFromCurrentUser(optionOrReport: OnyxEntry<Report> | OptionData, parentReportAction?: OnyxEntry<ReportAction>, isReportArchived = false) {
    return !!getReasonAndReportActionThatRequiresAttention(optionOrReport, parentReportAction, isReportArchived);
}

/**
 * Checks if the report contains at least one Non-Reimbursable transaction
 */
function hasNonReimbursableTransactions(iouReportID: string | undefined, reportsTransactionsParam: Record<string, Transaction[]> = reportsTransactions): boolean {
    const transactions = getReportTransactions(iouReportID, reportsTransactionsParam);
    return transactions.filter((transaction) => transaction.reimbursable === false).length > 0;
}

function getMoneyRequestSpendBreakdown(report: OnyxInputOrEntry<Report>, searchReports?: Report[]): SpendBreakdown {
    const reports = searchReports ?? allReports;
    let moneyRequestReport: OnyxEntry<Report>;
    if (report && (isMoneyRequestReport(report, searchReports) || isInvoiceReport(report))) {
        moneyRequestReport = report;
    }
    if (reports && report?.iouReportID) {
        moneyRequestReport = getReport(report.iouReportID, allReports);
    }
    if (moneyRequestReport) {
        let nonReimbursableSpend = moneyRequestReport.nonReimbursableTotal ?? 0;
        let totalSpend = moneyRequestReport.total ?? 0;

        if (nonReimbursableSpend + totalSpend !== 0) {
            // There is a possibility that if the Expense report has a negative total.
            // This is because there are instances where you can get a credit back on your card,
            // or you enter a negative expense to "offset" future expenses
            nonReimbursableSpend = isExpenseReport(moneyRequestReport) ? nonReimbursableSpend * -1 : Math.abs(nonReimbursableSpend);
            totalSpend = isExpenseReport(moneyRequestReport) ? totalSpend * -1 : Math.abs(totalSpend);

            const totalDisplaySpend = totalSpend;
            const reimbursableSpend = totalDisplaySpend - nonReimbursableSpend;

            return {
                nonReimbursableSpend,
                reimbursableSpend,
                totalDisplaySpend,
            };
        }
    }
    return {
        nonReimbursableSpend: 0,
        reimbursableSpend: 0,
        totalDisplaySpend: 0,
    };
}

/**
 * Given a report field, check if the field is for the report title.
 */
function isReportFieldOfTypeTitle(reportField: OnyxEntry<PolicyReportField>): boolean {
    return reportField?.fieldID === CONST.REPORT_FIELD_TITLE_FIELD_ID;
}

/**
 * Check if Report has any held expenses
 */
function isHoldCreator(transaction: OnyxEntry<Transaction>, reportID: string | undefined): boolean {
    const holdReportAction = getReportAction(reportID, `${transaction?.comment?.hold ?? ''}`);
    return isActionCreator(holdReportAction);
}

/**
 * Given a report field, check if the field can be edited or not.
 * For title fields, its considered disabled if `deletable` prop is `true` (https://github.com/Expensify/App/issues/35043#issuecomment-1911275433)
 * For non title fields, its considered disabled if:
 * 1. The user is not admin of the report
 * 2. Report is settled or it is closed
 */
function isReportFieldDisabled(report: OnyxEntry<Report>, reportField: OnyxEntry<PolicyReportField>, policy: OnyxEntry<Policy>): boolean {
    if (isInvoiceReport(report)) {
        return true;
    }
    const isReportSettled = isSettled(report?.reportID);
    const isReportClosed = isClosedReport(report);
    const isTitleField = isReportFieldOfTypeTitle(reportField);
    const isAdmin = isPolicyAdmin(policy);
    const isApproved = isReportApproved({report});
    if (!isAdmin && (isReportSettled || isReportClosed || isApproved)) {
        return true;
    }

    if (isTitleField) {
        return !reportField?.deletable;
    }

    return reportField?.type === CONST.REPORT_FIELD_TYPES.FORMULA;
}

/**
 * Determines if a report field should be disabled for the current user.
 * A field is considered disabled if it is disabled by the report configuration itself
 * or if the user is not an admin, owner, approver, or the report owner.
 */
function isReportFieldDisabledForUser(report: OnyxEntry<Report>, reportField: OnyxEntry<PolicyReportField>, policy: OnyxEntry<Policy>): boolean {
    return isReportFieldDisabled(report, reportField, policy) || !isAdminOwnerApproverOrReportOwner(report, policy);
}

/**
 * Given a set of report fields, return the field that refers to title
 */
function getTitleReportField(reportFields: Record<string, PolicyReportField>) {
    return Object.values(reportFields).find((field) => isReportFieldOfTypeTitle(field));
}

/**
 * Get the key for a report field
 */
function getReportFieldKey(reportFieldId: string | undefined) {
    if (!reportFieldId) {
        return '';
    }

    // We don't need to add `expensify_` prefix to the title field key, because backend stored title under a unique key `text_title`,
    // and all the other report field keys are stored under `expensify_FIELD_ID`.
    if (reportFieldId === CONST.REPORT_FIELD_TITLE_FIELD_ID) {
        return reportFieldId;
    }

    return `expensify_${reportFieldId}`;
}

/**
 * Get the report fields attached to the policy given policyID
 */
function getReportFieldsByPolicyID(policyID: string | undefined): Record<string, PolicyReportField> {
    if (!policyID) {
        return {};
    }

    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const policyDraft = allPolicyDrafts?.[`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`];
    const fieldList = (policy ?? policyDraft)?.fieldList;

    if ((!policy && !policyDraft) || !fieldList) {
        return {};
    }

    return fieldList;
}

/**
 * Get the report fields that we should display a MoneyReportView gets opened
 */

function getAvailableReportFields(report: OnyxEntry<Report>, policyReportFields: PolicyReportField[]): PolicyReportField[] {
    // Get the report fields that are attached to a report. These will persist even if a field is deleted from the policy.
    const reportFields = Object.values(report?.fieldList ?? {});
    const reportIsSettled = isSettled(report?.reportID);

    // If the report is settled, we don't want to show any new field that gets added to the policy.
    if (reportIsSettled) {
        return reportFields;
    }

    // If the report is unsettled, we want to merge the new fields that get added to the policy with the fields that
    // are attached to the report.
    const mergedFieldIds = Array.from(new Set([...policyReportFields.map(({fieldID}) => fieldID), ...reportFields.map(({fieldID}) => fieldID)]));

    const fields = mergedFieldIds.map((id) => {
        const field = report?.fieldList?.[getReportFieldKey(id)];
        const policyReportField = policyReportFields.find(({fieldID}) => fieldID === id);

        if (field) {
            return {
                ...field,
                ...(policyReportField
                    ? {
                          disabledOptions: policyReportField.disabledOptions,
                          values: policyReportField.values,
                      }
                    : {}),
            };
        }

        if (policyReportField) {
            return policyReportField;
        }

        return null;
    });

    return fields.filter(Boolean) as PolicyReportField[];
}

/**
 * Gets transaction created, amount, currency, comment, and waypoints (for distance expense)
 * into a flat object. Used for displaying transactions and sending them in API commands
 */

function getTransactionDetails(
    transaction: OnyxInputOrEntry<Transaction> | TransactionWithOptionalSearchFields,
    createdDateFormat: string = CONST.DATE.FNS_FORMAT_STRING,
    policy: OnyxEntry<Policy> = undefined,
    allowNegativeAmount = false,
    disableOppositeConversion = false,
    currentUserDetails = currentUserPersonalDetails,
): TransactionDetails | undefined {
    if (!transaction) {
        return;
    }

    const report = getReportOrDraftReport(transaction?.reportID, undefined, 'report' in transaction ? transaction.report : undefined);
    const isManualDistanceRequest = isManualDistanceRequestTransactionUtils(transaction);
    const isFromExpenseReport = !isEmptyObject(report) && isExpenseReport(report);

    return {
        created: getFormattedCreated(transaction, createdDateFormat),
        amount: getTransactionAmount(transaction, isFromExpenseReport, transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID, allowNegativeAmount, disableOppositeConversion),
        attendees: getAttendees(transaction, currentUserDetails),
        taxAmount: getTaxAmount(transaction, isFromExpenseReport),
        taxCode: getTaxCode(transaction),
        currency: getCurrency(transaction),
        comment: getDescription(transaction),
        merchant: getMerchant(transaction, policy),
        waypoints: getWaypoints(transaction),
        customUnitRateID: getRateID(transaction),
        category: getCategory(transaction),
        reimbursable: getReimbursable(transaction),
        billable: getBillable(transaction),
        tag: getTag(transaction),
        mccGroup: getMCCGroup(transaction),
        cardID: getCardID(transaction),
        cardName: getCardName(transaction),
        originalAmount: getOriginalAmount(transaction),
        originalCurrency: getOriginalCurrency(transaction),
        convertedAmount: getConvertedAmount(transaction, isFromExpenseReport, transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID, allowNegativeAmount, disableOppositeConversion),
        postedDate: getFormattedPostedDate(transaction),
        transactionID: transaction.transactionID,
        ...(isManualDistanceRequest && {distance: transaction.comment?.customUnit?.quantity ?? undefined}),
    };
}

function getTransactionCommentObject(transaction: OnyxEntry<Transaction>): Comment {
    return {
        ...transaction?.comment,
        comment: Parser.htmlToMarkdown(transaction?.comment?.comment ?? ''),
        waypoints: getWaypoints(transaction),
    };
}

/**
 * Can only edit if:
 *
 * - in case of IOU report
 *    - the current user is the requestor and is not settled yet
 * - in case of expense report
 *    - the current user is the requestor and is not settled yet
 *    - the current user is the manager of the report
 *    - or the current user is an admin on the policy the expense report is tied to
 *
 *    This is used in conjunction with canEditMoneyRequest to control editing of specific fields like amount, currency, created, receipt, and distance.
 *    On its own, it only controls allowing/disallowing navigating to the editing pages or showing/hiding the 'Edit' icon on report actions
 */
function canEditMoneyRequest(
    reportAction: OnyxInputOrEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>,
    isChatReportArchived = false,
    report?: OnyxInputOrEntry<Report>,
    policy?: OnyxEntry<Policy>,
    linkedTransaction?: OnyxEntry<Transaction>,
): boolean {
    const isDeleted = isDeletedAction(reportAction);

    if (isDeleted) {
        return false;
    }

    const allowedReportActionType: Array<ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>> = [CONST.IOU.REPORT_ACTION_TYPE.TRACK, CONST.IOU.REPORT_ACTION_TYPE.CREATE];
    const originalMessage = getOriginalMessage(reportAction);
    const actionType = originalMessage?.type;

    if (!actionType || !(allowedReportActionType.includes(actionType) || (actionType === CONST.IOU.REPORT_ACTION_TYPE.PAY && !!originalMessage.IOUDetails))) {
        return false;
    }

    const transaction = linkedTransaction ?? getLinkedTransaction(reportAction ?? undefined);

    // In case the transaction is failed to be created, we should disable editing the money request
    if (!transaction?.transactionID || (transaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !isEmptyObject(transaction.errors))) {
        return false;
    }

    // Domain admins can report unreported managed card transactions
    if (transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID && isManagedCardTransaction(transaction)) {
        return true;
    }

    const moneyRequestReportID = originalMessage?.IOUReportID;
    const isRequestor = currentUserAccountID === reportAction?.actorAccountID;

    if (!moneyRequestReportID) {
        return actionType === CONST.IOU.REPORT_ACTION_TYPE.TRACK && isRequestor;
    }

    const moneyRequestReport = report ?? getReportOrDraftReport(String(moneyRequestReportID));

    const isSubmitted = isProcessingReport(moneyRequestReport);
    if (isIOUReport(moneyRequestReport)) {
        return isSubmitted && isRequestor;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportPolicy = policy ?? getPolicy(moneyRequestReport?.policyID);
    const isAdmin = reportPolicy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = currentUserAccountID === moneyRequestReport?.managerID;

    if (isInvoiceReport(moneyRequestReport) && (isManager || isChatReportArchived)) {
        return false;
    }

    // Admin & managers can always edit coding fields such as tag, category, billable, etc.
    if (isAdmin || isManager) {
        return true;
    }

    if (reportPolicy?.type === CONST.POLICY.TYPE.CORPORATE && moneyRequestReport && isSubmitted && isCurrentUserSubmitter(moneyRequestReport)) {
        const isForwarded = getSubmitToAccountID(reportPolicy, moneyRequestReport) !== moneyRequestReport.managerID;
        return !isForwarded;
    }

    return !isReportApproved({report: moneyRequestReport}) && !isSettled(moneyRequestReport?.reportID) && !isClosedReport(moneyRequestReport) && isRequestor;
}

function getNextApproverAccountID(report: OnyxEntry<Report>, isUnapproved = false) {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(report?.policyID);

    // If the current user took control, then they are the final approver and we don't have a next approver
    // If someone else took control or rerouted, they are the next approver
    const bypassApproverAccountID = getBypassApproverAccountIDIfTakenControl(report);
    if (bypassApproverAccountID) {
        return bypassApproverAccountID === currentUserAccountID && !isUnapproved ? undefined : bypassApproverAccountID;
    }

    const approvalChain = getApprovalChain(policy, report);
    const submitToAccountID = getSubmitToAccountID(policy, report);

    if (isUnapproved) {
        if (approvalChain.includes(currentUserEmail ?? '')) {
            return currentUserAccountID;
        }

        return report?.managerID ?? submitToAccountID;
    }

    if (approvalChain.length === 0) {
        return submitToAccountID;
    }

    const currentUserIndex = approvalChain.indexOf(currentUserEmail ?? '');
    const nextApproverEmail = currentUserIndex === -1 ? approvalChain.at(0) : approvalChain.at(currentUserIndex + 1);

    if (!nextApproverEmail) {
        // If there's no next approver in the chain, return undefined to indicate the current user is the final approver
        return undefined;
    }

    return getAccountIDsByLogins([nextApproverEmail]).at(0);
}

function canEditReportPolicy(report: OnyxEntry<Report>, reportPolicy: OnyxEntry<Policy>): boolean {
    const isAdmin = isPolicyAdminPolicyUtils(reportPolicy);
    const isManager = isReportManager(report);
    const isSubmitter = isReportOwner(report);
    const isReportAuditor = isAuditor(report);
    const isIOUType = isIOUReport(report);
    const isInvoiceType = isInvoiceReport(report);
    const isExpenseType = isExpenseReport(report);
    const isOpen = isOpenReport(report);
    const isSubmitted = isProcessingReport(report);
    const isReimbursed = isReportManuallyReimbursed(report);

    if (isIOUType) {
        return isOpen || isSubmitted || isReimbursed;
    }

    if (isInvoiceType) {
        return isOpen && !isReportAuditor;
    }

    if (isExpenseType) {
        if (isOpen) {
            return isSubmitter || isAdmin;
        }

        if (isSubmitted) {
            return (isSubmitter && isAwaitingFirstLevelApproval(report)) || isManager || isAdmin;
        }

        return isManager || isAdmin;
    }

    return false;
}

/**
 * Checks if the current user can edit the provided property of an expense
 *
 */
function canEditFieldOfMoneyRequest(
    reportAction: OnyxInputOrEntry<ReportAction>,
    fieldToEdit: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>,
    isDeleteAction?: boolean,
    isChatReportArchived = false,
    outstandingReportsByPolicyID?: OutstandingReportsByPolicyIDDerivedValue,
    linkedTransaction?: OnyxEntry<Transaction>,
    report?: OnyxInputOrEntry<Report>,
    policy?: OnyxEntry<Policy>,
): boolean {
    // A list of fields that cannot be edited by anyone, once an expense has been settled
    const restrictedFields: string[] = [
        CONST.EDIT_REQUEST_FIELD.AMOUNT,
        CONST.EDIT_REQUEST_FIELD.CURRENCY,
        CONST.EDIT_REQUEST_FIELD.MERCHANT,
        CONST.EDIT_REQUEST_FIELD.DATE,
        CONST.EDIT_REQUEST_FIELD.RECEIPT,
        CONST.EDIT_REQUEST_FIELD.DISTANCE,
        CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE,
        CONST.EDIT_REQUEST_FIELD.REIMBURSABLE,
        CONST.EDIT_REQUEST_FIELD.REPORT,
    ];

    if (!isMoneyRequestAction(reportAction) || !canEditMoneyRequest(reportAction, isChatReportArchived, report, policy, linkedTransaction)) {
        return false;
    }

    // If we're editing fields such as category, tag, description, etc. the check above should be enough for handling the permission
    if (!restrictedFields.includes(fieldToEdit)) {
        return true;
    }

    const iouMessage = getOriginalMessage(reportAction);
    const moneyRequestReport = report ?? (iouMessage?.IOUReportID ? (getReport(iouMessage?.IOUReportID, allReports) ?? ({} as Report)) : ({} as Report));
    const transaction = linkedTransaction ?? allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${iouMessage?.IOUTransactionID}`] ?? ({} as Transaction);

    if (isSettled(String(moneyRequestReport.reportID)) || isReportIDApproved(String(moneyRequestReport.reportID))) {
        return false;
    }

    if (
        (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST.EDIT_REQUEST_FIELD.CURRENCY || fieldToEdit === CONST.EDIT_REQUEST_FIELD.DATE) &&
        isCardTransactionTransactionUtils(transaction)
    ) {
        return false;
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.REIMBURSABLE && isClosedReport(moneyRequestReport)) {
        return false;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportPolicy = policy ?? getPolicy(moneyRequestReport?.policyID);
    const isAdmin = isExpenseReport(moneyRequestReport) && reportPolicy?.role === CONST.POLICY.ROLE.ADMIN;
    const isManager = isExpenseReport(moneyRequestReport) && currentUserAccountID === moneyRequestReport?.managerID;
    const isRequestor = currentUserAccountID === reportAction?.actorAccountID;

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.REIMBURSABLE) {
        return isAdmin || isManager || isRequestor;
    }

    if ((fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST.EDIT_REQUEST_FIELD.CURRENCY) && isDistanceRequest(transaction)) {
        return isAdmin || isManager || isRequestor;
    }

    if (
        (fieldToEdit === CONST.EDIT_REQUEST_FIELD.AMOUNT || fieldToEdit === CONST.EDIT_REQUEST_FIELD.CURRENCY || fieldToEdit === CONST.EDIT_REQUEST_FIELD.MERCHANT) &&
        isPerDiemRequest(transaction)
    ) {
        return false;
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.RECEIPT) {
        return (
            !isInvoiceReport(moneyRequestReport) &&
            !isReceiptBeingScanned(transaction) &&
            !isPerDiemRequest(transaction) &&
            (!isDistanceRequest(transaction) || isManualDistanceRequestTransactionUtils(transaction)) &&
            (isAdmin || isManager || isRequestor) &&
            (isDeleteAction ? isRequestor : true)
        );
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.DISTANCE_RATE) {
        // The distance rate can be modified only on the distance expense reports
        return isExpenseReport(moneyRequestReport) && isDistanceRequest(transaction);
    }

    if (fieldToEdit === CONST.EDIT_REQUEST_FIELD.REPORT) {
        // Unreported transaction from OldDot can have the reportID as an empty string
        const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

        if (isUnreportedExpense) {
            return true;
        }

        if (!isReportOutstanding(moneyRequestReport, moneyRequestReport.policyID)) {
            return false;
        }

        const isRequestIOU = isIOUReport(moneyRequestReport);
        if (isRequestIOU) {
            return false;
        }
        const isOwner = moneyRequestReport?.ownerAccountID === currentUserAccountID;

        if (isInvoiceReport(moneyRequestReport)) {
            return (
                getOutstandingReportsForUser(
                    moneyRequestReport?.policyID,
                    moneyRequestReport?.ownerAccountID,
                    outstandingReportsByPolicyID?.[moneyRequestReport?.policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
                ).length > 0
            );
        }
        const isSubmitter = isCurrentUserSubmitter(moneyRequestReport);

        // If the report is Open, then only submitters, admins can move expenses
        const isOpen = isOpenExpenseReport(moneyRequestReport);
        if (!isUnreportedExpense && isOpen && !isSubmitter && !isAdmin) {
            return false;
        }

        return (
            Object.values(allPolicies ?? {}).flatMap((currentPolicy) =>
                getOutstandingReportsForUser(currentPolicy?.id, moneyRequestReport?.ownerAccountID, outstandingReportsByPolicyID?.[currentPolicy?.id ?? CONST.DEFAULT_NUMBER_ID] ?? {}),
            ).length > 1 ||
            ((isOwner || isAdmin || isManager) && isReportOutstanding(moneyRequestReport, moneyRequestReport.policyID))
        );
    }

    const isUnreportedExpense = !transaction?.reportID || transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    if (isUnreportedExpense && !isRequestor) {
        return false;
    }

    return true;
}

/**
 * Can only edit if:
 *
 * - It was written by the current user
 * - It's an ADD_COMMENT that is not an attachment
 * - It's an expense where conditions for modifications are defined in canEditMoneyRequest method
 * - It's not pending deletion
 */
function canEditReportAction(reportAction: OnyxInputOrEntry<ReportAction>): boolean {
    const isCommentOrIOU = reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT || reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
    const message = reportAction ? getReportActionMessageReportUtils(reportAction) : undefined;

    return !!(
        reportAction?.actorAccountID === currentUserAccountID &&
        isCommentOrIOU &&
        (!isMoneyRequestAction(reportAction) || canEditMoneyRequest(reportAction)) && // Returns true for non-IOU actions
        !isReportMessageAttachment(message) &&
        ((!reportAction.isAttachmentWithText && !reportAction.isAttachmentOnly) || !reportAction.isOptimisticAction) &&
        !isDeletedAction(reportAction) &&
        !isCreatedTaskReportAction(reportAction) &&
        reportAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
    );
}

function canModifyHoldStatus(report: Report, reportAction: ReportAction): boolean {
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (!isMoneyRequestReport(report) || isTrackExpenseReport(report)) {
        return false;
    }
    const isAdmin = isPolicyAdmin(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`]);
    const isActionOwner = isActionCreator(reportAction);
    const isManager = isMoneyRequestReport(report) && report?.managerID !== null && currentUserPersonalDetails?.accountID === report?.managerID;

    if (isIOUReport(report)) {
        return isActionOwner || isManager;
    }

    return isAdmin || isActionOwner || isManager;
}

function canHoldUnholdReportAction(
    report: OnyxEntry<Report>,
    reportAction: OnyxEntry<ReportAction>,
    holdReportAction: OnyxEntry<ReportAction>,
    transaction: OnyxEntry<Transaction>,
    policy: OnyxEntry<Policy>,
): {canHoldRequest: boolean; canUnholdRequest: boolean} {
    if (!report || !reportAction || !isMoneyRequestAction(reportAction) || isInvoiceReport(report)) {
        return {canHoldRequest: false, canUnholdRequest: false};
    }

    const isRequestSettled = isSettled(report);
    const isApproved = isReportApproved({report});
    const isRequestIOU = isIOUReport(report);
    const isHoldActionCreator = isActionCreator(holdReportAction);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isTrackExpenseMoneyReport = isTrackExpenseReport(report);
    const isActionOwner = isActionCreator(reportAction);
    const isApprover = isMoneyRequestReport(report) && report.managerID !== null && currentUserPersonalDetails?.accountID === report?.managerID;
    const isAdmin = isPolicyAdminPolicyUtils(policy);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const isClosed = isClosedReport(report);
    const isSubmitted = isProcessingReport(report);

    const canModifyStatus = canModifyHoldStatus(report, reportAction);
    const canModifyUnholdStatus = !isTrackExpenseMoneyReport && (isAdmin || (isActionOwner && isHoldActionCreator) || isApprover);

    const canHoldOrUnholdRequest = !isRequestSettled && !isApproved && !isClosed && !isDeletedParentAction(reportAction);
    const canHoldRequest = canHoldOrUnholdRequest && !isOnHold && canModifyStatus && !isScanning(transaction) && (isSubmitted || isActionOwner);

    const canUnholdRequest = !!(canHoldOrUnholdRequest && isOnHold && (isRequestIOU ? isHoldActionCreator : canModifyUnholdStatus));

    return {canHoldRequest, canUnholdRequest};
}

const changeMoneyRequestHoldStatus = (reportAction: OnyxEntry<ReportAction>): void => {
    if (!isMoneyRequestAction(reportAction)) {
        return;
    }
    const moneyRequestReportID = getOriginalMessage(reportAction)?.IOUReportID;

    const moneyRequestReport = getReportOrDraftReport(String(moneyRequestReportID));
    if (!moneyRequestReportID || !moneyRequestReport) {
        return;
    }

    const transactionID = getOriginalMessage(reportAction)?.IOUTransactionID;

    if (!transactionID) {
        Log.warn('Missing transactionID during the change of the money request hold status');
        return;
    }

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? ({} as Transaction);
    const isOnHold = isOnHoldTransactionUtils(transaction);
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${moneyRequestReport.policyID}`];

    if (isOnHold) {
        if (reportAction.childReportID) {
            unholdRequest(transactionID, reportAction.childReportID, policy);
        } else {
            Log.warn('Missing reportAction.childReportID during money request unhold');
        }
    } else {
        const activeRoute = encodeURIComponent(Navigation.getActiveRoute());
        Navigation.navigate(ROUTES.MONEY_REQUEST_HOLD_REASON.getRoute(policy?.type ?? CONST.POLICY.TYPE.PERSONAL, transactionID, reportAction.childReportID, activeRoute));
    }
};

const rejectMoneyRequestReason = (reportAction: OnyxEntry<ReportAction>): void => {
    if (!isMoneyRequestAction(reportAction)) {
        return;
    }

    const originalMessage = getOriginalMessage(reportAction);
    const moneyRequestReportID = originalMessage?.IOUReportID;
    const transactionID = originalMessage?.IOUTransactionID;

    if (!transactionID || !moneyRequestReportID) {
        Log.warn('Missing transactionID and moneyRequestReportID during the change of the money request hold status');
        return;
    }

    const report = getReport(moneyRequestReportID, allReports);
    if (isInvoiceReport(report) || isIOUReport(report)) {
        return; // Disable invoice
    }

    const activeRoute = encodeURIComponent(Navigation.getActiveRoute());
    Navigation.navigate(ROUTES.REJECT_MONEY_REQUEST_REASON.getRoute(transactionID, moneyRequestReportID, activeRoute));
};

/**
 * Gets all transactions on an IOU report with a receipt
 */
function getTransactionsWithReceipts(iouReportID: string | undefined): Transaction[] {
    const transactions = getReportTransactions(iouReportID);
    return transactions.filter((transaction) => hasReceiptTransactionUtils(transaction));
}

/**
 * For report previews, we display a "Receipt scan in progress" indicator
 * instead of the report total only when we have no report total ready to show. This is the case when
 * all requests are receipts that are being SmartScanned. As soon as we have a non-receipt request,
 * or as soon as one receipt request is done scanning, we have at least one
 * "ready" expense, and we remove this indicator to show the partial report total.
 */
function areAllRequestsBeingSmartScanned(iouReportID: string | undefined, reportPreviewAction: OnyxEntry<ReportAction>): boolean {
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    // If we have more requests than requests with receipts, we have some manual requests
    if (getNumberOfMoneyRequests(reportPreviewAction) > transactionsWithReceipts.length) {
        return false;
    }
    return transactionsWithReceipts.every((transaction) => isScanning(transaction));
}

/**
 * Get the transactions related to a report preview with receipts
 * Get the details linked to the IOU reportAction
 *
 * NOTE: This method is only meant to be used inside this action file. Do not export and use it elsewhere. Use useOnyx instead.
 */
function getLinkedTransaction(reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>, transactions?: Transaction[]): OnyxEntry<Transaction> {
    let transactionID: string | undefined;

    if (isMoneyRequestAction(reportAction)) {
        transactionID = getOriginalMessage(reportAction)?.IOUTransactionID;
    }

    return transactions ? transactions.find((transaction) => transaction.transactionID === transactionID) : allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
}

/**
 * Get report action which is missing smartscan fields
 */
function getReportActionWithMissingSmartscanFields(report: OnyxEntry<Report>, iouReportID: string | undefined): ReportAction | undefined {
    const reportActions = Object.values(getAllReportActions(iouReportID));
    return reportActions.find((action) => {
        if (!isMoneyRequestAction(action)) {
            return false;
        }
        const transaction = getLinkedTransaction(action);
        if (isEmptyObject(transaction)) {
            return false;
        }
        if (!wasActionTakenByCurrentUser(action)) {
            return false;
        }
        return hasMissingSmartscanFieldsTransactionUtils(transaction, report);
    });
}

/**
 * Check if iouReportID has required missing fields
 */
function shouldShowRBRForMissingSmartscanFields(report: OnyxEntry<Report>, iouReportID: string | undefined): boolean {
    return !!getReportActionWithMissingSmartscanFields(report, iouReportID);
}

/**
 * Given a parent IOU report action get report name for the LHN.
 */
function getTransactionReportName({
    reportAction,
    transactions,
    reports,
}: {
    reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>;
    transactions?: Transaction[];
    reports?: Report[];
}): string {
    if (reportAction && isReversedTransaction(reportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.reversedTransaction');
    }

    if (reportAction && isDeletedAction(reportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedExpense');
    }

    const transaction = reportAction ? getLinkedTransaction(reportAction, transactions) : transactions?.at(0);

    if (isEmptyObject(transaction)) {
        // Transaction data might be empty on app's first load, if so we fallback to Expense/Track Expense
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return isTrackExpenseAction(reportAction) ? translateLocal('iou.createExpense') : translateLocal('iou.expense');
    }

    if (isScanning(transaction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.receiptScanning', {count: 1});
    }

    const report = getReportOrDraftReport(transaction?.reportID, reports);
    if (hasMissingSmartscanFieldsTransactionUtils(transaction, report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.receiptMissingDetails');
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isFetchingWaypointsFromServer(transaction) && getMerchant(transaction) === translateLocal('iou.fieldPending')) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.fieldPending');
    }

    // The unit does not matter as we are only interested in whether the distance is zero or not
    if (isMapDistanceRequest(transaction) && !getDistanceInMeters(transaction, CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('violations.noRoute');
    }

    if (isSentMoneyReportAction(reportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getIOUReportActionDisplayMessage(translateLocal, reportAction as ReportAction, transaction);
    }

    const amount = getTransactionAmount(transaction, !isEmptyObject(report) && isExpenseReport(report), transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) ?? 0;
    const formattedAmount = convertToDisplayString(amount, getCurrency(transaction)) ?? '';
    const comment = getMerchantOrDescription(transaction);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.threadExpenseReportName', {formattedAmount, comment: Parser.htmlToText(comment)});
}

/**
 * Get expense message for an IOU report
 *
 * @param [iouReportAction] This is always an IOU action. When necessary, report preview actions will be unwrapped and the child iou report action is passed here (the original report preview
 *     action will be passed as `originalReportAction` in this case).
 * @param [originalReportAction] This can be either a report preview action or the IOU action. This will be the original report preview action in cases where `iouReportAction` was unwrapped
 *     from a report preview action. Otherwise, it will be the same as `iouReportAction`.
 */
function getReportPreviewMessage(
    reportOrID: OnyxInputOrEntry<Report> | string,
    iouReportAction: OnyxInputOrEntry<ReportAction> = null,
    shouldConsiderScanningReceiptOrPendingRoute = false,
    isPreviewMessageForParentChatReport = false,
    policy?: OnyxInputOrEntry<Policy>,
    isForListPreview = false,
    originalReportAction: OnyxInputOrEntry<ReportAction> = iouReportAction,
    isCopyAction = false,
): string {
    const report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    const reportActionMessage = getReportActionHtml(iouReportAction);
    if (isCopyAction && report) {
        return computeReportName(report) || (originalReportAction?.childReportName ?? '');
    }

    if (isEmptyObject(report) || !report?.reportID) {
        // This iouReport may be unavailable for one of the following reasons:
        // 1. After SignIn, the OpenApp API won't return iouReports if they're settled.
        // 2. The iouReport exists in local storage but hasn't been loaded into the allReports. It will be loaded automatically when the user opens the iouReport.
        // Until we know how to solve this the best, we just display the report action message.
        // If the report is empty, we display the report name to avoid showing "payer owes 0"
        return !!originalReportAction?.childReportName && originalReportAction?.childMoneyRequestCount === 0 ? originalReportAction?.childReportName : reportActionMessage;
    }

    const allReportTransactions = getReportTransactions(report.reportID);
    const transactionsWithReceipts = allReportTransactions.filter(hasReceiptTransactionUtils);
    const numberOfScanningReceipts = transactionsWithReceipts.filter(isScanning).length;

    if (!isEmptyObject(iouReportAction) && !isIOUReport(report) && iouReportAction && isSplitBillReportAction(iouReportAction)) {
        // This covers group chats where the last action is a split expense action
        const linkedTransaction = getLinkedTransaction(iouReportAction);
        if (isEmptyObject(linkedTransaction)) {
            return reportActionMessage;
        }

        if (!isEmptyObject(linkedTransaction)) {
            if (isScanning(linkedTransaction)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.receiptScanning', {count: 1});
            }

            if (hasMissingSmartscanFieldsTransactionUtils(linkedTransaction, report)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.receiptMissingDetails');
            }

            const amount = getTransactionAmount(linkedTransaction, !isEmptyObject(report) && isExpenseReport(report), linkedTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) ?? 0;
            const formattedAmount = convertToDisplayString(amount, getCurrency(linkedTransaction)) ?? '';
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.didSplitAmount', formattedAmount, getMerchantOrDescription(linkedTransaction));
        }
    }

    if (!isEmptyObject(iouReportAction) && !isIOUReport(report) && !isExpenseReport(report) && iouReportAction && isTrackExpenseAction(iouReportAction)) {
        // This covers group chats where the last action is a track expense action
        const linkedTransaction = getLinkedTransaction(iouReportAction);
        if (isEmptyObject(linkedTransaction)) {
            const originalMessage = getOriginalMessage(iouReportAction);
            const amount = originalMessage?.amount;
            const currency = originalMessage?.currency;
            const comment = originalMessage?.comment;

            if (amount && currency) {
                const formattedAmount = convertToDisplayString(amount, currency);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.trackedAmount', formattedAmount, comment);
            }

            return reportActionMessage;
        }

        if (!isEmptyObject(linkedTransaction)) {
            if (isScanning(linkedTransaction)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.receiptScanning', {count: 1});
            }

            if (hasMissingSmartscanFieldsTransactionUtils(linkedTransaction, report)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.receiptMissingDetails');
            }

            const amount = getTransactionAmount(linkedTransaction, !isEmptyObject(report) && isExpenseReport(report), linkedTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) ?? 0;
            const formattedAmount = convertToDisplayString(amount, getCurrency(linkedTransaction)) ?? '';
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.trackedAmount', formattedAmount, getMerchantOrDescription(linkedTransaction));
        }
    }

    const containsNonReimbursable = hasNonReimbursableTransactions(report.reportID);
    const {totalDisplaySpend: totalAmount} = getMoneyRequestSpendBreakdown(report);

    const parentReport = getParentReport(report);
    const policyName = getPolicyName({report: parentReport ?? report, policy});
    const payerName = isExpenseReport(report)
        ? policyName
        : getDisplayNameForParticipant({accountID: report.managerID, shouldUseShortForm: !isPreviewMessageForParentChatReport, formatPhoneNumber: formatPhoneNumberPhoneUtils});

    const formattedAmount = convertToDisplayString(totalAmount, report.currency);

    if (isReportApproved({report}) && isPaidGroupPolicy(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.managerApprovedAmount', {
            manager: payerName ?? '',
            amount: formattedAmount,
        });
    }

    const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];

    let linkedTransaction;
    if (!isEmptyObject(iouReportAction) && shouldConsiderScanningReceiptOrPendingRoute && iouReportAction && isMoneyRequestAction(iouReportAction)) {
        linkedTransaction = getLinkedTransaction(iouReportAction);
    }

    if (!isEmptyObject(linkedTransaction) && isScanning(linkedTransaction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.receiptScanning', {count: numberOfScanningReceipts});
    }

    if (!isEmptyObject(linkedTransaction) && isFetchingWaypointsFromServer(linkedTransaction) && !getTransactionAmount(linkedTransaction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.fieldPending');
    }

    const originalMessage = !isEmptyObject(iouReportAction) && isMoneyRequestAction(iouReportAction) ? getOriginalMessage(iouReportAction) : undefined;

    // Show Paid preview message if it's settled or if the amount is paid & stuck at receivers end for only chat reports.
    if (isSettled(report.reportID) || (report.isWaitingOnBankAccount && isPreviewMessageForParentChatReport)) {
        // A settled report preview message can come in three formats "paid ... elsewhere" or "paid ... with Expensify"
        let translatePhraseKey: TranslationPaths = 'iou.paidElsewhere';
        if (isPreviewMessageForParentChatReport) {
            translatePhraseKey = 'iou.payerPaidAmount';
        } else if (
            [CONST.IOU.PAYMENT_TYPE.VBBA, CONST.IOU.PAYMENT_TYPE.EXPENSIFY].some((paymentType) => paymentType === originalMessage?.paymentType) ||
            !!reportActionMessage.match(/ (with Expensify|using Expensify)$/) ||
            report.isWaitingOnBankAccount
        ) {
            translatePhraseKey = 'iou.paidWithExpensify';
            const isFromInvoice = !!originalMessage?.bankAccountID;
            if (originalMessage?.automaticAction) {
                translatePhraseKey = 'iou.automaticallyPaidWithExpensify';
            }

            if (originalMessage?.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                translatePhraseKey = 'iou.businessBankAccount';
            }

            if (isFromInvoice) {
                translatePhraseKey = originalMessage?.payAsBusiness ? 'iou.settleInvoiceBusiness' : 'iou.settleInvoicePersonal';
                const currentBankAccount = getBankAccountFromID(originalMessage?.bankAccountID);
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal(translatePhraseKey, formattedAmount, currentBankAccount?.accountData?.accountNumber?.slice(-4) ?? '');
            }
        }

        const payerAccountID = iouReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? iouReportAction?.actorAccountID : report.managerID;
        let actualPayerName =
            report.managerID === currentUserAccountID && !isForListPreview
                ? ''
                : getDisplayNameForParticipant({accountID: payerAccountID, shouldUseShortForm: true, formatPhoneNumber: formatPhoneNumberPhoneUtils});

        actualPayerName = actualPayerName && isForListPreview && !isPreviewMessageForParentChatReport ? `${actualPayerName}:` : actualPayerName;
        const payerDisplayName = isPreviewMessageForParentChatReport ? payerName : actualPayerName;
        if (translatePhraseKey === 'iou.businessBankAccount') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(translatePhraseKey, '', reportPolicy?.achAccount?.accountNumber?.slice(-4) ?? '');
        }
        if (translatePhraseKey === 'iou.automaticallyPaidWithExpensify' || translatePhraseKey === 'iou.paidWithExpensify') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(translatePhraseKey, payerDisplayName ?? '');
        }
        if (translatePhraseKey === 'iou.paidElsewhere') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(translatePhraseKey, {payer: payerDisplayName ?? undefined});
        }
        if (translatePhraseKey === 'iou.payerPaidAmount') {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal(translatePhraseKey, formattedAmount, payerDisplayName ?? '');
        }
    }

    if (report.isWaitingOnBankAccount) {
        const submitterDisplayName = getDisplayNameForParticipant({accountID: report.ownerAccountID, shouldUseShortForm: true, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.waitingOnBankAccount', {submitterDisplayName});
    }

    const lastActorID = iouReportAction?.actorAccountID;
    let amount = originalMessage?.amount;
    let currency = originalMessage?.currency ? originalMessage?.currency : report.currency;

    if (!isEmptyObject(linkedTransaction)) {
        amount = getTransactionAmount(linkedTransaction, isExpenseReport(report));
        currency = getCurrency(linkedTransaction);
    }

    if (isEmptyObject(linkedTransaction) && !isEmptyObject(iouReportAction)) {
        linkedTransaction = getLinkedTransaction(iouReportAction);
    }

    let comment = !isEmptyObject(linkedTransaction) ? getMerchantOrDescription(linkedTransaction) : undefined;
    if (!isEmptyObject(originalReportAction) && isReportPreviewAction(originalReportAction) && getNumberOfMoneyRequests(originalReportAction) !== 1) {
        comment = undefined;
    }

    // if we have the amount in the originalMessage and lastActorID, we can use that to display the preview message for the latest expense
    if (amount !== undefined && lastActorID && !isPreviewMessageForParentChatReport) {
        const amountToDisplay = convertToDisplayString(Math.abs(amount), currency);

        // We only want to show the actor name in the preview if it's not the current user who took the action
        const requestorName =
            lastActorID && lastActorID !== currentUserAccountID
                ? getDisplayNameForParticipant({accountID: lastActorID, shouldUseShortForm: !isPreviewMessageForParentChatReport, formatPhoneNumber: formatPhoneNumberPhoneUtils})
                : '';
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return `${requestorName ? `${requestorName}: ` : ''}${translateLocal('iou.expenseAmount', amountToDisplay, comment)}`;
    }

    if (containsNonReimbursable) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal(
            'iou.payerSpentAmount',
            formattedAmount,
            getDisplayNameForParticipant({accountID: report.ownerAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils}) ?? '',
        );
    }
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return translateLocal('iou.payerOwesAmount', formattedAmount, payerName ?? '', comment);
}

/**
 * Given the updates user made to the expense, compose the originalMessage
 * object of the modified expense action.
 *
 * At the moment, we only allow changing one transaction field at a time.
 */
function getModifiedExpenseOriginalMessage(
    oldTransaction: OnyxInputOrEntry<Transaction>,
    transactionChanges: TransactionChanges,
    isFromExpenseReport: boolean,
    policy: OnyxInputOrEntry<Policy>,
    updatedTransaction?: OnyxInputOrEntry<Transaction>,
    allowNegative = false,
): OriginalMessageModifiedExpense {
    const originalMessage: OriginalMessageModifiedExpense = {};
    // Remark: Comment field is the only one which has new/old prefixes for the keys (newComment/ oldComment),
    // all others have old/- pattern such as oldCreated/created
    if ('comment' in transactionChanges) {
        originalMessage.oldComment = getDescription(oldTransaction);
        originalMessage.newComment = transactionChanges?.comment;
    }
    if ('created' in transactionChanges) {
        originalMessage.oldCreated = getFormattedCreated(oldTransaction);
        originalMessage.created = transactionChanges?.created;
    }
    if ('merchant' in transactionChanges) {
        originalMessage.oldMerchant = getMerchant(oldTransaction);
        originalMessage.merchant = transactionChanges?.merchant;
    }
    if ('attendees' in transactionChanges) {
        originalMessage.oldAttendees = getAttendees(oldTransaction, currentUserPersonalDetails);
        originalMessage.newAttendees = transactionChanges?.attendees;
    }

    // The amount is always a combination of the currency and the number value so when one changes we need to store both
    // to match how we handle the modified expense action in oldDot
    const didAmountOrCurrencyChange = 'amount' in transactionChanges || 'currency' in transactionChanges;
    if (didAmountOrCurrencyChange) {
        originalMessage.oldAmount = getTransactionAmount(oldTransaction, isFromExpenseReport, false, allowNegative);
        originalMessage.amount = transactionChanges?.amount ?? transactionChanges.oldAmount;
        originalMessage.oldCurrency = getCurrency(oldTransaction);
        originalMessage.currency = transactionChanges?.currency ?? transactionChanges.oldCurrency;
    }

    if ('category' in transactionChanges) {
        originalMessage.oldCategory = getCategory(oldTransaction);
        originalMessage.category = transactionChanges?.category;
    }

    if ('tag' in transactionChanges) {
        originalMessage.oldTag = getTag(oldTransaction);
        originalMessage.tag = transactionChanges?.tag;
    }

    // We only want to display a tax rate update system message when tax rate is updated by user.
    // Tax rate can change as a result of currency update. In such cases, we want to skip displaying a system message, as discussed.
    const didTaxCodeChange = 'taxCode' in transactionChanges;
    if (didTaxCodeChange && !didAmountOrCurrencyChange) {
        originalMessage.oldTaxRate = policy?.taxRates?.taxes[getTaxCode(oldTransaction)]?.value;
        originalMessage.taxRate = transactionChanges?.taxCode && policy?.taxRates?.taxes[transactionChanges?.taxCode]?.value;
    }

    // We only want to display a tax amount update system message when tax amount is updated by user.
    // Tax amount can change as a result of amount, currency or tax rate update. In such cases, we want to skip displaying a system message, as discussed.
    if ('taxAmount' in transactionChanges && !(didAmountOrCurrencyChange || didTaxCodeChange)) {
        originalMessage.oldTaxAmount = getTaxAmount(oldTransaction, isFromExpenseReport);
        originalMessage.taxAmount = transactionChanges?.taxAmount;
        originalMessage.currency = getCurrency(oldTransaction);
    }

    if ('reimbursable' in transactionChanges) {
        const oldReimbursable = getReimbursable(oldTransaction);
        originalMessage.oldReimbursable = oldReimbursable ? 'reimbursable' : 'non-reimbursable';
        originalMessage.reimbursable = transactionChanges?.reimbursable ? 'reimbursable' : 'non-reimbursable';
    }

    if ('billable' in transactionChanges) {
        const oldBillable = getBillable(oldTransaction);
        originalMessage.oldBillable = oldBillable ? 'billable' : 'non-billable';
        originalMessage.billable = transactionChanges?.billable ? 'billable' : 'non-billable';
    }

    if (
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ('customUnitRateID' in transactionChanges && updatedTransaction?.comment?.customUnit?.customUnitRateID) ||
        ('distance' in transactionChanges && updatedTransaction?.comment?.customUnit?.quantity)
    ) {
        originalMessage.oldAmount = getTransactionAmount(oldTransaction, isFromExpenseReport, false, true);
        originalMessage.oldCurrency = getCurrency(oldTransaction);
        originalMessage.oldMerchant = getMerchant(oldTransaction);

        // For the originalMessage, we should use the non-negative amount, similar to what getAmount does for oldAmount
        originalMessage.amount = Math.abs(Number(updatedTransaction?.modifiedAmount ?? 0));
        originalMessage.currency = updatedTransaction?.modifiedCurrency ?? CONST.CURRENCY.USD;
        originalMessage.merchant = updatedTransaction?.modifiedMerchant;
    }

    return originalMessage;
}

/**
 * Check if original message is an object and can be used as a ChangeLog type
 * @param originalMessage
 */
function isChangeLogObject(originalMessage?: OriginalMessageChangeLog): OriginalMessageChangeLog | undefined {
    if (originalMessage && typeof originalMessage === 'object') {
        return originalMessage;
    }
    return undefined;
}

/**
 * Build invited usernames for admin chat threads
 * @param parentReportAction
 * @param parentReportActionMessage
 */
function getAdminRoomInvitedParticipants(translate: LocalizedTranslate, parentReportAction: OnyxEntry<ReportAction>, parentReportActionMessage: string) {
    if (isEmptyObject(parentReportAction)) {
        return parentReportActionMessage || translate('parentReportAction.deletedMessage');
    }
    if (!getOriginalMessage(parentReportAction)) {
        return parentReportActionMessage || translate('parentReportAction.deletedMessage');
    }
    if (!isPolicyChangeLogAction(parentReportAction) && !isRoomChangeLogAction(parentReportAction)) {
        return parentReportActionMessage || translate('parentReportAction.deletedMessage');
    }

    const originalMessage = isChangeLogObject(getOriginalMessage(parentReportAction));
    const personalDetails = getPersonalDetailsByIDs({accountIDs: originalMessage?.targetAccountIDs ?? [], currentUserAccountID: 0});

    const participants = personalDetails.map((personalDetail) => {
        const name = getEffectiveDisplayName(formatPhoneNumberPhoneUtils, personalDetail);
        if (name && name?.length > 0) {
            return name;
        }
        return translate('common.hidden');
    });
    const users = participants.length > 1 ? participants.join(` ${translate('common.and')} `) : participants.at(0);
    if (!users) {
        return parentReportActionMessage;
    }
    const actionType = parentReportAction.actionName;
    const isInviteAction = actionType === CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.INVITE_TO_ROOM || actionType === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.INVITE_TO_ROOM;

    const verbKey = isInviteAction ? 'workspace.invite.invited' : 'workspace.invite.removed';
    const prepositionKey = isInviteAction ? 'workspace.invite.to' : 'workspace.invite.from';
    const verb = translate(verbKey);
    const preposition = translate(prepositionKey);

    const roomName = originalMessage?.roomName ?? '';

    return roomName ? `${verb} ${users} ${preposition} ${roomName}` : `${verb} ${users}`;
}

/**
 * Parse html of reportAction into text
 */
function parseReportActionHtmlToText(reportAction: OnyxEntry<ReportAction>, reportID: string | undefined, childReportID?: string): string {
    if (!reportAction) {
        return '';
    }
    const key = `${reportID}_${reportAction.reportActionID}_${reportAction.lastModified}`;
    const cachedText = parsedReportActionMessageCache[key];
    if (cachedText !== undefined) {
        return cachedText;
    }

    const {html, text} = getReportActionMessageReportUtils(reportAction) ?? {};

    if (!html) {
        return text ?? '';
    }

    const mentionReportRegex = /<mention-report reportID="?(\d+)"?(?: *\/>|><\/mention-report>)/gi;
    const matches = html.matchAll(mentionReportRegex);

    const reportIDToName: Record<string, string> = {};
    for (const match of matches) {
        if (match[1] !== childReportID) {
            // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
            // eslint-disable-next-line @typescript-eslint/no-use-before-define, @typescript-eslint/no-deprecated
            reportIDToName[match[1]] = getReportName(getReportOrDraftReport(match[1])) ?? '';
        }
    }

    const mentionUserRegex = /(?:<mention-user accountID="?(\d+)"?(?: *\/>|><\/mention-user>))/gi;
    const accountIDToName: Record<string, string> = {};
    const accountIDs = Array.from(html.matchAll(mentionUserRegex), (mention) => Number(mention[1]));
    const logins = getLoginsByAccountIDs(accountIDs);
    for (const [index, id] of accountIDs.entries()) {
        const login = logins.at(index);
        const user = allPersonalDetails?.[id];
        const displayName = formatPhoneNumberPhoneUtils(login ?? '') || getDisplayNameOrDefault(user);
        accountIDToName[id] = getShortMentionIfFound(displayName, id.toString(), currentUserPersonalDetails, login) ?? '';
    }

    const textMessage = Str.removeSMSDomain(Parser.htmlToText(html, {reportIDToName, accountIDToName}));
    parsedReportActionMessageCache[key] = textMessage;

    return textMessage;
}

/**
 * Get the report action message for a report action.
 */
function getReportActionMessage({
    reportAction,
    translate,
    formatPhoneNumber,
    reportID,
    childReportID,
    reports,
    personalDetails,
}: {
    reportAction: OnyxEntry<ReportAction>;
    translate: LocalizedTranslate;
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'];
    reportID?: string;
    childReportID?: string;
    reports?: Report[];
    personalDetails?: Partial<PersonalDetailsList>;
}) {
    if (isEmptyObject(reportAction)) {
        return '';
    }
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
        return translate('iou.heldExpense');
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        return getExportIntegrationLastMessageText(translate, reportAction);
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
        return translate('iou.unheldExpense');
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
        return translate('iou.reject.reportActions.rejectedExpense');
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
        return translate('iou.reject.reportActions.markedAsResolved');
    }

    if (isApprovedOrSubmittedReportAction(reportAction) || isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        return getReportActionMessageText(reportAction);
    }
    if (isReimbursementQueuedAction(reportAction)) {
        return getReimbursementQueuedActionMessage({
            reportAction,
            report: getReportOrDraftReport(reportID, reports),
            translate,
            formatPhoneNumber,
            shouldUseShortDisplayName: false,
            personalDetails,
        });
    }
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED) {
        return translate('iou.receiptScanningFailed');
    }

    if (isReimbursementDeQueuedOrCanceledAction(reportAction)) {
        return getReimbursementDeQueuedOrCanceledActionMessage(translate, reportAction, getReportOrDraftReport(reportID, reports));
    }

    return parseReportActionHtmlToText(reportAction, reportID, childReportID);
}

/**
 * Get the title for a report.
 * @deprecated Moved to src/libs/ReportNameUtils.ts.
 * Use ReportNameUtils.computeReportName for full name generation.
 * For reading a stored name only, use ReportNameUtils.getReportName.
 */
function getReportName(
    report: OnyxEntry<Report>,
    policy?: OnyxEntry<Policy>,
    parentReportActionParam?: OnyxInputOrEntry<ReportAction>,
    personalDetails?: Partial<PersonalDetailsList>,
    invoiceReceiverPolicy?: OnyxEntry<Policy>,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
    transactions?: Transaction[],
    isReportArchived?: boolean,
    reports?: Report[],
    policies?: Policy[],
): string {
    // Check if we can use report name in derived values - only when we have report but no other params
    const canUseDerivedValue =
        report && policy === undefined && parentReportActionParam === undefined && personalDetails === undefined && invoiceReceiverPolicy === undefined && isReportArchived === undefined;
    const attributes = reportAttributes ?? reportAttributesDerivedValue;
    const derivedNameExists = report && !!attributes?.[report.reportID]?.reportName;
    if (canUseDerivedValue && derivedNameExists) {
        return attributes[report.reportID].reportName;
    }

    let formattedName: string | undefined;
    let parentReportAction: OnyxEntry<ReportAction>;
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`];
    if (parentReportActionParam) {
        parentReportAction = parentReportActionParam;
    } else {
        parentReportAction = isThread(report) ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`]?.[report.parentReportActionID] : undefined;
    }
    const parentReportActionMessage = getReportActionMessageReportUtils(parentReportAction);
    const isArchivedNonExpense = isArchivedNonExpenseReport(report, isReportArchived);

    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        isMarkAsClosedAction(parentReportAction)
    ) {
        const harvesting = !isMarkAsClosedAction(parentReportAction) ? (getOriginalMessage(parentReportAction)?.harvesting ?? false) : false;
        if (harvesting) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallySubmitted');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.submitted', {memo: getOriginalMessage(parentReportAction)?.message});
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallyForwarded');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.forwarded');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.rejectedThisReport');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.retracted');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.reopened');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.upgradedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.downgradedWorkspace');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspaceActions.forcedCorporateUpgrade');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceCurrencyUpdateMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceUpdateFieldMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FEATURE_ENABLED) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceFeatureEnabledMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ACH_ACCOUNT) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getUpdateACHAccountMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('systemMessage.mergedWithCashTransaction');
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return Str.htmlDecode(getWorkspaceNameUpdatedMessage(translateLocal, parentReportAction));
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceFrequencyUpdateMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceReportFieldAddMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceReportFieldUpdateMessage(translateLocal, parentReportAction);
    }
    if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceReportFieldDeleteMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return Parser.htmlToText(getUnreportedTransactionMessage(translateLocal, parentReportAction));
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return Parser.htmlToText(getMovedTransactionMessage(translateLocal, parentReportAction));
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogMaxExpenseAmountMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AGE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogMaxExpenseAgeMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceReimbursementUpdateMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogDefaultBillableMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogDefaultReimbursableMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogDefaultTitleEnforcedMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeLogDefaultTitleMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceAttendeeTrackingUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_APPROVER)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getDefaultApproverUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_SUBMITS_TO)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getSubmitsToUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FORWARDS_TO)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getForwardsToUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_NAME)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getInvoiceCompanyNameUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_INVOICE_COMPANY_WEBSITE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getInvoiceCompanyWebsiteUpdateMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSER)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getReimburserUpdateMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT) && getOriginalMessage(parentReportAction)?.resolution) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getActionableCardFraudAlertResolutionMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_ADDRESS)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getCompanyAddressUpdateMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
        return getMarkedReimbursedMessage(parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getPolicyChangeMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getChangedApproverActionMessage(translateLocal, parentReportAction);
    }

    if (parentReportAction?.actionName && isTagModificationAction(parentReportAction?.actionName)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getCleanedTagName(getWorkspaceTagUpdateMessage(translateLocal, parentReportAction) ?? '');
    }

    if (isMovedAction(parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getMovedActionMessage(translateLocal, parentReportAction, parentReport);
    }

    if (
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX) ||
        isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX)
    ) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceTaxUpdateMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getDismissedViolationMessageText(translateLocal, getOriginalMessage(parentReportAction));
    }

    if (isMoneyRequestAction(parentReportAction)) {
        const originalMessage = getOriginalMessage(parentReportAction);
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        const last4Digits = reportPolicy?.achAccount?.accountNumber?.slice(-4) ?? '';

        if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.paidElsewhere');
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                if (originalMessage.automaticAction) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('iou.automaticallyPaidWithBusinessBankAccount', undefined, last4Digits);
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.businessBankAccount', undefined, last4Digits);
            }
            if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                if (originalMessage.automaticAction) {
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    return translateLocal('iou.automaticallyPaidWithExpensify');
                }
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return translateLocal('iou.paidWithExpensify');
            }
        }
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
        const {automaticAction} = getOriginalMessage(parentReportAction) ?? {};
        if (automaticAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('iou.automaticallyApproved');
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.approvedMessage');
    }
    if (isUnapprovedAction(parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('iou.unapproved');
    }

    if (isActionableJoinRequest(parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getJoinRequestMessage(translateLocal, parentReportAction);
    }

    if (isTaskReport(report) && isCanceledTaskReport(report, parentReportAction)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedTask');
    }

    if (isTaskReport(report)) {
        return Parser.htmlToText(report?.reportName ?? '').trim();
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getIntegrationSyncFailedMessage(translateLocal, parentReportAction, report?.policyID);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getCompanyCardConnectionBrokenMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getTravelUpdateMessage(translateLocal, parentReportAction);
    }

    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceCustomUnitRateAddedMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceCustomUnitRateUpdatedMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getWorkspaceCustomUnitRateDeletedMessage(translateLocal, parentReportAction);
    }
    if (isActionOfType(parentReportAction, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
        const {originalID} = getOriginalMessage(parentReportAction) ?? {};
        const originalReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalID}`];
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- temporarily disabling rule for deprecated functions out of issue scope
        const reportName = getReportName(originalReport);
        // eslint-disable-next-line @typescript-eslint/no-deprecated -- temporarily disabling rule for deprecated functions out of issue scope
        return getCreatedReportForUnapprovedTransactionsMessage(originalID, reportName, translateLocal);
    }

    if (isChatThread(report)) {
        if (!isEmptyObject(parentReportAction) && isTransactionThread(parentReportAction)) {
            formattedName = getTransactionReportName({reportAction: parentReportAction, transactions, reports});

            if (isArchivedNonExpense) {
                formattedName = generateArchivedReportName(formattedName);
            }
            return formatReportLastMessageText(formattedName);
        }

        if (!isEmptyObject(parentReportAction) && isOldDotReportAction(parentReportAction)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return getMessageOfOldDotReportAction(translateLocal, parentReportAction);
        }

        if (isRenamedAction(parentReportAction)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return getRenamedAction(translateLocal, parentReportAction, isExpenseReport(getReport(report.parentReportID, allReports)));
        }

        if (parentReportActionMessage?.isDeletedParentAction) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('parentReportAction.deletedMessage');
        }

        if (parentReportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('violations.resolvedDuplicates');
        }

        const isAttachment = isReportActionAttachment(!isEmptyObject(parentReportAction) ? parentReportAction : undefined);
        const reportActionMessage = getReportActionMessage({
            reportAction: parentReportAction,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translate: translateLocal,
            formatPhoneNumber: formatPhoneNumberPhoneUtils,
            reportID: report?.parentReportID,
            childReportID: report?.reportID,
            reports,
            personalDetails,
        }).replaceAll(/(\n+|\r\n|\n|\r)/gm, ' ');
        if (isAttachment && reportActionMessage) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return `[${translateLocal('common.attachment')}]`;
        }
        if (
            parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE ||
            parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN ||
            parentReportActionMessage?.moderationDecision?.decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE
        ) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('parentReportAction.hiddenMessage');
        }
        if (isAdminRoom(report) || isUserCreatedPolicyRoom(report)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return getAdminRoomInvitedParticipants(translateLocal, parentReportAction, reportActionMessage);
        }

        if (reportActionMessage && isArchivedNonExpense) {
            return generateArchivedReportName(reportActionMessage);
        }
        if (!isEmptyObject(parentReportAction) && isModifiedExpenseAction(parentReportAction)) {
            const policyID = report?.policyID;

            const movedFromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.FROM)}`];
            const movedToReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${getMovedReportID(parentReportAction, CONST.REPORT.MOVE_TYPE.TO)}`];
            const modifiedMessage = getForReportAction({
                reportAction: parentReportAction,
                policyID,
                movedFromReport,
                movedToReport,
            });
            return formatReportLastMessageText(modifiedMessage);
        }
        if (isTripRoom(report) && report?.reportName !== CONST.REPORT.DEFAULT_REPORT_NAME) {
            return report?.reportName ?? '';
        }
        if (isCardIssuedAction(parentReportAction)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return getCardIssuedMessage({reportAction: parentReportAction, translate: translateLocal});
        }
        return reportActionMessage;
    }

    if (isClosedExpenseReportWithNoExpenses(report, transactions)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('parentReportAction.deletedReport');
    }

    if (isGroupChat(report)) {
        return getGroupChatName(formatPhoneNumberPhoneUtils, undefined, true, report) ?? '';
    }

    if (isChatRoom(report)) {
        formattedName = report?.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName({report, personalDetailsList: personalDetails});
    }

    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName({report, policy});
    }

    if (isInvoiceReport(report)) {
        formattedName = getInvoiceReportName(report, policy, invoiceReceiverPolicy);
    }

    if (isInvoiceRoom(report)) {
        formattedName = getInvoicesChatName({
            report,
            receiverPolicy: invoiceReceiverPolicy,
            personalDetails,
            policies,
            currentUserAccountID,
        });
    }

    if (isSelfDM(report)) {
        formattedName = getDisplayNameForParticipant({
            accountID: currentUserAccountID,
            shouldAddCurrentUserPostfix: true,
            personalDetailsData: personalDetails,
            formatPhoneNumber: formatPhoneNumberPhoneUtils,
        });
    }

    if (isConciergeChatReport(report)) {
        formattedName = CONST.CONCIERGE_DISPLAY_NAME;
    }

    if (formattedName) {
        return formatReportLastMessageText(isArchivedNonExpense ? generateArchivedReportName(formattedName) : formattedName);
    }

    // Not a room or PolicyExpenseChat, generate title from first 5 other participants
    formattedName = buildReportNameFromParticipantNames({report, personalDetailsList: personalDetails, currentUserAccountID});

    const finalName = formattedName || (report?.reportName ?? '');

    return isArchivedNonExpense ? generateArchivedReportName(finalName) : finalName;
}

/**
 * @deprecated Moved to src/libs/ReportNameUtils.ts.
 * Use ReportNameUtils.computeReportName(...) in search contexts instead.
 * @param props
 */
function getSearchReportName(props: GetReportNameParams): string {
    const {report, policy} = props;
    if (isChatThread(report) && policy?.name) {
        // Traverse up the parent chain to find the first expense report
        // If found, return the expense report name instead of workspace name
        let currentParent = getParentReport(report);
        const visitedReportIDs = new Set<string>();

        while (currentParent) {
            if (!currentParent.reportID) {
                break;
            }
            if (visitedReportIDs.has(currentParent.reportID)) {
                break;
            }
            visitedReportIDs.add(currentParent.reportID);

            if (isExpenseReport(currentParent)) {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                return getReportName(
                    currentParent,
                    policy,
                    props.parentReportActionParam,
                    props.personalDetails,
                    props.invoiceReceiverPolicy,
                    undefined,
                    props.transactions,
                    props.isReportArchived,
                    props.reports,
                    props.policies,
                );
            }

            // Continue traversing up the parent chain
            currentParent = getParentReport(currentParent);
        }

        return policy.name;
    }
    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return getReportName(
        report,
        policy,
        props.parentReportActionParam,
        props.personalDetails,
        props.invoiceReceiverPolicy,
        undefined,
        props.transactions,
        props.isReportArchived,
        props.reports,
        props.policies,
    );
}

/**
 * Get the payee name given a report.
 */
function getPayeeName(report: OnyxEntry<Report>): string | undefined {
    if (isEmptyObject(report)) {
        return undefined;
    }

    const participantsWithoutCurrentUser = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserAccountID);

    if (participantsWithoutCurrentUser.length === 0) {
        return undefined;
    }
    return getDisplayNameForParticipant({accountID: participantsWithoutCurrentUser.at(0), shouldUseShortForm: true, formatPhoneNumber: formatPhoneNumberPhoneUtils});
}

function getReportSubtitlePrefix(report: OnyxEntry<Report>): string {
    if ((!isChatRoom(report) && !isPolicyExpenseChat(report)) || isThread(report)) {
        return '';
    }

    const filteredPolicies = Object.values(allPolicies ?? {}).filter((policy) => shouldShowPolicy(policy, false, currentUserEmail));
    if (filteredPolicies.length < 2) {
        return '';
    }

    const policyName = getPolicyName({report, returnEmptyIfNotFound: true});
    if (!policyName) {
        return '';
    }
    return `${policyName} ${CONST.DOT_SEPARATOR} `;
}

/**
 * Get either the policyName or domainName the chat is tied to
 */
function getChatRoomSubtitle(report: OnyxEntry<Report>, isPolicyNamePreferred = false, isReportArchived = false): string | undefined {
    if (isChatThread(report)) {
        return '';
    }
    if (isSelfDM(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('reportActionsView.yourSpace');
    }
    if (isInvoiceRoom(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('workspace.common.invoices');
    }
    if (isConciergeChatReport(report)) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return translateLocal('reportActionsView.conciergeSupport');
    }
    if (!isDefaultRoom(report) && !isUserCreatedPolicyRoom(report) && !isPolicyExpenseChat(report)) {
        return '';
    }
    if (getChatType(report) === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return report?.reportName?.substring(1) ?? '';
    }
    if ((isPolicyExpenseChat(report) && !!report?.isOwnPolicyExpenseChat) || isExpenseReport(report)) {
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        const submitToAccountID = getSubmitToAccountID(policy, report);
        const submitsToAccountDetails = allPersonalDetails?.[submitToAccountID];
        const subtitle = submitsToAccountDetails?.displayName ?? submitsToAccountDetails?.login;

        if (!subtitle || !isPolicyNamePreferred) {
            return getPolicyName({report});
        }
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return `${getReportSubtitlePrefix(report)}${translateLocal('iou.submitsTo', {name: subtitle ?? ''})}`;
    }

    if (isReportArchived) {
        return report?.oldPolicyName ?? '';
    }
    return getPolicyName({report});
}

/**
 * Get pending members for reports
 */
function getPendingChatMembers(accountIDs: number[], previousPendingChatMembers: PendingChatMember[], pendingAction: PendingAction): PendingChatMember[] {
    const pendingChatMembers = accountIDs.map((accountID) => ({accountID: accountID.toString(), pendingAction}));
    return [...previousPendingChatMembers, ...pendingChatMembers];
}

/**
 * Gets the parent navigation subtitle for the report
 */
function getParentNavigationSubtitle(report: OnyxEntry<Report>, isParentReportArchived = false, reportAttributes?: ReportAttributesDerivedValue['reports']): ParentNavigationSummaryParams {
    const parentReport = getParentReport(report);

    if (isEmptyObject(parentReport)) {
        const ownerAccountID = report?.ownerAccountID;
        const personalDetails = ownerAccountID ? allPersonalDetails?.[ownerAccountID] : undefined;
        const login = personalDetails ? personalDetails.login : null;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const reportOwnerDisplayName = getDisplayNameForParticipant({accountID: ownerAccountID, shouldRemoveDomain: true, formatPhoneNumber: formatPhoneNumberPhoneUtils}) || login;

        if (isExpenseReport(report)) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                reportName: translateLocal('workspace.common.policyExpenseChatName', {displayName: reportOwnerDisplayName ?? ''}),
                workspaceName: getPolicyName({report}),
            };
        }
        if (isIOUReport(report)) {
            return {reportName: reportOwnerDisplayName ?? ''};
        }
        return {};
    }

    if (isInvoiceReport(report) || isInvoiceRoom(parentReport)) {
        let reportName = `${getPolicyName({report: parentReport})} & ${getInvoicePayerName(parentReport)}`;

        if (isArchivedNonExpenseReport(parentReport, isParentReportArchived)) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            reportName += ` (${translateLocal('common.archived')})`;
        }

        return {
            reportName,
        };
    }

    return {
        // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        reportName: getReportName(parentReport, undefined, undefined, undefined, undefined, reportAttributes),
        workspaceName: getPolicyName({report: parentReport, returnEmptyIfNotFound: true}),
    };
}

/**
 * Navigate to the details page of a given report
 */
function navigateToDetailsPage(report: OnyxEntry<Report>, backTo?: string, shouldUseActiveRoute?: boolean) {
    const isSelfDMReport = isSelfDM(report);
    const isOneOnOneChatReport = isOneOnOneChat(report);
    const participantAccountID = getParticipantsAccountIDsForDisplay(report);

    if (isSelfDMReport || isOneOnOneChatReport) {
        Navigation.navigate(ROUTES.PROFILE.getRoute(participantAccountID.at(0), isSelfDMReport || shouldUseActiveRoute ? Navigation.getActiveRoute() : backTo));
        return;
    }

    if (report?.reportID) {
        Navigation.navigate(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID, backTo));
    }
}

/**
 * Go back to the details page of a given report
 */
function goBackToDetailsPage(report: OnyxEntry<Report>, backTo?: string, shouldGoBackToDetailsPage = false) {
    const isOneOnOneChatReport = isOneOnOneChat(report);
    const participantAccountID = getParticipantsAccountIDsForDisplay(report);

    if (isOneOnOneChatReport) {
        Navigation.goBack(ROUTES.PROFILE.getRoute(participantAccountID.at(0), backTo));
        return;
    }

    if (report?.reportID) {
        if (shouldGoBackToDetailsPage) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report.reportID, backTo));
        } else {
            Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID, backTo));
        }
    } else {
        Log.warn('Missing reportID during navigation back to the details page');
    }
}

function navigateBackOnDeleteTransaction(backRoute: Route | undefined) {
    if (!backRoute) {
        return;
    }

    const rootState = navigationRef.current?.getRootState();
    const lastFullScreenRoute = rootState?.routes.findLast((route) => isFullScreenName(route.name));
    if (lastFullScreenRoute?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR) {
        Navigation.dismissToSuperWideRHP();
        return;
    }
    Navigation.dismissToSuperWideRHP();
    Navigation.isNavigationReady().then(() => {
        Navigation.goBack(backRoute);
    });
}

/**
 * Go back to the previous page from the edit private page of a given report
 */
function goBackFromPrivateNotes(report: OnyxEntry<Report>, accountID?: number, backTo?: string) {
    if (isEmpty(report) || !accountID) {
        return;
    }
    const currentUserPrivateNote = report.privateNotes?.[accountID]?.note ?? '';
    if (isEmpty(currentUserPrivateNote)) {
        const participantAccountIDs = getParticipantsAccountIDsForDisplay(report);

        if (isOneOnOneChat(report)) {
            Navigation.goBack(ROUTES.PROFILE.getRoute(participantAccountIDs.at(0), backTo));
            return;
        }

        if (report?.reportID) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID_DETAILS.getRoute(report?.reportID, backTo));
            return;
        }
    }
    Navigation.goBack(ROUTES.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo));
}

function navigateOnDeleteExpense(backToRoute: Route) {
    const rootState = navigationRef.getRootState();
    const focusedRoute = findFocusedRoute(rootState);
    if (focusedRoute?.params && 'backTo' in focusedRoute.params) {
        Navigation.goBack(focusedRoute.params.backTo as Route);
        return;
    }

    Navigation.goBack(backToRoute);
}

/**
 * Generate a random reportID up to 53 bits aka 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER).
 * There were approximately 98,000,000 reports with sequential IDs generated before we started using this approach, those make up roughly one billionth of the space for these numbers,
 * so we live with the 1 in a billion chance of a collision with an older ID until we can switch to 64-bit IDs.
 *
 * In a test of 500M reports (28 years of reports at our current max rate) we got 20-40 collisions meaning that
 * this is more than random enough for our needs.
 */
function generateReportID(): string {
    return (Math.floor(Math.random() * 2 ** 21) * 2 ** 32 + Math.floor(Math.random() * 2 ** 32)).toString();
}

function hasReportNameError(report: OnyxEntry<Report>): boolean {
    return !isEmptyObject(report?.errorFields?.reportName);
}

/**
 * For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
 * For longer comments, skip parsing, but still escape the text, and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
 */
function getParsedComment(text: string, parsingDetails?: ParsingDetails, mediaAttributes?: Record<string, string>, disabledRules?: string[]): string {
    let isGroupPolicyReport = false;
    if (parsingDetails?.reportID) {
        const currentReport = getReportOrDraftReport(parsingDetails?.reportID);
        isGroupPolicyReport = isReportInGroupPolicy(currentReport);
    }

    if (parsingDetails?.policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policyType = getPolicy(parsingDetails?.policyID)?.type;
        if (policyType) {
            isGroupPolicyReport = isGroupPolicy(policyType);
        }
    }

    const rules = disabledRules ?? [];

    if (text.length > CONST.MAX_MARKUP_LENGTH) {
        return lodashEscape(text);
    }

    return getParsedMessageWithShortMentions({
        text,
        availableMentionLogins: allPersonalDetailLogins,
        userEmailDomain: currentUserPrivateDomain,
        parserOptions: {
            disabledRules: isGroupPolicyReport ? [...rules] : ['reportMentions', ...rules],
            extras: {mediaAttributeCache: mediaAttributes},
        },
    });
}

function getUploadingAttachmentHtml(file?: FileObject): string {
    if (!file || typeof file.uri !== 'string') {
        return '';
    }

    const dataAttributes = [
        `${CONST.ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE}="${file.uri}"`,
        `${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}="${file.uri}"`,
        `${CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE}="${file.name}"`,
        'width' in file && `${CONST.ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE}="${file.width}"`,
        'height' in file && `${CONST.ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE}="${file.height}"`,
    ]
        .filter((x) => !!x)
        .join(' ');

    // file.type is a known mime type like image/png, image/jpeg, video/mp4 etc.
    if (file.type?.startsWith('image')) {
        return `<img src="${file.uri}" alt="${file.name}" ${dataAttributes} />`;
    }
    if (file.type?.startsWith('video')) {
        return `<video src="${file.uri}" ${dataAttributes}>${file.name}</video>`;
    }

    // For all other types, we present a generic download link
    return `<a href="${file.uri}" ${dataAttributes}>${file.name}</a>`;
}

function getReportDescription(report: OnyxEntry<Report>): string {
    if (!report?.description) {
        return '';
    }
    try {
        const reportDescription = report?.description;
        const objectDescription = JSON.parse(reportDescription) as {html: string};
        return objectDescription.html ?? reportDescription ?? '';
    } catch (error) {
        return report?.description ?? '';
    }
}

function getPolicyDescriptionText(policy: OnyxEntry<Policy>): string {
    if (!policy?.description) {
        return '';
    }

    return Parser.htmlToText(policy.description);
}

function buildOptimisticAddCommentReportAction(
    text?: string,
    file?: FileObject,
    actorAccountID?: number,
    createdOffset = 0,
    reportID?: string,
    reportActionID: string = rand64(),
): OptimisticReportAction {
    const commentText = getParsedComment(text ?? '', {reportID});
    const attachmentHtml = getUploadingAttachmentHtml(file);

    const htmlForNewComment = `${commentText}${commentText && attachmentHtml ? '<br /><br />' : ''}${attachmentHtml}`;
    const textForNewComment = Parser.htmlToText(htmlForNewComment);

    const isAttachmentOnly = file && !text;
    const isAttachmentWithText = !!text && file !== undefined;
    const accountID = actorAccountID ?? currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    // Remove HTML from text when applying optimistic offline comment
    return {
        commentText,
        reportAction: {
            reportActionID,
            reportID,
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            actorAccountID: accountID,
            person: [
                {
                    style: 'strong',
                    text: allPersonalDetails?.[accountID]?.displayName ?? currentUserEmail,
                    type: 'TEXT',
                },
            ],
            automatic: false,
            avatar: allPersonalDetails?.[accountID]?.avatar,
            created: NetworkConnection.getDBTimeWithSkew(Date.now() + createdOffset),
            message: [
                {
                    translationKey: isAttachmentOnly ? CONST.TRANSLATION_KEYS.ATTACHMENT : '',
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    html: htmlForNewComment,
                    text: textForNewComment,
                },
            ],
            originalMessage: {
                html: htmlForNewComment,
                whisperedTo: [],
            },
            isFirstItem: false,
            isAttachmentOnly,
            isAttachmentWithText,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            shouldShow: true,
            isOptimisticAction: true,
            delegateAccountID: delegateAccountDetails?.accountID,
        },
    };
}

/**
 * update optimistic parent reportAction when a comment is added or remove in the child report
 * @param parentReportAction - Parent report action of the child report
 * @param lastVisibleActionCreated - Last visible action created of the child report
 * @param type - The type of action in the child report
 */

function updateOptimisticParentReportAction(parentReportAction: OnyxEntry<ReportAction>, lastVisibleActionCreated: string, type: string, deleteBy = 1): UpdateOptimisticParentReportAction {
    let childVisibleActionCount = parentReportAction?.childVisibleActionCount ?? 0;
    let childCommenterCount = parentReportAction?.childCommenterCount ?? 0;
    let childOldestFourAccountIDs = parentReportAction?.childOldestFourAccountIDs;

    if (type === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        childVisibleActionCount += 1;
        const oldestFourAccountIDs = childOldestFourAccountIDs ? childOldestFourAccountIDs.split(',') : [];
        if (oldestFourAccountIDs.length < 4) {
            const index = oldestFourAccountIDs.findIndex((accountID) => accountID === currentUserAccountID?.toString());
            if (index === -1) {
                childCommenterCount += 1;
                oldestFourAccountIDs.push(currentUserAccountID?.toString() ?? '');
            }
        }
        childOldestFourAccountIDs = oldestFourAccountIDs.join(',');
    } else if (type === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        if (childVisibleActionCount > 0) {
            childVisibleActionCount -= deleteBy;
        }

        if (childVisibleActionCount === 0) {
            childCommenterCount = 0;
            childOldestFourAccountIDs = '';
        }
    }

    return {
        childVisibleActionCount,
        childCommenterCount,
        childLastVisibleActionCreated: lastVisibleActionCreated,
        childOldestFourAccountIDs,
    };
}

/**
 * Builds an optimistic reportAction for the parent report when a task is created
 * @param taskReportID - Report ID of the task
 * @param taskTitle - Title of the task
 * @param taskAssigneeAccountID - AccountID of the person assigned to the task
 * @param text - Text of the comment
 * @param parentReportID - Report ID of the parent report
 * @param createdOffset - The offset for task's created time that created via a loop
 */
function buildOptimisticTaskCommentReportAction(
    taskReportID: string,
    taskTitle: string,
    taskAssigneeAccountID: number,
    text: string,
    parentReportID: string | undefined,
    actorAccountID?: number,
    createdOffset = 0,
): OptimisticReportAction {
    const reportAction = buildOptimisticAddCommentReportAction(text, undefined, undefined, createdOffset, taskReportID);
    if (Array.isArray(reportAction.reportAction.message)) {
        const message = reportAction.reportAction.message.at(0);
        if (message) {
            message.taskReportID = taskReportID;
        }
    } else if (!Array.isArray(reportAction.reportAction.message) && reportAction.reportAction.message) {
        reportAction.reportAction.message.taskReportID = taskReportID;
    }

    // These parameters are not saved on the reportAction, but are used to display the task in the UI
    // Added when we fetch the reportActions on a report
    // eslint-disable-next-line
    reportAction.reportAction.originalMessage = {
        html: getReportActionHtml(reportAction.reportAction),
        taskReportID: getReportActionMessageReportUtils(reportAction.reportAction)?.taskReportID,
        whisperedTo: [],
    };
    reportAction.reportAction.childReportID = taskReportID;
    reportAction.reportAction.parentReportID = parentReportID;
    reportAction.reportAction.childType = CONST.REPORT.TYPE.TASK;
    reportAction.reportAction.childReportName = taskTitle;
    reportAction.reportAction.childManagerAccountID = taskAssigneeAccountID;
    reportAction.reportAction.childStatusNum = CONST.REPORT.STATUS_NUM.OPEN;
    reportAction.reportAction.childStateNum = CONST.REPORT.STATE_NUM.OPEN;

    if (actorAccountID) {
        reportAction.reportAction.actorAccountID = actorAccountID;
    }

    return reportAction;
}

function buildOptimisticSelfDMReport(created: string, reportID?: string): Report {
    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportID: reportID || generateReportID(),
        participants: {
            [currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE,
            },
        },
        type: CONST.REPORT.TYPE.CHAT,
        chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        isOwnPolicyExpenseChat: false,
        lastActorAccountID: 0,
        lastMessageHtml: '',
        lastMessageText: undefined,
        lastReadTime: created,
        lastVisibleActionCreated: created,
        ownerAccountID: currentUserAccountID,
        reportName: '',
        stateNum: 0,
        statusNum: 0,
        writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ALL,
    };
}

/**
 * Builds an optimistic IOU report with a randomly generated reportID
 *
 * @param payeeAccountID - AccountID of the person generating the IOU.
 * @param payerAccountID - AccountID of the other person participating in the IOU.
 * @param total - IOU amount in the smallest unit of the currency.
 * @param chatReportID - Report ID of the chat where the IOU is.
 * @param currency - IOU currency.
 * @param isSendingMoney - If we pay someone the IOU should be created as settled
 * @param parentReportActionID - The parent report action ID of the IOU report
 * @param optimisticIOUReportID - Optimistic IOU report id
 */

function buildOptimisticIOUReport(
    payeeAccountID: number,
    payerAccountID: number,
    total: number,
    chatReportID: string | undefined,
    currency: string,
    isSendingMoney = false,
    parentReportActionID?: string,
    optimisticIOUReportID?: string,
    createdTimestamp?: string,
): OptimisticIOUReport {
    const formattedTotal = convertToDisplayString(total, currency);
    const personalDetails = getPersonalDetailsForAccountID(payerAccountID);
    const payerEmail = 'login' in personalDetails ? personalDetails.login : '';
    const policyID = chatReportID ? getReport(chatReportID, allReports)?.policyID : undefined;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);
    const created = createdTimestamp ?? DateUtils.getDBTime();

    const participants: Participants = {
        [payeeAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
        [payerAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN},
    };

    return {
        type: CONST.REPORT.TYPE.IOU,
        chatReportID,
        currency,
        managerID: payerAccountID,
        ownerAccountID: payeeAccountID,
        participants,
        reportID: optimisticIOUReportID ?? generateReportID(),
        stateNum: isSendingMoney ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: isSendingMoney ? CONST.REPORT.STATUS_NUM.REIMBURSED : CONST.REPORT.STATE_NUM.SUBMITTED,
        total,
        unheldTotal: total,
        nonReimbursableTotal: 0,
        unheldNonReimbursableTotal: 0,

        // We don't translate reportName because the server response is always in English
        reportName: `${payerEmail} owes ${formattedTotal}`,
        parentReportID: chatReportID,
        created,
        lastVisibleActionCreated: created,
        fieldList: policy?.fieldList,
        parentReportActionID,
    };
}

function getHumanReadableStatus(statusNum: number): string {
    const status = Object.keys(CONST.REPORT.STATUS_NUM).find((key) => CONST.REPORT.STATUS_NUM[key as keyof typeof CONST.REPORT.STATUS_NUM] === statusNum);
    return status ? `${status.charAt(0)}${status.slice(1).toLowerCase()}` : '';
}

/**
 * Populates the report field formula with the values from the report and policy.
 * Currently, this only supports optimistic expense reports.
 * Each formula field is either replaced with a value, or removed.
 * If after all replacements the formula is empty, the original formula is returned.
 * See {@link https://help.expensify.com/articles/expensify-classic/insights-and-custom-reporting/Custom-Templates}
 */
function populateOptimisticReportFormula(formula: string, report: OptimisticExpenseReport | OptimisticNewReport, policy: OnyxEntry<Policy>, isMoneyRequestConfirmation = false): string {
    // If this is a newly created report and it is from money request confirmation, we should use 'New report' as the report title
    if (!report.parentReportActionID && isMoneyRequestConfirmation) {
        return 'New report';
    }

    const createdDate = report.lastVisibleActionCreated ? new Date(report.lastVisibleActionCreated) : undefined;

    const result = formula
        // We don't translate because the server response is always in English
        .replaceAll(/\{report:type\}/gi, 'Expense Report')
        .replaceAll(/\{report:startdate\}/gi, createdDate ? format(createdDate, CONST.DATE.FNS_FORMAT_STRING) : '')
        .replaceAll(/\{report:enddate\}/gi, createdDate ? format(createdDate, CONST.DATE.FNS_FORMAT_STRING) : '')
        .replaceAll(/\{report:id\}/gi, getBase62ReportID(Number(report.reportID)))
        .replaceAll(/\{report:total\}/gi, report.total !== undefined && !Number.isNaN(report.total) ? convertToDisplayString(Math.abs(report.total), report.currency).toString() : '')
        .replaceAll(/\{report:currency\}/gi, report.currency ?? '')
        .replaceAll(/\{report:policyname\}/gi, policy?.name ?? '')
        .replaceAll(/\{report:workspacename\}/gi, policy?.name ?? '')
        .replaceAll(/\{report:created\}/gi, createdDate ? format(createdDate, CONST.DATE.FNS_DATE_TIME_FORMAT_STRING) : '')
        .replaceAll(/\{report:created:yyyy-MM-dd\}/gi, createdDate ? format(createdDate, CONST.DATE.FNS_FORMAT_STRING) : '')
        .replaceAll(/\{report:status\}/gi, report.statusNum !== undefined ? getHumanReadableStatus(report.statusNum) : '')
        .replaceAll(/\{user:email\}/gi, currentUserEmail ?? '')
        .replaceAll(/\{user:email\|frontPart\}/gi, (currentUserEmail ? currentUserEmail.split('@').at(0) : '') ?? '')
        .replaceAll(/\{report:(.+)\}/gi, '');

    return result.trim().length ? result : formula;
}

/** Builds an optimistic invoice report with a randomly generated reportID */
function buildOptimisticInvoiceReport(
    chatReportID: string,
    policyID: string | undefined,
    receiverAccountID: number,
    receiverName: string,
    total: number,
    currency: string,
): OptimisticExpenseReport {
    const formattedTotal = convertToDisplayString(total, currency);
    const created = DateUtils.getDBTime();
    const invoiceReport = {
        reportID: generateReportID(),
        chatReportID,
        policyID,
        type: CONST.REPORT.TYPE.INVOICE,
        ownerAccountID: currentUserAccountID,
        managerID: receiverAccountID,
        currency,
        // We don't translate reportName because the server response is always in English
        reportName: `${receiverName} owes ${formattedTotal}`,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        total: total * -1,
        participants: {
            [receiverAccountID]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
        },
        parentReportID: chatReportID,
        created,
        lastVisibleActionCreated: created,
    };

    if (currentUserAccountID) {
        invoiceReport.participants[currentUserAccountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN};
    }

    return invoiceReport;
}

/**
 * Returns the stateNum and statusNum for an expense report based on the policy settings
 * @param policy
 */
function getExpenseReportStateAndStatus(policy: OnyxEntry<Policy>, isEmptyOptimisticReport = false) {
    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    if (isASAPSubmitBetaEnabled) {
        return {
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        };
    }
    const isInstantSubmitEnabledLocal = isInstantSubmitEnabled(policy);
    const isSubmitAndCloseLocal = isSubmitAndClose(policy);
    const arePaymentsDisabled = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

    if (isInstantSubmitEnabledLocal && arePaymentsDisabled && isSubmitAndCloseLocal && !isEmptyOptimisticReport) {
        return {
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        };
    }

    if (isInstantSubmitEnabledLocal) {
        return {
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
    }

    return {
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
    };
}

/**
 * Builds an optimistic Expense report with a randomly generated reportID
 *
 * @param chatReportID - Report ID of the PolicyExpenseChat where the Expense Report is
 * @param policyID - The policy ID of the PolicyExpenseChat
 * @param payeeAccountID - AccountID of the employee (payee)
 * @param total - Amount in cents
 * @param currency
 * @param reimbursable – Whether the expense is reimbursable
 * @param parentReportActionID – The parent ReportActionID of the PolicyExpenseChat
 * @param optimisticIOUReportID – Optimistic IOU report id
 */
function buildOptimisticExpenseReport(
    chatReportID: string | undefined,
    policyID: string | undefined,
    payeeAccountID: number,
    total: number,
    currency: string,
    nonReimbursableTotal = 0,
    parentReportActionID?: string,
    optimisticIOUReportID?: string,
    reportTransactions?: Record<string, Transaction>,
    createdTimestamp?: string,
): OptimisticExpenseReport {
    // The amount for Expense reports are stored as negative value in the database
    const storedTotal = total * -1;
    const storedNonReimbursableTotal = nonReimbursableTotal * -1;
    const report = chatReportID ? getReportOrDraftReport(chatReportID) : undefined;
    const policyName = getPolicyName({report});
    const formattedTotal = convertToDisplayString(storedTotal, currency);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyReal = getPolicy(policyID);
    const policyDraft = allPolicyDrafts?.[`${ONYXKEYS.COLLECTION.POLICY_DRAFTS}${policyID}`];
    const policy = policyReal ?? policyDraft;

    const {stateNum, statusNum} = getExpenseReportStateAndStatus(policy);

    const created = createdTimestamp ?? DateUtils.getDBTime();

    const expenseReport: OptimisticExpenseReport = {
        reportID: optimisticIOUReportID ?? generateReportID(),
        chatReportID,
        policyID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerAccountID: payeeAccountID,
        currency,
        // We don't translate reportName because the server response is always in English
        reportName: `${policyName} owes ${formattedTotal}`,
        stateNum,
        statusNum,
        total: storedTotal,
        unheldTotal: storedTotal,
        nonReimbursableTotal: storedNonReimbursableTotal,
        unheldNonReimbursableTotal: storedNonReimbursableTotal,
        participants: {
            [payeeAccountID]: {
                notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            },
        },
        parentReportID: chatReportID,
        created,
        lastVisibleActionCreated: created,
        parentReportActionID,
    };

    // Get the approver/manager for this report to properly display the optimistic data
    const submitToAccountID = getSubmitToAccountID(policy, expenseReport);
    if (submitToAccountID) {
        expenseReport.managerID = submitToAccountID;
    }

    // Only compute optimistic report name if the user is on the CUSTOM_REPORT_NAMES beta
    if (Permissions.isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES, allBetas)) {
        const titleReportField = getTitleReportField(getReportFieldsByPolicyID(policyID) ?? {});
        if (!!titleReportField && isGroupPolicy(policy?.type ?? '')) {
            const formulaContext: FormulaContext = {
                report: expenseReport,
                policy,
                allTransactions: reportTransactions ?? {},
            };

            // We use dynamic require here to avoid a circular dependency between ReportUtils and Formula
            // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
            const Formula = require('./Formula') as {compute: (formula?: string, context?: FormulaContext) => string};
            const computedName = Formula.compute(titleReportField.defaultValue, formulaContext);
            expenseReport.reportName = computedName ?? expenseReport.reportName;
        }
    }

    expenseReport.fieldList = policy?.fieldList;

    return expenseReport;
}

function buildOptimisticEmptyReport(reportID: string, accountID: number, parentReport: OnyxEntry<Report>, parentReportActionID: string, policy: OnyxEntry<Policy>, timeOfCreation: string) {
    const {stateNum, statusNum} = getExpenseReportStateAndStatus(policy, true);
    const titleReportField = getTitleReportField(getReportFieldsByPolicyID(policy?.id) ?? {});
    const optimisticEmptyReport: OptimisticNewReport = {
        reportName: '',
        reportID,
        policyID: policy?.id,
        type: CONST.REPORT.TYPE.EXPENSE,
        currency: policy?.outputCurrency,
        ownerAccountID: accountID,
        stateNum,
        statusNum,
        total: 0,
        nonReimbursableTotal: 0,
        participants: {},
        created: timeOfCreation,
        lastVisibleActionCreated: timeOfCreation,
        pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        parentReportID: parentReport?.reportID,
        parentReportActionID,
        chatReportID: parentReport?.reportID,
        managerID: getManagerAccountID(policy, {ownerAccountID: accountID}),
    };

    // Only compute optimistic report name if the user is on the CUSTOM_REPORT_NAMES beta
    if (Permissions.isBetaEnabled(CONST.BETAS.CUSTOM_REPORT_NAMES, allBetas)) {
        const formulaContext: FormulaContext = {
            report: optimisticEmptyReport as Report,
            policy,
            allTransactions: {},
        };

        // We use dynamic require here to avoid a circular dependency between ReportUtils and Formula
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
        const Formula = require('./Formula') as {compute: (formula?: string, context?: FormulaContext) => string};
        const optimisticReportName = Formula.compute(titleReportField?.defaultValue ?? CONST.POLICY.DEFAULT_REPORT_NAME_PATTERN, formulaContext);
        optimisticEmptyReport.reportName = optimisticReportName ?? '';
    }

    optimisticEmptyReport.participants = accountID
        ? {
              [accountID]: {
                  notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
              },
          }
        : {};
    optimisticEmptyReport.ownerAccountID = accountID;
    return optimisticEmptyReport;
}

function getWorkspaceNameUpdatedMessage(translate: LocalizedTranslate, action: ReportAction) {
    const {oldName, newName} = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME>) ?? {};
    const message = oldName && newName ? translate('workspaceActions.renamedWorkspaceNameAction', {oldName, newName}) : getReportActionText(action);
    return Str.htmlEncode(message);
}

function getDeletedTransactionMessage(translate: LocalizedTranslate, action: ReportAction) {
    const deletedTransactionOriginalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION>) ?? {};
    const amount = -(deletedTransactionOriginalMessage.amount ?? 0);
    const currency = deletedTransactionOriginalMessage.currency ?? '';
    const formattedAmount = convertToDisplayString(amount, currency) ?? '';
    const message = translate('iou.deletedTransaction', formattedAmount, deletedTransactionOriginalMessage.merchant ?? '');
    return message;
}

function getMovedTransactionMessage(translate: LocalizedTranslate, action: ReportAction) {
    const movedTransactionOriginalMessage = getOriginalMessage(action) ?? {};
    const {toReportID, fromReportID} = movedTransactionOriginalMessage as OriginalMessageMovedTransaction;

    const toReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`];
    const fromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`];

    const report = fromReport ?? toReport;

    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportName = getReportName(report) ?? report?.reportName ?? '';
    const reportUrl = getReportURLForCurrentContext(report?.reportID);
    if (typeof fromReportID === 'undefined') {
        return translate('iou.movedTransactionTo', {
            reportUrl,
            reportName,
        });
    }
    return translate('iou.movedTransactionFrom', {
        reportUrl,
        reportName,
    });
}

function getUnreportedTransactionMessage(translate: LocalizedTranslate, action: ReportAction) {
    const movedTransactionOriginalMessage = getOriginalMessage(action) ?? {};
    const {fromReportID} = movedTransactionOriginalMessage as OriginalMessageMovedTransaction;

    const fromReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`];

    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const reportName = getReportName(fromReport) ?? fromReport?.reportName ?? '';

    let reportUrl = getReportURLForCurrentContext(fromReportID);

    if (fromReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        reportUrl = `${environmentURL}/r/${findSelfDMReportID()}`;
        return translate('iou.unreportedTransaction', {
            reportUrl,
        });
    }

    return translate('iou.movedTransactionFrom', {
        reportUrl,
        reportName,
    });
}

function getMovedActionMessage(translate: LocalizedTranslate, action: ReportAction, report: OnyxEntry<Report>) {
    if (!isMovedAction(action)) {
        return '';
    }
    const movedActionOriginalMessage = getOriginalMessage(action);

    if (!movedActionOriginalMessage) {
        return '';
    }
    const {toPolicyID, newParentReportID, movedReportID} = movedActionOriginalMessage;
    const toPolicyName = getPolicyNameByID(toPolicyID);
    return translate('iou.movedAction', {
        shouldHideMovedReportUrl: !isDM(report),
        movedReportUrl: getReportURLForCurrentContext(movedReportID),
        newParentReportUrl: getReportURLForCurrentContext(newParentReportID),
        toPolicyName,
    });
}

function getPolicyChangeMessage(translate: LocalizedTranslate, action: ReportAction) {
    const PolicyChangeOriginalMessage = getOriginalMessage(action as ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY>) ?? {};
    const {fromPolicy: fromPolicyID, toPolicy: toPolicyID} = PolicyChangeOriginalMessage as OriginalMessageChangePolicy;
    const message = translate('report.actions.type.changeReportPolicy', getPolicyNameByID(toPolicyID), fromPolicyID ? getPolicyNameByID(fromPolicyID) : undefined);
    return message;
}

/**
 * @param iouReportID - the report ID of the IOU report the action belongs to
 * @param type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param total - IOU total in cents
 * @param comment - IOU comment
 * @param currency - IOU currency
 * @param paymentType - IOU paymentMethodType. Can be oneOf(Elsewhere, Expensify)
 * @param isSettlingUp - Whether we are settling up an IOU
 * @param bankAccountID - Bank account ID
 * @param payAsBusiness - Whether the payment is made as a business
 */
function getIOUReportActionMessage(
    iouReportID: string,
    type: string,
    total: number,
    comment: string,
    currency: string,
    paymentType = '',
    isSettlingUp = false,
    bankAccountID?: number | undefined,
    payAsBusiness = false,
): Message[] {
    const report = getReportOrDraftReport(iouReportID);
    const isInvoice = isInvoiceReport(report);
    const amount =
        type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !isEmptyObject(report)
            ? convertToDisplayString(getMoneyRequestSpendBreakdown(report).totalDisplaySpend, currency)
            : convertToDisplayString(total, currency);

    let paymentMethodMessage;
    switch (paymentType) {
        case CONST.IOU.PAYMENT_TYPE.VBBA:
        case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
            paymentMethodMessage = ' with Expensify';
            break;
        default:
            paymentMethodMessage = ` elsewhere`;
            break;
    }

    let iouMessage;
    switch (type) {
        case CONST.REPORT.ACTIONS.TYPE.APPROVED:
            iouMessage = `approved ${amount}`;
            break;
        case CONST.REPORT.ACTIONS.TYPE.FORWARDED:
            iouMessage = `approved ${amount}`;
            break;
        case CONST.REPORT.ACTIONS.TYPE.UNAPPROVED:
            iouMessage = `unapproved ${amount}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.CREATE:
            iouMessage = `submitted ${amount}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.TRACK:
            iouMessage = `tracking ${amount}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.SPLIT:
            iouMessage = `split ${amount}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.DELETE:
            iouMessage = `deleted the ${amount} expense${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.PAY:
            if (isInvoice && isSettlingUp) {
                iouMessage =
                    paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE
                        ? `Mark ${amount} as paid`
                        : `paid ${amount} with ${payAsBusiness ? 'business' : 'personal'} account ${String(bankAccountID).slice(-4)}`;
            } else {
                iouMessage = isSettlingUp ? `paid ${amount}${paymentMethodMessage}` : `sent ${amount}${comment && ` for ${comment}`}${paymentMethodMessage}`;
            }
            break;
        case CONST.REPORT.ACTIONS.TYPE.SUBMITTED:
            iouMessage = amount;
            break;
        default:
            break;
    }

    return [
        {
            html: lodashEscape(iouMessage),
            text: iouMessage ?? '',
            isEdited: false,
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];
}

/**
 * Builds an optimistic IOU reportAction object
 *
 * @param type - IOUReportAction type. Can be oneOf(create, delete, pay, split).
 * @param amount - IOU amount in cents.
 * @param currency
 * @param comment - User comment for the IOU.
 * @param participants - An array with participants details.
 * @param [transactionID] - Not required if the IOUReportAction type is 'pay'
 * @param [paymentType] - Only required if the IOUReportAction type is 'pay'. Can be oneOf(elsewhere, Expensify).
 * @param [iouReportID] - Only required if the IOUReportActions type is oneOf(decline, cancel, pay). Generates a randomID as default.
 * @param [isSettlingUp] - Whether we are settling up an IOU.
 * @param [isSendMoneyFlow] - Whether this is pay someone flow
 * @param [receipt]
 * @param [isOwnPolicyExpenseChat] - Whether this is an expense report create from the current user's policy expense chat
 */
function buildOptimisticIOUReportAction(params: BuildOptimisticIOUReportActionParams): OptimisticIOUReportAction {
    const {
        type,
        amount,
        currency,
        comment,
        participants,
        transactionID,
        paymentType,
        iouReportID = '',
        isSettlingUp = false,
        isSendMoneyFlow = false,
        isOwnPolicyExpenseChat = false,
        created = DateUtils.getDBTime(),
        linkedExpenseReportAction,
        isPersonalTrackingExpense = false,
        payAsBusiness,
        bankAccountID,
        reportActionID,
    } = params;

    const IOUReportID = isPersonalTrackingExpense ? undefined : iouReportID || generateReportID();

    const originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>['originalMessage'] = {
        amount,
        comment,
        currency,
        IOUTransactionID: transactionID,
        IOUReportID,
        type,
        payAsBusiness,
        bankAccountID,
    };

    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    if (type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        // In pay someone flow, we store amount, comment, currency in IOUDetails when type = pay
        if (isSendMoneyFlow) {
            const keys = ['amount', 'comment', 'currency'] as const;
            for (const key of keys) {
                delete originalMessage[key];
            }
            originalMessage.IOUDetails = {amount, comment, currency};
            originalMessage.paymentType = paymentType;
        } else {
            // In case of pay someone action, we dont store the comment
            // and there is no single transactionID to link the action to.
            delete originalMessage.IOUTransactionID;
            delete originalMessage.comment;
            originalMessage.paymentType = paymentType;
        }
    }

    // IOUs of type split only exist in group DMs and those don't have an iouReport so we need to delete the IOUReportID key
    if (type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
        delete originalMessage.IOUReportID;
    }

    if (type !== CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        // Split expense made from a policy expense chat only have the payee's accountID as the participant because the payer could be any policy admin
        if (isOwnPolicyExpenseChat && type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
            originalMessage.participantAccountIDs = currentUserAccountID ? [currentUserAccountID] : [];
        } else {
            originalMessage.participantAccountIDs = currentUserAccountID
                ? [
                      currentUserAccountID,
                      ...participants.filter((participant) => participant.accountID !== currentUserAccountID).map((participant) => participant.accountID ?? CONST.DEFAULT_NUMBER_ID),
                  ]
                : participants.map((participant) => participant.accountID ?? CONST.DEFAULT_NUMBER_ID);
        }
    }

    const iouReportAction = {
        ...linkedExpenseReportAction,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        automatic: false,
        isAttachmentOnly: false,
        originalMessage,
        reportActionID: reportActionID ?? rand64(),
        shouldShow: true,
        created,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails?.accountID,
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        avatar: getCurrentUserAvatar(),
        message: getIOUReportActionMessage(iouReportID, type, amount, comment, currency, paymentType, isSettlingUp, bankAccountID, payAsBusiness),
    };

    const managerMcTestParticipant = participants.find((participant) => isSelectedManagerMcTest(participant.login));
    if (managerMcTestParticipant) {
        return {
            ...iouReportAction,
            actorAccountID: managerMcTestParticipant.accountID,
            avatar: managerMcTestParticipant.icons?.[0]?.source,
            person: [
                {
                    style: 'strong',
                    text: getDisplayNameForParticipant({...managerMcTestParticipant, formatPhoneNumber: formatPhoneNumberPhoneUtils}),
                    type: 'TEXT',
                },
            ],
        };
    }

    return iouReportAction;
}

/**
 * Builds an optimistic APPROVED report action with a randomly generated reportActionID.
 */
function buildOptimisticApprovedReportAction(amount: number, currency: string, expenseReportID: string): OptimisticApprovedReportAction {
    const originalMessage = {
        amount,
        currency,
        expenseReportID,
    };
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage,
        message: getIOUReportActionMessage(expenseReportID, CONST.REPORT.ACTIONS.TYPE.APPROVED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

/**
 * Builds an optimistic APPROVED report action with a randomly generated reportActionID.
 */
function buildOptimisticUnapprovedReportAction(amount: number, currency: string, expenseReportID: string): OptimisticUnapprovedReportAction {
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage: {
            amount,
            currency,
            expenseReportID,
        },
        message: getIOUReportActionMessage(expenseReportID, CONST.REPORT.ACTIONS.TYPE.UNAPPROVED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

/**
 * Builds an optimistic CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS system report action.
 * Used to inform users that a new report was created for held/unapproved transactions.
 */
function buildOptimisticCreatedReportForUnapprovedAction(
    reportID: string,
    originalReportID: string | undefined,
): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS> {
    const createdTime = DateUtils.getDBTime();
    const actor = getAccountIDsByLogins([CONST.EMAIL.CONCIERGE]).at(0);

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS,
        actorAccountID: actor,
        avatar: getDefaultAvatarURL({accountID: actor, accountEmail: CONST.EMAIL.CONCIERGE}),
        created: createdTime,
        lastModified: createdTime,
        message: [],
        originalMessage: {
            originalID: originalReportID,
        },
        reportActionID: rand64(),
        reportID,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        isOptimisticAction: true,
        shouldShow: true,
        person: [
            {
                text: CONST.DISPLAY_NAME.EXPENSIFY_CONCIERGE,
                type: 'TEXT',
            },
        ],
    };
}

/**
 * Builds an optimistic MOVED report action with a randomly generated reportActionID.
 * This action is used when we move reports across workspaces.
 */
function buildOptimisticMovedReportAction(
    fromPolicyID: string | undefined,
    toPolicyID: string,
    newParentReportID: string,
    movedReportID: string,
    policyName: string,
    shouldHideMovedReportUrl = false,
): ReportAction {
    const originalMessage = {
        fromPolicyID,
        toPolicyID,
        newParentReportID,
        movedReportID,
    };

    const movedActionMessage = [
        {
            html: shouldHideMovedReportUrl
                ? `moved this <a href='${getReportURLForCurrentContext(movedReportID)}' target='_blank' rel='noreferrer noopener'>report</a> to the <a href='${getReportURLForCurrentContext(newParentReportID)}' target='_blank' rel='noreferrer noopener'>${policyName}</a> workspace`
                : `moved this report to the <a href='${getReportURLForCurrentContext(newParentReportID)}' target='_blank' rel='noreferrer noopener'>${policyName}</a> workspace`,
            text: `moved this report to the ${policyName} workspace`,
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.MOVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage,
        message: movedActionMessage,
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Builds an optimistic CHANGE_POLICY report action with a randomly generated reportActionID.
 * This action is used when we change the workspace of a report.
 */
function buildOptimisticChangePolicyReportAction(fromPolicyID: string | undefined, toPolicyID: string, automaticAction = false): ReportAction {
    const originalMessage = {
        fromPolicy: fromPolicyID,
        toPolicy: toPolicyID,
        automaticAction,
    };

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const fromPolicy = getPolicy(fromPolicyID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const toPolicy = getPolicy(toPolicyID);

    const changePolicyReportActionMessage = [
        {
            type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            text: `changed the workspace to ${toPolicy?.name}`,
        },
        ...(fromPolicyID
            ? [
                  {
                      type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                      text: ` (previously ${fromPolicy?.name})`,
                  },
              ]
            : []),
    ];

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        originalMessage,
        message: changePolicyReportActionMessage,
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

function buildOptimisticTransactionAction(
    type: typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION | typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
    transactionThreadReportID: string | undefined,
    originalReportID: string,
): ReportAction {
    const isFromPersonalSpace = originalReportID === CONST.REPORT.UNREPORTED_REPORT_ID;
    const reportName = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`]?.reportName ?? '';
    const url = isFromPersonalSpace ? getReportURLForCurrentContext(findSelfDMReportID()) : getReportURLForCurrentContext(originalReportID);
    const [actionText, messageHtml] = [`moved this expense from ${reportName}`, `moved this expense from <a href='${url}' target='_blank' rel='noreferrer noopener'>${reportName}</a>`];

    return {
        actionName: type,
        reportID: transactionThreadReportID,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        originalMessage: {fromReportID: originalReportID},
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                html: messageHtml,
                text: actionText,
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Builds an optimistic MOVED_TRANSACTION report action with a randomly generated reportActionID.
 * This action is used when we change the workspace of a report.
 */
function buildOptimisticMovedTransactionAction(transactionThreadReportID: string | undefined, fromReportID: string): ReportAction {
    return buildOptimisticTransactionAction(CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION, transactionThreadReportID, fromReportID);
}

/**
 * Builds an optimistic UNREPORTED_TRANSACTION report action with a randomly generated reportActionID.
 * This action is used when we un-report a transaction.
 */
function buildOptimisticUnreportedTransactionAction(transactionThreadReportID: string | undefined, fromReportID: string) {
    return buildOptimisticTransactionAction(CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION, transactionThreadReportID, fromReportID);
}

/**
 * Builds an optimistic SUBMITTED report action with a randomly generated reportActionID.
 *
 */
function buildOptimisticSubmittedReportAction(
    amount: number,
    currency: string,
    expenseReportID: string,
    adminAccountID: number | undefined,
    workflow: ValueOf<typeof CONST.POLICY.APPROVAL_MODE> | undefined,
): OptimisticSubmittedReportAction {
    const originalMessage = {
        amount,
        currency,
        expenseReportID,
        workflow,
    };

    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
        actorAccountID: currentUserAccountID,
        adminAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage,
        message: getIOUReportActionMessage(expenseReportID, CONST.REPORT.ACTIONS.TYPE.SUBMITTED, Math.abs(amount), '', currency),
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

/**
 * Builds an optimistic report preview action with a randomly generated reportActionID.
 *
 * @param chatReport
 * @param iouReport
 * @param [comment] - User comment for the IOU.
 * @param [transaction] - optimistic first transaction of preview
 * @param reportActionID
 */
function buildOptimisticReportPreview(
    chatReport: OnyxInputOrEntry<Report>,
    iouReport: Report,
    comment = '',
    transaction: OnyxInputOrEntry<Transaction> = null,
    childReportID?: string,
    reportActionID?: string,
): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> {
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const message = getReportPreviewMessage(iouReport);
    const created = DateUtils.getDBTime();
    const reportActorAccountID = (isInvoiceReport(iouReport) || isExpenseReport(iouReport) ? iouReport?.ownerAccountID : iouReport?.managerID) ?? -1;
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);
    const isTestTransaction = isTestTransactionReport(iouReport);
    const isTestDriveTransaction = !!transaction?.receipt?.isTestDriveReceipt;
    const isScanRequest = transaction ? isScanRequestTransactionUtils(transaction) : false;
    return {
        reportActionID: reportActionID ?? rand64(),
        reportID: chatReport?.reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        originalMessage: {
            linkedReportID: iouReport?.reportID,
        },
        message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        delegateAccountID: delegateAccountDetails?.accountID,
        created,
        accountID: iouReport?.managerID,
        // The preview is initially whispered if created with a receipt, so the actor is the current user as well
        actorAccountID: hasReceipt ? currentUserAccountID : reportActorAccountID,
        childReportID: childReportID ?? iouReport?.reportID,
        childMoneyRequestCount: 1,
        isOptimisticAction: true,
        childLastActorAccountID: currentUserAccountID,
        childLastMoneyRequestComment: comment,
        childRecentReceiptTransactionIDs: hasReceipt && !isEmptyObject(transaction) && transaction?.transactionID ? {[transaction.transactionID]: created} : undefined,
        childOwnerAccountID: iouReport?.ownerAccountID,
        childManagerAccountID: iouReport?.managerID,
        ...((isTestDriveTransaction || isTestTransaction) && !isScanRequest && {childStateNum: 2, childStatusNum: 4}),
    };
}

/**
 * Builds an optimistic ACTIONABLE_TRACK_EXPENSE_WHISPER action with a randomly generated reportActionID.
 */
function buildOptimisticActionableTrackExpenseWhisper(iouAction: OptimisticIOUReportAction, transactionID: string): ReportAction {
    const currentTime = DateUtils.getDBTime();
    const targetEmail = CONST.EMAIL.CONCIERGE;
    const actorAccountID = getAccountIDsByLogins([targetEmail]).at(0);
    const reportActionID = rand64();
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER,
        actorAccountID,
        avatar: getDefaultAvatarURL({accountID: actorAccountID, accountEmail: targetEmail}),
        created: DateUtils.addMillisecondsFromDateTime(currentTime, 1),
        lastModified: DateUtils.addMillisecondsFromDateTime(currentTime, 1),
        message: [
            {
                html: CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                text: CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                whisperedTo: [],
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        originalMessage: {
            lastModified: DateUtils.addMillisecondsFromDateTime(currentTime, 1),
            transactionID,
        },
        person: [
            {
                text: CONST.DISPLAY_NAME.EXPENSIFY_CONCIERGE,
                type: 'TEXT',
            },
        ],
        reportActionID,
        shouldShow: true,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Builds an optimistic modified expense action with a randomly generated reportActionID.
 */
function buildOptimisticModifiedExpenseReportAction(
    transactionThread: OnyxInputOrEntry<Report>,
    oldTransaction: OnyxInputOrEntry<Transaction>,
    transactionChanges: TransactionChanges,
    isFromExpenseReport: boolean,
    policy: OnyxInputOrEntry<Policy>,
    updatedTransaction?: OnyxInputOrEntry<Transaction>,
    allowNegative = false,
): OptimisticModifiedExpenseReportAction {
    const originalMessage = getModifiedExpenseOriginalMessage(oldTransaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative);
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        isAttachmentOnly: false,
        message: [
            {
                // Currently we are composing the message from the originalMessage and message is only used in OldDot and not in the App
                text: 'You',
                style: 'strong',
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        originalMessage,
        person: [
            {
                style: 'strong',
                text: currentUserPersonalDetails?.displayName ?? String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        reportActionID: rand64(),
        reportID: transactionThread?.reportID,
        shouldShow: true,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

/**
 * Builds an optimistic DETACH_RECEIPT report action with a randomly generated reportActionID.
 */
function buildOptimisticDetachReceipt(reportID: string | undefined, transactionID: string, merchant: string = CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT) {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        isAttachmentOnly: false,
        originalMessage: {
            transactionID,
            merchant: `${merchant}`,
        },
        message: [
            {
                type: 'COMMENT',
                html: `detached a receipt from expense '${merchant}'`,
                text: `detached a receipt from expense '${merchant}'`,
                whisperedTo: [],
            },
        ],
        person: [
            {
                style: 'strong',
                text: currentUserPersonalDetails?.displayName ?? String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        reportActionID: rand64(),
        reportID,
        shouldShow: true,
    };
}

/**
 * Updates a report preview action that exists for an IOU report.
 *
 * @param [comment] - User comment for the IOU.
 * @param [transaction] - optimistic newest transaction of a report preview
 *
 */
function updateReportPreview(
    iouReport: OnyxEntry<Report>,
    reportPreviewAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>,
    isPayRequest = false,
    comment = '',
    transaction?: OnyxEntry<Transaction>,
): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> {
    const hasReceipt = hasReceiptTransactionUtils(transaction);
    const recentReceiptTransactions = reportPreviewAction?.childRecentReceiptTransactionIDs ?? {};
    const transactionsToKeep = getRecentTransactions(recentReceiptTransactions);
    const previousTransactionsArray = Object.entries(recentReceiptTransactions ?? {}).map(([key, value]) => (transactionsToKeep.includes(key) ? {[key]: value} : null));
    const previousTransactions: Record<string, string> = {};

    for (const obj of previousTransactionsArray) {
        for (const key in obj) {
            if (obj) {
                previousTransactions[key] = obj[key];
            }
        }
    }

    const message = getReportPreviewMessage(iouReport, reportPreviewAction);
    const originalMessage = getOriginalMessage(reportPreviewAction);
    return {
        ...reportPreviewAction,
        message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        childLastMoneyRequestComment: comment || reportPreviewAction?.childLastMoneyRequestComment,
        childMoneyRequestCount: (reportPreviewAction?.childMoneyRequestCount ?? 0) + (isPayRequest ? 0 : 1),
        childRecentReceiptTransactionIDs: hasReceipt
            ? {
                  ...(transaction && {[transaction.transactionID]: transaction?.created}),
                  ...previousTransactions,
              }
            : recentReceiptTransactions,
        // As soon as we add a transaction without a receipt to the report, it will have ready expenses,
        // so we remove the whisper
        originalMessage: originalMessage
            ? {
                  ...originalMessage,
                  whisperedTo: hasReceipt ? originalMessage.whisperedTo : [],
                  linkedReportID: originalMessage.linkedReportID,
              }
            : undefined,
    };
}

function buildOptimisticTaskReportAction(
    taskReportID: string,
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED | typeof CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED | typeof CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED,
    message = '',
    actorAccountID = currentUserAccountID,
    createdOffset = 0,
): OptimisticTaskReportAction {
    const originalMessage = {
        taskReportID,
        type: actionName,
        text: message,
        html: message,
        whisperedTo: [],
    };
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        actionName,
        actorAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        isAttachmentOnly: false,
        originalMessage,
        message: [
            {
                text: message,
                taskReportID,
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        person: [
            {
                style: 'strong',
                text: currentUserPersonalDetails?.displayName ?? String(currentUserAccountID),
                type: 'TEXT',
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
        created: NetworkConnection.getDBTimeWithSkew(Date.now() + createdOffset),
        isFirstItem: false,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

function isWorkspaceChat(chatType: string) {
    return chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS || chatType === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE || chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT;
}

/**
 * Builds an optimistic chat report with a randomly generated reportID and as much information as we currently have
 */
type BuildOptimisticChatReportParams = {
    participantList: number[];
    reportName?: string;
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
    policyID?: string;
    ownerAccountID?: number;
    isOwnPolicyExpenseChat?: boolean;
    oldPolicyName?: string;
    visibility?: ValueOf<typeof CONST.REPORT.VISIBILITY>;
    writeCapability?: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;
    notificationPreference?: NotificationPreference;
    parentReportActionID?: string;
    parentReportID?: string;
    description?: string;
    avatarUrl?: string;
    optimisticReportID?: string;
    isPinned?: boolean;
    chatReportID?: string;
};

function buildOptimisticChatReport({
    participantList,
    reportName = CONST.REPORT.DEFAULT_REPORT_NAME,
    chatType,
    policyID = CONST.POLICY.OWNER_EMAIL_FAKE,
    ownerAccountID = CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    isOwnPolicyExpenseChat = false,
    oldPolicyName = '',
    visibility,
    writeCapability,
    notificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    parentReportActionID = '',
    parentReportID = undefined,
    description = '',
    avatarUrl = '',
    optimisticReportID = '',
    isPinned = false,
    chatReportID = undefined,
}: BuildOptimisticChatReportParams): OptimisticChatReport {
    const isWorkspaceChatType = chatType && isWorkspaceChat(chatType);
    const participants = participantList.reduce((reportParticipants: Participants, accountID: number) => {
        const participant: ReportParticipant = {
            notificationPreference,
            ...(!isWorkspaceChatType && {role: accountID === currentUserAccountID ? CONST.REPORT.ROLE.ADMIN : CONST.REPORT.ROLE.MEMBER}),
        };
        // eslint-disable-next-line no-param-reassign
        reportParticipants[accountID] = participant;
        return reportParticipants;
    }, {} as Participants);
    const currentTime = DateUtils.getDBTime();
    const optimisticChatReport: OptimisticChatReport = {
        type: CONST.REPORT.TYPE.CHAT,
        chatType,
        isOwnPolicyExpenseChat,
        isPinned,
        lastActorAccountID: 0,
        lastMessageHtml: '',
        lastMessageText: undefined,
        lastReadTime: currentTime,
        lastVisibleActionCreated: currentTime,
        oldPolicyName,
        ownerAccountID: ownerAccountID || CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
        parentReportActionID,
        parentReportID,
        participants,
        policyID,
        reportID: optimisticReportID || generateReportID(),
        reportName,
        stateNum: 0,
        statusNum: 0,
        visibility,
        description,
        writeCapability,
        avatarUrl,
        chatReportID,
    };

    if (chatType === CONST.REPORT.CHAT_TYPE.INVOICE) {
        // TODO: update to support workspace as an invoice receiver when workspace-to-workspace invoice room implemented
        optimisticChatReport.invoiceReceiver = {
            type: 'individual',
            accountID: participantList.at(0) ?? -1,
        };
    }

    return optimisticChatReport;
}

function buildOptimisticGroupChatReport(
    participantAccountIDs: number[],
    reportName: string,
    avatarUri: string,
    optimisticReportID?: string,
    notificationPreference?: NotificationPreference,
) {
    return buildOptimisticChatReport({
        participantList: participantAccountIDs,
        reportName,
        chatType: CONST.REPORT.CHAT_TYPE.GROUP,
        notificationPreference,
        avatarUrl: avatarUri,
        optimisticReportID,
    });
}

/**
 * Returns the necessary reportAction onyx data to indicate that the chat has been created optimistically
 * @param [created] - Action created time
 */
function buildOptimisticCreatedReportAction(emailCreatingAction: string, created = DateUtils.getDBTime(), optimisticReportActionID?: string): OptimisticCreatedReportAction {
    return {
        reportActionID: optimisticReportActionID ?? rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailCreatingAction,
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' created this report',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the room has been renamed
 */
function buildOptimisticRenamedRoomReportAction(newName: string, oldName: string): OptimisticRenamedReportAction {
    const now = DateUtils.getDBTime();
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: 'You',
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ` renamed this report. New title is '${newName}' (previously '${oldName}').`,
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            oldName,
            newName,
            html: `Room renamed to ${newName}`,
            lastModified: now,
        },
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: now,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the room description has been updated
 */
function buildOptimisticRoomDescriptionUpdatedReportAction(description: string): OptimisticRoomDescriptionUpdatedReportAction {
    const now = DateUtils.getDBTime();
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: description ? `set the room description to: ${Parser.htmlToText(description)}` : 'cleared the room description',
                html: description ? `<muted-text>set the room description to: ${description}</muted-text>` : '<muted-text>cleared the room description</muted-text>',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            description,
            lastModified: now,
        },
        created: now,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the room avatar has been updated
 */
function buildOptimisticRoomAvatarUpdatedReportAction(avatarURL: string): OptimisticRoomAvatarUpdatedReportAction {
    const now = DateUtils.getDBTime();
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_AVATAR,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: avatarURL ? `changed the room avatar` : 'removed the room avatar',
                html: avatarURL ? `<muted-text>changed the room avatar</muted-text>` : '<muted-text>removed the room avatar</muted-text>',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            avatarURL,
            lastModified: now,
        },
        created: now,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been put on hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticHoldReportAction(created = DateUtils.getDBTime()): OptimisticHoldReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.HOLD,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: 'held this expense',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been put on hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticHoldReportActionComment(comment: string, created = DateUtils.getDBTime()): OptimisticHoldReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: comment,
                html: comment, // as discussed on https://github.com/Expensify/App/pull/39452 we will not support HTML for now
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been removed from hold optimistically
 * @param [created] - Action created time
 */
function buildOptimisticUnHoldReportAction(created = DateUtils.getDBTime()): OptimisticHoldReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.UNHOLD,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: 'unheld this expense',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

function buildOptimisticRetractedReportAction(created = DateUtils.getDBTime()): OptimisticRetractedReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.RETRACTED,
        actorAccountID: currentUserAccountID,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: 'retracted',
                html: `<muted-text>retracted</muted-text>`,
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

function buildOptimisticReopenedReportAction(created = DateUtils.getDBTime()): OptimisticReopenedReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.REOPENED,
        actorAccountID: currentUserAccountID,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: 'reopened',
                html: '<muted-text>reopened</muted-text>',
            },
        ],
        person: [
            {
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

function buildOptimisticEditedTaskFieldReportAction({title, description}: Task): OptimisticEditedTaskReportAction {
    // We do not modify title & description in one request, so we need to create a different optimistic action for each field modification
    let field = '';
    let value = '';
    if (title !== undefined) {
        field = 'task title';
        value = title;
    } else if (description !== undefined) {
        field = 'description';
        value = description;
    }

    let changelog = 'edited this task';
    if (field && value) {
        changelog = `updated the ${field} to ${value}`;
    } else if (field) {
        changelog = `removed the ${field}`;
    }
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.TASK_EDITED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: changelog,
                html: getParsedComment(changelog, undefined, undefined, title !== undefined ? [...CONST.TASK_TITLE_DISABLED_RULES] : undefined),
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        shouldShow: false,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

function buildOptimisticCardAssignedReportAction(assigneeAccountID: number): OptimisticCardAssignedReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        originalMessage: {assigneeAccountID, cardID: -1},
        message: [{type: CONST.REPORT.MESSAGE.TYPE.COMMENT, text: '', html: ''}],
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
    };
}

function buildOptimisticChangedTaskAssigneeReportAction(assigneeAccountID: number): OptimisticEditedTaskReportAction {
    const delegateAccountDetails = getPersonalDetailByEmail(delegateEmail);

    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.TASK_EDITED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: `assigned to ${getDisplayNameForParticipant({accountID: assigneeAccountID, formatPhoneNumber: formatPhoneNumberPhoneUtils})}`,
                html: `assigned to <mention-user accountID="${assigneeAccountID}"/>`,
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        shouldShow: false,
        delegateAccountID: delegateAccountDetails?.accountID,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that a chat has been archived
 *
 * @param reason - A reason why the chat has been archived
 */
function buildOptimisticClosedReportAction(
    emailClosingReport: string,
    policyName: string,
    reason: ValueOf<typeof CONST.REPORT.ARCHIVE_REASON> = CONST.REPORT.ARCHIVE_REASON.DEFAULT,
): OptimisticClosedReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailClosingReport,
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' closed this report',
            },
        ],
        originalMessage: {
            policyName,
            reason,
        },
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
    };
}

/**
 * Returns an optimistic Dismissed Violation Report Action. Use the originalMessage customize this to the type of
 * violation being dismissed.
 */
function buildOptimisticDismissedViolationReportAction(
    originalMessage: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION>['originalMessage'],
): OptimisticDismissedViolationReportAction {
    let text = '';
    if (originalMessage) {
        const violationName = originalMessage.violationName as keyof typeof CONST.VIOLATION_DISMISSAL;
        const reason = originalMessage.reason as keyof (typeof CONST.VIOLATION_DISMISSAL)[typeof violationName];
        text = CONST.VIOLATION_DISMISSAL[violationName][reason];
    }
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text,
            },
        ],
        originalMessage,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
    };
}

function buildOptimisticResolvedDuplicatesReportAction(): OptimisticDismissedViolationReportAction {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES,
        actorAccountID: currentUserAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: 'resolved the duplicate',
            },
        ],
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        reportActionID: rand64(),
        shouldShow: true,
    };
}

function buildOptimisticChangeApproverReportAction(managerID: number, actorAccountID: number): OptimisticChangedApproverReportAction {
    const created = DateUtils.getDBTime();
    return {
        actionName: managerID === actorAccountID ? CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL : CONST.REPORT.ACTIONS.TYPE.REROUTE,
        actorAccountID,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: `changed the approver to ${getDisplayNameForParticipant({accountID: managerID, formatPhoneNumber: formatPhoneNumberPhoneUtils})}`,
                html: `changed the approver to <mention-user accountID="${managerID}"/>`,
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        originalMessage: {
            lastModified: created,
            mentionedAccountIDs: [managerID],
        },
        shouldShow: false,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        isOptimisticAction: true,
        reportActionID: rand64(),
    };
}

function buildOptimisticAnnounceChat(policyID: string, accountIDs: number[]): OptimisticAnnounceChat {
    const announceReport = getRoom(CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, policyID);
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);
    const announceRoomOnyxData: AnnounceRoomOnyxData = {
        onyxOptimisticData: [],
        onyxSuccessData: [],
        onyxFailureData: [],
    };

    // Do not create #announce room if the room already exists or if there are less than 3 participants in workspace
    if (accountIDs.length < 3 || announceReport) {
        return {
            announceChatReportID: '',
            announceChatReportActionID: '',
            announceChatData: announceRoomOnyxData,
        };
    }

    const announceChatData = buildOptimisticChatReport({
        participantList: accountIDs,
        reportName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE,
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        policyID,
        ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
        oldPolicyName: policy?.name,
        writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    });

    const announceCreatedAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);
    announceRoomOnyxData.onyxOptimisticData.push(
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatData.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...announceChatData,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_DRAFT}${announceChatData.reportID}`,
            value: null,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatData.reportID}`,
            value: {
                [announceCreatedAction.reportActionID]: announceCreatedAction,
            },
        },
    );
    announceRoomOnyxData.onyxSuccessData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatData.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${announceChatData.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatData.reportID}`,
            value: {
                [announceCreatedAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    );
    announceRoomOnyxData.onyxFailureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${announceChatData.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
                pendingAction: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${announceChatData.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${announceChatData.reportID}`,
            value: {
                [announceCreatedAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    );
    return {
        announceChatReportID: announceChatData.reportID,
        announceChatReportActionID: announceCreatedAction.reportActionID,
        announceChatData: announceRoomOnyxData,
    };
}

function shouldPinAdminRoomByDefault() {
    return !isExpensifyTeam(currentUserEmail);
}

function buildOptimisticWorkspaceChats(policyID: string, policyName: string, expenseReportId?: string): OptimisticWorkspaceChats {
    const pendingChatMembers = getPendingChatMembers(currentUserAccountID ? [currentUserAccountID] : [], [], CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    const adminsChatData = {
        ...buildOptimisticChatReport({
            participantList: currentUserAccountID ? [currentUserAccountID] : [],
            reportName: CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            policyID,
            ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            oldPolicyName: policyName,
            isPinned: shouldPinAdminRoomByDefault(),
        }),
    };
    const adminsChatReportID = adminsChatData.reportID;
    const adminsCreatedAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);
    const adminsReportActionData = {
        [adminsCreatedAction.reportActionID]: adminsCreatedAction,
    };

    const expenseChatData = buildOptimisticChatReport({
        participantList: currentUserAccountID ? [currentUserAccountID] : [],
        reportName: '',
        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID,
        ownerAccountID: currentUserAccountID,
        isOwnPolicyExpenseChat: true,
        oldPolicyName: policyName,
        optimisticReportID: expenseReportId,
    });

    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail ?? '');
    const expenseReportActionData = {
        [expenseReportCreatedAction.reportActionID]: expenseReportCreatedAction,
    };

    return {
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        adminsCreatedReportActionID: adminsCreatedAction.reportActionID,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
        expenseCreatedReportActionID: expenseReportCreatedAction.reportActionID,
        pendingChatMembers,
    };
}

/**
 * Builds an optimistic Task Report with a randomly generated reportID
 *
 * @param ownerAccountID - Account ID of the person generating the Task.
 * @param assigneeAccountID - AccountID of the other person participating in the Task.
 * @param parentReportID - Report ID of the chat where the Task is.
 * @param title - Task title.
 * @param description - Task description.
 * @param policyID - PolicyID of the parent report
 */

function buildOptimisticTaskReport(
    ownerAccountID: number,
    parentReportID: string,
    assigneeAccountID = 0,
    title?: string,
    description?: string,
    policyID: string = CONST.POLICY.OWNER_EMAIL_FAKE,
    notificationPreference: NotificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
    mediaAttributes?: Record<string, string>,
): OptimisticTaskReport {
    const participants: Participants = {
        [ownerAccountID]: {
            notificationPreference,
        },
    };

    if (assigneeAccountID) {
        participants[assigneeAccountID] = {notificationPreference};
    }

    return {
        reportID: generateReportID(),
        reportName: getParsedComment(title ?? '', undefined, undefined, [...CONST.TASK_TITLE_DISABLED_RULES]),
        description: getParsedComment(description ?? '', {}, mediaAttributes),
        ownerAccountID,
        participants,
        managerID: assigneeAccountID,
        type: CONST.REPORT.TYPE.TASK,
        parentReportID,
        policyID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        lastVisibleActionCreated: DateUtils.getDBTime(),
        hasParentAccess: true,
    };
}

/**
 * Builds an optimistic EXPORTED_TO_INTEGRATION report action
 *
 * @param integration - The connectionName of the integration
 * @param markedManually - Whether the integration was marked as manually exported
 */
function buildOptimisticExportIntegrationAction(integration: ConnectionName, markedManually = false): OptimisticExportIntegrationAction {
    const label = CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[integration];
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created: DateUtils.getDBTime(),
        shouldShow: true,
        originalMessage: {
            label,
            lastModified: DateUtils.getDBTime(),
            markedManually,
            inProgress: true,
        },
    };
}

/**
 * A helper method to create transaction thread
 *
 * @param reportAction - the parent IOU report action from which to create the thread
 * @param moneyRequestReport - the report which the report action belongs to
 */
function buildTransactionThread(
    reportAction: OnyxEntry<ReportAction | OptimisticIOUReportAction>,
    moneyRequestReport: OnyxEntry<Report>,
    existingTransactionThreadReportID?: string,
    optimisticTransactionThreadReportID?: string,
): OptimisticChatReport {
    const participantAccountIDs = [...new Set([currentUserAccountID, Number(reportAction?.actorAccountID)])].filter(Boolean) as number[];
    const existingTransactionThreadReport = getReportOrDraftReport(existingTransactionThreadReportID);

    if (existingTransactionThreadReportID && existingTransactionThreadReport) {
        return {
            ...existingTransactionThreadReport,
            parentReportActionID: reportAction?.reportActionID,
            parentReportID: moneyRequestReport?.reportID,
            chatReportID: moneyRequestReport?.reportID,
            reportName: getTransactionReportName({reportAction}),
            policyID: moneyRequestReport?.policyID,
        };
    }

    return buildOptimisticChatReport({
        participantList: participantAccountIDs,
        reportName: getTransactionReportName({reportAction}),
        policyID: moneyRequestReport?.policyID,
        ownerAccountID: CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
        parentReportActionID: reportAction?.reportActionID,
        parentReportID: moneyRequestReport?.reportID,
        optimisticReportID: optimisticTransactionThreadReportID,
        chatReportID: moneyRequestReport?.reportID,
    });
}

/**
 * Build optimistic expense entities:
 *
 * 1. CREATED action for the chatReport
 * 2. CREATED action for the iouReport
 * 3. IOU action for the iouReport linked to the transaction thread via `childReportID`
 * 4. Transaction Thread linked to the IOU action via `parentReportActionID`
 * 5. CREATED action for the Transaction Thread
 */
function buildOptimisticMoneyRequestEntities(
    optimisticMoneyRequestEntities: OptimisticMoneyRequestEntitiesWithoutTransactionThreadFlag,
): [OptimisticCreatedReportAction, OptimisticCreatedReportAction, OptimisticIOUReportAction, OptimisticChatReport, OptimisticCreatedReportAction | null];
function buildOptimisticMoneyRequestEntities(
    optimisticMoneyRequestEntities: OptimisticMoneyRequestEntitiesWithTransactionThreadFlag,
): [OptimisticCreatedReportAction, OptimisticCreatedReportAction, OptimisticIOUReportAction, OptimisticChatReport | undefined, OptimisticCreatedReportAction | null];
function buildOptimisticMoneyRequestEntities({
    iouReport,
    type,
    amount,
    currency,
    comment,
    payeeEmail,
    participants,
    transactionID,
    paymentType,
    isSettlingUp = false,
    isSendMoneyFlow = false,
    isOwnPolicyExpenseChat = false,
    isPersonalTrackingExpense,
    existingTransactionThreadReportID,
    linkedTrackedExpenseReportAction,
    optimisticCreatedReportActionID,
    shouldGenerateTransactionThreadReport = true,
    reportActionID,
}: OptimisticMoneyRequestEntities): [
    OptimisticCreatedReportAction,
    OptimisticCreatedReportAction,
    OptimisticIOUReportAction,
    OptimisticChatReport | undefined,
    OptimisticCreatedReportAction | null,
] {
    const createdActionForChat = buildOptimisticCreatedReportAction(payeeEmail, undefined, optimisticCreatedReportActionID);

    // The `CREATED` action must be optimistically generated before the IOU action so that it won't appear after the IOU action in the chat.
    const iouActionCreationTime = DateUtils.getDBTime();
    const createdActionForIOUReport = buildOptimisticCreatedReportAction(payeeEmail, DateUtils.subtractMillisecondsFromDateTime(iouActionCreationTime, 1));

    const iouAction = buildOptimisticIOUReportAction({
        type,
        amount,
        currency,
        comment,
        participants,
        transactionID,
        paymentType,
        iouReportID: iouReport.reportID,
        isPersonalTrackingExpense,
        isSettlingUp,
        isSendMoneyFlow,
        isOwnPolicyExpenseChat,
        created: iouActionCreationTime,
        linkedExpenseReportAction: linkedTrackedExpenseReportAction,
        reportActionID,
    });

    // Create optimistic transactionThread and the `CREATED` action for it, if existingTransactionThreadReportID is undefined
    const transactionThread = shouldGenerateTransactionThreadReport ? buildTransactionThread(iouAction, iouReport, existingTransactionThreadReportID) : undefined;
    const createdActionForTransactionThread = !!existingTransactionThreadReportID || !shouldGenerateTransactionThreadReport ? null : buildOptimisticCreatedReportAction(payeeEmail);

    // The IOU action and the transactionThread are co-dependent as parent-child, so we need to link them together
    iouAction.childReportID = existingTransactionThreadReportID ?? transactionThread?.reportID;

    return [createdActionForChat, createdActionForIOUReport, iouAction, transactionThread, createdActionForTransactionThread];
}

/**
 * Check if the report is empty, meaning it has no visible messages (i.e. only a "created" report action).
 * Added caching mechanism via derived values.
 */
function isEmptyReport(report: OnyxEntry<Report>, isReportArchived: boolean | undefined): boolean {
    if (!report) {
        return true;
    }

    // Get the `isEmpty` state from cached report attributes
    const attributes = reportAttributesDerivedValue?.[report.reportID];
    if (attributes) {
        return attributes.isEmpty;
    }

    return generateIsEmptyReport(report, isReportArchived);
}

type ReportEmptyStateSummary = Pick<
    Report,
    'policyID' | 'ownerAccountID' | 'type' | 'stateNum' | 'statusNum' | 'total' | 'nonReimbursableTotal' | 'pendingAction' | 'pendingFields' | 'errors'
> &
    Pick<Report, 'reportID'>;

function toReportEmptyStateSummary(report: Report | ReportEmptyStateSummary | undefined): ReportEmptyStateSummary | undefined {
    if (!report) {
        return undefined;
    }

    return {
        reportID: report.reportID,
        policyID: report.policyID ?? undefined,
        ownerAccountID: report.ownerAccountID ?? undefined,
        type: report.type ?? undefined,
        stateNum: report.stateNum ?? undefined,
        statusNum: report.statusNum ?? undefined,
        total: report.total ?? undefined,
        nonReimbursableTotal: report.nonReimbursableTotal ?? undefined,
        pendingAction: report.pendingAction ?? undefined,
        pendingFields: report.pendingFields ?? undefined,
        errors: report.errors ?? undefined,
    };
}

function getReportSummariesForEmptyCheck(reports: OnyxCollection<Report> | Array<Report | ReportEmptyStateSummary | null | undefined> | undefined): ReportEmptyStateSummary[] {
    if (!reports) {
        return [];
    }

    const reportsArray = Array.isArray(reports) ? reports : Object.values(reports);
    return reportsArray.map((report) => toReportEmptyStateSummary(report as Report | ReportEmptyStateSummary | undefined)).filter((summary): summary is ReportEmptyStateSummary => !!summary);
}

const reportSummariesOnyxSelector = (reports: Parameters<typeof getReportSummariesForEmptyCheck>[0]) => getReportSummariesForEmptyCheck(reports);

/**
 * Checks if there are any empty (no transactions) open expense reports for a specific policy and user.
 * An empty report is defined as having zero transactions.
 * This excludes reports that are being deleted or have errors.
 */
function hasEmptyReportsForPolicy(
    reports: OnyxCollection<Report> | Array<Report | ReportEmptyStateSummary | null | undefined> | undefined,
    policyID: string | undefined,
    accountID?: number,
    reportsTransactionsParam: Record<string, Transaction[]> = reportsTransactions,
): boolean {
    if (!accountID || !policyID) {
        return false;
    }

    const summaries = getReportSummariesForEmptyCheck(reports);

    return summaries.some((report) => {
        if (!report.reportID || !report.policyID || report.policyID !== policyID || report.ownerAccountID !== accountID) {
            return false;
        }

        // Exclude reports that are being deleted or have errors
        if (report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.errors) {
            return false;
        }

        const isOutstandingExpense =
            report.type === CONST.REPORT.TYPE.EXPENSE &&
            (report.stateNum ?? CONST.REPORT.STATE_NUM.OPEN) <= CONST.REPORT.STATE_NUM.SUBMITTED &&
            (report.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN) <= CONST.REPORT.STATUS_NUM.SUBMITTED;
        if (!isOutstandingExpense) {
            return false;
        }

        // Ignore transactions that are already pending deletion so we treat the report as empty once the removal is queued.
        const transactions = getReportTransactions(report.reportID, reportsTransactionsParam).filter(
            (transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        return transactions.length === 0;
    });
}

/**
 * Returns a lookup object containing the policy IDs that have empty (no transactions) open expense reports for a specific user.
 * An empty report is defined as having zero transactions.
 * This excludes reports that are being deleted or have errors.
 */
function getPolicyIDsWithEmptyReportsForAccount(
    reports: OnyxCollection<Report> | Array<Report | ReportEmptyStateSummary | null | undefined> | undefined,
    accountID?: number,
    reportsTransactionsParam: Record<string, Transaction[]> = reportsTransactions,
): Record<string, boolean> {
    if (!accountID) {
        return {};
    }

    const summaries = getReportSummariesForEmptyCheck(reports);
    const policyLookup: Record<string, boolean> = {};

    for (const report of summaries) {
        if (!report.reportID || !report.policyID || report.ownerAccountID !== accountID) {
            continue;
        }

        if (report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || report.errors) {
            continue;
        }

        const isOutstandingExpense =
            report.type === CONST.REPORT.TYPE.EXPENSE &&
            (report.stateNum ?? CONST.REPORT.STATE_NUM.OPEN) <= CONST.REPORT.STATE_NUM.SUBMITTED &&
            (report.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN) <= CONST.REPORT.STATUS_NUM.SUBMITTED;
        if (!isOutstandingExpense) {
            continue;
        }

        // Ignore transactions that are already pending deletion so we treat the report as empty once the removal is queued.
        const transactions = getReportTransactions(report.reportID, reportsTransactionsParam).filter(
            (transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        if (transactions.length === 0) {
            policyLookup[report.policyID] = true;
        }
    }

    return policyLookup;
}

/**
 * Check if the report is empty, meaning it has no visible messages (i.e. only a "created" report action).
 * No cache implementation which bypasses derived value check.
 */
function generateIsEmptyReport(report: OnyxEntry<Report>, isReportArchived: boolean | undefined): boolean {
    if (!report) {
        return true;
    }

    if (report.lastMessageText) {
        return false;
    }

    const lastVisibleMessage = getLastVisibleMessage(report.reportID, isReportArchived);
    return !lastVisibleMessage.lastMessageText;
}

// We need oneTransactionThreadReport to get the correct last visible action created
function isUnread(report: OnyxEntry<Report>, oneTransactionThreadReport: OnyxEntry<Report>, isReportArchived: boolean | undefined): boolean {
    if (!report) {
        return false;
    }

    if (isEmptyReport(report, isReportArchived)) {
        return false;
    }
    // lastVisibleActionCreated and lastReadTime are both datetime strings and can be compared directly
    const lastVisibleActionCreated = getReportLastVisibleActionCreated(report, oneTransactionThreadReport);
    const lastReadTime = report.lastReadTime ?? '';
    const lastMentionedTime = report.lastMentionedTime ?? '';

    // If the user was mentioned and the comment got deleted the lastMentionedTime will be more recent than the lastVisibleActionCreated
    return lastReadTime < (lastVisibleActionCreated ?? '') || lastReadTime < lastMentionedTime;
}

function isIOUOwnedByCurrentUser(report: OnyxEntry<Report>, allReportsDict?: OnyxCollection<Report>): boolean {
    const allAvailableReports = allReportsDict ?? allReports;
    if (!report || !allAvailableReports) {
        return false;
    }

    let reportToLook = report;
    if (report.iouReportID) {
        const iouReport = allAvailableReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            reportToLook = iouReport;
        }
    }

    return reportToLook.ownerAccountID === currentUserAccountID;
}

/**
 * Assuming the passed in report is a default room, lets us know whether we can see it or not, based on permissions and
 * the various subsets of users we've allowed to use default rooms.
 */
function canSeeDefaultRoom(report: OnyxEntry<Report>, betas: OnyxEntry<Beta[]>, isReportArchived = false): boolean {
    // Include archived rooms
    if (isArchivedNonExpenseReport(report, isReportArchived)) {
        return true;
    }

    // If the room has an assigned guide, it can be seen.
    if (hasExpensifyGuidesEmails(Object.keys(report?.participants ?? {}).map(Number))) {
        return true;
    }

    // Include any admins and announce rooms, since only non partner-managed domain rooms are on the beta now.
    if (isAdminRoom(report) || isAnnounceRoom(report)) {
        return true;
    }

    // For all other cases, just check that the user belongs to the default rooms beta
    return Permissions.isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS, betas ?? []);
}

function canAccessReport(report: OnyxEntry<Report>, betas: OnyxEntry<Beta[]>, isReportArchived = false): boolean {
    // We hide default rooms (it's basically just domain rooms now) from people who aren't on the defaultRooms beta.
    if (isDefaultRoom(report) && !canSeeDefaultRoom(report, betas, isReportArchived)) {
        return false;
    }

    if (report?.errorFields?.notFound) {
        return false;
    }

    return true;
}

// eslint-disable-next-line rulesdir/no-negated-variables
function isReportNotFound(report: OnyxEntry<Report>): boolean {
    return !!report?.errorFields?.notFound;
}

/**
 * Check if the report is the parent report of the currently viewed report or at least one child report has report action
 */
function shouldHideReport(report: OnyxEntry<Report>, currentReportId: string | undefined, isReportArchived: boolean | undefined): boolean {
    const currentReport = getReportOrDraftReport(currentReportId);
    const parentReport = getParentReport(!isEmptyObject(currentReport) ? currentReport : undefined);
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`] ?? {};
    const isChildReportHasComment = Object.values(reportActions ?? {})?.some(
        (reportAction) =>
            (reportAction?.childVisibleActionCount ?? 0) > 0 && shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canUserPerformWriteAction(report, isReportArchived)),
    );
    return parentReport?.reportID !== report?.reportID && !isChildReportHasComment;
}

/**
 * Should we display a RBR on the LHN on this report due to violations?
 */
function shouldDisplayViolationsRBRInLHN(report: OnyxEntry<Report>, transactionViolations: OnyxCollection<TransactionViolation[]>): boolean {
    // We only show the RBR in the highest level, which is the expense chat
    if (!report || !isPolicyExpenseChat(report)) {
        return false;
    }

    // We only show the RBR to the submitter
    if (!isCurrentUserSubmitter(report)) {
        return false;
    }
    if (!report.policyID || !reportsByPolicyID) {
        return false;
    }

    // If any report has a violation, then it should have a RBR
    const potentialReports = Object.values(reportsByPolicyID[report.policyID] ?? {}) ?? [];
    return potentialReports.some((potentialReport) => {
        if (!potentialReport) {
            return false;
        }
        const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${potentialReport.policyID}`];
        const transactions = getReportTransactions(potentialReport.reportID);

        if (!isOpenReport(potentialReport)) {
            return false;
        }

        return (
            !isInvoiceReport(potentialReport) &&
            ViolationsUtils.hasVisibleViolationsForUser(
                potentialReport,
                transactionViolations,
                currentUserEmail ?? '',
                currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
                policy,
                transactions,
            ) &&
            (hasViolations(
                potentialReport.reportID,
                transactionViolations,
                currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
                currentUserEmail ?? '',
                true,
                transactions,
                potentialReport,
                policy,
            ) ||
                hasWarningTypeViolations(
                    potentialReport.reportID,
                    transactionViolations,
                    currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserEmail ?? '',
                    true,
                    transactions,
                    potentialReport,
                    policy,
                ) ||
                hasNoticeTypeViolations(
                    potentialReport.reportID,
                    transactionViolations,
                    currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID,
                    currentUserEmail ?? '',
                    true,
                    transactions,
                    potentialReport,
                    policy,
                ))
        );
    });
}

/**
 * Checks to see if a report contains a violation
 */
function hasViolations(
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    shouldShowInReview?: boolean,
    reportTransactions?: Transaction[],
    report?: OnyxEntry<Report>,
    policy?: OnyxEntry<Policy>,
): boolean {
    const transactions = reportTransactions ?? getReportTransactions(reportID);
    return transactions.some((transaction) => hasViolation(transaction, transactionViolations, currentUserEmailParam ?? '', currentUserAccountIDParam, report, policy, shouldShowInReview));
}

/**
 * Checks to see if a report contains a violation of type `warning`
 */
function hasWarningTypeViolations(
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    shouldShowInReview?: boolean,
    reportTransactions?: Transaction[],
    report?: OnyxEntry<Report>,
    policy?: OnyxEntry<Policy>,
): boolean {
    const transactions = reportTransactions ?? getReportTransactions(reportID);
    return transactions.some((transaction) =>
        hasWarningTypeViolation(transaction, transactionViolations, currentUserEmailParam ?? '', currentUserAccountIDParam, report, policy, shouldShowInReview),
    );
}

/**
 * Checks to see if a transaction contains receipt error
 */
function hasReceiptError(transaction: OnyxInputOrEntry<Transaction>): boolean {
    const errors = {
        ...(transaction?.errorFields?.route ?? transaction?.errorFields?.waypoints ?? transaction?.errors),
    };
    const errorEntries = Object.entries(errors ?? {});
    const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
    return Object.values(errorMessages).some((error) => isReceiptError(error));
}

/**
 * Checks to see if a report contains receipt error
 */
function hasReceiptErrors(reportID: string | undefined): boolean {
    const transactions = getReportTransactions(reportID);
    return transactions.some(hasReceiptError);
}

/**
 * Checks to see if a report contains a violation of type `notice`
 */
function hasNoticeTypeViolations(
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    shouldShowInReview?: boolean,
    reportTransactions?: Transaction[],
    report?: OnyxEntry<Report>,
    policy?: OnyxEntry<Policy>,
): boolean {
    const transactions = reportTransactions ?? getReportTransactions(reportID);
    return transactions.some((transaction) =>
        hasNoticeTypeViolation(transaction, transactionViolations, currentUserEmailParam ?? '', currentUserAccountIDParam, report, policy, shouldShowInReview),
    );
}

/**
 * Checks to see if a report contains any type of violation
 */
function hasAnyViolations(
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    reportTransactions?: Transaction[],
    report?: OnyxEntry<Report>,
    policy?: OnyxEntry<Policy>,
) {
    return (
        hasViolations(reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam, undefined, reportTransactions, report, policy) ||
        hasNoticeTypeViolations(reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam, true, reportTransactions, report, policy) ||
        hasWarningTypeViolations(reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam ?? '', true, reportTransactions, report, policy)
    );
}

function hasReportViolations(reportID: string | undefined) {
    if (!reportID) {
        return false;
    }
    const reportViolations = allReportsViolations?.[`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${reportID}`];
    return Object.values(reportViolations ?? {}).some((violations) => !isEmptyObject(violations));
}

/**
 * Checks if submission should be blocked due to strict policy rules being enabled and violations present.
 * When a user's domain has "strictly enforce workspace rules" enabled, they cannot submit reports with violations.
 */
function shouldBlockSubmitDueToStrictPolicyRules(
    reportID: string | undefined,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    areStrictPolicyRulesEnabled: boolean,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    reportTransactions?: Transaction[],
) {
    if (!areStrictPolicyRulesEnabled) {
        return false;
    }
    return hasAnyViolations(reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam, reportTransactions);
}

type ReportErrorsAndReportActionThatRequiresAttention = {
    errors: ErrorFields;
    reportAction?: OnyxEntry<ReportAction>;
};

function getAllReportActionsErrorsAndReportActionThatRequiresAttention(
    report: OnyxEntry<Report>,
    reportActions: OnyxEntry<ReportActions>,
    isReportArchived = false,
): ReportErrorsAndReportActionThatRequiresAttention {
    const reportActionsArray = Object.values(reportActions ?? {}).filter((action) => !isDeletedAction(action));
    const reportActionErrors: ErrorFields = {};
    let reportAction: OnyxEntry<ReportAction>;

    for (const action of reportActionsArray) {
        if (action && !isEmptyValueObject(action.errors)) {
            Object.assign(reportActionErrors, action.errors);

            if (!reportAction) {
                reportAction = action;
            }
        }
    }

    if (!isReportArchived && hasSmartscanError(reportActionsArray, report)) {
        reportActionErrors.smartscan = getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericSmartscanFailureMessage');
        reportAction = getReportActionWithSmartscanError(reportActionsArray, report);
    }

    if (!isReportArchived && report?.statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
        const mostRecentActiveDEWAction = getMostRecentActiveDEWSubmitFailedAction(reportActionsArray);
        if (mostRecentActiveDEWAction) {
            reportActionErrors.dewSubmitFailed = getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage');
            reportAction = mostRecentActiveDEWAction;
        }
    }

    return {
        errors: reportActionErrors,
        reportAction,
    };
}

/**
 * Get an object of error messages keyed by microtime by combining all error objects related to the report.
 */
function getAllReportErrors(report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>, isReportArchived = false): Errors {
    const reportErrorFields = report?.errorFields ?? {};
    const {errors: reportActionErrors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, isReportArchived);

    // All error objects related to the report. Each object in the sources contains error messages keyed by microtime
    const errorSources = {
        ...reportErrorFields,
        ...reportActionErrors,
    };

    const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
    if (reportErrorFields.export && !getConnectedIntegration(reportPolicy)) {
        delete errorSources.export;
    }

    // Combine all error messages keyed by microtime into one object
    const errorSourcesArray = Object.values(errorSources ?? {});
    const allReportErrors = {};

    for (const errors of errorSourcesArray) {
        if (!isEmptyObject(errors)) {
            Object.assign(allReportErrors, errors);
        }
    }
    return allReportErrors;
}

function hasReportErrorsOtherThanFailedReceipt(
    report: Report,
    chatReport: OnyxEntry<Report>,
    doesReportHaveViolations: boolean,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    reportAttributes?: ReportAttributesDerivedValue['reports'],
) {
    const allReportErrors = reportAttributes?.[report?.reportID]?.reportErrors ?? {};
    const transactionReportActions = getAllReportActions(report.reportID);
    const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, transactionReportActions, undefined);
    let doesTransactionThreadReportHasViolations = false;
    if (oneTransactionThreadReportID) {
        const transactionReport = getReport(oneTransactionThreadReportID, allReports);
        doesTransactionThreadReportHasViolations = !!transactionReport && shouldDisplayViolationsRBRInLHN(transactionReport, transactionViolations);
    }
    return (
        doesTransactionThreadReportHasViolations ||
        doesReportHaveViolations ||
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        Object.values(allReportErrors).some((error) => error?.[0] !== translateLocal('iou.error.genericSmartscanFailureMessage'))
    );
}

type ShouldReportBeInOptionListParams = {
    report: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    currentReportId: string | undefined;
    isInFocusMode: boolean;
    betas: OnyxEntry<Beta[]>;
    excludeEmptyChats: boolean;
    doesReportHaveViolations: boolean;
    includeSelfDM?: boolean;
    login?: string;
    includeDomainEmail?: boolean;
    isReportArchived: boolean | undefined;
    draftComment: string | undefined;
};

function reasonForReportToBeInOptionList({
    report,
    chatReport,
    currentReportId,
    isInFocusMode,
    betas,
    excludeEmptyChats,
    doesReportHaveViolations,
    draftComment,
    includeSelfDM = false,
    login,
    includeDomainEmail = false,
    isReportArchived,
}: ShouldReportBeInOptionListParams): ValueOf<typeof CONST.REPORT_IN_LHN_REASONS> | null {
    const isInDefaultMode = !isInFocusMode;
    // Exclude reports that have no data because there wouldn't be anything to show in the option item.
    // This can happen if data is currently loading from the server or a report is in various stages of being created.
    // This can also happen for anyone accessing a public room or archived room for which they don't have access to the underlying policy.
    // Optionally exclude reports that do not belong to currently active workspace

    const parentReportAction = isThread(report) ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]?.[report.parentReportActionID] : undefined;

    if (
        !report?.reportID ||
        !report?.type ||
        report?.reportName === undefined ||
        (!report?.participants &&
            // We omit sending back participants for chat rooms when searching for reports since they aren't needed to display the results and can get very large.
            // So we allow showing rooms with no participants–in any other circumstances we should never have these reports with no participants in Onyx.
            !isChatRoom(report) &&
            !isChatThread(report) &&
            !isReportArchived &&
            !isMoneyRequestReport(report) &&
            !isTaskReport(report) &&
            !isSelfDM(report) &&
            !isSystemChat(report) &&
            !isGroupChat(report))
    ) {
        return null;
    }

    const currentReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`] ?? {};
    const reportActionValues = Object.values(currentReportActions);

    // We used to use the system DM for A/B testing onboarding tasks, but now only create them in the Concierge chat. We
    // still need to allow existing users who have tasks in the system DM to see them, but otherwise we don't need to
    // show that chat
    if (report?.participants?.[CONST.ACCOUNT_ID.NOTIFICATIONS] && isEmptyReport(report, isReportArchived)) {
        return null;
    }

    if (!canAccessReport(report, betas, isReportArchived)) {
        return null;
    }

    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];

    // If this is a transaction thread associated with a report that only has one transaction, omit it
    if (isOneTransactionThread(report, parentReport, parentReportAction)) {
        return null;
    }

    if ((Object.values(CONST.REPORT.UNSUPPORTED_TYPE) as string[]).includes(report?.type ?? '')) {
        return null;
    }

    // Include the currently viewed report. If we excluded the currently viewed report, then there
    // would be no way to highlight it in the options list and it would be confusing to users because they lose
    // a sense of context.
    if (report.reportID === currentReportId) {
        return CONST.REPORT_IN_LHN_REASONS.IS_FOCUSED;
    }

    const hasOnlyCreatedAction = reportActionValues.length === 1 && reportActionValues.at(0)?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED;

    // Hide empty reports that have only a `CREATED` action, a total of 0, and are in a submitted state
    // These reports should be hidden because they appear empty to users and there is nothing actionable for them to do
    if (report?.total === 0 && report?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED && hasOnlyCreatedAction) {
        return null;
    }

    // Include reports that are relevant to the user in any view mode. Criteria include having a draft or having a GBR showing.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (draftComment) {
        return CONST.REPORT_IN_LHN_REASONS.HAS_DRAFT_COMMENT;
    }

    if (requiresAttentionFromCurrentUser(report, undefined, isReportArchived)) {
        return CONST.REPORT_IN_LHN_REASONS.HAS_GBR;
    }

    const isEmptyChat = isEmptyReport(report, isReportArchived);
    const canHideReport = shouldHideReport(report, currentReportId, isReportArchived);

    // Drafts already return early above, so no draft check needed here
    if (isChatThread(report) && isEmptyChat) {
        const isParentDeleted = !isEmptyObject(parentReportAction) && isDeletedAction(parentReportAction);
        const isParentPendingDelete = !isEmptyObject(parentReportAction) && parentReportAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        const hasReplies = (parentReportAction?.childVisibleActionCount ?? 0) > 0;

        if ((isParentDeleted || isParentPendingDelete) && !hasReplies) {
            return null;
        }
    }

    // Include reports if they are pinned
    if (report.isPinned) {
        return CONST.REPORT_IN_LHN_REASONS.PINNED_BY_USER;
    }

    const reportIsSettled = report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED;

    // Always show IOU reports with violations unless they are reimbursed
    if (isExpenseRequest(report) && doesReportHaveViolations && !reportIsSettled) {
        return CONST.REPORT_IN_LHN_REASONS.HAS_IOU_VIOLATIONS;
    }

    // Hide only chat threads that haven't been commented on (other threads are actionable)
    if (isChatThread(report) && canHideReport && isEmptyChat) {
        return null;
    }

    // Include reports that have errors from trying to add a workspace
    // If we excluded it, then the red-brock-road pattern wouldn't work for the user to resolve the error
    if (report.errorFields?.addWorkspaceRoom) {
        return CONST.REPORT_IN_LHN_REASONS.HAS_ADD_WORKSPACE_ROOM_ERRORS;
    }

    // All unread chats (even archived ones) in GSD mode will be shown. This is because GSD mode is specifically for focusing the user on the most relevant chats, primarily, the unread ones
    if (isInFocusMode) {
        const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`]);
        const oneTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`];
        return isUnread(report, oneTransactionThreadReport, isReportArchived) && getReportNotificationPreference(report) !== CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE
            ? CONST.REPORT_IN_LHN_REASONS.IS_UNREAD
            : null;
    }

    // Archived reports should always be shown when in default (most recent) mode. This is because you should still be able to access and search for the chats to find them.
    if (isInDefaultMode && isArchivedNonExpenseReport(report, isReportArchived)) {
        return CONST.REPORT_IN_LHN_REASONS.IS_ARCHIVED;
    }

    // Hide chats between two users that haven't been commented on from the LNH
    if (excludeEmptyChats && isEmptyChat && isChatReport(report) && !isPolicyExpenseChat(report) && !isTripRoom(report) && !isSystemChat(report) && canHideReport) {
        return null;
    }

    if (isSelfDM(report)) {
        return includeSelfDM ? CONST.REPORT_IN_LHN_REASONS.IS_SELF_DM : null;
    }

    if (Str.isDomainEmail(login ?? '') && !includeDomainEmail) {
        return null;
    }

    // Hide chat threads where the parent message is pending removal
    if (!isEmptyObject(parentReportAction) && isPendingRemove(parentReportAction) && isThreadParentMessage(parentReportAction, report?.reportID)) {
        return null;
    }

    return CONST.REPORT_IN_LHN_REASONS.DEFAULT;
}

/**
 * Takes several pieces of data from Onyx and evaluates if a report should be shown in the option list (either when searching
 * for reports or the reports shown in the LHN).
 *
 * This logic is very specific and the order of the logic is very important. It should fail quickly in most cases and also
 * filter out the majority of reports before filtering out very specific minority of reports.
 */
function shouldReportBeInOptionList(params: ShouldReportBeInOptionListParams) {
    return reasonForReportToBeInOptionList(params) !== null;
}

/**
 * Attempts to find a report in onyx with the provided list of participants. Does not include threads, task, expense, room, and policy expense chat.
 */
function getChatByParticipants(newParticipantList: number[], reports: OnyxCollection<Report> = allReports, shouldIncludeGroupChats = false): OnyxEntry<Report> {
    const sortedNewParticipantList = newParticipantList.sort();
    return Object.values(reports ?? {}).find((report) => {
        const participantAccountIDs = Object.keys(report?.participants ?? {});

        // Skip if it's not a 1:1 chat
        if (!shouldIncludeGroupChats && !isOneOnOneChat(report) && !isSystemChat(report)) {
            return false;
        }

        // If we are looking for a group chat, then skip non-group chat report
        if (shouldIncludeGroupChats && !isGroupChat(report)) {
            return false;
        }

        const sortedParticipantsAccountIDs = participantAccountIDs.map(Number).sort();

        // Only return the chat if it has all the participants
        return deepEqual(sortedNewParticipantList, sortedParticipantsAccountIDs);
    });
}

/**
 * Attempts to find a policy expense report in onyx that is owned by ownerAccountID in a given policy
 */
function getPolicyExpenseChat(ownerAccountID: number | undefined, policyID: string | undefined, reports = allReports): OnyxEntry<Report> {
    if (!ownerAccountID || !policyID) {
        return;
    }

    return Object.values(reports ?? {}).find((report: OnyxEntry<Report>) => {
        // If the report has been deleted, then skip it
        if (!report) {
            return false;
        }

        return report.policyID === policyID && isPolicyExpenseChat(report) && !isThread(report) && report.ownerAccountID === ownerAccountID;
    });
}

function getAllPolicyReports(policyID: string): Array<OnyxEntry<Report>> {
    return Object.values(allReports ?? {}).filter((report) => report?.policyID === policyID);
}

/**
 * Returns true if Chronos is one of the chat participants (1:1)
 */
function chatIncludesChronos(report: OnyxInputOrEntry<Report>): boolean {
    const participantAccountIDs = Object.keys(report?.participants ?? {}).map(Number);
    return participantAccountIDs.includes(CONST.ACCOUNT_ID.CHRONOS);
}

function chatIncludesChronosWithID(reportOrID?: string | Report): boolean {
    if (!reportOrID) {
        return false;
    }

    const report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    return chatIncludesChronos(report);
}

/**
 * Can only flag if:
 *
 * - It was written by someone else and isn't a whisper
 * - It's a welcome message whisper
 * - It's an ADD_COMMENT that is not an attachment
 */
function canFlagReportAction(reportAction: OnyxInputOrEntry<ReportAction>, reportID: string | undefined): boolean {
    const isCurrentUserAction = reportAction?.actorAccountID === currentUserAccountID;
    if (isWhisperAction(reportAction)) {
        // Allow flagging whispers that are sent by other users
        if (!isCurrentUserAction && reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE) {
            return true;
        }

        // Disallow flagging the rest of whisper as they are sent by us
        return false;
    }

    let report = getReportOrDraftReport(reportID);

    // If the childReportID exists in reportAction and is equal to the reportID,
    // the report action being evaluated is the parent report action in a thread, and we should get the parent report to evaluate instead.
    if (reportAction?.childReportID?.toString() === reportID?.toString()) {
        report = getReportOrDraftReport(report?.parentReportID);
    }

    return !!(
        !isCurrentUserAction &&
        reportAction?.actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT &&
        !isDeletedAction(reportAction) &&
        !isCreatedTaskReportAction(reportAction) &&
        !isEmptyObject(report) &&
        report &&
        isAllowedToComment(report)
    );
}

/**
 * Whether flag comment page should show
 */
function shouldShowFlagComment(reportAction: OnyxInputOrEntry<ReportAction>, report: OnyxInputOrEntry<Report>, isReportArchived = false): boolean {
    return (
        canFlagReportAction(reportAction, report?.reportID) &&
        !isArchivedNonExpenseReport(report, isReportArchived) &&
        !chatIncludesChronos(report) &&
        !isConciergeChatReport(report) &&
        reportAction?.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE
    );
}

/**
 * Performs the markdown conversion, and replaces code points > 127 with C escape sequences
 * Used for compatibility with the backend auth validator for AddComment, and to account for MD in comments
 * @returns The comment's total length as seen from the backend
 */
function getCommentLength(textComment: string, parsingDetails?: ParsingDetails): number {
    return getParsedComment(textComment, parsingDetails)
        .replaceAll(/[^ -~]/g, '\\u????')
        .trim().length;
}

function getRouteFromLink(url: string | null): string {
    if (!url) {
        return '';
    }

    // Get the reportID from URL
    let route = url;
    const localWebAndroidRegEx = /^(https:\/\/([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}))/;
    for (const prefix of linkingConfig.prefixes) {
        if (route.startsWith(prefix)) {
            route = route.replace(prefix, '');
        } else if (localWebAndroidRegEx.test(route)) {
            route = route.replace(localWebAndroidRegEx, '');
        } else {
            continue;
        }

        // Remove the port if it's a localhost URL
        if (/^:\d+/.test(route)) {
            route = route.replaceAll(/:\d+/g, '');
        }

        // Remove the leading slash if exists
        if (route.startsWith('/')) {
            route = route.replace('/', '');
        }
    }
    return route;
}

function parseReportRouteParams(route: string): ReportRouteParams {
    let parsingRoute = route;
    if (parsingRoute.at(0) === '/') {
        // remove the first slash
        parsingRoute = parsingRoute.slice(1);
    }

    if (!parsingRoute.startsWith(addTrailingForwardSlash(ROUTES.REPORT))) {
        return {reportID: '', isSubReportPageRoute: false};
    }

    const state = getStateFromPath(parsingRoute as Route);
    const focusedRoute = findFocusedRoute(state);

    const reportID = focusedRoute?.params && 'reportID' in focusedRoute.params ? (focusedRoute?.params?.reportID as string) : '';

    if (!reportID) {
        return {reportID: '', isSubReportPageRoute: false};
    }

    return {
        reportID,
        // We're checking the route start with `r/`, the sub report route is the route that we can open from report screen like `r/:reportID/details`
        isSubReportPageRoute: focusedRoute?.name !== SCREENS.REPORT,
    };
}

function getReportIDFromLink(url: string | null): string {
    const route = getRouteFromLink(url);
    const {reportID, isSubReportPageRoute} = parseReportRouteParams(route);
    if (isSubReportPageRoute) {
        // We allow the Sub-Report deep link routes (settings, details, etc.) to be handled by their respective component pages
        return '';
    }
    return reportID;
}

/**
 * Check if the chat report is linked to an iou that is waiting for the current user to add a credit bank account.
 */
function hasIOUWaitingOnCurrentUserBankAccount(chatReport: OnyxInputOrEntry<Report>): boolean {
    if (chatReport?.iouReportID) {
        const iouReport = getReport(chatReport.iouReportID, allReports);
        if (iouReport?.isWaitingOnBankAccount && iouReport?.ownerAccountID === currentUserAccountID) {
            return true;
        }
    }

    return false;
}

/**
 * Users can submit an expense:
 * - in policy expense chats only if they are in a role of a member in the chat (in other words, if it's their policy expense chat)
 * - in an open or submitted expense report tied to a policy expense chat the user owns
 *     - employee can submit expenses in a submitted expense report only if the policy has Instant Submit settings turned on
 * - in an IOU report, which is not settled yet
 * - in a 1:1 DM chat
 */
function canRequestMoney(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, otherParticipants: number[]): boolean {
    // User cannot submit expenses in a chat thread, task report or in a chat room
    if (isChatThread(report) || isTaskReport(report) || isChatRoom(report) || isSelfDM(report) || isGroupChat(report)) {
        return false;
    }

    // Users can only submit expenses in DMs if they are a 1:1 DM
    if (isDM(report)) {
        return otherParticipants.length === 1;
    }

    // Prevent requesting money if pending IOU report waiting for their bank account already exists
    if (hasIOUWaitingOnCurrentUserBankAccount(report)) {
        return false;
    }

    let isOwnPolicyExpenseChat = report?.isOwnPolicyExpenseChat ?? false;
    if (isExpenseReport(report) && getParentReport(report)) {
        isOwnPolicyExpenseChat = !!getParentReport(report)?.isOwnPolicyExpenseChat;
    }

    // In case there are no other participants than the current user and it's not user's own policy expense chat, they can't submit expenses from such report
    if (otherParticipants.length === 0 && !isOwnPolicyExpenseChat) {
        return false;
    }

    // Current user must be a manager or owner of this IOU
    if (isIOUReport(report) && currentUserAccountID !== report?.managerID && currentUserAccountID !== report?.ownerAccountID) {
        return false;
    }

    if (isMoneyRequestReport(report)) {
        return canAddTransaction(report);
    }

    // In the case of policy expense chat, users can only submit expenses from their own policy expense chat
    return !isPolicyExpenseChat(report) || isOwnPolicyExpenseChat;
}

function isGroupChatAdmin(report: OnyxEntry<Report>, accountID: number) {
    if (!report?.participants) {
        return false;
    }

    const reportParticipants = report.participants ?? {};
    const participant = reportParticipants[accountID];
    return participant?.role === CONST.REPORT.ROLE.ADMIN;
}

/**
 * Helper method to define what expense options we want to show for particular method.
 * There are 4 expense options: Submit, Split, Pay and Track expense:
 * - Submit option should show for:
 *     - DMs
 *     - own policy expense chats
 *     - open and processing expense reports tied to own policy expense chat
 *     - unsettled IOU reports
 * - Pay option should show for:
 *     - DMs
 * - Split options should show for:
 *     - DMs
 *     - chat/policy rooms with more than 1 participant
 *     - groups chats with 2 and more participants
 *     - corporate expense chats
 * - Track expense option should show for:
 *    - Self DMs
 *    - own policy expense chats
 *    - open and processing expense reports tied to own policy expense chat
 * - Send invoice option should show for:
 *    - invoice rooms if the user is an admin of the sender workspace
 * None of the options should show in chat threads or if there is some special Expensify account
 * as a participant of the report.
 */
function getMoneyRequestOptions(
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    reportParticipants: number[],
    filterDeprecatedTypes = false,
    isReportArchived = false,
    isRestrictedToPreferredPolicy = false,
): IOUType[] {
    const teacherUnitePolicyID = environment === CONST.ENVIRONMENT.PRODUCTION ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
    const isTeachersUniteReport = report?.policyID === teacherUnitePolicyID;

    // In any thread, task report or trip room, we do not allow any new expenses
    if (isChatThread(report) || isTaskReport(report) || isInvoiceReport(report) || isSystemChat(report) || isReportArchived || isTripRoom(report)) {
        return [];
    }

    if (isInvoiceRoom(report)) {
        if (canSendInvoiceFromWorkspace(policy?.id) && isPolicyAdmin(allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`])) {
            return [CONST.IOU.TYPE.INVOICE];
        }
        return [];
    }

    const otherParticipants = reportParticipants.filter((accountID) => currentUserAccountID !== accountID);
    // We don't allow IOU actions if an Expensify account is a participant of the report, unless the policy that the report is on is owned by an Expensify account
    const doParticipantsIncludeExpensifyAccounts = lodashIntersection(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS).length > 0;
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policyOwnerAccountID = getPolicy(report?.policyID)?.ownerAccountID;
    const isPolicyOwnedByExpensifyAccounts = policyOwnerAccountID ? CONST.EXPENSIFY_ACCOUNT_IDS.includes(policyOwnerAccountID) : false;
    if (doParticipantsIncludeExpensifyAccounts && !isPolicyOwnedByExpensifyAccounts) {
        // Allow create expense option for Manager McTest report
        if (
            canRequestMoney(report, policy, otherParticipants) &&
            reportParticipants.some((accountID) => accountID === CONST.ACCOUNT_ID.MANAGER_MCTEST) &&
            Permissions.isBetaEnabled(CONST.BETAS.NEWDOT_MANAGER_MCTEST, allBetas)
        ) {
            return [CONST.IOU.TYPE.SUBMIT];
        }
        return [];
    }

    const hasSingleParticipantInReport = otherParticipants.length === 1;
    let options: IOUType[] = [];

    if (isSelfDM(report)) {
        options = [CONST.IOU.TYPE.TRACK];
    }

    if (canRequestMoney(report, policy, otherParticipants)) {
        // For Teachers Unite policy, don't show Create Expense option
        if (!isTeachersUniteReport) {
            options = [...options, CONST.IOU.TYPE.SUBMIT];
            if (!filterDeprecatedTypes) {
                options = [...options, CONST.IOU.TYPE.REQUEST];
            }
        }

        // If the user can request money from the workspace report, they can also track expenses
        if (isPolicyExpenseChat(report) || isExpenseReport(report)) {
            options = [...options, CONST.IOU.TYPE.TRACK];
        }
    }

    // For expense reports on Teachers Unite workspace, disable "Create report" option
    if (isExpenseReport(report) && report?.policyID === teacherUnitePolicyID) {
        options = options.filter((option) => option !== CONST.IOU.TYPE.SUBMIT);
    }

    // User created policy rooms and default rooms like #admins or #announce will always have the Split Expense option
    // unless there are no other participants at all (e.g. #admins room for a policy with only 1 admin)
    // DM chats will have the Split Expense option.
    // Your own expense chats will have the split expense option.
    // Only show Split Expense for TU policy
    if (
        (isChatRoom(report) && !isAnnounceRoom(report) && otherParticipants.length > 0) ||
        (isDM(report) && otherParticipants.length > 0) ||
        (isGroupChat(report) && otherParticipants.length > 0) ||
        (isPolicyExpenseChat(report) && report?.isOwnPolicyExpenseChat && isTeachersUniteReport)
    ) {
        options = [...options, CONST.IOU.TYPE.SPLIT];
    }

    // Pay someone option should be visible only in 1:1 DMs
    if (isDM(report) && hasSingleParticipantInReport) {
        options = [...options, CONST.IOU.TYPE.PAY];
        if (!filterDeprecatedTypes) {
            options = [...options, CONST.IOU.TYPE.SEND];
        }
    }

    // Apply preferred workspace restrictions if enabled
    if (isRestrictedToPreferredPolicy) {
        options = options.filter((option) => {
            // Remove PAY/SEND options for DMs
            if (option === CONST.IOU.TYPE.PAY || option === CONST.IOU.TYPE.SEND) {
                return !isDM(report);
            }

            // Remove SUBMIT/REQUEST/SPLIT options for DMs, group chats, user-created chat rooms, and IOU reports
            if (option === CONST.IOU.TYPE.SUBMIT || option === CONST.IOU.TYPE.REQUEST || option === CONST.IOU.TYPE.SPLIT) {
                return !isDM(report) && !isGroupChat(report) && !isUserCreatedPolicyRoom(report) && !isIOUReport(report);
            }

            // Keep other options (TRACK, INVOICE, etc.)
            return true;
        });
    }

    return options;
}

/**
 * This is a temporary function to help with the smooth transition with the oldDot.
 * This function will be removed once the transition occurs in oldDot to new links.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
function temporary_getMoneyRequestOptions(
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    reportParticipants: number[],
    isReportArchived = false,
    isRestrictedToPreferredPolicy = false,
): Array<Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.SPLIT_EXPENSE>> {
    return getMoneyRequestOptions(report, policy, reportParticipants, true, isReportArchived, isRestrictedToPreferredPolicy) as Array<
        Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND | typeof CONST.IOU.TYPE.CREATE | typeof CONST.IOU.TYPE.SPLIT_EXPENSE>
    >;
}

/**
 * Invoice sender, invoice receiver and auto-invited admins cannot leave
 */
function canLeaveInvoiceRoom(report: OnyxEntry<Report>): boolean {
    if (!report || !report?.invoiceReceiver) {
        return false;
    }

    if (report?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED) {
        return false;
    }
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isSenderPolicyAdmin = getPolicy(report.policyID)?.role === CONST.POLICY.ROLE.ADMIN;

    if (isSenderPolicyAdmin) {
        return false;
    }

    if (report.invoiceReceiver.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
        return report?.invoiceReceiver?.accountID !== currentUserAccountID;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const isReceiverPolicyAdmin = getPolicy(report.invoiceReceiver.policyID)?.role === CONST.POLICY.ROLE.ADMIN;

    if (isReceiverPolicyAdmin) {
        return false;
    }

    return true;
}

function isCurrentUserTheOnlyParticipant(participantAccountIDs?: number[]): boolean {
    return !!(participantAccountIDs?.length === 1 && participantAccountIDs?.at(0) === currentUserAccountID);
}

/**
 * Returns display names for those that can see the whisper.
 * However, it returns "you" if the current user is the only one who can see it besides the person that sent it.
 */
function getWhisperDisplayNames(translate: LocalizedTranslate, formatPhoneNumber: LocaleContextProps['formatPhoneNumber'], participantAccountIDs?: number[]): string | undefined {
    const isWhisperOnlyVisibleToCurrentUser = isCurrentUserTheOnlyParticipant(participantAccountIDs);

    // When the current user is the only participant, the display name needs to be "you" because that's the only person reading it
    if (isWhisperOnlyVisibleToCurrentUser) {
        return translate('common.youAfterPreposition');
    }

    return participantAccountIDs?.map((accountID) => getDisplayNameForParticipant({accountID, shouldUseShortForm: !isWhisperOnlyVisibleToCurrentUser, formatPhoneNumber})).join(', ');
}

/**
 * Show subscript on expense chats / threads and expense requests
 */
function shouldReportShowSubscript(report: OnyxEntry<Report>, isReportArchived = false): boolean {
    if (isArchivedNonExpenseReport(report, isReportArchived) && !isWorkspaceThread(report)) {
        return false;
    }

    if (isPolicyExpenseChat(report) && !isChatThread(report) && !isTaskReport(report) && !report?.isOwnPolicyExpenseChat) {
        return true;
    }

    if (isPolicyExpenseChat(report) && !isThread(report) && !isTaskReport(report)) {
        return true;
    }

    if (isExpenseRequest(report)) {
        return true;
    }

    if (isExpenseReport(report)) {
        return true;
    }

    if (isWorkspaceTaskReport(report)) {
        return true;
    }

    if (isWorkspaceThread(report)) {
        return true;
    }

    if (isInvoiceRoom(report) || isInvoiceReport(report)) {
        return true;
    }

    return false;
}

/**
 * Return true if reports data exists
 */
function isReportDataReady(): boolean {
    return !isEmptyObject(allReports) && Object.keys(allReports ?? {}).some((key) => allReports?.[key]?.reportID);
}

/**
 * Return true if reportID from path is valid
 */
function isValidReportIDFromPath(reportIDFromPath: string | undefined): boolean {
    return !!reportIDFromPath && !['', 'null', 'undefined', '0', '-1'].includes(reportIDFromPath);
}

/**
 * Return the errors we have when creating a chat, a workspace room, or a new empty report
 */
function getCreationReportErrors(report: OnyxEntry<Report>): Errors | null | undefined {
    // We are either adding a workspace room, creating a chat, or we're creating a report, it isn't possible for all of these to have errors for the same report at the same time, so
    // simply looking up the first truthy value will get the relevant property if it's set.
    return report?.errorFields?.addWorkspaceRoom ?? report?.errorFields?.createChat ?? report?.errorFields?.createReport;
}

/**
 * Return true if the expense report is marked for deletion.
 */
function isMoneyRequestReportPendingDeletion(reportOrID: OnyxEntry<Report> | string): boolean {
    const report = typeof reportOrID === 'string' ? getReport(reportOrID, allReports) : reportOrID;
    if (!isMoneyRequestReport(report)) {
        return false;
    }

    const parentReportAction = getReportAction(report?.parentReportID, report?.parentReportActionID);
    return parentReportAction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function navigateToLinkedReportAction(ancestor: Ancestor, isInNarrowPaneModal: boolean, canUserPerformWrite: boolean | undefined, isOffline: boolean) {
    if (isInNarrowPaneModal) {
        Navigation.navigate(
            ROUTES.SEARCH_REPORT.getRoute({
                reportID: ancestor.report.reportID,
                reportActionID: ancestor.reportAction.reportActionID,
                backTo: SCREENS.RIGHT_MODAL.SEARCH_REPORT,
            }),
        );
        return;
    }

    // Pop the thread report screen before navigating to the chat report.
    Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.reportID));

    const isVisibleAction = shouldReportActionBeVisible(ancestor.reportAction, ancestor.reportAction.reportActionID, canUserPerformWrite);

    if (isVisibleAction && !isOffline) {
        // Pop the chat report screen before navigating to the linked report action.
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(ancestor.report.reportID, ancestor.reportAction.reportActionID));
    }
}

function canUserPerformWriteAction(report: OnyxEntry<Report>, isReportArchived: boolean | undefined) {
    const reportErrors = getCreationReportErrors(report);

    // If the expense report is marked for deletion, let us prevent any further write action.
    if (isMoneyRequestReportPendingDeletion(report)) {
        return false;
    }

    return !isArchivedNonExpenseReport(report, isReportArchived) && isEmptyObject(reportErrors) && report && isAllowedToComment(report) && !isAnonymousUser && canWriteInReport(report);
}

/**
 * Returns ID of the original report from which the given reportAction is first created.
 */
function getOriginalReportID(reportID: string | undefined, reportAction: OnyxInputOrEntry<ReportAction>): string | undefined {
    if (!reportID) {
        return undefined;
    }
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`];
    const currentReportAction = reportAction?.reportActionID ? reportActions?.[reportAction.reportActionID] : undefined;
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions ?? ([] as ReportAction[]));
    const isThreadReportParentAction = reportAction?.childReportID?.toString() === reportID;
    if (Object.keys(currentReportAction ?? {}).length === 0) {
        return isThreadReportParentAction ? getReport(reportID, allReports)?.parentReportID : (transactionThreadReportID ?? reportID);
    }
    return reportID;
}

/**
 * Return the pendingAction and the errors resulting from either
 *
 * - creating a workspace room
 * - starting a chat
 * - paying the expense
 *
 * while being offline
 */
function getReportOfflinePendingActionAndErrors(report: OnyxEntry<Report>): ReportOfflinePendingActionAndErrors {
    // It shouldn't be possible for all of these actions to be pending (or to have errors) for the same report at the same time, so just take the first that exists
    const reportPendingAction = report?.pendingFields?.addWorkspaceRoom ?? report?.pendingFields?.createChat ?? report?.pendingFields?.createReport ?? report?.pendingFields?.reportName;
    const reportErrors = getCreationReportErrors(report);
    return {reportPendingAction, reportErrors};
}

/**
 * Check if the report can create the expense with type is iouType
 */
function canCreateRequest(
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    isReportArchived: boolean | undefined,
    isRestrictedToPreferredPolicy = false,
): boolean {
    const participantAccountIDs = Object.keys(report?.participants ?? {}).map(Number);

    if (!canUserPerformWriteAction(report, isReportArchived)) {
        return false;
    }

    const requestOptions = getMoneyRequestOptions(report, policy, participantAccountIDs, false, isReportArchived, isRestrictedToPreferredPolicy);
    requestOptions.push(CONST.IOU.TYPE.CREATE);

    return requestOptions.includes(iouType);
}

function getWorkspaceChats(policyID: string | undefined, accountIDs: number[], reports: OnyxCollection<Report> = allReports): Array<OnyxEntry<Report>> {
    return Object.values(reports ?? {}).filter(
        (report) => isPolicyExpenseChat(report) && !!policyID && report?.policyID === policyID && report?.ownerAccountID && accountIDs.includes(report?.ownerAccountID),
    );
}

/**
 * Gets all reports that relate to the policy
 *
 * @param policyID - the workspace ID to get all associated reports
 */
function getAllWorkspaceReports(policyID?: string): Array<OnyxEntry<Report>> {
    if (!policyID) {
        return [];
    }
    return Object.values(allReports ?? {}).filter((report) => report?.policyID === policyID);
}

/**
 * @param policy - the workspace the report is on, null if the user isn't a member of the workspace
 */
function shouldDisableRename(report: OnyxEntry<Report>, isReportArchived = false): boolean {
    if (
        isDefaultRoom(report) ||
        isReportArchived ||
        isPublicRoom(report) ||
        isThread(report) ||
        isMoneyRequest(report) ||
        isMoneyRequestReport(report) ||
        isPolicyExpenseChat(report) ||
        isInvoiceRoom(report) ||
        isInvoiceReport(report) ||
        isSystemChat(report)
    ) {
        return true;
    }

    if (isGroupChat(report)) {
        return false;
    }

    if (isDeprecatedGroupDM(report, isReportArchived) || isTaskReport(report)) {
        return true;
    }

    return false;
}

/**
 * @param policy - the workspace the report is on, null if the user isn't a member of the workspace
 */
function canEditWriteCapability(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, isReportArchived = false): boolean {
    return isPolicyAdminPolicyUtils(policy) && !isAdminRoom(report) && !isReportArchived && !isThread(report) && !isInvoiceRoom(report) && !isPolicyExpenseChat(report);
}

/**
 * @param policy - the workspace the room is on, null if the user isn't a member of the workspace
 * @param isReportArchived - whether the workspace room is archived
 */
function canEditRoomVisibility(policy: OnyxEntry<Policy>, isReportArchived: boolean): boolean {
    return !isReportArchived && isPolicyAdminPolicyUtils(policy);
}

/**
 * Returns the onyx data needed for the task assignee chat
 */
function getTaskAssigneeChatOnyxData(
    accountID: number,
    assigneeAccountID: number,
    taskReportID: string,
    assigneeChatReportID: string,
    parentReportID: string | undefined,
    title: string,
    assigneeChatReport: OnyxEntry<Report>,
    isOptimisticAssigneeChatReport?: boolean,
): OnyxDataTaskAssigneeChat {
    // Set if we need to add a comment to the assignee chat notifying them that they have been assigned a task
    let optimisticAssigneeAddComment: OptimisticReportAction | undefined;
    // Set if this is a new chat that needs to be created for the assignee
    let optimisticChatCreatedReportAction: OptimisticCreatedReportAction | undefined;
    const assigneeChatReportMetadata = getReportMetadata(assigneeChatReportID);
    const currentTime = DateUtils.getDBTime();
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>> = [];

    // You're able to assign a task to someone you haven't chatted with before - so we need to optimistically create the chat and the chat reportActions
    // Only add the assignee chat report to onyx if we haven't already set it optimistically
    if ((isOptimisticAssigneeChatReport ?? assigneeChatReportMetadata?.isOptimisticReport) && assigneeChatReport?.pendingFields?.createChat !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        optimisticChatCreatedReportAction = buildOptimisticCreatedReportAction(assigneeChatReportID);
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: {
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${assigneeChatReportID}`,
                value: {
                    isOptimisticReport: true,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticChatCreatedReportAction.reportActionID]: optimisticChatCreatedReportAction as Partial<ReportAction>},
            },
        );

        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                    },
                    // BE will send a different participant. We clear the optimistic one to avoid duplicated entries
                    participants: {[assigneeAccountID]: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${assigneeChatReportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${assigneeChatReportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );

        // If task assignee is created optimistically, we need to clear the optimistic personal details to prevent duplication with real data sent from BE.
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [assigneeAccountID]: null,
            },
        });

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticChatCreatedReportAction.reportActionID]: {pendingAction: null}},
            },
            // If we failed, we want to remove the optimistic personal details as it was likely due to an invalid login
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [assigneeAccountID]: null,
                },
            },
        );
    }

    // If you're choosing to share the task in the same DM as the assignee then we don't need to create another reportAction indicating that you've been assigned
    if (assigneeChatReportID !== parentReportID) {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const displayname = allPersonalDetails?.[assigneeAccountID]?.displayName || allPersonalDetails?.[assigneeAccountID]?.login || '';
        optimisticAssigneeAddComment = buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeAccountID, `assigned to ${displayname}`, parentReportID);
        const lastAssigneeCommentText = formatReportLastMessageText(getReportActionText(optimisticAssigneeAddComment.reportAction as ReportAction));
        const optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: lastAssigneeCommentText,
            lastActorAccountID: accountID,
            lastReadTime: currentTime,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction as ReportAction},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: optimisticAssigneeReport,
            },
        );
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: {isOptimisticAction: null}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: {pendingAction: null}},
        });
    }

    return {
        optimisticData,
        successData,
        failureData,
        optimisticAssigneeAddComment,
        optimisticChatCreatedReportAction,
    };
}

/**
 * Return iou report action display message
 */
function getIOUReportActionDisplayMessage(translate: LocalizedTranslate, reportAction: OnyxEntry<ReportAction>, transaction?: OnyxEntry<Transaction>, report?: Report): string {
    if (!isMoneyRequestAction(reportAction)) {
        return '';
    }
    const originalMessage = getOriginalMessage(reportAction);
    const {IOUReportID, automaticAction, payAsBusiness} = originalMessage ?? {};
    const iouReport = getReportOrDraftReport(IOUReportID);
    const isInvoice = isInvoiceReport(iouReport);

    let translationKey: TranslationPaths;
    if (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        const reportPolicy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`];
        const last4Digits = reportPolicy?.achAccount?.accountNumber?.slice(-4) ?? '';

        switch (originalMessage.paymentType) {
            case CONST.IOU.PAYMENT_TYPE.ELSEWHERE:
                translationKey = hasMissingInvoiceBankAccount(IOUReportID) ? 'iou.payerSettledWithMissingBankAccount' : 'iou.paidElsewhere';
                break;
            case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
            case CONST.IOU.PAYMENT_TYPE.VBBA:
                if (isInvoice) {
                    return translate(payAsBusiness ? 'iou.settleInvoiceBusiness' : 'iou.settleInvoicePersonal', '', last4Digits);
                }
                translationKey = 'iou.businessBankAccount';

                if (automaticAction) {
                    if (originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
                        return translate('iou.automaticallyPaidWithExpensify', '');
                    }
                    return translate('iou.automaticallyPaidWithBusinessBankAccount', '', last4Digits);
                }
                break;
            default:
                return translate('iou.payerPaidAmount', '', '');
        }
        if (translationKey === 'iou.businessBankAccount') {
            return translate(translationKey, '', last4Digits);
        }
        if (translationKey === 'iou.paidElsewhere') {
            return translate(translationKey);
        }
        if (translationKey === 'iou.payerSettledWithMissingBankAccount') {
            return translate(translationKey, '');
        }
    }

    const amount = getTransactionAmount(transaction, !isEmptyObject(iouReport) && isExpenseReport(iouReport), transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) ?? 0;
    const formattedAmount = convertToDisplayString(amount, getCurrency(transaction)) ?? '';
    const isRequestSettled = isSettled(IOUReportID);
    const isApproved = isReportApproved({report: iouReport});
    if (isRequestSettled) {
        return translate('iou.payerSettled', formattedAmount);
    }
    if (isApproved) {
        return translate('iou.approvedAmount', formattedAmount);
    }
    if (isSplitBillReportAction(reportAction)) {
        translationKey = 'iou.didSplitAmount';
    } else if (isTrackExpenseAction(reportAction)) {
        translationKey = 'iou.trackedAmount';
    } else {
        translationKey = 'iou.expenseAmount';
    }
    return translate(translationKey, formattedAmount, getMerchantOrDescription(transaction));
}

/**
 * Checks if a report is a group chat.
 *
 * A report is a group chat if it meets the following conditions:
 * - Not a chat thread.
 * - Not a task report.
 * - Not an expense / IOU report.
 * - Not an archived room.
 * - Not a public / admin / announce chat room (chat type doesn't match any of the specified types).
 * - More than 2 participants.
 *
 */
function isDeprecatedGroupDM(report: OnyxEntry<Report>, isReportArchived = false): boolean {
    return !!(
        report &&
        !isChatThread(report) &&
        !isTaskReport(report) &&
        !isInvoiceReport(report) &&
        !isMoneyRequestReport(report) &&
        !isReportArchived &&
        !Object.values(CONST.REPORT.CHAT_TYPE).some((chatType) => chatType === getChatType(report)) &&
        Object.keys(report.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID).length > 1
    );
}

/**
 * A "root" group chat is the top level group chat and does not refer to any threads off of a Group Chat
 */
function isRootGroupChat(report: OnyxEntry<Report>, isReportArchived = false): boolean {
    return !isChatThread(report) && (isGroupChat(report) || isDeprecatedGroupDM(report, isReportArchived));
}

/**
 * Assume any report without a reportID is unusable.
 */
function isValidReport(report?: OnyxEntry<Report>): boolean {
    return !!report?.reportID;
}

/**
 * Check to see if we are a participant of this report.
 */
function isReportParticipant(accountID: number | undefined, report: OnyxEntry<Report>): boolean {
    if (!accountID) {
        return false;
    }

    const possibleAccountIDs = Object.keys(report?.participants ?? {}).map(Number);
    if (report?.ownerAccountID) {
        possibleAccountIDs.push(report?.ownerAccountID);
    }
    if (report?.managerID) {
        possibleAccountIDs.push(report?.managerID);
    }
    return possibleAccountIDs.includes(accountID);
}

/**
 * Check to see if the current user has access to view the report.
 */
function canCurrentUserOpenReport(report: OnyxEntry<Report>, isReportArchived = false): boolean {
    return (isReportParticipant(currentUserAccountID, report) || isPublicRoom(report)) && canAccessReport(report, allBetas, isReportArchived);
}

function shouldUseFullTitleToDisplay(report: OnyxEntry<Report>): boolean {
    return (
        isMoneyRequestReport(report) || isPolicyExpenseChat(report) || isChatRoom(report) || isChatThread(report) || isTaskReport(report) || isGroupChat(report) || isInvoiceReport(report)
    );
}

function getRoom(type: ValueOf<typeof CONST.REPORT.CHAT_TYPE>, policyID: string): OnyxEntry<Report> {
    const room = Object.values(allReports ?? {}).find((report) => report?.policyID === policyID && report?.chatType === type && !isThread(report));
    return room;
}

/**
 *  We only want policy members who are members of the report to be able to modify the report description, but not in thread chat.
 */
function canEditReportDescription(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, isReportArchived = false): boolean {
    return (
        !isMoneyRequestReport(report) &&
        !isReportArchived &&
        isChatRoom(report) &&
        !isChatThread(report) &&
        !isEmpty(policy) &&
        hasParticipantInArray(report, currentUserAccountID ? [currentUserAccountID] : []) &&
        !isAuditor(report)
    );
}

function getReportActionWithSmartscanError(reportActions: ReportAction[], report: OnyxEntry<Report>): ReportAction | undefined {
    return reportActions.find((action) => {
        const isReportPreview = isReportPreviewAction(action);
        const isSplitOrTrackAction = isSplitBillReportAction(action) || isTrackExpenseAction(action);
        if (!isSplitOrTrackAction && !isReportPreview) {
            return false;
        }
        const IOUReportID = getIOUReportIDFromReportActionPreview(action);
        const isReportPreviewError = isReportPreview && shouldShowRBRForMissingSmartscanFields(report, IOUReportID) && !isSettled(IOUReportID);
        if (isReportPreviewError) {
            return true;
        }

        const transactionID = isSplitOrTrackAction ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? {};
        const isTransactionThreadError = isSplitOrTrackAction && hasMissingSmartscanFieldsTransactionUtils(transaction as Transaction, report);

        return isTransactionThreadError;
    });
}

/**
 * Checks if report action has error when smart scanning
 */
function hasSmartscanError(reportActions: ReportAction[], report: OnyxEntry<Report>): boolean {
    return !!getReportActionWithSmartscanError(reportActions, report);
}

function shouldAutoFocusOnKeyPress(event: KeyboardEvent): boolean {
    if (event.key.length > 1) {
        return false;
    }

    // If a key is pressed in combination with Meta, Control or Alt do not focus
    if (event.ctrlKey || event.metaKey) {
        return false;
    }

    if (event.code === 'Space') {
        return false;
    }

    return true;
}

/**
 * Navigates to the appropriate screen based on the presence of a private note for the current user.
 */
function navigateToPrivateNotes(report: OnyxEntry<Report>, accountID: number, backTo?: string) {
    if (isEmpty(report) || !accountID) {
        return;
    }
    const currentUserPrivateNote = report.privateNotes?.[accountID]?.note ?? '';
    if (isEmpty(currentUserPrivateNote)) {
        Navigation.navigate(ROUTES.PRIVATE_NOTES_EDIT.getRoute(report.reportID, accountID, backTo));
        return;
    }
    Navigation.navigate(ROUTES.PRIVATE_NOTES_LIST.getRoute(report.reportID, backTo));
}

/**
 * Get all held transactions of a iouReport
 */
function getAllHeldTransactions(iouReportID?: string): Transaction[] {
    const transactions = getReportTransactions(iouReportID);
    return transactions.filter((transaction) => isOnHoldTransactionUtils(transaction));
}

/**
 * Check if Report has any held expenses
 */
function hasHeldExpenses(iouReportID?: string, allReportTransactions?: Transaction[]): boolean {
    const iouReportTransactions = getReportTransactions(iouReportID);
    const transactions = allReportTransactions ?? iouReportTransactions;
    return transactions.some((transaction) => isOnHoldTransactionUtils(transaction));
}

/**
 * Check if all expenses in the Report are on hold
 */
function hasOnlyHeldExpenses(iouReportID?: string, allReportTransactions?: Transaction[]): boolean {
    const transactionsByIouReportID = getReportTransactions(iouReportID);
    const reportTransactions = allReportTransactions ?? transactionsByIouReportID;
    return reportTransactions.length > 0 && !reportTransactions.some((transaction) => !isOnHoldTransactionUtils(transaction));
}

/**
 * Checks if thread replies should be displayed
 */
function shouldDisplayThreadReplies(reportAction: OnyxInputOrEntry<ReportAction>, isThreadReportParentAction: boolean): boolean {
    const hasReplies = (reportAction?.childVisibleActionCount ?? 0) > 0;
    return hasReplies && !!reportAction?.childCommenterCount && !isThreadReportParentAction;
}

/**
 * Check if money report has any transactions updated optimistically
 */
function hasUpdatedTotal(report: OnyxInputOrEntry<Report>, policy: OnyxInputOrEntry<Policy>): boolean {
    if (!report) {
        return true;
    }

    const allReportTransactions = getReportTransactions(report.reportID);

    const hasPendingTransaction = allReportTransactions.some((transaction) => !!transaction.pendingAction);
    const hasTransactionWithDifferentCurrency = allReportTransactions.some((transaction) => transaction.currency !== report.currency);
    const hasDifferentWorkspaceCurrency = report.pendingFields?.createChat && isExpenseReport(report) && report.currency !== policy?.outputCurrency;
    const hasOptimisticHeldExpense = hasHeldExpenses(report.reportID) && report?.unheldTotal === undefined;

    return !(hasPendingTransaction && (hasTransactionWithDifferentCurrency || hasDifferentWorkspaceCurrency)) && !hasOptimisticHeldExpense && !report.pendingFields?.total;
}

/**
 * Return held and full amount formatted with used currency
 */
function getNonHeldAndFullAmount(iouReport: OnyxEntry<Report>, shouldExcludeNonReimbursables: boolean): NonHeldAndFullAmount {
    // if the report is an expense report, the total amount should be negated
    const coefficient = isExpenseReport(iouReport) ? -1 : 1;

    let total = iouReport?.total ?? 0;
    let unheldTotal = iouReport?.unheldTotal ?? 0;
    if (shouldExcludeNonReimbursables) {
        total -= iouReport?.nonReimbursableTotal ?? 0;
        unheldTotal -= iouReport?.unheldNonReimbursableTotal ?? 0;
    }

    const adjustedUnheldTotal = unheldTotal * coefficient;
    const adjustedTotal = total * coefficient;

    // For the "approve unheld" option to be valid, we need:
    // 1. There should be held expenses
    // 2. For expense reports with negative totals, we need to ensure the unheld amount is valid
    //    by checking that the absolute values are meaningful and different
    const hasHeldExpensesLocal = hasHeldExpenses(iouReport?.reportID);
    const hasValidNonHeldAmount =
        hasHeldExpensesLocal &&
        // For normal cases (positive amounts or IOU reports)
        (adjustedUnheldTotal >= 0 ||
            // For expense reports with negative amounts, check if amounts are meaningful
            (isExpenseReport(iouReport) && Math.abs(adjustedUnheldTotal) > 0 && Math.abs(adjustedUnheldTotal) !== Math.abs(adjustedTotal)));

    return {
        nonHeldAmount: convertToDisplayString(adjustedUnheldTotal, iouReport?.currency),
        fullAmount: convertToDisplayString(adjustedTotal, iouReport?.currency),
        hasValidNonHeldAmount,
    };
}

/**
 * Disable reply in thread action if:
 *
 * - The action is listed in the thread-disabled list
 * - The action is a split expense action
 * - The action is deleted and is not threaded
 * - The report is archived and the action is not threaded
 * - The action is a whisper action and it's neither a report preview nor IOU action
 * - The action is the thread's first chat
 */
function shouldDisableThread(reportAction: OnyxInputOrEntry<ReportAction>, isThreadReportParentAction: boolean, isReportArchived = false): boolean {
    const isSplitBillAction = isSplitBillReportAction(reportAction);
    const isDeletedActionLocal = isDeletedAction(reportAction);
    const isReportPreviewActionLocal = isReportPreviewAction(reportAction);
    const isIOUAction = isMoneyRequestAction(reportAction);
    const isWhisperActionLocal = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
    const isDynamicWorkflowRoutedAction = isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
    const isActionDisabled = CONST.REPORT.ACTIONS.THREAD_DISABLED.some((action: string) => action === reportAction?.actionName);
    const isManagerMcTestOwner = reportAction?.actorAccountID === CONST.ACCOUNT_ID.MANAGER_MCTEST;

    return (
        isActionDisabled ||
        isManagerMcTestOwner ||
        isSplitBillAction ||
        (isDeletedActionLocal && !reportAction?.childVisibleActionCount) ||
        (isReportArchived && !reportAction?.childVisibleActionCount) ||
        (isWhisperActionLocal && !isReportPreviewActionLocal && !isIOUAction) ||
        isThreadReportParentAction ||
        isDynamicWorkflowRoutedAction
    );
}

/**
 * The <ReportActionsListItemRenderer> does not render some ancestor report actions in a thread.
 * So we exclude report-preview action, transaction-thread action unless it is a sent-money action and
 * trip-preview action that is the first ancestor report action in the hierarchy.
 *
 * @param ancestorReportAction - The ancestor report action we determine whether it should be excluded
 * @param isFirstAncestor - Whether it is the first report action in the hierarchy
 * @returns boolean - true if the ancestor report action should be excluded, false otherwise
 */
function shouldExcludeAncestorReportAction(ancestorReportAction: ReportAction, isFirstAncestor: boolean): boolean {
    if (isTripPreview(ancestorReportAction)) {
        return !isFirstAncestor;
    }

    // Exclude transaction threads except sent-money actions
    if (isTransactionThread(ancestorReportAction)) {
        return !isSentMoneyReportAction(ancestorReportAction);
    }

    return isReportPreviewAction(ancestorReportAction);
}

function getAllAncestorReportActionIDs(report: Report | null | undefined, includeTransactionThread = false): AncestorIDs {
    if (!report) {
        return {
            reportIDs: [],
            reportActionsIDs: [],
        };
    }

    const allAncestorIDs: AncestorIDs = {
        reportIDs: [],
        reportActionsIDs: [],
    };
    let parentReportID = report.parentReportID;
    let parentReportActionID = report.parentReportActionID;

    while (parentReportID) {
        const parentReport = getReportOrDraftReport(parentReportID);
        const parentReportAction = getReportAction(parentReportID, parentReportActionID);

        if (
            !parentReportAction ||
            (!includeTransactionThread && ((isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction)) || isReportPreviewAction(parentReportAction)))
        ) {
            break;
        }

        allAncestorIDs.reportIDs.push(parentReportID);
        if (parentReportActionID) {
            allAncestorIDs.reportActionsIDs.push(parentReportActionID);
        }

        if (!parentReport) {
            break;
        }

        parentReportID = parentReport?.parentReportID;
        parentReportActionID = parentReport?.parentReportActionID;
    }

    return allAncestorIDs;
}

/**
 * Traverses up the report hierarchy with the `parentReportID` until the root report,
 * then returns the ancestor reports and their associated actions based on `parentReportActionID`.
 *
 * @param report - The report for which to fetch ancestor reports and actions.
 * @param reportCollection - Collection of reports.
 * @param reportDraftCollection - Collection of report drafts.
 * @param reportActionsCollection - Collection of report actions.
 * @param shouldExcludeAncestorReportActionCallback - Callback to determine if an ancestor should be excluded. Check shouldExcludeAncestorReportAction for example.
 * @returns An array of ancestor reports and their associated actions.
 */
function getAncestors(
    report: OnyxEntry<Report>,
    reportCollection: OnyxCollection<Report>,
    reportDraftCollection: OnyxCollection<Report>,
    reportActionsCollection: OnyxCollection<ReportActions>,
    shouldExcludeAncestorReportActionCallback: (reportAction: ReportAction, isFirstAncestor: boolean) => boolean = () => false,
): Ancestor[] {
    const ancestors: Ancestor[] = [];
    let currentReport = report;

    // Traverse up the report hierarchy until current report has no parent
    while (currentReport?.parentReportID && currentReport?.parentReportActionID) {
        const currentReportAction = reportActionsCollection?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentReport.parentReportID}`]?.[`${currentReport.parentReportActionID}`];
        if (!currentReportAction) {
            return ancestors;
        }

        // As we traverse up the report hierarchy, we need to reassign `currentReport` to the parent's own report.
        currentReport =
            reportCollection?.[`${ONYXKEYS.COLLECTION.REPORT}${currentReport.parentReportID}`] ??
            reportDraftCollection?.[`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${currentReport.parentReportID}`];
        if (!currentReport || shouldExcludeAncestorReportActionCallback(currentReportAction, ancestors.length === 0)) {
            return ancestors;
        }
        // To maintain the order from the top-most ancestor down to the immediate parent
        // we `unshift` (push) each ancestor to the start of the array.
        ancestors.unshift({
            report: currentReport,
            reportAction: currentReportAction,
            shouldDisplayNewMarker: isCurrentActionUnread(currentReport, currentReportAction),
        });
    }

    return ancestors;
}

/**
 * Get optimistic data of the parent report action
 * @param report The report that is updated
 * @param lastVisibleActionCreated Last visible action created of the child report
 * @param type The type of action in the child report
 */
function getOptimisticDataForParentReportAction(report: Report | undefined, lastVisibleActionCreated: string, type: string): Array<OnyxUpdate | null> {
    if (!report || isEmptyObject(report)) {
        return [];
    }

    const ancestors = getAllAncestorReportActionIDs(report, true);
    const totalAncestor = ancestors.reportIDs.length;

    let previousActionDeleted = false;
    return Array.from(Array(totalAncestor), (_, index) => {
        const ancestorReport = getReportOrDraftReport(ancestors.reportIDs.at(index));

        if (!ancestorReport || isEmptyObject(ancestorReport)) {
            return null;
        }

        const ancestorReportAction = getReportAction(ancestorReport.reportID, ancestors.reportActionsIDs.at(index) ?? '');

        if (!ancestorReportAction?.reportActionID || isEmptyObject(ancestorReportAction)) {
            return null;
        }
        const updatedReportAction = updateOptimisticParentReportAction(ancestorReportAction, lastVisibleActionCreated, type, previousActionDeleted ? index + 1 : undefined);

        previousActionDeleted = isDeletedAction(ancestorReportAction) && updatedReportAction.childVisibleActionCount === 0;

        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReport.reportID}`,
            value: {
                [ancestorReportAction.reportActionID]: updatedReportAction,
            },
        };
    });
}
/**
 * Get optimistic data of the ancestor report actions
 * @param ancestors The thread report ancestors
 * @param lastVisibleActionCreated Last visible action created of the child report
 * @param type The type of action in the child report
 */
function getOptimisticDataForAncestors(ancestors: Ancestor[], lastVisibleActionCreated: string, type: string): Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> {
    let previousActionDeleted = false;
    return ancestors.map(({report: ancestorReport, reportAction: ancestorReportAction}, index) => {
        const updatedReportAction = updateOptimisticParentReportAction(ancestorReportAction, lastVisibleActionCreated, type, previousActionDeleted ? index + 1 : undefined);
        previousActionDeleted = isDeletedAction(ancestorReportAction) && updatedReportAction.childVisibleActionCount === 0;
        return {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${ancestorReport.reportID}`,
            value: {
                [ancestorReportAction.reportActionID]: updatedReportAction,
            },
        };
    });
}

function canBeAutoReimbursed(report: OnyxInputOrEntry<Report>, policy: OnyxInputOrEntry<Policy>): boolean {
    if (isEmptyObject(policy)) {
        return false;
    }
    type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;
    const reimbursableTotal = getMoneyRequestSpendBreakdown(report).totalDisplaySpend;
    const autoReimbursementLimit = policy?.autoReimbursement?.limit ?? policy?.autoReimbursementLimit ?? 0;
    const isAutoReimbursable =
        isReportInGroupPolicy(report) &&
        policy.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES &&
        autoReimbursementLimit >= reimbursableTotal &&
        reimbursableTotal > 0 &&
        CONST.DIRECT_REIMBURSEMENT_CURRENCIES.includes(report?.currency as CurrencyType);
    return isAutoReimbursable;
}

/** Check if the current user is an owner of the report */
function isReportOwner(report: OnyxInputOrEntry<Report>): boolean {
    return report?.ownerAccountID === currentUserAccountID;
}

function isAllowedToApproveExpenseReport(report: OnyxEntry<Report>, approverAccountID?: number, reportPolicy?: OnyxEntry<Policy>): boolean {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = reportPolicy ?? getPolicy(report?.policyID);
    const isOwner = (approverAccountID ?? currentUserAccountID) === report?.ownerAccountID;
    return !(policy?.preventSelfApproval && isOwner);
}

function isAllowedToSubmitDraftExpenseReport(report: OnyxEntry<Report>): boolean {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(report?.policyID);
    const submitToAccountID = getSubmitToAccountID(policy, report);

    return isAllowedToApproveExpenseReport(report, submitToAccountID);
}

/**
 * What missing payment method does this report action indicate, if any?
 */
function getIndicatedMissingPaymentMethod(
    userWalletTierName: string | undefined,
    reportId: string | undefined,
    reportAction: ReportAction,
    bankAccountList: OnyxEntry<BankAccountList>,
): MissingPaymentMethod | undefined {
    const isSubmitterOfUnsettledReport = reportId && isCurrentUserSubmitter(getReport(reportId, allReports)) && !isSettled(reportId);
    if (!reportId || !isSubmitterOfUnsettledReport || !isReimbursementQueuedAction(reportAction)) {
        return undefined;
    }
    const paymentType = getOriginalMessage(reportAction)?.paymentType;
    if (paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
        return !userWalletTierName || userWalletTierName === CONST.WALLET.TIER_NAME.SILVER ? 'wallet' : undefined;
    }

    return !hasCreditBankAccount(bankAccountList) ? 'bankAccount' : undefined;
}

/**
 * Checks if report chat contains missing payment method
 */
function hasMissingPaymentMethod(userWalletTierName: string | undefined, iouReportID: string | undefined, bankAccountList: OnyxEntry<BankAccountList>): boolean {
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`] ?? {};
    return Object.values(reportActions)
        .filter(Boolean)
        .some((action) => getIndicatedMissingPaymentMethod(userWalletTierName, iouReportID, action, bankAccountList) !== undefined);
}

/**
 * Used from expense actions to decide if we need to build an optimistic expense report.
 * Create a new report if:
 * - we don't have an iouReport set in the chatReport
 * - we have one, but it's waiting on the payee adding a bank account
 * - we have one, but we can't add more transactions to it due to: report is approved or settled
 * - It is a SmartScan request, the user is in the ASAP Submit beta, and the action is not "submit"
 */
function shouldCreateNewMoneyRequestReport(
    existingIOUReport: OnyxInputOrEntry<Report> | undefined,
    chatReport: OnyxInputOrEntry<Report>,
    isScanRequest: boolean,
    action?: IOUAction,
): boolean {
    if (existingIOUReport && !!existingIOUReport.errorFields?.createChat) {
        return true;
    }

    const isASAPSubmitBetaEnabled = Permissions.isBetaEnabled(CONST.BETAS.ASAP_SUBMIT, allBetas);
    return (
        !existingIOUReport ||
        hasIOUWaitingOnCurrentUserBankAccount(chatReport) ||
        !canAddTransaction(existingIOUReport) ||
        (action !== CONST.IOU.ACTION.SUBMIT && isScanRequest && isASAPSubmitBetaEnabled)
    );
}

function getTripIDFromTransactionParentReportID(transactionParentReportID: string | undefined): string | undefined {
    return getReportOrDraftReport(transactionParentReportID)?.tripData?.tripID;
}

/**
 * Checks if report contains actions with errors
 */
function hasActionWithErrorsForTransaction(reportID: string | undefined, transaction: Transaction | undefined): boolean {
    if (!reportID) {
        return false;
    }
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? {};
    return Object.values(reportActions)
        .filter(Boolean)
        .some((action) => {
            if (isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID) {
                if (getOriginalMessage(action)?.IOUTransactionID === transaction?.transactionID) {
                    return !isEmptyValueObject(action.errors);
                }
                return false;
            }
            return !isEmptyValueObject(action.errors);
        });
}

function isNonAdminOrOwnerOfPolicyExpenseChat(report: OnyxInputOrEntry<Report>, policy: OnyxInputOrEntry<Policy>): boolean {
    return isPolicyExpenseChat(report) && !(isPolicyAdminPolicyUtils(policy) || isPolicyOwner(policy, currentUserAccountID) || isReportOwner(report));
}

function isAdminOwnerApproverOrReportOwner(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>): boolean {
    const isApprover = isMoneyRequestReport(report) && report?.managerID !== null && currentUserPersonalDetails?.accountID === report?.managerID;

    return isPolicyAdminPolicyUtils(policy) || isPolicyOwner(policy, currentUserAccountID) || isReportOwner(report) || isApprover;
}

function isNonOwnerMangerOfIOUReport(report: OnyxEntry<Report>): boolean {
    const isOwner = report?.ownerAccountID === currentUserPersonalDetails?.accountID;
    const isManager = report?.managerID === currentUserPersonalDetails?.accountID;
    return isIOUReport(report) && !isOwner && !isManager;
}

/**
 * Whether the user can join a report
 */
function canJoinChat(
    report: OnyxEntry<Report>,
    parentReportAction: OnyxInputOrEntry<ReportAction>,
    policy: OnyxEntry<Policy>,
    parentReport: OnyxEntry<Report>,
    isReportArchived = false,
): boolean {
    // We disabled thread functions for whisper action
    // So we should not show join option for existing thread on whisper message that has already been left, or manually leave it
    if (isWhisperAction(parentReportAction)) {
        return false;
    }

    // If the notification preference of the chat is not hidden that means we have already joined the chat
    if (!isHiddenForCurrentUser(report)) {
        return false;
    }

    const isExpenseChat = isMoneyRequestReport(report) || isMoneyRequest(report) || isInvoiceReport(report) || isTrackExpenseReportNew(report, parentReport, parentReportAction);
    // Anyone viewing these chat types is already a participant and therefore cannot join
    if (isRootGroupChat(report, isReportArchived) || isSelfDM(report) || isInvoiceRoom(report) || isSystemChat(report) || isExpenseChat) {
        return false;
    }

    // The user who is a member of the workspace has already joined the public announce room.
    if (isPublicAnnounceRoom(report) && !isEmptyObject(policy)) {
        return false;
    }

    // For restricted visibility rooms, the user must be a workspace member to join
    if (isUserCreatedPolicyRoom(report) && report?.visibility === CONST.REPORT.VISIBILITY.RESTRICTED && !isPolicyMember(policy, currentUserEmail)) {
        return false;
    }

    if (isReportArchived) {
        return false;
    }

    return isChatThread(report) || isUserCreatedPolicyRoom(report) || isNonAdminOrOwnerOfPolicyExpenseChat(report, policy);
}

/**
 * Whether the user can leave a report
 */
function canLeaveChat(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, isReportArchived = false): boolean {
    if (isRootGroupChat(report, isReportArchived)) {
        return true;
    }

    if (isPolicyExpenseChat(report) && !report?.isOwnPolicyExpenseChat && !isPolicyAdminPolicyUtils(policy)) {
        return true;
    }

    if (isPublicRoom(report) && isAnonymousUserSession()) {
        return false;
    }

    if (isHiddenForCurrentUser(report)) {
        return false;
    }

    // Anyone viewing these chat types is already a participant and therefore cannot leave
    if (isSelfDM(report)) {
        return false;
    }

    // The user who is a member of the workspace cannot leave the public announce room.
    if (isPublicAnnounceRoom(report) && !isEmptyObject(policy)) {
        return false;
    }

    if (isInvoiceRoom(report)) {
        return canLeaveInvoiceRoom(report);
    }

    return (
        (isChatThread(report) && !!getReportNotificationPreference(report)) ||
        isUserCreatedPolicyRoom(report) ||
        isNonAdminOrOwnerOfPolicyExpenseChat(report, policy) ||
        isNonOwnerMangerOfIOUReport(report)
    );
}

function createDraftWorkspaceAndNavigateToConfirmationScreen(introSelected: OnyxEntry<IntroSelected>, transactionID: string, actionName: IOUAction): void {
    const isCategorizing = actionName === CONST.IOU.ACTION.CATEGORIZE;
    const {expenseChatReportID, policyID, policyName} = createDraftWorkspace(introSelected, currentUserEmail);
    setMoneyRequestParticipants(transactionID, [
        {
            selected: true,
            accountID: 0,
            isPolicyExpenseChat: true,
            reportID: expenseChatReportID,
            policyID,
            searchText: policyName,
        },
    ]);
    setMoneyRequestReportID(transactionID, expenseChatReportID);
    if (isCategorizing) {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, expenseChatReportID));
    } else {
        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, expenseChatReportID, undefined, true));
    }
}

function createDraftTransactionAndNavigateToParticipantSelector(
    transactionID: string | undefined,
    reportID: string | undefined,
    actionName: IOUAction,
    reportActionID: string | undefined,
    introSelected: OnyxEntry<IntroSelected>,
    allTransactionDrafts: OnyxCollection<Transaction>,
    activePolicy: OnyxEntry<Policy>,
    isRestrictedToPreferredPolicy = false,
    preferredPolicyID?: string,
): void {
    if (!transactionID || !reportID) {
        return;
    }

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] ?? ({} as Transaction);
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] ?? ([] as ReportAction[]);

    if (!transaction || !reportActions) {
        return;
    }

    const linkedTrackedExpenseReportAction = Object.values(reportActions)
        .filter(Boolean)
        .find((action) => isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID === transactionID);

    const {created, amount, currency, merchant, mccGroup} = getTransactionDetails(transaction) ?? {};
    const baseComment = getTransactionCommentObject(transaction);
    // Use modifiedAttendees if present (for edited transactions), otherwise use the attendees from comment
    const comment = {
        ...baseComment,
        attendees: transaction?.modifiedAttendees ?? baseComment.attendees,
    };

    removeDraftTransactions(false, allTransactionDrafts);

    createDraftTransaction({
        ...transaction,
        actionableWhisperReportActionID: reportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID: reportID,
        created,
        modifiedCreated: undefined,
        modifiedAmount: undefined,
        modifiedCurrency: undefined,
        amount,
        currency,
        comment,
        merchant,
        modifiedMerchant: '',
        modifiedAttendees: undefined,
        mccGroup,
    } as Transaction);

    const filteredPolicies = Object.values(allPolicies ?? {}).filter((policy) => shouldShowPolicy(policy, false, currentUserEmail));

    if (actionName === CONST.IOU.ACTION.CATEGORIZE) {
        if (activePolicy && shouldRestrictUserBillableActions(activePolicy.id)) {
            Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(activePolicy.id));
            return;
        }

        if (activePolicy && shouldShowPolicy(activePolicy, false, currentUserEmail)) {
            const policyExpenseReportID = getPolicyExpenseChat(currentUserAccountID, activePolicy.id)?.reportID;
            setMoneyRequestParticipants(transactionID, [
                {
                    selected: true,
                    accountID: 0,
                    isPolicyExpenseChat: true,
                    reportID: policyExpenseReportID,
                    policyID: activePolicy.id,
                    searchText: activePolicy?.name,
                },
            ]);
            if (policyExpenseReportID) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, policyExpenseReportID));
            } else {
                Log.warn('policyExpenseReportID is not valid during expense categorizing');
            }
            return;
        }
        if (filteredPolicies.length === 0 || filteredPolicies.length > 1) {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                    action: actionName,
                    iouType: CONST.IOU.TYPE.SUBMIT,
                    transactionID,
                    reportID,
                    backTo: '',
                    upgradePath: actionName === CONST.IOU.ACTION.CATEGORIZE ? CONST.UPGRADE_PATHS.CATEGORIES : '',
                    shouldSubmitExpense: true,
                }),
            );
            return;
        }

        const policyID = filteredPolicies.at(0)?.id;
        const policyExpenseReportID = getPolicyExpenseChat(currentUserAccountID, policyID)?.reportID;
        setMoneyRequestParticipants(transactionID, [
            {
                selected: true,
                accountID: 0,
                isPolicyExpenseChat: true,
                reportID: policyExpenseReportID,
                policyID,
                searchText: activePolicy?.name,
            },
        ]);
        if (policyExpenseReportID) {
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, policyExpenseReportID));
        } else {
            Log.warn('policyExpenseReportID is not valid during expense categorizing');
        }
        return;
    }

    if (actionName === CONST.IOU.ACTION.SHARE) {
        Navigation.navigate(ROUTES.MONEY_REQUEST_ACCOUNTANT.getRoute(actionName, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, Navigation.getActiveRoute()));
        return;
    }

    if (actionName === CONST.IOU.ACTION.SUBMIT || (allPolicies && filteredPolicies.length > 0)) {
        // Check if user is restricted to preferred workspace for submit tracked expenses
        if (isRestrictedToPreferredPolicy && preferredPolicyID) {
            const policyExpenseReport = getPolicyExpenseChat(currentUserAccountID, preferredPolicyID);

            if (policyExpenseReport) {
                setMoneyRequestParticipantsFromReport(transactionID, policyExpenseReport, currentUserAccountID).then(() => {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.SUBMIT, CONST.IOU.TYPE.SUBMIT, transactionID, policyExpenseReport.reportID));
                });
                return;
            }
        }

        Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, transactionID, reportID, undefined, actionName));
        return;
    }

    return createDraftWorkspaceAndNavigateToConfirmationScreen(introSelected, transactionID, actionName);
}

/**
 * Check if a report has any forwarded actions
 */
function hasForwardedAction(reportID: string): boolean {
    const reportActions = getAllReportActions(reportID);
    return Object.values(reportActions).some((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.FORWARDED);
}

function isReportOutstanding(
    iouReport: OnyxInputOrEntry<Report>,
    policyID: string | undefined,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = allReportNameValuePair,
    allowSubmitted = true,
): boolean {
    if (!iouReport || isEmptyObject(iouReport)) {
        return false;
    }
    const currentRoute = navigationRef.getCurrentRoute();
    const params = currentRoute?.params as MoneyRequestNavigatorParamList[typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION] | ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];
    const activeReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${params?.reportID}`];
    const policy = allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
    const reportNameValuePair = reportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport.reportID}`];
    const canSubmit = canSubmitReport(iouReport, policy, getReportTransactions(iouReport.reportID), undefined, false, currentUserEmail ?? '');
    const shouldAllowSubmittedReport = allowSubmitted || canSubmit || isProcessingReport(activeReport);
    return (
        isExpenseReport(iouReport) &&
        iouReport?.stateNum !== undefined &&
        iouReport?.statusNum !== undefined &&
        iouReport?.policyID === policyID &&
        (shouldAllowSubmittedReport ? iouReport?.stateNum <= CONST.REPORT.STATE_NUM.SUBMITTED : iouReport?.stateNum < CONST.REPORT.STATE_NUM.SUBMITTED) &&
        (shouldAllowSubmittedReport ? iouReport?.statusNum <= CONST.REPORT.STATE_NUM.SUBMITTED : iouReport?.statusNum < CONST.REPORT.STATE_NUM.SUBMITTED) &&
        !hasForwardedAction(iouReport.reportID) &&
        !isArchivedReport(reportNameValuePair)
    );
}

/**
 * Get outstanding expense reports for a given policy ID
 * @param policyID - The policy ID to filter reports by
 * @param reportOwnerAccountID - The accountID of the report owner
 * @param reports - Collection of reports to filter
 * @returns Array of outstanding expense reports
 */
function getOutstandingReportsForUser(
    policyID: string | undefined,
    reportOwnerAccountID: number | undefined,
    reports: OnyxCollection<Report> = allReports,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs> = allReportNameValuePair,
    allowSubmitted = true,
): Array<OnyxEntry<Report>> {
    if (!reports) {
        return [];
    }
    return Object.values(reports).filter(
        (report) =>
            report?.pendingFields?.preview !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            isReportOutstanding(report, policyID, reportNameValuePairs, allowSubmitted) &&
            report?.ownerAccountID === reportOwnerAccountID,
    );
}

/**
 * Sort outstanding reports by their name, while keeping the selected one at the beginning.
 * @param report1 Details of the first report to be compared.
 * @param report2 Details of the second report to be compared.
 * @param selectedReportID ID of the selected report which needs to be at the beginning.
 */
function sortOutstandingReportsBySelected(
    report1: OnyxEntry<Report>,
    report2: OnyxEntry<Report>,
    selectedReportID: string | undefined,
    localeCompare: LocaleContextProps['localeCompare'],
): number {
    if (report1?.reportID === selectedReportID) {
        return -1;
    }
    if (report2?.reportID === selectedReportID) {
        return 1;
    }
    return localeCompare(report2?.created ?? '', report1?.created ?? '');
}

/**
 * @returns the object to update `report.hasOutstandingChildRequest`
 */
function getOutstandingChildRequest(iouReport: OnyxInputOrEntry<Report>): OutstandingChildRequest {
    if (!iouReport || isEmptyObject(iouReport)) {
        return {};
    }

    if (!isExpenseReport(iouReport)) {
        const {reimbursableSpend} = getMoneyRequestSpendBreakdown(iouReport);
        return {
            hasOutstandingChildRequest: iouReport.managerID === currentUserAccountID && reimbursableSpend !== 0,
        };
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(iouReport.policyID);
    const shouldBeManuallySubmitted = isPaidGroupPolicyPolicyUtils(policy) && !policy?.harvesting?.enabled && isOpenReport(iouReport);
    if (shouldBeManuallySubmitted) {
        return {
            hasOutstandingChildRequest: true,
        };
    }

    // We don't need to update hasOutstandingChildRequest in this case
    return {};
}

function canReportBeMentionedWithinPolicy(report: OnyxEntry<Report>, policyID: string | undefined): boolean {
    if (!policyID || report?.policyID !== policyID) {
        return false;
    }

    return isChatRoom(report) && !isInvoiceRoom(report) && !isThread(report);
}

type PrepareOnboardingOnyxDataParams = {
    introSelected: OnyxEntry<IntroSelected>;
    engagementChoice: OnboardingPurpose;
    onboardingMessage: OnboardingMessage;
    adminsChatReportID?: string;
    onboardingPolicyID?: string;
    userReportedIntegration?: OnboardingAccounting;
    wasInvited?: boolean;
    companySize: OnboardingCompanySize | undefined;
    selectedInterestedFeatures?: string[];
    isInvitedAccountant?: boolean;
    onboardingPurposeSelected?: OnboardingPurpose;
};

function prepareOnboardingOnyxData({
    introSelected,
    engagementChoice,
    onboardingMessage,
    adminsChatReportID,
    onboardingPolicyID,
    userReportedIntegration,
    wasInvited,
    companySize,
    selectedInterestedFeatures,
    isInvitedAccountant,
    onboardingPurposeSelected,
}: PrepareOnboardingOnyxDataParams) {
    if (engagementChoice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND) {
        // eslint-disable-next-line no-param-reassign
        onboardingMessage = getOnboardingMessages().onboardingMessages[CONST.ONBOARDING_CHOICES.PERSONAL_SPEND];
    }

    if (engagementChoice === CONST.ONBOARDING_CHOICES.EMPLOYER || engagementChoice === CONST.ONBOARDING_CHOICES.SUBMIT) {
        // eslint-disable-next-line no-param-reassign
        onboardingMessage = getOnboardingMessages().onboardingMessages[CONST.ONBOARDING_CHOICES.SUBMIT];
    }

    // Guides are assigned and tasks are posted in the #admins room for the MANAGE_TEAM and TRACK_WORKSPACE onboarding actions, except for emails that have a '+'.
    const shouldPostTasksInAdminsRoom = isPostingTasksInAdminsRoom(engagementChoice);
    const adminsChatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${adminsChatReportID}`];
    const targetChatReport = shouldPostTasksInAdminsRoom
        ? (adminsChatReport ?? {reportID: adminsChatReportID, policyID: onboardingPolicyID})
        : getChatByParticipants([CONST.ACCOUNT_ID.CONCIERGE, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID], allReports, false);
    const {reportID: targetChatReportID = '', policyID: targetChatPolicyID = ''} = targetChatReport ?? {};

    if (!targetChatReportID) {
        Log.warn('Missing reportID for onboarding optimistic data');
        return;
    }

    const integrationName = userReportedIntegration ? CONST.ONBOARDING_ACCOUNTING_MAPPING[userReportedIntegration as keyof typeof CONST.ONBOARDING_ACCOUNTING_MAPPING] : '';
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const assignedGuideEmail = getPolicy(targetChatPolicyID)?.assignedGuide?.email ?? 'Setup Specialist';
    const assignedGuidePersonalDetail = Object.values(allPersonalDetails ?? {}).find((personalDetail) => personalDetail?.login === assignedGuideEmail);
    let assignedGuideAccountID: number;
    let isOptimisticAssignedGuide = false;
    if (assignedGuidePersonalDetail && assignedGuidePersonalDetail.accountID) {
        isOptimisticAssignedGuide = assignedGuidePersonalDetail.isOptimisticPersonalDetail ?? false;
        assignedGuideAccountID = assignedGuidePersonalDetail.accountID;
    } else {
        assignedGuideAccountID = generateAccountID(assignedGuideEmail);
        isOptimisticAssignedGuide = !assignedGuidePersonalDetail;
        // eslint-disable-next-line rulesdir/prefer-actions-set-data
        Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [assignedGuideAccountID]: {
                isOptimisticPersonalDetail: !assignedGuidePersonalDetail,
                login: assignedGuideEmail,
                displayName: assignedGuideEmail,
                avatar: getDefaultAvatarURL({accountID: assignedGuideAccountID}),
            },
        });
    }
    const actorAccountID = shouldPostTasksInAdminsRoom ? assignedGuideAccountID : CONST.ACCOUNT_ID.CONCIERGE;
    const firstAdminPolicy = getActivePolicies(allPolicies, currentUserEmail).find(
        (policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL && getPolicyRole(policy, currentUserEmail) === CONST.POLICY.ROLE.ADMIN,
    );

    let testDriveURL: string;
    if (([CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE] as OnboardingPurpose[]).includes(engagementChoice)) {
        testDriveURL = ROUTES.TEST_DRIVE_DEMO_ROOT;
    } else if (introSelected?.choice === CONST.ONBOARDING_CHOICES.SUBMIT && introSelected.inviteType === CONST.ONBOARDING_INVITE_TYPES.WORKSPACE) {
        testDriveURL = ROUTES.TEST_DRIVE_DEMO_ROOT;
    } else {
        testDriveURL = ROUTES.TEST_DRIVE_MODAL_ROOT.route;
    }

    const onboardingTaskParams: OnboardingTaskLinks = {
        integrationName,
        onboardingCompanySize: companySize,
        workspaceSettingsLink: `${environmentURL}/${ROUTES.WORKSPACE_OVERVIEW.getRoute(onboardingPolicyID ?? firstAdminPolicy?.id)}`,
        workspaceCategoriesLink: `${environmentURL}/${ROUTES.WORKSPACE_CATEGORIES.getRoute(onboardingPolicyID)}`,
        workspaceTagsLink: `${environmentURL}/${ROUTES.WORKSPACE_TAGS.getRoute(onboardingPolicyID)}`,
        workspaceMembersLink: `${environmentURL}/${ROUTES.WORKSPACE_MEMBERS.getRoute(onboardingPolicyID)}`,
        workspaceMoreFeaturesLink: `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(onboardingPolicyID)}`,
        workspaceConfirmationLink: `${environmentURL}/${ROUTES.WORKSPACE_CONFIRMATION.getRoute(ROUTES.WORKSPACES_LIST.route)}`,
        testDriveURL: `${environmentURL}/${testDriveURL}`,
        workspaceAccountingLink: `${environmentURL}/${ROUTES.POLICY_ACCOUNTING.getRoute(onboardingPolicyID)}`,
        corporateCardLink: `${environmentURL}/${ROUTES.WORKSPACE_COMPANY_CARDS.getRoute(onboardingPolicyID)}`,
    };

    // Text message
    const message = typeof onboardingMessage.message === 'function' ? onboardingMessage.message(onboardingTaskParams) : onboardingMessage.message;
    const textComment = buildOptimisticAddCommentReportAction(message, undefined, actorAccountID, 1);
    const textCommentAction: OptimisticAddCommentReportAction = textComment.reportAction;
    const textMessage: AddCommentOrAttachmentParams = {
        reportID: targetChatReportID,
        reportActionID: textCommentAction.reportActionID,
        reportComment: textComment.commentText,
    };

    let createWorkspaceTaskReportID;
    let addExpenseApprovalsTaskReportID;
    let setupTagsTaskReportID;
    let setupCategoriesAndTagsTaskReportID;
    const tasksData = onboardingMessage.tasks
        .filter((task) => {
            if (engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
                if (!!selectedInterestedFeatures && TASK_TO_FEATURE[task.type] && !selectedInterestedFeatures.includes(TASK_TO_FEATURE[task.type])) {
                    return false;
                }
            }

            if (([CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES, CONST.ONBOARDING_TASK_TYPE.SETUP_TAGS] as string[]).includes(task.type) && userReportedIntegration) {
                return false;
            }

            if (([CONST.ONBOARDING_TASK_TYPE.ADD_ACCOUNTING_INTEGRATION, CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS] as string[]).includes(task.type) && !userReportedIntegration) {
                return false;
            }
            type SkipViewTourOnboardingChoices = 'newDotSubmit' | 'newDotSplitChat' | 'newDotPersonalSpend' | 'newDotEmployer';
            if (
                task.type === CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR &&
                [
                    CONST.ONBOARDING_CHOICES.EMPLOYER,
                    CONST.ONBOARDING_CHOICES.PERSONAL_SPEND,
                    CONST.ONBOARDING_CHOICES.SUBMIT,
                    CONST.ONBOARDING_CHOICES.CHAT_SPLIT,
                    CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                ].includes(introSelected?.choice as SkipViewTourOnboardingChoices) &&
                engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM
            ) {
                return false;
            }

            // Exclude createWorkspace and viewTour tasks from #admin room, for test drive receivers,
            // since these users already have them in concierge
            if (
                introSelected?.choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER &&
                ([CONST.ONBOARDING_TASK_TYPE.CREATE_WORKSPACE, CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR] as string[]).includes(task.type) &&
                shouldPostTasksInAdminsRoom
            ) {
                return false;
            }

            return true;
        })
        .map((task, index) => {
            const taskDescription = typeof task.description === 'function' ? task.description(onboardingTaskParams) : task.description;
            const taskTitle = typeof task.title === 'function' ? task.title(onboardingTaskParams) : task.title;
            const currentTask = buildOptimisticTaskReport(
                actorAccountID,
                targetChatReportID,
                currentUserAccountID,
                taskTitle,
                taskDescription,
                targetChatPolicyID,
                CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                task.mediaAttributes,
            );
            const emailCreatingAction =
                engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? (allPersonalDetails?.[actorAccountID]?.login ?? CONST.EMAIL.CONCIERGE) : CONST.EMAIL.CONCIERGE;
            const taskCreatedAction = buildOptimisticCreatedReportAction(emailCreatingAction);
            const taskReportAction = buildOptimisticTaskCommentReportAction(currentTask.reportID, taskTitle, 0, `task for ${taskTitle}`, targetChatReportID, actorAccountID, index + 3);
            currentTask.parentReportActionID = taskReportAction.reportAction.reportActionID;

            let isTaskAutoCompleted: boolean = task.autoCompleted;

            if (task.type === CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR && onboarding?.selfTourViewed) {
                // If the user has already viewed the self tour, we mark the task as auto completed
                isTaskAutoCompleted = true;
            }

            if (task.type === CONST.ONBOARDING_TASK_TYPE.INVITE_ACCOUNTANT && isInvitedAccountant) {
                isTaskAutoCompleted = true;
            }

            const completedTaskReportAction = isTaskAutoCompleted
                ? buildOptimisticTaskReportAction(currentTask.reportID, CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED, 'marked as complete', actorAccountID, 2)
                : null;
            if (task.type === CONST.ONBOARDING_TASK_TYPE.CREATE_WORKSPACE) {
                createWorkspaceTaskReportID = currentTask.reportID;
            }
            if (task.type === CONST.ONBOARDING_TASK_TYPE.ADD_EXPENSE_APPROVALS) {
                addExpenseApprovalsTaskReportID = currentTask.reportID;
            }
            if (task.type === CONST.ONBOARDING_TASK_TYPE.SETUP_TAGS) {
                setupTagsTaskReportID = currentTask.reportID;
            }
            if (task.type === CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES_AND_TAGS) {
                setupCategoriesAndTagsTaskReportID = currentTask.reportID;
            }

            return {
                task,
                currentTask,
                taskCreatedAction,
                taskReportAction,
                taskDescription: currentTask.description,
                completedTaskReportAction,
            };
        });

    // Sign-off welcome message
    const welcomeSignOffText =
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        engagementChoice === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? translateLocal('onboarding.welcomeSignOffTitleManageTeam') : translateLocal('onboarding.welcomeSignOffTitle');
    const welcomeSignOffComment = buildOptimisticAddCommentReportAction(welcomeSignOffText, undefined, actorAccountID, tasksData.length + 3);
    const welcomeSignOffCommentAction: OptimisticAddCommentReportAction = welcomeSignOffComment.reportAction;
    const welcomeSignOffMessage = {
        reportID: targetChatReportID,
        reportActionID: welcomeSignOffCommentAction.reportActionID,
        reportComment: welcomeSignOffComment.commentText,
    };

    const tasksForParameters = tasksData.map<TaskForParameters>(({task, currentTask, taskCreatedAction, taskReportAction, taskDescription, completedTaskReportAction}) => ({
        type: 'task',
        task: task.type,
        taskReportID: currentTask.reportID,
        parentReportID: currentTask.parentReportID,
        parentReportActionID: taskReportAction.reportAction.reportActionID,
        createdTaskReportActionID: taskCreatedAction.reportActionID,
        completedTaskReportActionID: completedTaskReportAction?.reportActionID,
        title: currentTask.reportName ?? '',
        description: taskDescription ?? '',
    }));

    const hasOutstandingChildTask = tasksData.some((task) => !task.completedTaskReportAction);

    const tasksForOptimisticData = tasksData.reduce<
        Array<
            OnyxUpdate<
                | typeof ONYXKEYS.COLLECTION.REPORT
                | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
                | typeof ONYXKEYS.NVP_INTRO_SELECTED
                | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                | typeof ONYXKEYS.NVP_ONBOARDING
            >
        >
    >((acc, {currentTask, taskCreatedAction, taskReportAction, taskDescription, completedTaskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: taskReportAction.reportAction as ReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    ...currentTask,
                    description: taskDescription,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        description: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        managerID: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                    managerID: currentUserAccountID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${currentTask.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [taskCreatedAction.reportActionID]: taskCreatedAction as ReportAction,
                },
            },
        );

        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [completedTaskReportAction.reportActionID]: completedTaskReportAction as ReportAction,
                },
            });

            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    managerID: currentUserAccountID,
                },
            });
        }

        return acc;
    }, []);

    const tasksForFailureData = tasksData.reduce<Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>>>((acc, {currentTask, taskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                    } as ReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: null,
            },
        );

        return acc;
    }, []);

    const tasksForSuccessData = tasksData.reduce<
        Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>>
    >((acc, {currentTask, taskCreatedAction, taskReportAction, completedTaskReportAction}) => {
        acc.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
                value: {
                    [taskReportAction.reportAction.reportActionID]: {pendingAction: null, isOptimisticAction: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${currentTask.reportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                        reportName: null,
                        description: null,
                        managerID: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${currentTask.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [taskCreatedAction.reportActionID]: {pendingAction: null},
                },
            },
        );

        if (completedTaskReportAction) {
            acc.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${currentTask.reportID}`,
                value: {
                    [completedTaskReportAction.reportActionID]: {pendingAction: null, isOptimisticAction: null},
                },
            });
        }

        return acc;
    }, []);

    const optimisticData: Array<TupleToUnion<typeof tasksForOptimisticData> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY>> = [...tasksForOptimisticData];
    const lastVisibleActionCreated = welcomeSignOffCommentAction.created;
    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`,
            value: {
                hasOutstandingChildTask,
                lastVisibleActionCreated,
                lastActorAccountID: actorAccountID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {
                choice: engagementChoice,
                createWorkspace: createWorkspaceTaskReportID,
                addExpenseApprovals: addExpenseApprovalsTaskReportID,
                setupTags: setupTagsTaskReportID,
                setupCategoriesAndTags: setupCategoriesAndTagsTaskReportID,
            },
        },
    );

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
        value: {
            [textCommentAction.reportActionID]: textCommentAction as ReportAction,
        },
    });

    if (!wasInvited) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {hasCompletedGuidedSetupFlow: true},
        });
    }

    const successData: Array<
        TupleToUnion<typeof tasksForSuccessData> | OnyxUpdate<typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.PERSONAL_DETAILS_LIST | typeof ONYXKEYS.NVP_ONBOARDING>
    > = [...tasksForSuccessData];

    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
        value: {
            [textCommentAction.reportActionID]: {pendingAction: null, isOptimisticAction: null},
        },
    });

    let failureReport: Partial<Report> = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
        hasOutstandingChildTask: false,
    };
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`];
    const canUserPerformWriteActionVariable = canUserPerformWriteAction(report, false);
    const {lastMessageText = ''} = getLastVisibleMessageActionUtils(targetChatReportID, canUserPerformWriteActionVariable);
    if (lastMessageText) {
        const lastVisibleAction = getLastVisibleAction(targetChatReportID, canUserPerformWriteActionVariable);
        const prevLastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        failureReport = {
            lastMessageText,
            lastVisibleActionCreated: prevLastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    const failureData: Array<
        | TupleToUnion<typeof tasksForFailureData>
        | OnyxUpdate<typeof ONYXKEYS.NVP_INTRO_SELECTED | typeof ONYXKEYS.NVP_ONBOARDING | typeof ONYXKEYS.COLLECTION.POLICY | typeof ONYXKEYS.PERSONAL_DETAILS_LIST>
    > = [...tasksForFailureData];
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetChatReportID}`,
            value: failureReport,
        },

        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_INTRO_SELECTED,
            value: {
                choice: null,
                createWorkspace: null,
                addExpenseApprovals: null,
                setupCategoriesAndTags: null,
                setupTags: null,
            },
        },
    );

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
        value: {
            [textCommentAction.reportActionID]: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
            } as ReportAction,
        },
    });

    if (!wasInvited) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_ONBOARDING,
            value: {hasCompletedGuidedSetupFlow: onboarding?.hasCompletedGuidedSetupFlow ?? null},
        });
    }

    if (userReportedIntegration) {
        const requiresControlPlan: AllConnectionName[] = [CONST.POLICY.CONNECTIONS.NAME.NETSUITE, CONST.POLICY.CONNECTIONS.NAME.QBD, CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT];

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                areConnectionsEnabled: true,
                ...(requiresControlPlan.includes(userReportedIntegration as AllConnectionName)
                    ? {
                          type: CONST.POLICY.TYPE.CORPORATE,
                      }
                    : {}),
                pendingFields: {
                    areConnectionsEnabled: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY}${onboardingPolicyID}`,
            value: {
                // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                areConnectionsEnabled: getPolicy(onboardingPolicyID)?.areConnectionsEnabled,
                pendingFields: {
                    areConnectionsEnabled: null,
                },
            },
        });
    }

    // If we post tasks in the #admins room and introSelected?.choice does not exist, it means that a guide is assigned and all messages except tasks are handled by the backend
    const guidedSetupData: GuidedSetupData = [];

    guidedSetupData.push({type: 'message', ...textMessage});

    let selfDMParameters: SelfDMParameters = {};
    if (
        engagementChoice === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND ||
        (engagementChoice === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE && (!onboardingPurposeSelected || onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND))
    ) {
        const selfDMReportID = findSelfDMReportID();
        let selfDMReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${selfDMReportID}`];
        let createdAction: ReportAction;
        if (!selfDMReport) {
            const currentTime = DateUtils.getDBTime();
            selfDMReport = buildOptimisticSelfDMReport(currentTime);
            createdAction = buildOptimisticCreatedReportAction(currentUserEmail ?? '', currentTime);
            selfDMParameters = {reportID: selfDMReport.reportID, createdReportActionID: createdAction.reportActionID};
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                    value: {
                        ...selfDMReport,
                        pendingFields: {
                            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                    value: {
                        isOptimisticReport: true,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    value: {
                        [createdAction.reportActionID]: createdAction,
                    },
                },
            );

            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`,
                    value: {
                        pendingFields: {
                            createChat: null,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${selfDMReport.reportID}`,
                    value: {
                        isOptimisticReport: false,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReport.reportID}`,
                    value: {
                        [createdAction.reportActionID]: {
                            pendingAction: null,
                        },
                    },
                },
            );
        }
    }

    guidedSetupData.push(...tasksForParameters);

    if (!introSelected?.choice || introSelected.choice === CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: welcomeSignOffCommentAction as ReportAction,
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: {pendingAction: null, isOptimisticAction: null},
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetChatReportID}`,
            value: {
                [welcomeSignOffCommentAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('report.genericAddCommentFailureMessage'),
                } as ReportAction,
            },
        });
        guidedSetupData.push({type: 'message', ...welcomeSignOffMessage});
    }

    if (isOptimisticAssignedGuide) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [assignedGuideAccountID]: null,
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [assignedGuideAccountID]: null,
            },
        });
    }

    return {optimisticData, successData, failureData, guidedSetupData, actorAccountID, selfDMParameters};
}

/**
 * Whether a given report is used for onboarding tasks. In the past, it could be either the Concierge chat or the system
 * DM, and we saved the report ID in the user's `onboarding` NVP. As a fallback for users who don't have the NVP, we now
 * only use the Concierge chat.
 */
function isChatUsedForOnboarding(optionOrReport: OnyxEntry<Report> | OptionData, onboardingValue: OnyxEntry<Onboarding>, onboardingPurposeSelected?: OnboardingPurpose): boolean {
    // onboarding can be an empty object for old accounts and accounts created from olddot
    if (onboardingValue && !isEmptyObject(onboardingValue) && onboardingValue.chatReportID) {
        return onboardingValue.chatReportID === optionOrReport?.reportID;
    }
    if (isEmptyObject(onboardingValue)) {
        return (optionOrReport as OptionData)?.isConciergeChat ?? isConciergeChatReport(optionOrReport);
    }

    return isPostingTasksInAdminsRoom(onboardingPurposeSelected) ? isAdminRoom(optionOrReport) : ((optionOrReport as OptionData)?.isConciergeChat ?? isConciergeChatReport(optionOrReport));
}

/**
 * Whether onboarding tasks should be posted in the #admins room instead of Concierge.
 * Onboarding guides are assigned to signup with emails that do not contain a '+' and select the "Manage my team's expenses" intent.
 */
function isPostingTasksInAdminsRoom(engagementChoice?: OnboardingPurpose): boolean {
    const userHasPhonePrimaryEmail = Str.endsWith(currentUserEmail ?? '', CONST.SMS.DOMAIN);
    return (
        engagementChoice !== undefined &&
        [CONST.ONBOARDING_CHOICES.MANAGE_TEAM, CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE].includes(engagementChoice as 'newDotManageTeam' | 'newDotTrackWorkspace') &&
        (!currentUserEmail?.includes('+') || userHasPhonePrimaryEmail)
    );
}

/**
 * Get the report used for the user's onboarding process. For most users it is the Concierge chat, however in the past
 * we also used the system DM for A/B tests.
 */
function getChatUsedForOnboarding(onboardingValue: OnyxEntry<Onboarding>): OnyxEntry<Report> {
    return Object.values(allReports ?? {}).find((report) => isChatUsedForOnboarding(report, onboardingValue));
}

/**
 * Checks if given field has any violations and returns name of the first encountered one
 */
function getFieldViolation(violations: OnyxEntry<ReportViolations>, reportField: PolicyReportField): ReportViolationName | undefined {
    if (!reportField) {
        return undefined;
    }

    if (!violations) {
        return (reportField.value ?? reportField.defaultValue) ? undefined : CONST.REPORT_VIOLATIONS.FIELD_REQUIRED;
    }

    const fieldViolation = Object.values(CONST.REPORT_VIOLATIONS).find((violation) => !!violations[violation] && violations[violation][reportField.fieldID]);

    // If the field has no value or no violation, we return 'fieldRequired' violation
    if (!fieldViolation) {
        return reportField.value ? undefined : CONST.REPORT_VIOLATIONS.FIELD_REQUIRED;
    }

    return fieldViolation;
}

/**
 * Returns translation for given field violation
 */
function getFieldViolationTranslation(reportField: PolicyReportField, violation?: ReportViolationName): string {
    if (!violation) {
        return '';
    }

    switch (violation) {
        case 'fieldRequired':
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            return translateLocal('reportViolations.fieldRequired', {fieldName: reportField.name});
        default:
            return '';
    }
}

/**
 * Returns all violations for report
 */
function getReportViolations(reportID: string): ReportViolations | undefined {
    if (!allReportsViolations) {
        return undefined;
    }

    return allReportsViolations[`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${reportID}`];
}

function findPolicyExpenseChatByPolicyID(policyID: string): OnyxEntry<Report> {
    return Object.values(allReports ?? {}).find((report) => isPolicyExpenseChat(report) && report?.policyID === policyID);
}

/**
 * A function to get the report last message. This is usually used to restore the report message preview in LHN after report actions change.
 * @param reportID
 * @param actionsToMerge
 * @param canUserPerformWriteActionInReport
 * @returns containing the calculated message preview data of the report
 */
function getReportLastMessage(reportID: string, isReportArchived: boolean | undefined, actionsToMerge?: ReportActions) {
    let result: Partial<Report> = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };

    const {lastMessageText = ''} = getLastVisibleMessage(reportID, isReportArchived, actionsToMerge);

    if (lastMessageText) {
        const report = getReport(reportID, allReports);
        const lastVisibleAction = getLastVisibleActionReportActionsUtils(reportID, canUserPerformWriteAction(report, isReportArchived), actionsToMerge);
        const lastVisibleActionCreated = lastVisibleAction?.created;
        const lastActorAccountID = lastVisibleAction?.actorAccountID;
        result = {
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    return result;
}

function getReportLastVisibleActionCreated(report: OnyxEntry<Report>, oneTransactionThreadReport: OnyxEntry<Report>) {
    const reportLastVisibleActionCreated = report?.lastVisibleActionCreated ?? '';
    const threadLastVisibleActionCreated = oneTransactionThreadReport?.lastVisibleActionCreated ?? '';
    return reportLastVisibleActionCreated > threadLastVisibleActionCreated ? reportLastVisibleActionCreated : threadLastVisibleActionCreated;
}

function getSourceIDFromReportAction(reportAction: OnyxEntry<ReportAction>): string {
    const message = Array.isArray(reportAction?.message) ? (reportAction?.message?.at(-1) ?? null) : (reportAction?.message ?? null);
    const html = message?.html ?? '';
    const {sourceURL} = getAttachmentDetails(html);
    const sourceID = (sourceURL?.match(CONST.REGEX.ATTACHMENT_ID) ?? [])[1];
    return sourceID;
}

function getIntegrationIcon(connectionName?: ConnectionName, expensifyIcons?: Record<'XeroSquare' | 'QBOSquare' | 'NetSuiteSquare' | 'IntacctSquare' | 'QBDSquare', IconAsset> | undefined) {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.XERO) {
        return expensifyIcons?.XeroSquare;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO) {
        return expensifyIcons?.QBOSquare;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.NETSUITE) {
        return expensifyIcons?.NetSuiteSquare;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT) {
        return expensifyIcons?.IntacctSquare;
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBD) {
        return expensifyIcons?.QBDSquare;
    }

    return undefined;
}

function getIntegrationExportIcon(connectionName?: ConnectionName): 'XeroExport' | 'QBOExport' | 'NetSuiteExport' | 'SageIntacctExport' | undefined {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.XERO) {
        return 'XeroExport';
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO || connectionName === CONST.POLICY.CONNECTIONS.NAME.QBD) {
        return 'QBOExport';
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.NETSUITE) {
        return 'NetSuiteExport';
    }
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT) {
        return 'SageIntacctExport';
    }

    return undefined;
}

function canBeExported(report: OnyxEntry<Report>) {
    if (!report?.statusNum) {
        return false;
    }
    const isCorrectState = [CONST.REPORT.STATUS_NUM.APPROVED, CONST.REPORT.STATUS_NUM.CLOSED, CONST.REPORT.STATUS_NUM.REIMBURSED].some((status) => status === report.statusNum);
    return isExpenseReport(report) && isCorrectState;
}

function getIntegrationNameFromExportMessage(reportActions: OnyxEntry<ReportActions> | ReportAction[]) {
    if (!reportActions) {
        return '';
    }

    if (Array.isArray(reportActions)) {
        const exportIntegrationAction = reportActions.find((action) => isExportIntegrationAction(action));
        if (!exportIntegrationAction || !isExportIntegrationAction(exportIntegrationAction)) {
            return null;
        }

        const originalMessage = (getOriginalMessage(exportIntegrationAction) ?? {}) as OriginalMessageExportIntegration;
        const {label} = originalMessage;
        return label ?? null;
    }
}

function isExported(reportActions: OnyxEntry<ReportActions> | ReportAction[], report?: OnyxEntry<Report>): boolean {
    // If report object is provided and has the property, use it directly
    if (report?.isExportedToIntegration !== undefined) {
        return report.isExportedToIntegration;
    }

    // Fallback to checking actions for backward compatibility
    if (!reportActions) {
        return false;
    }

    let exportIntegrationActionsCount = 0;
    let integrationMessageActionsCount = 0;

    const reportActionList = Array.isArray(reportActions) ? reportActions : Object.values(reportActions);
    for (const action of reportActionList) {
        if (isExportIntegrationAction(action)) {
            const originalMessage = getOriginalMessage(action);
            // We consider any reports marked manually as exported to be exported, so we shortcut here.
            if (originalMessage?.markedManually) {
                return true;
            }
            // exportTemplate type is a CSV export, so we don't count it as an export integration action
            if (originalMessage?.type !== CONST.EXPORT_TEMPLATE) {
                exportIntegrationActionsCount++;
            }
        }
        if (isIntegrationMessageAction(action)) {
            integrationMessageActionsCount++;
        }
    }

    // We need to make sure that there was at least one successful export to consider the report exported.
    // We add one EXPORT_INTEGRATION action to the report when we start exporting it (with pendingAction: 'add') and then another EXPORT_INTEGRATION when the export finishes successfully.
    // If the export fails, we add an INTEGRATIONS_MESSAGE action to the report, but the initial EXPORT_INTEGRATION action is still present, so we compare the counts of these two actions to determine if the report was exported successfully.
    return exportIntegrationActionsCount > integrationMessageActionsCount;
}

function hasExportError(reportActions: OnyxEntry<ReportActions> | ReportAction[], report?: OnyxEntry<Report>) {
    // If report object is provided and has the property, use it directly
    if (report?.hasExportError !== undefined) {
        return report.hasExportError;
    }

    // Fallback to checking actions for backward compatibility
    if (!reportActions) {
        return false;
    }

    if (Array.isArray(reportActions)) {
        return reportActions.some((action) => isIntegrationMessageAction(action));
    }

    return Object.values(reportActions).some((action) => isIntegrationMessageAction(action));
}

function doesReportContainRequestsFromMultipleUsers(iouReport: OnyxEntry<Report>): boolean {
    const transactions = getReportTransactions(iouReport?.reportID);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (Permissions.isBetaEnabled(CONST.BETAS.ZERO_EXPENSES, allBetas)) {
        return isIOUReport(iouReport) && transactions.some((transaction) => (Number(transaction?.modifiedAmount) || transaction?.amount) <= 0);
    }
    return isIOUReport(iouReport) && transactions.some((transaction) => (Number(transaction?.modifiedAmount) || transaction?.amount) < 0);
}

/**
 * Determines whether the report can be moved to the workspace.
 */
function isWorkspaceEligibleForReportChange(submitterEmail: string | undefined, newPolicy: OnyxEntry<Policy>, report?: Report): boolean {
    if (!submitterEmail || !newPolicy?.isPolicyExpenseChatEnabled) {
        return false;
    }
    if (report && report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED && !isPolicyAdminPolicyUtils(newPolicy)) {
        return false;
    }
    return isPaidGroupPolicyPolicyUtils(newPolicy) && !!newPolicy.role;
}

/**
 * Checks if someone took control of the report and if that take control is still valid
 * A take control is invalidated if there's a SUBMITTED action after it
 */
function getBypassApproverAccountIDIfTakenControl(expenseReport: OnyxEntry<Report>): number | null {
    if (!expenseReport?.reportID) {
        return null;
    }

    if (!isProcessingReport(expenseReport)) {
        return null;
    }

    const reportActions = getAllReportActions(expenseReport.reportID);
    if (!reportActions) {
        return null;
    }

    // Sort actions by created timestamp to get chronological order
    const sortedActions = getSortedReportActions(Object.values(reportActions ?? {}), true);

    // Look through actions in reverse chronological order (newest first)
    // If we find a SUBMITTED action, there's no valid take control since any take control would be older
    for (const action of sortedActions) {
        if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED)) {
            return null;
        }

        if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            return expenseReport.managerID ?? null;
        }

        if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL)) {
            return action.actorAccountID ?? null;
        }
    }

    return null;
}

function getApprovalChain(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report>): string[] {
    const approvalChain: string[] = [];
    const fullApprovalChain: string[] = [];
    const reportTotal = expenseReport?.total ?? 0;
    const submitterEmail = getLoginsByAccountIDs([expenseReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]).at(0) ?? '';

    if (isSubmitAndClose(policy)) {
        return approvalChain;
    }

    // Get category/tag approver list
    const ruleApprovers = getRuleApprovers(policy, expenseReport);

    // Push rule approvers to approvalChain list before submitsTo/forwardsTo approvers
    for (const ruleApprover of ruleApprovers) {
        // Don't push submitter to approve as a rule approver
        if (fullApprovalChain.includes(ruleApprover) || ruleApprover === submitterEmail) {
            continue;
        }
        fullApprovalChain.push(ruleApprover);
    }

    let nextApproverEmail = getManagerAccountEmail(policy, expenseReport);

    while (nextApproverEmail && !approvalChain.includes(nextApproverEmail)) {
        approvalChain.push(nextApproverEmail);
        nextApproverEmail = getForwardsToAccount(policy, nextApproverEmail, reportTotal);
    }

    for (const approver of approvalChain) {
        if (fullApprovalChain.includes(approver)) {
            continue;
        }

        fullApprovalChain.push(approver);
    }

    if (fullApprovalChain.at(-1) === submitterEmail && policy?.preventSelfApproval) {
        fullApprovalChain.pop();
    }
    return fullApprovalChain;
}

/**
 * Checks if the user has missing bank account for the invoice room.
 */
function hasMissingInvoiceBankAccount(iouReportID: string | undefined): boolean {
    if (!iouReportID) {
        return false;
    }

    const invoiceReport = getReport(iouReportID, allReports);

    if (!isInvoiceReport(invoiceReport)) {
        return false;
    }

    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return invoiceReport?.ownerAccountID === currentUserAccountID && !getPolicy(invoiceReport?.policyID)?.invoice?.bankAccount?.transferBankAccountID && isSettled(iouReportID);
}

function hasInvoiceReports() {
    const reports = Object.values(allReports ?? {});
    return reports.some((report) => isInvoiceReport(report));
}

function getReportMetadata(reportID: string | undefined) {
    return reportID ? allReportMetadataKeyValue[reportID] : undefined;
}

/**
 * Helper method to check if participant email is Manager McTest
 */
function isSelectedManagerMcTest(email: string | null | undefined): boolean {
    return email === CONST.EMAIL.MANAGER_MCTEST;
}

/**
 *  Helper method to check if the report is a test transaction report
 */
function isTestTransactionReport(report: OnyxEntry<Report>): boolean {
    const managerID = report?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const personalDetails = allPersonalDetails?.[managerID];
    return isSelectedManagerMcTest(personalDetails?.login);
}

function isWaitingForSubmissionFromCurrentUser(chatReport: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    return chatReport?.isOwnPolicyExpenseChat && !policy?.harvesting?.enabled;
}

function getGroupChatDraft() {
    return newGroupChatDraft;
}

function getChatListItemReportName(action: ReportAction & {reportName?: string}, report: Report | undefined): string {
    if (report && isInvoiceReport(report)) {
        const properInvoiceReport = report;
        properInvoiceReport.chatReportID = report.parentReportID;

        return getInvoiceReportName(properInvoiceReport);
    }

    if (action?.reportName) {
        return action.reportName;
    }

    if (report?.reportID) {
        // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return getReportName(getReport(report?.reportID, allReports));
    }

    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return getReportName(report);
}

/**
 * Generates report attributes for a report
 * This function should be called only in reportAttributes.ts
 * DO NOT USE THIS FUNCTION ANYWHERE ELSE
 */
function generateReportAttributes({
    report,
    chatReport,
    reportActions,
    transactionViolations,
    isReportArchived = false,
}: {
    report: OnyxEntry<Report>;
    chatReport: OnyxEntry<Report>;
    reportActions?: OnyxCollection<ReportActions>;
    transactionViolations: OnyxCollection<TransactionViolation[]>;
    isReportArchived: boolean;
}) {
    const reportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`];
    const parentReportActionsList = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`];
    const isReportSettled = isSettled(report);
    const isCurrentUserReportOwner = isReportOwner(report);
    const doesReportHasViolations = isDraftReport(report?.reportID) && hasReportViolations(report?.reportID);
    const hasViolationsToDisplayInLHN = shouldDisplayViolationsRBRInLHN(report, transactionViolations);
    const hasAnyTypeOfViolations = hasViolationsToDisplayInLHN || (!isReportSettled && isCurrentUserReportOwner && doesReportHasViolations);
    const reportErrors = getAllReportErrors(report, reportActionsList, isReportArchived);
    const hasErrors = Object.entries(reportErrors ?? {}).length > 0;
    const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActionsList);
    const parentReportAction = report?.parentReportActionID ? parentReportActionsList?.[report.parentReportActionID] : undefined;
    const requiresAttention = requiresAttentionFromCurrentUser(report, parentReportAction, isReportArchived);

    return {
        doesReportHasViolations,
        hasViolationsToDisplayInLHN,
        hasAnyViolations: hasAnyTypeOfViolations,
        reportErrors,
        hasErrors,
        oneTransactionThreadReportID,
        parentReportAction,
        requiresAttention,
    };
}

function getReportPersonalDetailsParticipants(report: Report, personalDetailsParam: OnyxEntry<PersonalDetailsList>, reportMetadata: OnyxEntry<ReportMetadata>, isRoomMembersList = false) {
    const chatParticipants = getParticipantsList(report, personalDetailsParam, isRoomMembersList, reportMetadata);
    return {
        chatParticipants,
        personalDetailsParticipants: chatParticipants.reduce<Record<number, PersonalDetails>>((acc, accountID) => {
            const details = personalDetailsParam?.[accountID];
            if (details) {
                acc[accountID] = details;
            }
            return acc;
        }, {}),
    };
}

function canRejectReportAction(currentUserLogin: string, report: Report, policy?: Policy): boolean {
    const isReportApprover = isApproverUtils(policy, currentUserLogin);
    const isReportBeingProcessed = isProcessingReport(report);
    const isIOU = isIOUReport(report);
    const isInvoice = isInvoiceReport(report);
    const isCurrentUserManager = report?.managerID === currentUserAccountID;

    const userCanReject = isReportApprover && isCurrentUserManager;

    if (!userCanReject) {
        return false; // must be approver or payer
    }

    if (isIOU) {
        return false; // Disable IOU
    }

    if (isInvoice) {
        return false; // Disable invoice
    }

    if (isReportBeingProcessed) {
        return true; // non-IOU reports can be rejected while processing
    }

    return false;
}

function hasReportBeenReopened(report: OnyxEntry<Report>, reportActions?: OnyxEntry<ReportActions> | ReportAction[]): boolean {
    // If report object is provided and has the property, use it directly
    if (report?.hasReportBeenReopened !== undefined) {
        return report.hasReportBeenReopened;
    }

    // Fallback to checking actions for backward compatibility
    if (!reportActions) {
        return false;
    }

    const reportActionList = Array.isArray(reportActions) ? reportActions : Object.values(reportActions);
    return reportActionList.some((action) => isReopenedAction(action));
}

function hasReportBeenRetracted(report: OnyxEntry<Report>, reportActions?: OnyxEntry<ReportActions> | ReportAction[]): boolean {
    // If report object is provided and has the property, use it directly
    if (report?.hasReportBeenRetracted !== undefined) {
        return report.hasReportBeenRetracted;
    }

    // Fallback to checking actions for backward compatibility
    if (!reportActions) {
        return false;
    }

    const reportActionList = Array.isArray(reportActions) ? reportActions : Object.values(reportActions);
    return reportActionList.some((action) => isRetractedAction(action));
}

function getMoneyReportPreviewName(action: ReportAction, iouReport: OnyxEntry<Report>, isInvoice?: boolean, reportAttributes?: ReportAttributesDerivedValue['reports']) {
    if (isInvoice && isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW)) {
        const originalMessage = getOriginalMessage(action);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return originalMessage && translateLocal('iou.invoiceReportName', originalMessage);
    }
    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return getReportName(iouReport, undefined, undefined, undefined, undefined, reportAttributes) || action.childReportName;
}

function selectFilteredReportActions(
    reportActions: Record<string, Record<string, OnyxInputOrEntry<ReportAction>> | undefined> | null | undefined,
): Record<string, ReportAction[]> | undefined {
    if (!reportActions) {
        return {};
    }

    return Object.fromEntries(
        Object.entries(reportActions).map(([reportId, actionsGroup]) => {
            const actions = Object.values(actionsGroup ?? {});
            const filteredActions = actions.filter(
                (action): action is ReportAction =>
                    isExportIntegrationAction(action) || isIntegrationMessageAction(action) || isDynamicExternalWorkflowSubmitFailedAction(action) || isSubmittedAction(action),
            );
            return [reportId, filteredActions];
        }),
    );
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been rejected optimistically
 * @param [created] - Action created time
 */
function buildOptimisticRejectReportAction(created = DateUtils.getDBTime()): OptimisticRejectReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: 'rejected this expense',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been rejected optimistically
 * @param [created] - Action created time
 */
function buildOptimisticRejectReportActionComment(comment: string, created = DateUtils.getDBTime()): OptimisticRejectReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                text: comment,
                html: comment,
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the transaction has been marked as resolved optimistically
 * @param [created] - Action created time
 */
function buildOptimisticMarkedAsResolvedReportAction(created = DateUtils.getDBTime()): OptimisticRejectReportAction {
    return {
        reportActionID: rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: 'marked the rejection reason as resolved',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: getCurrentUserDisplayNameOrEmail(),
            },
        ],
        automatic: false,
        avatar: getCurrentUserAvatar(),
        created,
        shouldShow: true,
    };
}

/**
 * Returns the translated, human-readable status of the report based on its state and status values.
 * The status is determined by the stateNum and statusNum of the report.
 * The mapping is as follows:
 * ========================================
 * State  |  Status  |  What to display?  |
 * 0	  |  0	     |  Draft             |
 * 1	  |  1	     |  Outstanding       |
 * 2	  |  2	     |  Done              |
 * 2	  |  3	     |  Approved          |
 * 2	  |  4	     |  Paid              |
 * 3	  |  4	     |  Paid              |
 * 6      |  4	     |  Paid              |
 * ========================================
 */

function getReportStatusTranslation({stateNum, statusNum, translate}: GetReportStatusParams): string {
    if (stateNum === undefined || statusNum === undefined) {
        return '';
    }

    if (stateNum === CONST.REPORT.STATE_NUM.OPEN && statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
        return translate('common.draft');
    }
    if (stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
        return translate('common.outstanding');
    }
    if (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.CLOSED) {
        return translate('common.done');
    }
    if (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return translate('iou.approved');
    }
    if (
        (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED) ||
        (stateNum === CONST.REPORT.STATE_NUM.BILLING && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED) ||
        (stateNum === CONST.REPORT.STATE_NUM.AUTOREIMBURSED && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED)
    ) {
        return translate('iou.settledExpensify');
    }

    return '';
}

function getReportStatusColorStyle(theme: ThemeColors, stateNum?: number, statusNum?: number): {backgroundColor?: ColorValue; textColor?: ColorValue} | undefined {
    if (stateNum === undefined || statusNum === undefined) {
        return undefined;
    }

    if (stateNum === CONST.REPORT.STATE_NUM.OPEN && statusNum === CONST.REPORT.STATUS_NUM.OPEN) {
        return theme.reportStatusBadge.draft;
    }
    if (stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED) {
        return theme.reportStatusBadge.outstanding;
    }
    if (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.CLOSED) {
        return theme.reportStatusBadge.closed;
    }
    if (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.APPROVED) {
        return theme.reportStatusBadge.approved;
    }
    if (
        (stateNum === CONST.REPORT.STATE_NUM.APPROVED && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED) ||
        (stateNum === CONST.REPORT.STATE_NUM.BILLING && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED) ||
        (stateNum === CONST.REPORT.STATE_NUM.AUTOREIMBURSED && statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED)
    ) {
        return theme.reportStatusBadge.paid;
    }

    return undefined;
}

/**
 * Checks if a workspace member is leaving a workspace room
 * This is used to determine if we need to show special handling when a workspace member leaves a room
 */
function isWorkspaceMemberLeavingWorkspaceRoom(report: OnyxEntry<Report>, isPolicyEmployee: boolean, isPolicyAdminParam: boolean): boolean {
    if (!report) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const hasAccessPolicyExpenseChat = isPolicyExpenseChat(report) && (report.isOwnPolicyExpenseChat || isPolicyAdminParam);
    return (report.visibility === CONST.REPORT.VISIBILITY.RESTRICTED || hasAccessPolicyExpenseChat) && isPolicyEmployee;
}

/**
 * Checks if all selected items have the necessary Onyx data hydrated for bulk rejection.
 */
function checkBulkRejectHydration(
    selectedTransactions: Record<string, {reportID: string; policyID?: string}>,
    policies: Record<string, unknown> | null | undefined,
): {areHydrated: boolean; missingReportIDs: string[]; missingPolicyIDs: string[]} {
    const transactionIDs = Object.keys(selectedTransactions);
    const missingReportIDs: string[] = [];
    const missingPolicyIDs: string[] = [];

    for (const transactionID of transactionIDs) {
        const transaction = selectedTransactions[transactionID];
        const reportID = transaction?.reportID;

        // Check if we have the report data
        const report = getReportOrDraftReport(reportID);
        if (!report) {
            missingReportIDs.push(reportID);
            continue;
        }

        const effectivePolicyID = transaction?.policyID ?? report.policyID;

        // Check if we have the policy data (required for canRejectReportAction check)
        if (effectivePolicyID) {
            const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${effectivePolicyID}`];
            if (!policy) {
                missingPolicyIDs.push(effectivePolicyID);
                continue;
            }
        }

        // Check if essential report fields are present
        if (report.managerID == null || report.stateNum == null || report.statusNum == null) {
            missingReportIDs.push(reportID);
            continue;
        }
    }

    return {
        areHydrated: missingReportIDs.length === 0 && missingPolicyIDs.length === 0,
        missingReportIDs: [...new Set(missingReportIDs)],
        missingPolicyIDs: [...new Set(missingPolicyIDs)],
    };
}

function shouldHideSingleReportField(reportField: PolicyReportField) {
    const hasEnableOption = reportField.type !== CONST.REPORT_FIELD_TYPES.LIST || reportField.disabledOptions.some((option) => !option);

    return isReportFieldOfTypeTitle(reportField) || !hasEnableOption;
}

/**
 * Get both field values map and fields-by-name map in a single pass
 */
function getReportFieldMaps(report: OnyxEntry<Report>, fieldList: Record<string, PolicyReportField>): {fieldValues: Record<string, string>; fieldsByName: Record<string, PolicyReportField>} {
    const fields = getAvailableReportFields(report, Object.values(fieldList ?? {}));
    const fieldValues: Record<string, string> = {};
    const fieldsByName: Record<string, PolicyReportField> = {};

    for (const field of fields) {
        if (field.name) {
            const key = field.name.toLowerCase();
            fieldValues[key] = field.value ?? field.defaultValue ?? '';
            fieldsByName[key] = field;
        }
    }

    return {fieldValues, fieldsByName};
}

export {
    areAllRequestsBeingSmartScanned,
    buildOptimisticAddCommentReportAction,
    buildOptimisticApprovedReportAction,
    checkBulkRejectHydration,
    buildOptimisticCreatedReportForUnapprovedAction,
    buildOptimisticUnapprovedReportAction,
    buildOptimisticCancelPaymentReportAction,
    buildOptimisticChangedTaskAssigneeReportAction,
    buildOptimisticChatReport,
    buildOptimisticClosedReportAction,
    buildOptimisticCreatedReportAction,
    buildOptimisticDismissedViolationReportAction,
    buildOptimisticEditedTaskFieldReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticEmptyReport,
    buildOptimisticGroupChatReport,
    buildOptimisticHoldReportAction,
    buildOptimisticHoldReportActionComment,
    buildOptimisticRetractedReportAction,
    buildOptimisticReopenedReportAction,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticModifiedExpenseReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticMovedReportAction,
    buildOptimisticChangePolicyReportAction,
    buildOptimisticRenamedRoomReportAction,
    buildOptimisticRoomDescriptionUpdatedReportAction,
    buildOptimisticRoomAvatarUpdatedReportAction,
    buildOptimisticReportPreview,
    buildOptimisticActionableTrackExpenseWhisper,
    buildOptimisticSubmittedReportAction,
    buildOptimisticTaskCommentReportAction,
    buildOptimisticTaskReport,
    buildOptimisticTaskReportAction,
    buildOptimisticUnHoldReportAction,
    buildOptimisticAnnounceChat,
    buildOptimisticWorkspaceChats,
    buildOptimisticCardAssignedReportAction,
    buildOptimisticDetachReceipt,
    buildOptimisticRejectReportAction,
    buildOptimisticRejectReportActionComment,
    buildOptimisticMarkedAsResolvedReportAction,
    buildParticipantsFromAccountIDs,
    buildOptimisticChangeApproverReportAction,
    buildTransactionThread,
    canAccessReport,
    isReportNotFound,
    canAddTransaction,
    canDeleteTransaction,
    canBeAutoReimbursed,
    canCreateRequest,
    canCreateTaskInReport,
    canCurrentUserOpenReport,
    canDeleteMoneyRequestReport,
    canDeleteReportAction,
    canHoldUnholdReportAction,
    canEditReportPolicy,
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canEditReportAction,
    canEditReportDescription,
    canEditRoomVisibility,
    canEditWriteCapability,
    canFlagReportAction,
    isNonAdminOrOwnerOfPolicyExpenseChat,
    canJoinChat,
    canLeaveChat,
    canReportBeMentionedWithinPolicy,
    canRequestMoney,
    canSeeDefaultRoom,
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction,
    chatIncludesChronos,
    chatIncludesChronosWithID,
    chatIncludesConcierge,
    createDraftTransactionAndNavigateToParticipantSelector,
    doesReportBelongToWorkspace,
    shouldEnableNegative,
    findLastAccessedReport,
    findSelfDMReportID,
    formatReportLastMessageText,
    generateReportID,
    getCreationReportErrors,
    getAllHeldTransactions,
    getAllPolicyReports,
    getAllWorkspaceReports,
    getAvailableReportFields,
    getBankAccountRoute,
    getChatByParticipants,
    getChatRoomSubtitle,
    getChildReportNotificationPreference,
    getCommentLength,
    getDefaultGroupAvatar,
    getDefaultWorkspaceAvatar,
    getDefaultWorkspaceAvatarTestID,
    getDeletedParentActionMessageForChatReport,
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    prepareOnboardingOnyxData,
    getIOUReportActionDisplayMessage,
    getIOUReportActionMessage,
    getWorkspaceNameUpdatedMessage,
    getDeletedTransactionMessage,
    getIcons,
    sortIconsByName,
    getIconsForParticipants,
    getIndicatedMissingPaymentMethod,
    getLastVisibleMessage,
    getMoneyRequestOptions,
    getMoneyRequestSpendBreakdown,
    getNonHeldAndFullAmount,
    getOptimisticDataForAncestors,
    getOptimisticDataForParentReportAction,
    getOriginalReportID,
    getOutstandingChildRequest,
    getParentNavigationSubtitle,
    getParsedComment,
    getParticipantsAccountIDsForDisplay,
    getParticipantsList,
    getParticipants,
    getPendingChatMembers,
    getPersonalDetailsForAccountID,
    getPolicyDescriptionText,
    getPolicyExpenseChat,
    getPolicyName,
    getPolicyType,
    getReimbursementDeQueuedOrCanceledActionMessage,
    getReimbursementQueuedActionMessage,
    getReportDescription,
    getReportFieldKey,
    getReportFieldMaps,
    getReportIDFromLink,
    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getSearchReportName,
    getReportTransactions,
    reportTransactionsSelector,
    getReportNotificationPreference,
    getReportOfflinePendingActionAndErrors,
    getReportParticipantsTitle,
    getReportPreviewMessage,
    getReportRecipientAccountIDs,
    getParentReport,
    getReportOrDraftReport,
    getRoom,
    getRootParentReport,
    getRouteFromLink,
    canDeleteCardTransactionByLiabilityType,
    getAddExpenseDropdownOptions,
    getTaskAssigneeChatOnyxData,
    getTransactionDetails,
    getTransactionReportName,
    getDisplayedReportID,
    getTransactionsWithReceipts,
    getUserDetailTooltipText,
    getWhisperDisplayNames,
    getWorkspaceChats,
    getWorkspaceIcon,
    goBackToDetailsPage,
    goBackFromPrivateNotes,
    getHarvestOriginalReportID,
    getPayeeName,
    getReportSummariesForEmptyCheck,
    reportSummariesOnyxSelector,
    getPolicyIDsWithEmptyReportsForAccount,
    hasActionWithErrorsForTransaction,
    hasAutomatedExpensifyAccountIDs,
    hasEmptyReportsForPolicy,
    hasExpensifyGuidesEmails,
    hasHeldExpenses,
    hasIOUWaitingOnCurrentUserBankAccount,
    hasMissingPaymentMethod,
    hasNonReimbursableTransactions,
    hasOnlyHeldExpenses,
    hasOnlyTransactionsWithPendingRoutes,
    hasReceiptError,
    hasReceiptErrors,
    hasReportNameError,
    getReportActionWithSmartscanError,
    hasSmartscanError,
    hasUpdatedTotal,
    hasViolations,
    hasWarningTypeViolations,
    hasNoticeTypeViolations,
    hasAnyViolations,
    isActionCreator,
    isAdminRoom,
    isAdminsOnlyPostingRoom,
    isAllowedToApproveExpenseReport,
    isAllowedToComment,
    isAnnounceRoom,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isArchivedNonExpenseReportWithID,
    isClosedReport,
    isCanceledTaskReport,
    isChatReport,
    isChatRoom,
    isTripRoom,
    isChatThread,
    isChildReport,
    isClosedExpenseReportWithNoExpenses,
    isCompletedTaskReport,
    isConciergeChatReport,
    isControlPolicyExpenseChat,
    doesReportReceiverMatchParticipant,
    isControlPolicyExpenseReport,
    isCurrentUserSubmitter,
    isCurrentUserTheOnlyParticipant,
    isDM,
    isDefaultRoom,
    isDeprecatedGroupDM,
    isEmptyReport,
    generateIsEmptyReport,
    isRootGroupChat,
    isExpenseReport,
    isExpenseRequest,
    isFinancialReportsForBusinesses,
    isExpensifyOnlyParticipantInReport,
    isGroupChat,
    isGroupChatAdmin,
    isHarvestCreatedExpenseReport,
    isGroupPolicy,
    isReportInGroupPolicy,
    isHoldCreator,
    isIOUOwnedByCurrentUser,
    isIOUReport,
    isIOUReportUsingReport,
    isJoinRequestInAdminRoom,
    isDomainRoom,
    isMoneyRequest,
    isMoneyRequestReport,
    isMoneyRequestReportPendingDeletion,
    isOneOnOneChat,
    isOneTransactionThread,
    isOpenExpenseReport,
    isOpenTaskReport,
    isOptimisticPersonalDetail,
    isPaidGroupPolicy,
    isPaidGroupPolicyExpenseChat,
    isPaidGroupPolicyExpenseReport,
    isPayer,
    isPolicyAdmin,
    isPolicyExpenseChat,
    isPolicyExpenseChatAdmin,
    isProcessingReport,
    isOpenReport,
    requiresManualSubmission,
    isReportIDApproved,
    isAwaitingFirstLevelApproval,
    isPublicAnnounceRoom,
    isPublicRoom,
    isReportApproved,
    isReportManuallyReimbursed,
    isReportDataReady,
    isReportFieldDisabled,
    isReportFieldDisabledForUser,
    isReportFieldOfTypeTitle,
    isReportManager,
    isReportOwner,
    isReportParticipant,
    isSelfDM,
    isSelfDMOrSelfDMThread,
    isSettled,
    isSystemChat,
    isTaskReport,
    isThread,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    isTrackExpenseReport,
    isUnread,
    isUnreadWithMention,
    isUserCreatedPolicyRoom,
    isValidReport,
    isValidReportIDFromPath,
    isWaitingForAssigneeToCompleteAction,
    isWaitingForSubmissionFromCurrentUser,
    isWorkspaceMemberLeavingWorkspaceRoom,
    isInvoiceRoom,
    isInvoiceRoomWithID,
    isInvoiceReport,
    isNewDotInvoice,
    isOpenInvoiceReport,
    isReportTransactionThread,
    getDefaultNotificationPreferenceForReport,
    canWriteInReport,
    navigateToDetailsPage,
    navigateToPrivateNotes,
    navigateBackOnDeleteTransaction,
    parseReportRouteParams,
    parseReportActionHtmlToText,
    requiresAttentionFromCurrentUser,
    selectFilteredReportActions,
    shouldAutoFocusOnKeyPress,
    shouldCreateNewMoneyRequestReport,
    shouldDisableDetailPage,
    shouldDisableRename,
    shouldDisableThread,
    shouldDisplayThreadReplies,
    shouldDisplayViolationsRBRInLHN,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
    shouldShowFlagComment,
    sortOutstandingReportsBySelected,
    shouldUseFullTitleToDisplay,
    updateOptimisticParentReportAction,
    updateReportPreview,
    temporary_getMoneyRequestOptions,
    getTripIDFromTransactionParentReportID,
    buildOptimisticInvoiceReport,
    isCurrentUserInvoiceReceiver,
    isDraftReport,
    changeMoneyRequestHoldStatus,
    rejectMoneyRequestReason,
    isAdminOwnerApproverOrReportOwner,
    createDraftWorkspaceAndNavigateToConfirmationScreen,
    isChatUsedForOnboarding,
    buildOptimisticExportIntegrationAction,
    getChatUsedForOnboarding,
    getFieldViolationTranslation,
    getFieldViolation,
    getReportViolations,
    findPolicyExpenseChatByPolicyID,
    getIntegrationIcon,
    getIntegrationExportIcon,
    canBeExported,
    isExported,
    hasExportError,
    getHelpPaneReportType,
    hasOnlyNonReimbursableTransactions,
    getReportLastMessage,
    getReportLastVisibleActionCreated,
    getMostRecentlyVisitedReport,
    getSourceIDFromReportAction,
    getIntegrationNameFromExportMessage,
    hasReportViolations,
    isPayAtEndExpenseReport,
    getApprovalChain,
    isIndividualInvoiceRoom,
    hasOutstandingChildRequest,
    isAuditor,
    hasMissingInvoiceBankAccount,
    reasonForReportToBeInOptionList,
    getReasonAndReportActionThatRequiresAttention,
    buildOptimisticChangeFieldAction,
    isPolicyRelatedReport,
    hasReportErrorsOtherThanFailedReceipt,
    getAllReportErrors,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    hasInvoiceReports,
    shouldExcludeAncestorReportAction,
    getReportMetadata,
    buildOptimisticSelfDMReport,
    isHiddenForCurrentUser,
    isSelectedManagerMcTest,
    isTestTransactionReport,
    getReportSubtitlePrefix,
    getPolicyChangeMessage,
    getMovedTransactionMessage,
    getUnreportedTransactionMessage,
    getExpenseReportStateAndStatus,
    navigateToLinkedReportAction,
    buildOptimisticUnreportedTransactionAction,
    isBusinessInvoiceRoom,
    buildOptimisticResolvedDuplicatesReportAction,
    getTitleReportField,
    getReportFieldsByPolicyID,
    getGroupChatDraft,
    getChatListItemReportName,
    buildOptimisticMovedTransactionAction,
    populateOptimisticReportFormula,
    getOutstandingReportsForUser,
    isReportOutstanding,
    generateReportAttributes,
    getHumanReadableStatus,
    getReportPersonalDetailsParticipants,
    isAllowedToSubmitDraftExpenseReport,
    isWorkspaceEligibleForReportChange,
    pushTransactionViolationsOnyxData,
    navigateOnDeleteExpense,
    canRejectReportAction,
    hasReportBeenReopened,
    hasReportBeenRetracted,
    getMoneyReportPreviewName,
    getNextApproverAccountID,
    isWorkspaceTaskReport,
    isWorkspaceThread,
    isMoneyRequestReportEligibleForMerge,
    getReportStatusTranslation,
    getReportStatusColorStyle,
    getMovedActionMessage,
    excludeParticipantsForDisplay,
    getAncestors,
    // This will be fixed as follow up https://github.com/Expensify/App/pull/75357
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getReportName,
    doesReportContainRequestsFromMultipleUsers,
    hasUnresolvedCardFraudAlert,
    getUnresolvedCardFraudAlertAction,
    shouldBlockSubmitDueToStrictPolicyRules,
    isWorkspaceChat,
    isOneTransactionReport,
    isTrackExpenseReportNew,
    shouldHideSingleReportField,
    getReportForHeader,
};

export type {
    Ancestor,
    DisplayNameWithTooltips,
    OptimisticAddCommentReportAction,
    OptimisticChatReport,
    OptimisticClosedReportAction,
    OptimisticConciergeCategoryOptionsAction,
    OptimisticCreatedReportAction,
    OptimisticExportIntegrationAction,
    OptimisticIOUReportAction,
    OptimisticTaskReportAction,
    OptionData,
    TransactionDetails,
    PartialReportAction,
    ParsingDetails,
    MissingPaymentMethod,
    OptimisticNewReport,
    PrepareOnboardingOnyxDataParams,
    SelfDMParameters,
};
