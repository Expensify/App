import {deepEqual} from 'fast-equals';
import mapValues from 'lodash/mapValues';
import React, {memo, use, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {InteractionManager, Keyboard, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Emoji} from '@assets/emojis/types';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import {AttachmentContext} from '@components/AttachmentContext';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import MentionReportContext from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer/MentionReportContext';
import Icon from '@components/Icon';
import {Eye} from '@components/Icon/Expensicons';
import InlineSystemMessage from '@components/InlineSystemMessage';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import ChronosOOOListActions from '@components/ReportActionItem/ChronosOOOListActions';
import ExportIntegration from '@components/ReportActionItem/ExportIntegration';
import IssueCardMessage from '@components/ReportActionItem/IssueCardMessage';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';
import {SearchContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import ControlSelection from '@libs/ControlSelection';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {OnyxDataWithErrors} from '@libs/ErrorUtils';
import {getLatestErrorMessageField, isReceiptError} from '@libs/ErrorUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import {isReportMessageAttachment} from '@libs/isReportMessageAttachment';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getCleanedTagName, getPersonalPolicy, isPolicyAdmin, isPolicyOwner} from '@libs/PolicyUtils';
import {
    extractLinksFromMessageHtml,
    getActionableCardFraudAlertMessage,
    getActionableMentionWhisperMessage,
    getAddedApprovalRuleMessage,
    getAddedConnectionMessage,
    getChangedApproverActionMessage,
    getDeletedApprovalRuleMessage,
    getDemotedFromWorkspaceMessage,
    getDismissedViolationMessageText,
    getIntegrationSyncFailedMessage,
    getIOUReportIDFromReportActionPreview,
    getJoinRequestMessage,
    getOriginalMessage,
    getPolicyChangeLogAddEmployeeMessage,
    getPolicyChangeLogDefaultBillableMessage,
    getPolicyChangeLogDefaultReimbursableMessage,
    getPolicyChangeLogDefaultTitleEnforcedMessage,
    getPolicyChangeLogDeleteMemberMessage,
    getPolicyChangeLogMaxExpenseAmountMessage,
    getPolicyChangeLogMaxExpenseAmountNoReceiptMessage,
    getPolicyChangeLogUpdateEmployee,
    getRemovedConnectionMessage,
    getRemovedFromApprovalChainMessage,
    getRenamedAction,
    getReopenedMessage,
    getReportActionMessage,
    getReportActionText,
    getTagListNameUpdatedMessage,
    getTravelUpdateMessage,
    getUpdatedApprovalRuleMessage,
    getUpdatedAuditRateMessage,
    getUpdatedManualApprovalThresholdMessage,
    getWhisperedTo,
    getWorkspaceAttendeeTrackingUpdateMessage,
    getWorkspaceCategoryUpdateMessage,
    getWorkspaceCurrencyUpdateMessage,
    getWorkspaceCustomUnitRateAddedMessage,
    getWorkspaceCustomUnitRateDeletedMessage,
    getWorkspaceCustomUnitRateUpdatedMessage,
    getWorkspaceCustomUnitUpdatedMessage,
    getWorkspaceFrequencyUpdateMessage,
    getWorkspaceReimbursementUpdateMessage,
    getWorkspaceReportFieldAddMessage,
    getWorkspaceReportFieldDeleteMessage,
    getWorkspaceReportFieldUpdateMessage,
    getWorkspaceTagUpdateMessage,
    getWorkspaceTaxUpdateMessage,
    getWorkspaceUpdateFieldMessage,
    isActionableAddPaymentCard,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isActionableTrackExpense,
    isActionOfType,
    isCardIssuedAction,
    isChronosOOOListAction,
    isConciergeCategoryOptions,
    isConciergeDescriptionOptions,
    isCreatedTaskReportAction,
    isDeletedAction,
    isDeletedParentAction as isDeletedParentActionUtils,
    isIOURequestReportAction,
    isMarkAsClosedAction,
    isMessageDeleted,
    isMoneyRequestAction,
    isPendingRemove,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isResolvedConciergeCategoryOptions,
    isResolvedConciergeDescriptionOptions,
    isSplitBillAction as isSplitBillActionReportActionsUtils,
    isTagModificationAction,
    isTaskAction,
    isTrackExpenseAction as isTrackExpenseActionReportActionsUtils,
    isTripPreview,
    isUnapprovedAction,
    isWhisperActionTargetedToOthers,
    useTableReportViewActionRenderConditionals,
} from '@libs/ReportActionsUtils';
import type {MissingPaymentMethod} from '@libs/ReportUtils';
import {
    canWriteInReport,
    chatIncludesConcierge,
    getChatListItemReportName,
    getDeletedTransactionMessage,
    getDisplayNamesWithTooltips,
    getDowngradeWorkspaceMessage,
    getForcedCorporateUpgradeMessage,
    getMovedActionMessage,
    getMovedTransactionMessage,
    getPolicyChangeMessage,
    getRejectedReportMessage,
    getUnreportedTransactionMessage,
    getUpgradeWorkspaceMessage,
    getWhisperDisplayNames,
    getWorkspaceNameUpdatedMessage,
    isArchivedNonExpenseReport,
    isChatThread,
    isCompletedTaskReport,
    isExpenseReport,
    isTaskReport,
    shouldDisplayThreadReplies as shouldDisplayThreadRepliesUtils,
} from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import shouldRenderAddPaymentCard from '@libs/shouldRenderAppPaymentCard';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import variables from '@styles/variables';
import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';
import {resolveFraudAlert} from '@userActions/Card';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';
import {acceptJoinRequest, declineJoinRequest} from '@userActions/Policy/Member';
import {
    createTransactionThreadReport,
    expandURLPreview,
    resolveActionableMentionConfirmWhisper,
    resolveConciergeCategoryOptions,
    resolveConciergeDescriptionOptions,
} from '@userActions/Report';
import type {IgnoreDirection} from '@userActions/ReportActions';
import {isAnonymousUser, signOutAndRedirectToSignIn} from '@userActions/Session';
import {isBlockedFromConcierge} from '@userActions/User';
import type {IOUAction} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import type {JoinWorkspaceResolution, OriginalMessageMovedTransaction} from '@src/types/onyx/OriginalMessage';
import type {SearchReport} from '@src/types/onyx/SearchResults';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {RestrictedReadOnlyContextMenuActions} from './ContextMenu/ContextMenuActions';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import type {ContextMenuAnchor} from './ContextMenu/ReportActionContextMenu';
import {hideContextMenu, hideDeleteModal, isActiveReportAction, showContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import ReportActionItemContentCreated from './ReportActionItemContentCreated';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemThread from './ReportActionItemThread';
import TripSummary from './TripSummary';

type PureReportActionItemProps = {
    /** All the data of the report collection */
    allReports: OnyxCollection<OnyxTypes.Report>;

    /** All the data of the policy collection */
    policies: OnyxCollection<OnyxTypes.Policy>;

    /** Model of onboarding selected */
    introSelected?: OnyxEntry<OnyxTypes.IntroSelected>;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy for this action */
    policy?: OnyxEntry<OnyxTypes.Policy>;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;

    /** Array of report actions for the report for this action */
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: OnyxTypes.ReportAction[];

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread?: OnyxEntry<OnyxTypes.ReportAction>;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: boolean;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Report action ID that was referenced in the deeplink to report  */
    linkedReportActionID?: string;

    /** Callback to be called on onPress */
    onPress?: () => void;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /**
     * Is the action a thread's parent reportAction viewed from within the thread report?
     * It will be false if we're viewing the same parent report action from the report it belongs to rather than the thread.
     */
    isThreadReportParentAction?: boolean;

    /** IF the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;

    /** Whether context menu should be displayed */
    shouldDisplayContextMenu?: boolean;

    /** ReportAction draft message */
    draftMessage?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;

    /** The task report associated with this action, if any */
    taskReport: OnyxEntry<OnyxTypes.Report>;

    /** The linked report associated with this action, if any */
    linkedReport: OnyxEntry<OnyxTypes.Report>;

    /** The iou report associated with the linked report, if any */
    iouReportOfLinkedReport: OnyxEntry<OnyxTypes.Report>;

    /** All the emoji reactions for the report action. */
    emojiReactions?: OnyxTypes.ReportActionReactions;

    /** Linked transaction route error */
    linkedTransactionRouteError?: Errors;

    /** Optional property to indicate if the user is validated */
    isUserValidated?: boolean;

    /** Parent report */
    parentReport?: OnyxTypes.Report;

    /** Personal details list */
    personalDetails?: OnyxTypes.PersonalDetailsList;

    /** Whether or not the user is blocked from concierge */
    blockedFromConcierge?: OnyxTypes.BlockedFromConcierge;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID?: string;

    /** Function to deletes the draft for a comment report action. */
    deleteReportActionDraft?: (reportID: string | undefined, action: OnyxTypes.ReportAction) => void;

    /** Whether the room is archived */
    isArchivedRoom?: boolean;

    /** Whether the room is a chronos report */
    isChronosReport?: boolean;

    /** Function to toggle emoji reaction */
    toggleEmojiReaction?: (
        reportID: string | undefined,
        reportAction: OnyxTypes.ReportAction,
        reactionObject: Emoji,
        existingReactions: OnyxEntry<OnyxTypes.ReportActionReactions>,
        paramSkinTone: number | undefined,
        ignoreSkinToneOnCompare: boolean | undefined,
    ) => void;

    /** Function to create a draft transaction and navigate to participant selector */
    createDraftTransactionAndNavigateToParticipantSelector?: (
        transactionID: string | undefined,
        reportID: string | undefined,
        actionName: IOUAction,
        reportActionID: string,
        introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
        isRestrictedToPreferredPolicy?: boolean,
        preferredPolicyID?: string,
    ) => void;

    /** Function to resolve actionable report mention whisper */
    resolveActionableReportMentionWhisper?: (
        reportId: string | undefined,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
        isReportArchived?: boolean,
    ) => void;

    /** Function to resolve actionable mention whisper */
    resolveActionableMentionWhisper?: (
        reportId: string | undefined,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
        isReportArchived: boolean,
    ) => void;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;

    /** What missing payment method does this report action indicate, if any? */
    missingPaymentMethod?: MissingPaymentMethod | undefined;

    /** Returns the preview message for `REIMBURSEMENT_DEQUEUED` or `REIMBURSEMENT_ACH_CANCELED` action */
    reimbursementDeQueuedOrCanceledActionMessage?: string;

    /** The report action message when expense has been modified. */
    modifiedExpenseMessage?: string;

    /** Gets all transactions on an IOU report with a receipt */
    getTransactionsWithReceipts?: (iouReportID: string | undefined) => OnyxTypes.Transaction[];

    /** Whether the current user is the only participant in the report */
    isCurrentUserTheOnlyParticipant?: (participantAccountIDs?: number[]) => boolean;

    /** Function to clear an error from a transaction */
    clearError?: (transactionID: string) => void;

    /** Function to clear all errors from a report action */
    clearAllRelatedReportActionErrors?: (reportID: string | undefined, reportAction: OnyxTypes.ReportAction | null | undefined, ignore?: IgnoreDirection, keys?: string[]) => void;

    /** Function to dismiss the actionable whisper for tracking expenses */
    dismissTrackExpenseActionableWhisper?: (reportID: string | undefined, reportAction: OnyxEntry<OnyxTypes.ReportAction>) => void;

    /** User payment card ID */
    userBillingFundID?: number;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Whether to highlight the action for a few seconds */
    shouldHighlight?: boolean;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed?: boolean;

    /** Current user's account id */
    currentUserAccountID?: number;

    /** The bank account list */
    bankAccountList?: OnyxTypes.BankAccountList | undefined;
};

// This is equivalent to returning a negative boolean in normal functions, but we can keep the element return type
// If the child was rendered using RenderHTML and an empty html string, it has an empty prop called html
// If we render an empty component/fragment, this does not apply
const emptyHTML = <RenderHTML html="" />;
const isEmptyHTML = <T extends React.JSX.Element>({props: {html}}: T): boolean => typeof html === 'string' && html.length === 0;

/**
 * This is a pure version of ReportActionItem, used in ReportActionList and Search result chat list items.
 * Since the search result has a separate Onyx key under the 'snapshot_' prefix, we should not connect this component with Onyx.
 * Instead, pass all Onyx read/write operations as props.
 */
function PureReportActionItem({
    allReports,
    policies,
    introSelected,
    action,
    report,
    policy,
    transactionThreadReport,
    linkedReportActionID,
    displayAsGroup,
    index,
    isMostRecentIOUReportAction,
    parentReportAction,
    shouldDisplayNewMarker,
    shouldHideThreadDividerLine = false,
    onPress = undefined,
    isFirstVisibleReportAction = false,
    isThreadReportParentAction = false,
    shouldUseThreadDividerLine = false,
    shouldDisplayContextMenu = true,
    parentReportActionForTransactionThread,
    draftMessage,
    iouReport,
    taskReport,
    linkedReport,
    iouReportOfLinkedReport,
    emojiReactions,
    linkedTransactionRouteError,
    isUserValidated,
    parentReport,
    personalDetails,
    blockedFromConcierge,
    originalReportID = '-1',
    deleteReportActionDraft = () => {},
    isArchivedRoom,
    isChronosReport,
    toggleEmojiReaction = () => {},
    createDraftTransactionAndNavigateToParticipantSelector = () => {},
    resolveActionableReportMentionWhisper = () => {},
    resolveActionableMentionWhisper = () => {},
    isClosedExpenseReportWithNoExpenses,
    isCurrentUserTheOnlyParticipant = () => false,
    missingPaymentMethod,
    reimbursementDeQueuedOrCanceledActionMessage = '',
    modifiedExpenseMessage = '',
    getTransactionsWithReceipts = () => [],
    clearError = () => {},
    clearAllRelatedReportActionErrors = () => {},
    dismissTrackExpenseActionableWhisper = () => {},
    userBillingFundID,
    shouldShowBorder,
    shouldHighlight = false,
    isTryNewDotNVPDismissed = false,
    currentUserAccountID,
    bankAccountList,
}: PureReportActionItemProps) {
    const actionSheetAwareScrollViewContext = useContext(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    const {translate, formatPhoneNumber, localeCompare, formatTravelDate, getLocalDateFromDatetime} = useLocalize();
    const personalDetail = useCurrentUserPersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const reportID = report?.reportID ?? action?.reportID;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => isActiveReportAction(action.reportActionID));
    const [isEmojiPickerActive, setIsEmojiPickerActive] = useState<boolean | undefined>();
    const [isPaymentMethodPopoverActive, setIsPaymentMethodPopoverActive] = useState<boolean | undefined>();
    const {isRestrictedToPreferredPolicy, preferredPolicyID} = usePreferredPolicy();
    const shouldRenderViewBasedOnAction = useTableReportViewActionRenderConditionals(action);
    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState<OnyxTypes.DecisionName>(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
    const reactionListRef = useContext(ReactionListContext);
    const {updateHiddenAttachments} = useContext(AttachmentModalContext);
    const kycWallRef = useContext(KYCWallContext);
    const composerTextInputRef = useRef<TextInput | HTMLTextAreaElement>(null);
    const popoverAnchorRef = useRef<Exclude<ContextMenuAnchor, TextInput>>(null);
    const downloadedPreviews = useRef<string[]>([]);
    const prevDraftMessage = usePrevious(draftMessage);
    const isReportActionLinked = linkedReportActionID && action.reportActionID && linkedReportActionID === action.reportActionID;
    const [isReportActionActive, setIsReportActionActive] = useState(!!isReportActionLinked);
    const isActionableWhisper =
        isActionableMentionWhisper(action) || isActionableMentionInviteToSubmitExpenseConfirmWhisper(action) || isActionableTrackExpense(action) || isActionableReportMentionWhisper(action);
    const isReportArchived = useReportIsArchived(reportID);
    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const highlightedBackgroundColorIfNeeded = useMemo(
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        () => (isReportActionLinked || shouldHighlight ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {}),
        [StyleUtils, isReportActionLinked, theme.messageHighlightBG, shouldHighlight],
    );

    const reportPreviewStyles = StyleUtils.getMoneyRequestReportPreviewStyle(shouldUseNarrowLayout, 1, undefined, undefined);

    const isDeletedParentAction = isDeletedParentActionUtils(action);

    // IOUDetails only exists when we are sending money
    const isSendingMoney = isMoneyRequestAction(action) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && getOriginalMessage(action)?.IOUDetails;

    const updateHiddenState = useCallback(
        (isHiddenValue: boolean) => {
            setIsHidden(isHiddenValue);
            const message = Array.isArray(action.message) ? action.message?.at(-1) : action.message;
            const isAttachment = CONST.ATTACHMENT_REGEX.test(message?.html ?? '') || isReportMessageAttachment(message);
            if (!isAttachment) {
                return;
            }
            updateHiddenAttachments(action.reportActionID, isHiddenValue);
        },
        [action.reportActionID, action.message, updateHiddenAttachments],
    );

    const isOnSearch = useIsOnSearch();
    let currentSearchHash: number | undefined;
    if (isOnSearch) {
        const {currentSearchHash: searchContextCurrentSearchHash} = use(SearchContext);
        currentSearchHash = searchContextCurrentSearchHash;
    }

    const [showConfirmDismissReceiptError, setShowConfirmDismissReceiptError] = useState(false);
    const dismissError = useCallback(() => {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (transactionID) {
            clearError(transactionID);
        }
        clearAllRelatedReportActionErrors(reportID, action);
    }, [reportID, clearError, clearAllRelatedReportActionErrors, action]);

    const onClose = () => {
        const errors = linkedTransactionRouteError ?? getLatestErrorMessageField(action as OnyxDataWithErrors);
        const errorEntries = Object.entries(errors ?? {});
        const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
        const hasReceiptError = Object.values(errorMessages).some((error) => isReceiptError(error));

        if (hasReceiptError) {
            setShowConfirmDismissReceiptError(true);
        } else {
            dismissError();
        }
    };
    useEffect(
        () => () => {
            // ReportActionContextMenu, EmojiPicker and PopoverReactionList are global components,
            // we should also hide them when the current component is destroyed
            if (isActiveReportAction(action.reportActionID)) {
                hideContextMenu();
                hideDeleteModal();
            }
            if (isActive(action.reportActionID)) {
                hideEmojiPicker(true);
            }
            if (reactionListRef?.current?.isActiveReportAction(action.reportActionID)) {
                reactionListRef?.current?.hideReactionList();
            }
        },
        [action.reportActionID, reactionListRef],
    );

    useEffect(() => {
        // We need to hide EmojiPicker when this is a deleted parent action
        if (!isDeletedParentAction || !isActive(action.reportActionID)) {
            return;
        }

        hideEmojiPicker(true);
    }, [isDeletedParentAction, action.reportActionID]);

    useEffect(() => {
        if (prevDraftMessage !== undefined || draftMessage === undefined) {
            return;
        }

        focusComposerWithDelay(composerTextInputRef.current)(true);
    }, [prevDraftMessage, draftMessage]);

    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = extractLinksFromMessageHtml(action);
        if (deepEqual(downloadedPreviews.current, urls) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        downloadedPreviews.current = urls;
        expandURLPreview(reportID, action.reportActionID);
    }, [action, reportID]);

    useEffect(() => {
        if (draftMessage === undefined || !isDeletedAction(action)) {
            return;
        }
        deleteReportActionDraft(reportID, action);
    }, [draftMessage, action, reportID, deleteReportActionDraft]);

    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    const latestDecision = getReportActionMessage(action)?.moderationDecision?.decision ?? '';
    useEffect(() => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            return;
        }

        // Hide reveal message button and show the message if latestDecision is changed to empty
        if (!latestDecision) {
            setModerationDecision(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
            setIsHidden(false);
            return;
        }

        setModerationDecision(latestDecision);
        if (![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === latestDecision) && !isPendingRemove(action)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(isActiveReportAction(action.reportActionID));
    }, [action.reportActionID]);

    const handleShowContextMenu = useCallback(
        (callback: () => void) => {
            if (!(popoverAnchorRef.current && 'measureInWindow' in popoverAnchorRef.current)) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/naming-convention
            popoverAnchorRef.current?.measureInWindow((_fx, frameY, _width, height) => {
                actionSheetAwareScrollViewContext.transitionActionSheetState({
                    type: ActionSheetAwareScrollView.Actions.OPEN_POPOVER,
                    payload: {
                        popoverHeight: 0,
                        frameY,
                        height,
                    },
                });

                callback();
            });
        },
        [actionSheetAwareScrollViewContext],
    );

    const disabledActions = useMemo(() => (!canWriteInReport(report) ? RestrictedReadOnlyContextMenuActions : []), [report]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    const showPopover = useCallback(
        (event: GestureResponderEvent | MouseEvent) => {
            // Block menu on the message being Edited or if the report action item has errors
            if (draftMessage !== undefined || !isEmptyObject(action.errors) || !shouldDisplayContextMenu) {
                return;
            }

            handleShowContextMenu(() => {
                setIsContextMenuActive(true);
                const selection = SelectionScraper.getCurrentSelection();
                showContextMenu({
                    type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                    event,
                    selection,
                    contextMenuAnchor: popoverAnchorRef.current,
                    report: {
                        reportID,
                        originalReportID,
                        isArchivedRoom,
                        isChronos: isChronosReport,
                    },
                    reportAction: {
                        reportActionID: action.reportActionID,
                        draftMessage,
                        isThreadReportParentAction,
                    },
                    callbacks: {
                        onShow: toggleContextMenuFromActiveReportAction,
                        onHide: toggleContextMenuFromActiveReportAction,
                        setIsEmojiPickerActive: setIsEmojiPickerActive as () => void,
                    },
                    disabledOptions: disabledActions,
                });
            });
        },
        [
            draftMessage,
            action.errors,
            action.reportActionID,
            reportID,
            toggleContextMenuFromActiveReportAction,
            originalReportID,
            shouldDisplayContextMenu,
            disabledActions,
            isArchivedRoom,
            isChronosReport,
            handleShowContextMenu,
            isThreadReportParentAction,
        ],
    );

    const toggleReaction = useCallback(
        (emoji: Emoji, ignoreSkinToneOnCompare?: boolean) => {
            toggleEmojiReaction(reportID, action, emoji, emojiReactions, undefined, ignoreSkinToneOnCompare);
        },
        [reportID, action, emojiReactions, toggleEmojiReaction],
    );

    const contextValue = useMemo(
        () => ({
            anchor: popoverAnchorRef.current,
            report,
            isReportArchived,
            action,
            transactionThreadReport,
            checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
            onShowContextMenu: handleShowContextMenu,
            isDisabled: false,
            shouldDisplayContextMenu,
        }),
        [report, action, toggleContextMenuFromActiveReportAction, transactionThreadReport, handleShowContextMenu, shouldDisplayContextMenu, isReportArchived],
    );

    const attachmentContextValue = useMemo(() => {
        if (isOnSearch) {
            return {type: CONST.ATTACHMENT_TYPE.SEARCH, currentSearchHash};
        }
        return {reportID, type: CONST.ATTACHMENT_TYPE.REPORT};
    }, [reportID, isOnSearch, currentSearchHash]);

    const mentionReportContextValue = useMemo(() => ({currentReportID: report?.reportID, exactlyMatch: true}), [report?.reportID]);
    const actionableItemButtons: ActionableItem[] = useMemo(() => {
        if (isActionableAddPaymentCard(action) && userBillingFundID === undefined && shouldRenderAddPaymentCard()) {
            return [
                {
                    text: 'subscription.cardSection.addCardButton',
                    key: `${action.reportActionID}-actionableAddPaymentCard-submit`,
                    onPress: () => {
                        Navigation.navigate(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
                    },
                    isPrimary: true,
                },
            ];
        }

        const reportActionReportID = originalReportID ?? reportID;
        if (isConciergeCategoryOptions(action)) {
            const options = getOriginalMessage(action)?.options;
            if (!options) {
                return [];
            }

            if (isResolvedConciergeCategoryOptions(action)) {
                return [];
            }

            if (!reportActionReportID) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeCategoryOptions-${option}`,
                onPress: () => {
                    resolveConciergeCategoryOptions(reportActionReportID, reportID, action.reportActionID, option, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE);
                },
            }));
        }

        if (isConciergeDescriptionOptions(action)) {
            const options = getOriginalMessage(action)?.options;
            if (!options) {
                return [];
            }

            if (isResolvedConciergeDescriptionOptions(action)) {
                return [];
            }

            if (!reportActionReportID) {
                return [];
            }

            return options.map((option, i) => ({
                text: `${i + 1} - ${option}`,
                key: `${action.reportActionID}-conciergeDescriptionOptions-${option}`,
                onPress: () => {
                    resolveConciergeDescriptionOptions(reportActionReportID, reportID, action.reportActionID, option, personalDetail.timezone ?? CONST.DEFAULT_TIME_ZONE);
                },
            }));
        }

        if (!isActionableWhisper && !isActionableCardFraudAlert(action) && (!isActionableJoinRequest(action) || getOriginalMessage(action)?.choice !== ('' as JoinWorkspaceResolution))) {
            return [];
        }

        if (isActionableTrackExpense(action)) {
            const transactionID = getOriginalMessage(action)?.transactionID;
            const options = [
                {
                    text: 'actionableMentionTrackExpense.submit',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-submit`,
                    onPress: () => {
                        createDraftTransactionAndNavigateToParticipantSelector(
                            transactionID,
                            reportActionReportID,
                            CONST.IOU.ACTION.SUBMIT,
                            action.reportActionID,
                            introSelected,
                            isRestrictedToPreferredPolicy,
                            preferredPolicyID,
                        );
                    },
                },
            ];

            if (Permissions.canUseTrackFlows()) {
                options.push(
                    {
                        text: 'actionableMentionTrackExpense.categorize',
                        key: `${action.reportActionID}-actionableMentionTrackExpense-categorize`,
                        onPress: () => {
                            createDraftTransactionAndNavigateToParticipantSelector(transactionID, reportActionReportID, CONST.IOU.ACTION.CATEGORIZE, action.reportActionID, introSelected);
                        },
                    },
                    {
                        text: 'actionableMentionTrackExpense.share',
                        key: `${action.reportActionID}-actionableMentionTrackExpense-share`,
                        onPress: () => {
                            createDraftTransactionAndNavigateToParticipantSelector(transactionID, reportActionReportID, CONST.IOU.ACTION.SHARE, action.reportActionID, introSelected);
                        },
                    },
                );
            }
            options.push({
                text: 'actionableMentionTrackExpense.nothing',
                key: `${action.reportActionID}-actionableMentionTrackExpense-nothing`,
                onPress: () => {
                    dismissTrackExpenseActionableWhisper(reportActionReportID, action);
                },
            });
            return options;
        }

        if (isActionableCardFraudAlert(action)) {
            if (getOriginalMessage(action)?.resolution) {
                return [];
            }

            const cardID = getOriginalMessage(action)?.cardID;
            return [
                {
                    text: translate('cardPage.cardFraudAlert.confirmButtonText'),
                    key: `${action.reportActionID}-cardFraudAlert-confirm`,
                    onPress: () => {
                        resolveFraudAlert(cardID, false, reportID, action?.reportActionID);
                    },
                    isPrimary: true,
                },
                {
                    text: translate('cardPage.cardFraudAlert.reportFraudButtonText'),
                    key: `${action.reportActionID}-cardFraudAlert-reportFraud`,
                    onPress: () => {
                        resolveFraudAlert(cardID, true, reportID, action?.reportActionID);
                    },
                },
            ];
        }

        if (isActionableJoinRequest(action)) {
            return [
                {
                    text: 'actionableMentionJoinWorkspaceOptions.accept',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT}`,
                    onPress: () => acceptJoinRequest(reportActionReportID, action),
                    isPrimary: true,
                },
                {
                    text: 'actionableMentionJoinWorkspaceOptions.decline',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE}`,
                    onPress: () => declineJoinRequest(reportActionReportID, action),
                },
            ];
        }

        if (isActionableReportMentionWhisper(action)) {
            return [
                {
                    text: 'common.yes',
                    key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE}`,
                    onPress: () => resolveActionableReportMentionWhisper(reportActionReportID, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.CREATE, isReportArchived),
                    isPrimary: true,
                },
                {
                    text: 'common.no',
                    key: `${action.reportActionID}-actionableReportMentionWhisper-${CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                    onPress: () => resolveActionableReportMentionWhisper(reportActionReportID, action, CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION.NOTHING, isReportArchived),
                },
            ];
        }

        if (isActionableMentionInviteToSubmitExpenseConfirmWhisper(action)) {
            return [
                {
                    text: 'common.buttonConfirm',
                    key: `${action.reportActionID}-actionableReportMentionConfirmWhisper-${CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE}`,
                    onPress: () =>
                        resolveActionableMentionConfirmWhisper(
                            reportActionReportID,
                            action,
                            CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER.DONE,
                            isOriginalReportArchived,
                        ),
                    isPrimary: true,
                },
            ];
        }

        const actionableMentionWhisperOptions = [];
        const isReportInPolicy = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE && getPersonalPolicy()?.id !== report.policyID;

        if (isReportInPolicy && (isPolicyAdmin(policy) || isPolicyOwner(policy, currentUserAccountID))) {
            actionableMentionWhisperOptions.push({
                text: 'actionableMentionWhisperOptions.inviteToSubmitExpense',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE}`,
                onPress: () =>
                    resolveActionableMentionWhisper(reportActionReportID, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE_TO_SUBMIT_EXPENSE, isOriginalReportArchived),
                isMediumSized: true,
            });
        }

        actionableMentionWhisperOptions.push(
            {
                text: 'actionableMentionWhisperOptions.inviteToChat',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
                onPress: () => resolveActionableMentionWhisper(reportActionReportID, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE, isOriginalReportArchived),
                isMediumSized: true,
            },
            {
                text: 'actionableMentionWhisperOptions.nothing',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                onPress: () => resolveActionableMentionWhisper(reportActionReportID, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING, isOriginalReportArchived),
                isMediumSized: true,
            },
        );
        return actionableMentionWhisperOptions;
    }, [
        action,
        userBillingFundID,
        originalReportID,
        reportID,
        isActionableWhisper,
        report?.policyID,
        policy,
        currentUserAccountID,
        personalDetail.timezone,
        createDraftTransactionAndNavigateToParticipantSelector,
        isRestrictedToPreferredPolicy,
        preferredPolicyID,
        dismissTrackExpenseActionableWhisper,
        translate,
        resolveActionableReportMentionWhisper,
        isReportArchived,
        formatPhoneNumber,
        isOriginalReportArchived,
        resolveActionableMentionWhisper,
        introSelected,
    ]);

    /**
     * Get the content of ReportActionItem
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the report action is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns child component(s)
     */
    const renderItemContent = (hovered = false, isWhisper = false, hasErrors = false): React.JSX.Element => {
        let children;
        const moneyRequestOriginalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
        const moneyRequestActionType = moneyRequestOriginalMessage?.type;

        // Show the preview for when expense is present
        if (isIOURequestReportAction(action)) {
            const isSplitScanWithNoAmount = moneyRequestActionType === CONST.IOU.REPORT_ACTION_TYPE.SPLIT && moneyRequestOriginalMessage?.amount === 0;
            const chatReportID = moneyRequestOriginalMessage?.IOUReportID ? report?.chatReportID : reportID;
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = moneyRequestOriginalMessage?.IOUReportID?.toString();
            children = (
                <MoneyRequestAction
                    allReports={allReports}
                    // If originalMessage.iouReportID is set, this is a 1:1 IOU expense in a DM chat whose reportID is report.chatReportID
                    chatReportID={chatReportID}
                    requestReportID={iouReportID}
                    reportID={reportID}
                    action={action}
                    isMostRecentIOUReportAction={isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef.current}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={displayAsGroup ? [] : [styles.mt2]}
                    isWhisper={isWhisper}
                    shouldDisplayContextMenu={shouldDisplayContextMenu}
                />
            );

            if (report?.type === CONST.REPORT.TYPE.CHAT) {
                const isSplitBill = moneyRequestActionType === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
                const shouldShowSplitPreview = isSplitBill || isSplitScanWithNoAmount;
                if (report.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM || shouldShowSplitPreview) {
                    children = (
                        <View style={[styles.mt1, styles.w100]}>
                            <TransactionPreview
                                allReports={allReports}
                                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                                chatReportID={reportID}
                                reportID={reportID}
                                action={action}
                                shouldDisplayContextMenu={shouldDisplayContextMenu}
                                isBillSplit={isSplitBillActionReportActionsUtils(action)}
                                transactionID={shouldShowSplitPreview ? moneyRequestOriginalMessage?.IOUTransactionID : undefined}
                                containerStyles={[reportPreviewStyles.transactionPreviewStandaloneStyle, styles.mt1]}
                                transactionPreviewWidth={reportPreviewStyles.transactionPreviewStandaloneStyle.width}
                                onPreviewPressed={() => {
                                    if (shouldShowSplitPreview) {
                                        Navigation.navigate(ROUTES.SPLIT_BILL_DETAILS.getRoute(chatReportID, action.reportActionID, Navigation.getReportRHPActiveRoute()));
                                        return;
                                    }

                                    // If no childReportID exists, create transaction thread on-demand
                                    if (!action.childReportID) {
                                        const createdTransactionThreadReport = createTransactionThreadReport(iouReport, action);
                                        if (createdTransactionThreadReport?.reportID) {
                                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(createdTransactionThreadReport.reportID, undefined, undefined, Navigation.getActiveRoute()));
                                            return;
                                        }
                                        return;
                                    }

                                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(action.childReportID, undefined, undefined, Navigation.getActiveRoute()));
                                }}
                                isTrackExpense={isTrackExpenseActionReportActionsUtils(action)}
                            />
                        </View>
                    );
                } else {
                    children = emptyHTML;
                }
            }
        } else if (isTripPreview(action)) {
            children = (
                <TripRoomPreview
                    action={action}
                    chatReport={linkedReport}
                    iouReport={iouReportOfLinkedReport}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef.current}
                    containerStyles={displayAsGroup ? [] : [styles.mt2]}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    shouldDisplayContextMenu={shouldDisplayContextMenu}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isClosedExpenseReportWithNoExpenses) {
            children = <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedReport')}</deleted-action>`} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
            children = (
                <MoneyRequestReportPreview
                    allReports={allReports}
                    policies={policies}
                    iouReportID={getIOUReportIDFromReportActionPreview(action)}
                    policyID={report?.policyID}
                    chatReportID={reportID}
                    action={action}
                    contextMenuAnchor={popoverAnchorRef.current}
                    isHovered={hovered}
                    isWhisper={isWhisper}
                    isInvoice={action.childType === CONST.REPORT.CHAT_TYPE.INVOICE}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    onPaymentOptionsShow={() => setIsPaymentMethodPopoverActive(true)}
                    onPaymentOptionsHide={() => setIsPaymentMethodPopoverActive(false)}
                    shouldDisplayContextMenu={shouldDisplayContextMenu}
                    shouldShowBorder={shouldShowBorder}
                />
            );
        } else if (isTaskAction(action)) {
            children = <TaskAction action={action} />;
        } else if (isCreatedTaskReportAction(action)) {
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <TaskPreview
                        style={displayAsGroup ? [] : [styles.mt1]}
                        taskReport={taskReport}
                        chatReportID={reportID}
                        action={action}
                        isHovered={hovered}
                        onShowContextMenu={handleShowContextMenu}
                        contextMenuAnchor={popoverAnchorRef.current}
                        checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                        policyID={report?.policyID}
                        shouldDisplayContextMenu={shouldDisplayContextMenu}
                    />
                </ShowContextMenuContext.Provider>
            );
        } else if (isReimbursementQueuedAction(action)) {
            const targetReport = isChatThread(report) ? parentReport : report;
            const submitterDisplayName = formatPhoneNumber(getDisplayNameOrDefault(personalDetails?.[targetReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]));
            const paymentType = getOriginalMessage(action)?.paymentType ?? '';

            children = (
                <ReportActionItemBasicMessage
                    message={translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', {submitterDisplayName})}
                >
                    <>
                        {missingPaymentMethod === 'bankAccount' && (
                            <Button
                                success
                                style={[styles.w100, styles.requestPreviewBox]}
                                text={translate('bankAccount.addBankAccount')}
                                onPress={() => openPersonalBankAccountSetupView({exitReportID: Navigation.getTopmostReportId() ?? targetReport?.reportID, isUserValidated})}
                                pressOnEnter
                                large
                            />
                        )}
                        {missingPaymentMethod === 'wallet' && (
                            <KYCWall
                                ref={kycWallRef}
                                onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                chatReportID={targetReport?.reportID}
                                iouReport={iouReport}
                            >
                                {(triggerKYCFlow, buttonRef) => (
                                    <Button
                                        ref={buttonRef}
                                        success
                                        large
                                        style={[styles.w100, styles.requestPreviewBox]}
                                        text={translate('iou.enableWallet')}
                                        onPress={(event) => {
                                            triggerKYCFlow({event});
                                        }}
                                    />
                                )}
                            </KYCWall>
                        )}
                    </>
                </ReportActionItemBasicMessage>
            );
        } else if (isReimbursementDeQueuedOrCanceledAction(action)) {
            children = <ReportActionItemBasicMessage message={reimbursementDeQueuedOrCanceledActionMessage} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${modifiedExpenseMessage}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) || isMarkAsClosedAction(action)) {
            const wasSubmittedViaHarvesting = !isMarkAsClosedAction(action) ? (getOriginalMessage(action)?.harvesting ?? false) : false;
            if (wasSubmittedViaHarvesting) {
                children = (
                    <ReportActionItemBasicMessage>
                        <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallySubmitted')}</muted-text></comment>`} />
                    </ReportActionItemBasicMessage>
                );
            } else {
                children = <ReportActionItemBasicMessage message={translate('iou.submitted', {memo: getOriginalMessage(action)?.message})} />;
            }
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.APPROVED)) {
            const wasAutoApproved = getOriginalMessage(action)?.automaticAction ?? false;
            if (wasAutoApproved) {
                children = (
                    <ReportActionItemBasicMessage>
                        <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyApproved')}</muted-text></comment>`} />
                    </ReportActionItemBasicMessage>
                );
            } else {
                children = <ReportActionItemBasicMessage message={translate('iou.approvedMessage')} />;
            }
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            const wasAutoPaid = getOriginalMessage(action)?.automaticAction ?? false;
            const paymentType = getOriginalMessage(action)?.paymentType;

            if (paymentType === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
                children = <ReportActionItemBasicMessage message={translate('iou.paidElsewhere')} />;
            } else if (paymentType === CONST.IOU.PAYMENT_TYPE.VBBA) {
                const last4Digits = policy?.achAccount?.accountNumber?.slice(-4) ?? '';

                if (wasAutoPaid) {
                    const translation = translate('iou.automaticallyPaidWithBusinessBankAccount', {amount: '', last4Digits});

                    children = (
                        <ReportActionItemBasicMessage>
                            <RenderHTML html={`<comment><muted-text>${translation}</muted-text></comment>`} />
                        </ReportActionItemBasicMessage>
                    );
                } else {
                    children = <ReportActionItemBasicMessage message={translate('iou.businessBankAccount', {amount: '', last4Digits})} />;
                }
            } else if (wasAutoPaid) {
                children = (
                    <ReportActionItemBasicMessage>
                        <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyPaidWithExpensify')}</muted-text></comment>`} />
                    </ReportActionItemBasicMessage>
                );
            } else {
                const originalMessage = getOriginalMessage(action);
                const amount = convertToDisplayString(Math.abs(originalMessage?.amount ?? 0), originalMessage?.currency);
                if (originalMessage?.bankAccountID) {
                    const bankAccount = bankAccountList?.[originalMessage.bankAccountID];
                    children = (
                        <ReportActionItemBasicMessage
                            message={translate(originalMessage?.payAsBusiness ? 'iou.settleInvoiceBusiness' : 'iou.settleInvoicePersonal', {
                                amount,
                                last4Digits: bankAccount?.accountData?.accountNumber?.slice(-4) ?? '',
                            })}
                        />
                    );
                } else {
                    children = <ReportActionItemBasicMessage message={translate('iou.paidWithExpensify')} />;
                }
            }
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED)) {
            const isFromNewDot = getOriginalMessage(action)?.isNewDot ?? false;

            children = isFromNewDot ? emptyHTML : <ReportActionItemBasicMessage message={translate('iou.paidElsewhere')} />;
        } else if (isUnapprovedAction(action)) {
            children = <ReportActionItemBasicMessage message={translate('iou.unapproved')} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
            const wasAutoForwarded = getOriginalMessage(action)?.automaticAction ?? false;
            if (wasAutoForwarded) {
                children = (
                    <ReportActionItemBasicMessage>
                        <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyForwarded')}</muted-text></comment>`} />
                    </ReportActionItemBasicMessage>
                );
            } else {
                children = <ReportActionItemBasicMessage message={translate('iou.forwarded')} />;
            }
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED) {
            children = <ReportActionItemBasicMessage message={getRejectedReportMessage()} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
            children = <ReportActionItemBasicMessage message={getUpgradeWorkspaceMessage()} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<muted-text>${getForcedCorporateUpgradeMessage()}</muted-text>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
            children = <ReportActionItemBasicMessage message={getDowngradeWorkspaceMessage()} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
            children = <ReportActionItemBasicMessage message={translate('iou.heldExpense')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT) {
            children = <ReportActionItemBasicMessage message={getReportActionText(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
            children = <ReportActionItemBasicMessage message={translate('iou.unheldExpense')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD) {
            children = <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.rejectedExpense')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED) {
            children = <ReportActionItemBasicMessage message={translate('iou.reject.reportActions.markedAsResolved')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.RETRACTED) {
            children = <ReportActionItemBasicMessage message={translate('iou.retracted')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REOPENED) {
            children = <ReportActionItemBasicMessage message={getReopenedMessage()} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION) {
            children = <ReportActionItemBasicMessage message={getDeletedTransactionMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION) {
            const movedTransactionOriginalMessage = getOriginalMessage(action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>) ?? {};
            const {toReportID} = movedTransactionOriginalMessage as OriginalMessageMovedTransaction;
            const toReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`];
            // When expenses are merged multiple times, the previous toReportID may reference a deleted report,
            // making it impossible to retrieve the report name for display
            // Ref: https://github.com/Expensify/App/issues/70338
            if (!toReport) {
                children = emptyHTML;
            } else {
                children = (
                    <ReportActionItemBasicMessage message="">
                        <RenderHTML html={`<comment><muted-text>${getMovedTransactionMessage(toReport)}</muted-text></comment>`} />
                    </ReportActionItemBasicMessage>
                );
            }
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getMovedActionMessage(action, report)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getTravelUpdateMessage(action, formatTravelDate)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getUnreportedTransactionMessage()}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION) {
            children = <ReportActionItemBasicMessage message={translate('systemMessage.mergedWithCashTransaction')} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION)) {
            children = <ReportActionItemBasicMessage message={getDismissedViolationMessageText(getOriginalMessage(action))} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES)) {
            children = <ReportActionItemBasicMessage message={translate('violations.resolvedDuplicates')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME) {
            children = <ReportActionItemBasicMessage message={getWorkspaceNameUpdatedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CURRENCY) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCurrencyUpdateMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUTO_REPORTING_FREQUENCY) {
            children = <ReportActionItemBasicMessage message={getWorkspaceFrequencyUpdateMessage(action)} />;
        } else if (
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CATEGORY ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CATEGORY ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CATEGORY ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.SET_CATEGORY_NAME
        ) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCategoryUpdateMessage(action, policy)} />;
        } else if (
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_TAX ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_TAX ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAX
        ) {
            children = <ReportActionItemBasicMessage message={getWorkspaceTaxUpdateMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_TAG_LIST_NAME) {
            children = <ReportActionItemBasicMessage message={getCleanedTagName(getTagListNameUpdatedMessage(action))} />;
        } else if (isTagModificationAction(action.actionName)) {
            children = <ReportActionItemBasicMessage message={getCleanedTagName(getWorkspaceTagUpdateMessage(action))} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCustomUnitUpdatedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateAddedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateUpdatedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_CUSTOM_UNIT_RATE) {
            children = <ReportActionItemBasicMessage message={getWorkspaceCustomUnitRateDeletedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage message={getWorkspaceReportFieldAddMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage message={getWorkspaceReportFieldUpdateMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_REPORT_FIELD) {
            children = <ReportActionItemBasicMessage message={getWorkspaceReportFieldDeleteMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_FIELD)) {
            children = <ReportActionItemBasicMessage message={getWorkspaceUpdateFieldMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_IS_ATTENDEE_TRACKING_ENABLED)) {
            children = <ReportActionItemBasicMessage message={getWorkspaceAttendeeTrackingUpdateMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_REIMBURSEMENT_ENABLED)) {
            children = <ReportActionItemBasicMessage message={getWorkspaceReimbursementUpdateMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT)) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountNoReceiptMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MAX_EXPENSE_AMOUNT)) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogMaxExpenseAmountMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_BILLABLE)) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultBillableMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_REIMBURSABLE)) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultReimbursableMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_DEFAULT_TITLE_ENFORCED)) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogDefaultTitleEnforcedMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EMPLOYEE) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogAddEmployeeMessage(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EMPLOYEE) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogUpdateEmployee(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_EMPLOYEE) {
            children = <ReportActionItemBasicMessage message={getPolicyChangeLogDeleteMemberMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage message={getAddedApprovalRuleMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage message={getDeletedApprovalRuleMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_APPROVER_RULE)) {
            children = <ReportActionItemBasicMessage message={getUpdatedApprovalRuleMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN)) {
            children = <ReportActionItemBasicMessage message={getRemovedFromApprovalChainMessage(action)} />;
        } else if (isActionableCardFraudAlert(action)) {
            const message = getActionableCardFraudAlertMessage(action, getLocalDateFromDatetime);

            children = (
                <View
                    accessibilityRole={CONST.ROLE.ALERT}
                    accessibilityLabel={translate('reportFraudConfirmationPage.title')}
                >
                    <ReportActionItemBasicMessage message={message} />
                    {actionableItemButtons.length > 0 && (
                        <ActionableItemButtons
                            items={actionableItemButtons}
                            layout="horizontal"
                        />
                    )}
                </View>
            );
        } else if (isActionableJoinRequest(action)) {
            children = (
                <View>
                    <ReportActionItemBasicMessage message={getJoinRequestMessage(action)} />
                    {actionableItemButtons.length > 0 && (
                        <ActionableItemButtons
                            items={actionableItemButtons}
                            shouldUseLocalization
                            layout={isActionableTrackExpense(action) ? 'vertical' : 'horizontal'}
                        />
                    )}
                </View>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE)) {
            children = <ReportActionItemBasicMessage message={getDemotedFromWorkspaceMessage(action)} />;
        } else if (isCardIssuedAction(action)) {
            children = (
                <IssueCardMessage
                    action={action}
                    policyID={report?.policyID}
                />
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
            children = <ExportIntegration action={action} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED)) {
            children = <ReportActionItemBasicMessage message={translate('iou.receiptScanningFailed')} />;
        } else if (isRenamedAction(action)) {
            const message = getRenamedAction(action, isExpenseReport(report));
            children = <ReportActionItemBasicMessage message={message} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getIntegrationSyncFailedMessage(action, report?.policyID, isTryNewDotNVPDismissed)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_INTEGRATION)) {
            children = <ReportActionItemBasicMessage message={getAddedConnectionMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.DELETE_INTEGRATION)) {
            children = <ReportActionItemBasicMessage message={getRemovedConnectionMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_AUDIT_RATE)) {
            children = <ReportActionItemBasicMessage message={getUpdatedAuditRateMessage(action)} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_MANUAL_APPROVAL_THRESHOLD)) {
            children = <ReportActionItemBasicMessage message={getUpdatedManualApprovalThresholdMessage(action)} />;
        } else if (isActionableMentionWhisper(action)) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={getActionableMentionWhisperMessage(action)} />
                    {actionableItemButtons.length > 0 && (
                        <ActionableItemButtons
                            items={actionableItemButtons}
                            shouldUseLocalization
                            layout="vertical"
                        />
                    )}
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${getChangedApproverActionMessage(action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else {
            const hasBeenFlagged =
                ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) && !isPendingRemove(action);
            children = (
                <MentionReportContext.Provider value={mentionReportContextValue}>
                    <ShowContextMenuContext.Provider value={contextValue}>
                        <AttachmentContext.Provider value={attachmentContextValue}>
                            {draftMessage === undefined ? (
                                <View style={displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                                    <ReportActionItemMessage
                                        reportID={reportID}
                                        action={action}
                                        displayAsGroup={displayAsGroup}
                                        isHidden={isHidden}
                                    />
                                    {hasBeenFlagged && (
                                        <Button
                                            small
                                            style={[styles.mt2, styles.alignSelfStart]}
                                            onPress={() => updateHiddenState(!isHidden)}
                                        >
                                            <Text
                                                style={[styles.buttonSmallText, styles.userSelectNone]}
                                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                            >
                                                {isHidden ? translate('moderation.revealMessage') : translate('moderation.hideMessage')}
                                            </Text>
                                        </Button>
                                    )}
                                    {/**
                                     These are the actionable buttons that appear at the bottom of a Concierge message
                                     for example: Invite a user mentioned but not a member of the room
                                     https://github.com/Expensify/App/issues/32741
                                     */}
                                    {actionableItemButtons.length > 0 && (
                                        <ActionableItemButtons
                                            items={actionableItemButtons}
                                            layout={
                                                isActionableTrackExpense(action) ||
                                                isConciergeCategoryOptions(action) ||
                                                isConciergeDescriptionOptions(action) ||
                                                isActionableMentionWhisper(action)
                                                    ? 'vertical'
                                                    : 'horizontal'
                                            }
                                            shouldUseLocalization={!isConciergeCategoryOptions(action) && !isConciergeDescriptionOptions(action)}
                                        />
                                    )}
                                </View>
                            ) : (
                                <ReportActionItemMessageEdit
                                    action={action}
                                    draftMessage={draftMessage}
                                    reportID={reportID}
                                    originalReportID={originalReportID}
                                    policyID={report?.policyID}
                                    index={index}
                                    ref={composerTextInputRef}
                                    shouldDisableEmojiPicker={
                                        (chatIncludesConcierge(report) && isBlockedFromConcierge(blockedFromConcierge)) || isArchivedNonExpenseReport(report, isArchivedRoom)
                                    }
                                    isGroupPolicyReport={!!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE}
                                />
                            )}
                        </AttachmentContext.Provider>
                    </ShowContextMenuContext.Provider>
                </MentionReportContext.Provider>
            );
        }
        const numberOfThreadReplies = action.childVisibleActionCount ?? 0;

        const shouldDisplayThreadReplies = shouldDisplayThreadRepliesUtils(action, isThreadReportParentAction) && !isOnSearch;
        const oldestFourAccountIDs =
            action.childOldestFourAccountIDs
                ?.split(',')
                .map((accountID) => Number(accountID))
                .filter((accountID): accountID is number => typeof accountID === 'number') ?? [];
        const draftMessageRightAlign = draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {};

        const itemContent = (
            <>
                {children}
                {Permissions.canUseLinkPreviews() && !isHidden && (action.linkMetadata?.length ?? 0) > 0 && (
                    <View style={draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {}}>
                        <LinkPreviewer linkMetadata={action.linkMetadata?.filter((item) => !isEmptyObject(item))} />
                    </View>
                )}
                {!isMessageDeleted(action) && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions
                            reportAction={action}
                            emojiReactions={isOnSearch ? {} : emojiReactions}
                            shouldBlockReactions={hasErrors}
                            toggleReaction={(emoji, ignoreSkinToneOnCompare) => {
                                if (isAnonymousUser()) {
                                    hideContextMenu(false);

                                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                                    InteractionManager.runAfterInteractions(() => {
                                        signOutAndRedirectToSignIn();
                                    });
                                } else {
                                    toggleReaction(emoji, ignoreSkinToneOnCompare);
                                }
                            }}
                            setIsEmojiPickerActive={setIsEmojiPickerActive}
                        />
                    </View>
                )}

                {shouldDisplayThreadReplies && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemThread
                            reportAction={action}
                            reportID={reportID}
                            numberOfReplies={numberOfThreadReplies}
                            mostRecentReply={`${action.childLastVisibleActionCreated}`}
                            isHovered={hovered || isContextMenuActive}
                            accountIDs={oldestFourAccountIDs}
                            onSecondaryInteraction={showPopover}
                            isActive={isReportActionActive && !isContextMenuActive}
                        />
                    </View>
                )}
            </>
        );

        return isEmptyHTML(children) ? emptyHTML : itemContent;
    };

    /**
     * Get ReportActionItem with a proper wrapper
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the ReportActionItem is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns report action item
     */

    const renderReportActionItem = (hovered: boolean, isWhisper: boolean, hasErrors: boolean): React.JSX.Element => {
        const content = renderItemContent(hovered || isContextMenuActive || isEmojiPickerActive, isWhisper, hasErrors);

        if (isEmptyHTML(content) || (!shouldRenderViewBasedOnAction && !isClosedExpenseReportWithNoExpenses)) {
            return emptyHTML;
        }

        if (draftMessage !== undefined) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={action}
                    showHeader={draftMessage === undefined}
                    wrapperStyle={{
                        ...(isOnSearch && styles.p0),
                        ...(isWhisper && styles.pt1),
                    }}
                    report={report}
                    iouReport={iouReport}
                    isHovered={hovered || isContextMenuActive}
                    isActive={isReportActionActive && !isContextMenuActive}
                    hasBeenFlagged={
                        ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) && !isPendingRemove(action)
                    }
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{content}</ReportActionItemGrouped>;
    };
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        const transactionID = isMoneyRequestAction(parentReportActionForTransactionThread) ? getOriginalMessage(parentReportActionForTransactionThread)?.IOUTransactionID : undefined;

        return (
            <ReportActionItemContentCreated
                contextValue={contextValue}
                allReports={allReports}
                parentReportAction={parentReportAction}
                parentReport={parentReport}
                transactionID={transactionID}
                draftMessage={draftMessage}
                shouldHideThreadDividerLine={shouldHideThreadDividerLine}
            />
        );
    }

    if (isTripPreview(action) && isThreadReportParentAction) {
        return <TripSummary reportID={getOriginalMessage(action)?.linkedReportID} />;
    }

    if (isChronosOOOListAction(action)) {
        return (
            <ChronosOOOListActions
                action={action}
                reportID={reportID}
            />
        );
    }

    // For the `pay` IOU action on non-pay expense flow, we don't want to render anything if `isWaitingOnBankAccount` is true
    // Otherwise, we will see two system messages informing the payee needs to add a bank account or wallet
    if (isMoneyRequestAction(action) && !!report?.isWaitingOnBankAccount && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney) {
        return null;
    }

    // We currently send whispers to all report participants and hide them in the UI for users that shouldn't see them.
    // This is a temporary solution needed for comment-linking.
    // The long term solution will leverage end-to-end encryption and only targeted users will be able to decrypt.
    if (isWhisperActionTargetedToOthers(action)) {
        return null;
    }

    const hasErrors = !isEmptyObject(action.errors);
    const whisperedTo = getWhisperedTo(action);
    const isMultipleParticipant = whisperedTo.length > 1;

    const iouReportID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUReportID ? getOriginalMessage(action)?.IOUReportID?.toString() : undefined;
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const isWhisper = whisperedTo.length > 0 && transactionsWithReceipts.length === 0;
    const whisperedToPersonalDetails = isWhisper
        ? (Object.values(personalDetails ?? {}).filter((details) => whisperedTo.includes(details?.accountID ?? CONST.DEFAULT_NUMBER_ID)) as OnyxTypes.PersonalDetails[])
        : [];
    const isWhisperOnlyVisibleByUser = isWhisper && isCurrentUserTheOnlyParticipant(whisperedTo);
    const displayNamesWithTooltips = isWhisper ? getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant, localeCompare) : [];

    const renderSearchHeader = (children: React.ReactNode) => {
        if (!isOnSearch) {
            return children;
        }

        return (
            <View style={[styles.p4]}>
                <View style={styles.webViewStyles.tagStyles.ol}>
                    <View style={[styles.flexRow, styles.alignItemsCenter, !isWhisper ? styles.mb3 : {}]}>
                        <Text style={styles.chatItemMessageHeaderPolicy}>{translate('common.in')}&nbsp;</Text>
                        <TextLink
                            fontSize={variables.fontSizeSmall}
                            onPress={() => {
                                onPress?.();
                            }}
                            numberOfLines={1}
                        >
                            {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
                            {getChatListItemReportName(action, report as SearchReport)}
                        </TextLink>
                    </View>
                    {children}
                </View>
            </View>
        );
    };

    return (
        <PressableWithSecondaryInteraction
            ref={popoverAnchorRef}
            onPress={() => {
                if (draftMessage === undefined) {
                    onPress?.();
                }
                if (!Keyboard.isVisible()) {
                    return;
                }
                Keyboard.dismiss();
            }}
            style={[action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isDeletedParentAction ? styles.pointerEventsNone : styles.pointerEventsAuto]}
            onPressIn={() => shouldUseNarrowLayout && canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContextMenu={draftMessage === undefined && !hasErrors}
            withoutFocusOnSecondaryInteraction
            accessibilityLabel={translate('accessibilityHints.chatMessage')}
            accessible
        >
            <Hoverable
                shouldHandleScroll
                isDisabled={draftMessage !== undefined}
                shouldFreezeCapture={isPaymentMethodPopoverActive}
                onHoverIn={() => {
                    setIsReportActionActive(false);
                }}
                onHoverOut={() => {
                    setIsReportActionActive(!!isReportActionLinked);
                }}
            >
                {(hovered) => (
                    <View style={highlightedBackgroundColorIfNeeded}>
                        {shouldDisplayNewMarker && (!shouldUseThreadDividerLine || !isFirstVisibleReportAction) && <UnreadActionIndicator reportActionID={action.reportActionID} />}
                        {shouldDisplayContextMenu && (
                            <MiniReportActionContextMenu
                                reportID={reportID}
                                reportActionID={action.reportActionID}
                                anchor={popoverAnchorRef}
                                originalReportID={originalReportID}
                                isArchivedRoom={isArchivedRoom}
                                displayAsGroup={displayAsGroup}
                                disabledActions={disabledActions}
                                isVisible={hovered && draftMessage === undefined && !hasErrors}
                                isThreadReportParentAction={isThreadReportParentAction}
                                draftMessage={draftMessage}
                                isChronosReport={isChronosReport}
                                checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                                setIsEmojiPickerActive={setIsEmojiPickerActive}
                            />
                        )}
                        <View
                            style={StyleUtils.getReportActionItemStyle(
                                hovered || isWhisper || isContextMenuActive || !!isEmojiPickerActive || draftMessage !== undefined || isPaymentMethodPopoverActive,
                                draftMessage === undefined && !!onPress,
                            )}
                        >
                            <OfflineWithFeedback
                                onClose={onClose}
                                dismissError={dismissError}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                pendingAction={
                                    draftMessage !== undefined ? undefined : (action.pendingAction ?? (action.isOptimisticAction ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : undefined))
                                }
                                shouldHideOnDelete={!isDeletedParentAction}
                                errors={(linkedTransactionRouteError ?? !isOnSearch) ? getLatestErrorMessageField(action as OnyxDataWithErrors) : {}}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={isMoneyRequestAction(action)}
                                shouldDisableStrikeThrough
                            >
                                {renderSearchHeader(
                                    <>
                                        {isWhisper && (
                                            <View style={[styles.flexRow, styles.pl5, styles.pt2, styles.pr3]}>
                                                <View style={[styles.pl6, styles.mr3]}>
                                                    <Icon
                                                        fill={theme.icon}
                                                        src={Eye}
                                                        small
                                                    />
                                                </View>
                                                <Text style={[styles.chatItemMessageHeaderTimestamp]}>
                                                    {translate('reportActionContextMenu.onlyVisible')}
                                                    &nbsp;
                                                </Text>
                                                <DisplayNames
                                                    fullTitle={getWhisperDisplayNames(whisperedTo) ?? ''}
                                                    displayNamesWithTooltips={displayNamesWithTooltips}
                                                    tooltipEnabled
                                                    numberOfLines={1}
                                                    textStyles={[styles.chatItemMessageHeaderTimestamp, styles.flex1]}
                                                    shouldUseFullTitle={isWhisperOnlyVisibleByUser}
                                                />
                                            </View>
                                        )}
                                        {renderReportActionItem(!!hovered || !!isReportActionLinked, isWhisper, hasErrors)}
                                    </>,
                                )}
                            </OfflineWithFeedback>
                        </View>
                    </View>
                )}
            </Hoverable>
            <View style={styles.reportActionSystemMessageContainer}>
                <InlineSystemMessage message={action.error} />
            </View>
            <ConfirmModal
                isVisible={showConfirmDismissReceiptError}
                onConfirm={() => {
                    dismissError();
                    setShowConfirmDismissReceiptError(false);
                }}
                onCancel={() => {
                    setShowConfirmDismissReceiptError(false);
                }}
                title={translate('iou.dismissReceiptError')}
                prompt={translate('iou.dismissReceiptErrorConfirmation')}
                confirmText={translate('common.dismiss')}
                cancelText={translate('common.cancel')}
                shouldShowCancelButton
                danger
            />
        </PressableWithSecondaryInteraction>
    );
}

export type {PureReportActionItemProps};
export default memo(PureReportActionItem, (prevProps, nextProps) => {
    const prevParentReportAction = prevProps.parentReportAction;
    const nextParentReportAction = nextProps.parentReportAction;
    return (
        prevProps.displayAsGroup === nextProps.displayAsGroup &&
        prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction &&
        prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
        deepEqual(prevProps.action, nextProps.action) &&
        deepEqual(prevProps.report?.pendingFields, nextProps.report?.pendingFields) &&
        deepEqual(prevProps.report?.isDeletedParentAction, nextProps.report?.isDeletedParentAction) &&
        deepEqual(prevProps.report?.errorFields, nextProps.report?.errorFields) &&
        prevProps.report?.statusNum === nextProps.report?.statusNum &&
        prevProps.report?.stateNum === nextProps.report?.stateNum &&
        prevProps.report?.parentReportID === nextProps.report?.parentReportID &&
        prevProps.report?.parentReportActionID === nextProps.report?.parentReportActionID &&
        // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
        isTaskReport(prevProps.report) === isTaskReport(nextProps.report) &&
        prevProps.action.actionName === nextProps.action.actionName &&
        prevProps.report?.reportName === nextProps.report?.reportName &&
        prevProps.report?.description === nextProps.report?.description &&
        isCompletedTaskReport(prevProps.report) === isCompletedTaskReport(nextProps.report) &&
        prevProps.report?.managerID === nextProps.report?.managerID &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
        prevProps.report?.total === nextProps.report?.total &&
        prevProps.report?.nonReimbursableTotal === nextProps.report?.nonReimbursableTotal &&
        prevProps.report?.policyAvatar === nextProps.report?.policyAvatar &&
        prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
        deepEqual(prevProps.report?.fieldList, nextProps.report?.fieldList) &&
        deepEqual(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
        deepEqual(prevProps.reportActions, nextProps.reportActions) &&
        deepEqual(prevParentReportAction, nextParentReportAction) &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.iouReport?.reportID === nextProps.iouReport?.reportID &&
        deepEqual(prevProps.emojiReactions, nextProps.emojiReactions) &&
        deepEqual(prevProps.linkedTransactionRouteError, nextProps.linkedTransactionRouteError) &&
        prevProps.isUserValidated === nextProps.isUserValidated &&
        prevProps.parentReport?.reportID === nextProps.parentReport?.reportID &&
        deepEqual(prevProps.personalDetails, nextProps.personalDetails) &&
        deepEqual(prevProps.introSelected, nextProps.introSelected) &&
        deepEqual(prevProps.blockedFromConcierge, nextProps.blockedFromConcierge) &&
        prevProps.originalReportID === nextProps.originalReportID &&
        prevProps.isArchivedRoom === nextProps.isArchivedRoom &&
        prevProps.isChronosReport === nextProps.isChronosReport &&
        prevProps.isClosedExpenseReportWithNoExpenses === nextProps.isClosedExpenseReportWithNoExpenses &&
        deepEqual(prevProps.missingPaymentMethod, nextProps.missingPaymentMethod) &&
        prevProps.reimbursementDeQueuedOrCanceledActionMessage === nextProps.reimbursementDeQueuedOrCanceledActionMessage &&
        prevProps.modifiedExpenseMessage === nextProps.modifiedExpenseMessage &&
        prevProps.userBillingFundID === nextProps.userBillingFundID &&
        deepEqual(prevProps.taskReport, nextProps.taskReport) &&
        prevProps.shouldHighlight === nextProps.shouldHighlight &&
        deepEqual(prevProps.bankAccountList, nextProps.bankAccountList)
    );
});
