/* eslint-disable rulesdir/no-deep-equal-in-memo */
import {useNavigation} from '@react-navigation/native';
import {deepEqual} from 'fast-equals';
import mapValues from 'lodash/mapValues';
import React, {memo, use, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Button from '@components/Button';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import InlineSystemMessage from '@components/InlineSystemMessage';
import KYCWall from '@components/KYCWall';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import ChronosOOOListActions from '@components/ReportActionItem/ChronosOOOListActions';
import CreatedReportForUnapprovedTransactionsAction from '@components/ReportActionItem/CreatedReportForUnapprovedTransactionsAction';
import CreateHarvestReportAction from '@components/ReportActionItem/CreateHarvestReportAction';
import ExportIntegration from '@components/ReportActionItem/ExportIntegration';
import IssueCardMessage from '@components/ReportActionItem/IssueCardMessage';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import MovedTransactionAction from '@components/ReportActionItem/MovedTransactionAction';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TransactionPreview from '@components/ReportActionItem/TransactionPreview';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';
import UnreportedTransactionAction from '@components/ReportActionItem/UnreportedTransactionAction';
import {SearchStateContext} from '@components/Search/SearchContext';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanUpMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import {isChronosOOOListAction} from '@libs/ChronosUtils';
import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import type {OnyxDataWithErrors} from '@libs/ErrorUtils';
import {getLatestErrorMessageField, isReceiptError} from '@libs/ErrorUtils';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isReportMessageAttachment} from '@libs/isReportMessageAttachment';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {isPolicyAdmin} from '@libs/PolicyUtils';
import {
    extractLinksFromMessageHtml,
    getChangedApproverActionMessage,
    getCompanyCardConnectionBrokenMessage,
    getIntegrationSyncFailedMessage,
    getIOUReportIDFromReportActionPreview,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getRenamedAction,
    getReportActionHtml,
    getReportActionMessage,
    getReportActionText,
    getSettlementAccountLockedMessage,
    getTravelUpdateMessage,
    getWhisperedTo,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isActionOfType,
    isCardBrokenConnectionAction,
    isCardIssuedAction,
    isCreatedTaskReportAction,
    isDeletedAction,
    isDeletedParentAction as isDeletedParentActionUtils,
    isIOURequestReportAction,
    isMessageDeleted,
    isMoneyRequestAction,
    isPendingRemove,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isSplitBillAction as isSplitBillActionReportActionsUtils,
    isTaskAction,
    isTrackExpenseAction as isTrackExpenseActionReportActionsUtils,
    isTripPreview,
    isWhisperActionTargetedToOthers,
    useTableReportViewActionRenderConditionals,
} from '@libs/ReportActionsUtils';
import type {MissingPaymentMethod} from '@libs/ReportUtils';
import {
    canWriteInReport,
    getChatListItemReportName,
    getDisplayNamesWithTooltips,
    getMovedActionMessage,
    getWhisperDisplayNames,
    isChatThread,
    isCompletedTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport as isHarvestCreatedExpenseReportUtils,
    isTaskReport,
    shouldDisplayThreadReplies as shouldDisplayThreadRepliesUtils,
} from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import {ReactionListContext} from '@pages/inbox/ReportScreenContext';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import variables from '@styles/variables';
import {openPersonalBankAccountSetupView} from '@userActions/BankAccounts';
import type {IgnoreDirection} from '@userActions/ClearReportActionErrors';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';
import {createTransactionThreadReport, expandURLPreview} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject, isEmptyValueObject} from '@src/types/utils/EmptyObject';
import ApprovalFlowContent, {isApprovalFlowAction} from './actionContents/ApprovalFlowContent';
import CardBrokenConnectionContent from './actionContents/CardBrokenConnectionContent';
import ChatMessageContent from './actionContents/ChatMessageContent';
import ConfirmWhisperContent from './actionContents/ConfirmWhisperContent';
import FraudAlertContent from './actionContents/FraudAlertContent';
import JoinRequestContent from './actionContents/JoinRequestContent';
import MentionWhisperContent from './actionContents/MentionWhisperContent';
import ModifiedExpenseContent from './actionContents/ModifiedExpenseContent';
import PaymentContent from './actionContents/PaymentContent';
import PolicyChangeLogContent, {isHandledPolicyChangeLogAction} from './actionContents/PolicyChangeLogContent';
import ReimbursedContent from './actionContents/ReimbursedContent';
import ReimbursementDeQueuedContent from './actionContents/ReimbursementDeQueuedContent';
import ReportMentionWhisperContent from './actionContents/ReportMentionWhisperContent';
import SimpleMessageContent, {isSimpleMessageAction} from './actionContents/SimpleMessageContent';
import {RestrictedReadOnlyContextMenuActions} from './ContextMenu/ContextMenuActions';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import type {ContextMenuAnchor} from './ContextMenu/ReportActionContextMenu';
import {hideContextMenu, hideDeleteModal, isActiveReportAction, showContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import ReportActionItemContentCreated from './ReportActionItemContentCreated';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemThread from './ReportActionItemThread';
import TripSummary from './TripSummary';

type PureReportActionItemProps = {
    /** The personal policy ID */
    personalPolicyID: string | undefined;

    /** Model of onboarding selected */
    introSelected?: OnyxEntry<OnyxTypes.IntroSelected>;

    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Policy for this action */
    policy?: OnyxEntry<OnyxTypes.Policy>;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread?: OnyxEntry<OnyxTypes.ReportAction>;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

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

    /** Linked transaction route error */
    linkedTransactionRouteError?: Errors;

    /** Optional property to indicate if the user is validated */
    isUserValidated?: boolean;

    /** Parent report */
    parentReport?: OnyxTypes.Report;

    /** Personal details list */
    personalDetails?: OnyxTypes.PersonalDetailsList;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID?: string;

    /** Original report from which the given reportAction is first created */
    originalReport?: OnyxTypes.Report;

    /** Function to deletes the draft for a comment report action. */
    deleteReportActionDraft?: (reportID: string | undefined, action: OnyxTypes.ReportAction) => void;

    /** Whether the room is archived */
    isArchivedRoom?: boolean;

    /** Whether the room is a chronos report */
    isChronosReport?: boolean;

    /** Function to resolve actionable report mention whisper */
    resolveActionableReportMentionWhisper?: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
        isReportArchived?: boolean,
    ) => void;

    /** Function to resolve actionable mention whisper */
    resolveActionableMentionWhisper?: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
        isReportArchived: boolean,
    ) => void;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;

    /** What missing payment method does this report action indicate, if any? */
    missingPaymentMethod?: MissingPaymentMethod | undefined;

    /** Gets all transactions on an IOU report with a receipt */
    getTransactionsWithReceipts?: (iouReportID: string | undefined) => OnyxTypes.Transaction[];

    /** Whether the current user is the only participant in the report */
    isCurrentUserTheOnlyParticipant?: (participantAccountIDs?: number[]) => boolean;

    /** Function to clear an error from a transaction */
    clearError?: (transactionID: string) => void;

    /** Function to clear all errors from a report action */
    clearAllRelatedReportActionErrors?: (
        reportID: string | undefined,
        reportAction: OnyxTypes.ReportAction | null | undefined,
        originalReportID: string | undefined,
        ignore?: IgnoreDirection,
        keys?: string[],
    ) => void;

    /** User payment card ID */
    userBillingFundID?: number;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Whether to highlight the action for a few seconds */
    shouldHighlight?: boolean;

    /** Did the user dismiss trying out NewDot? If true, it means they prefer using OldDot */
    isTryNewDotNVPDismissed?: boolean;

    /** The bank account list */
    bankAccountList?: OnyxTypes.BankAccountList | undefined;

    /** Report name value pairs origin */
    reportNameValuePairsOrigin?: string;

    /** Report name value pairs originalID */
    reportNameValuePairsOriginalID?: string;

    /** Report metadata for the report */
    reportMetadata?: OnyxEntry<OnyxTypes.ReportMetadata>;
};

// This is equivalent to returning a negative boolean in normal functions, but we can keep the element return type
// If the child was rendered using RenderHTML and an empty html string, it has an empty prop called html
// If we render an empty component/fragment, this does not apply
const emptyHTML = <RenderHTML html="" />;
const isEmptyHTML = <T extends React.JSX.Element>({props: {html}}: T): boolean => typeof html === 'string' && html.length === 0;

function PureReportActionItem({
    personalPolicyID,
    introSelected,
    betas,
    action,
    report,
    policy,
    transactionThreadReport,
    linkedReportActionID,
    displayAsGroup,
    index,
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
    linkedTransactionRouteError,
    isUserValidated,
    parentReport,
    personalDetails,
    originalReportID = '-1',
    originalReport,
    deleteReportActionDraft = () => {},
    isArchivedRoom,
    isChronosReport,
    resolveActionableReportMentionWhisper = () => {},
    resolveActionableMentionWhisper = () => {},
    isClosedExpenseReportWithNoExpenses,
    isCurrentUserTheOnlyParticipant = () => false,
    missingPaymentMethod,
    getTransactionsWithReceipts = () => [],
    clearError = () => {},
    clearAllRelatedReportActionErrors = () => {},
    userBillingFundID,
    shouldShowBorder,
    shouldHighlight = false,
    isTryNewDotNVPDismissed = false,
    bankAccountList,
    reportNameValuePairsOrigin,
    reportNameValuePairsOriginalID,
    reportMetadata,
}: PureReportActionItemProps) {
    const isConciergeGreeting = action.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID;
    const shouldDisplayContextMenuValue = shouldDisplayContextMenu && !isConciergeGreeting;

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {translate, formatPhoneNumber, localeCompare, formatTravelDate, datetimeToCalendarTime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const personalDetail = useCurrentUserPersonalDetails();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const reportID = report?.reportID ?? action?.reportID;
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => isActiveReportAction(action.reportActionID));
    const [isEmojiPickerActive, setIsEmojiPickerActive] = useState<boolean | undefined>();
    const [isPaymentMethodPopoverActive, setIsPaymentMethodPopoverActive] = useState<boolean | undefined>();
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
    const isReportArchived = useReportIsArchived(reportID);

    const isHarvestCreatedExpenseReport = isHarvestCreatedExpenseReportUtils(reportNameValuePairsOrigin, reportNameValuePairsOriginalID);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Eye']);

    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

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
            const isAttachment = (message?.html ?? '').search(CONST.REGEX.ATTACHMENT.ATTACHMENT_REGEX) !== -1 || isReportMessageAttachment(message);
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
        const {currentSearchHash: searchContextCurrentSearchHash} = use(SearchStateContext);
        currentSearchHash = searchContextCurrentSearchHash;
    }

    const navigation = useNavigation<PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const dismissError = useCallback(() => {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (isSendingMoney && transactionID && reportID) {
            cleanUpMoneyRequest(transactionID, action, reportID, report, chatReport, undefined, originalReportID, true);
            return;
        }
        if (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && isReportActionLinked) {
            navigation.setParams({reportActionID: ''});
        }
        if (transactionID) {
            clearError(transactionID);
        }
        clearAllRelatedReportActionErrors(reportID, action, originalReportID);
    }, [action, isSendingMoney, reportID, clearAllRelatedReportActionErrors, originalReportID, isReportActionLinked, report, chatReport, clearError, navigation]);

    const showDismissReceiptErrorModal = useCallback(async () => {
        const result = await showConfirmModal({
            title: translate('iou.dismissReceiptError'),
            prompt: translate('iou.dismissReceiptErrorConfirmation'),
            confirmText: translate('common.dismiss'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        });
        if (result.action === ModalActions.CONFIRM) {
            dismissError();
        }
    }, [showConfirmModal, translate, dismissError]);

    const onClose = useCallback(() => {
        const errors = linkedTransactionRouteError ?? getLatestErrorMessageField(action as OnyxDataWithErrors);
        const errorEntries = Object.entries(errors ?? {});
        const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
        const hasReceiptError = Object.values(errorMessages).some((error) => isReceiptError(error));

        if (hasReceiptError) {
            showDismissReceiptErrorModal();
        } else {
            dismissError();
        }
    }, [linkedTransactionRouteError, action, showDismissReceiptErrorModal, dismissError]);

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
                transitionActionSheetState({
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
        [transitionActionSheetState],
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
            if (draftMessage !== undefined || !isEmptyValueObject(action.errors) || !shouldDisplayContextMenuValue) {
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
            shouldDisplayContextMenuValue,
            disabledActions,
            isArchivedRoom,
            isChronosReport,
            handleShowContextMenu,
            isThreadReportParentAction,
        ],
    );

    const contextMenuStateValue = useMemo(
        () => ({
            anchor: popoverAnchorRef.current,
            report,
            isReportArchived,
            action,
            transactionThreadReport,
            isDisabled: false,
            shouldDisplayContextMenu: shouldDisplayContextMenuValue,
            originalReportID,
        }),
        [report, action, transactionThreadReport, shouldDisplayContextMenuValue, isReportArchived, originalReportID],
    );

    const contextMenuActionsValue = useMemo(
        () => ({
            checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
            onShowContextMenu: handleShowContextMenu,
        }),
        [toggleContextMenuFromActiveReportAction, handleShowContextMenu],
    );

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
                    // If originalMessage.iouReportID is set, this is a 1:1 IOU expense in a DM chat whose reportID is report.chatReportID
                    chatReportID={chatReportID}
                    requestReportID={iouReportID}
                    reportID={reportID}
                    action={action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef.current}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={displayAsGroup ? [] : [styles.mt2]}
                    isWhisper={isWhisper}
                    shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                    originalReportID={originalReportID}
                />
            );

            if (report?.type === CONST.REPORT.TYPE.CHAT) {
                const isSplitBill = moneyRequestActionType === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
                const shouldShowSplitPreview = isSplitBill || isSplitScanWithNoAmount;
                if (report.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM || shouldShowSplitPreview) {
                    children = (
                        <View style={[styles.mt1, styles.w100]}>
                            <TransactionPreview
                                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                                chatReportID={reportID}
                                reportID={reportID}
                                action={action}
                                shouldDisplayContextMenu={shouldDisplayContextMenuValue}
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
                                        const createdTransactionThreadReport = createTransactionThreadReport(
                                            introSelected,
                                            personalDetail.email ?? '',
                                            personalDetail.accountID,
                                            betas,
                                            iouReport,
                                            action,
                                        );
                                        if (createdTransactionThreadReport?.reportID) {
                                            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(createdTransactionThreadReport.reportID, undefined, undefined, Navigation.getActiveRoute()));
                                            return;
                                        }
                                        return;
                                    }

                                    Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(action.childReportID, undefined, undefined, Navigation.getActiveRoute()));
                                }}
                                isTrackExpense={isTrackExpenseActionReportActionsUtils(action)}
                                originalReportID={originalReportID}
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
                    shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                    originalReportID={originalReportID}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isClosedExpenseReportWithNoExpenses) {
            children = <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedReport')}</deleted-action>`} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
            children = (
                <MoneyRequestReportPreview
                    iouReportID={getIOUReportIDFromReportActionPreview(action)}
                    policyID={report?.policyID}
                    chatReportID={reportID}
                    action={action}
                    contextMenuAnchor={popoverAnchorRef.current}
                    isHovered={hovered}
                    isWhisper={isWhisper}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    onPaymentOptionsShow={() => setIsPaymentMethodPopoverActive(true)}
                    onPaymentOptionsHide={() => setIsPaymentMethodPopoverActive(false)}
                    shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                    shouldShowBorder={shouldShowBorder}
                    originalReportID={originalReportID}
                />
            );
        } else if (isTaskAction(action)) {
            children = <TaskAction action={action} />;
        } else if (isCreatedTaskReportAction(action)) {
            children = (
                <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                    <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
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
                            shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                        />
                    </ShowContextMenuActionsContext.Provider>
                </ShowContextMenuStateContext.Provider>
            );
        } else if (isReimbursementQueuedAction(action)) {
            const targetReport = isChatThread(report) ? parentReport : report;
            const submitterDisplayName = formatPhoneNumber(getDisplayNameOrDefault(personalDetails?.[targetReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID]));
            const paymentType = getOriginalMessage(action)?.paymentType ?? '';

            children = (
                <ReportActionItemBasicMessage
                    message={translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', submitterDisplayName)}
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
            children = (
                <ReimbursementDeQueuedContent
                    action={action}
                    report={report}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
            children = (
                <ModifiedExpenseContent
                    action={action}
                    report={report}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        } else if (isApprovalFlowAction(action)) {
            children = (
                <ApprovalFlowContent
                    action={action}
                    policy={policy}
                    reportMetadata={reportMetadata}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
            children = (
                <PaymentContent
                    action={action}
                    bankAccountList={bankAccountList}
                    policy={policy}
                />
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
            children = (
                <ReimbursedContent
                    action={action}
                    report={report}
                />
            );
        } else if (isSimpleMessageAction(action)) {
            children = <SimpleMessageContent action={action} />;
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
        } else if (isHandledPolicyChangeLogAction(action)) {
            children = (
                <PolicyChangeLogContent
                    action={action}
                    policy={policy}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION) {
            children = (
                <MovedTransactionAction
                    action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>}
                    emptyHTML={emptyHTML}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getMovedActionMessage(translate, action, report)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getTravelUpdateMessage(translate, action, formatTravelDate)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
            children = (
                <UnreportedTransactionAction
                    action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>}
                    childReport={childReport}
                    originalReport={originalReport}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN || action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getReportActionHtml(action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionableCardFraudAlert(action)) {
            children = (
                <FraudAlertContent
                    action={action}
                    reportID={reportID}
                />
            );
        } else if (isActionableJoinRequest(action)) {
            children = (
                <JoinRequestContent
                    action={action}
                    reportID={reportID}
                    originalReportID={originalReportID}
                    policy={policy}
                />
            );
        } else if (isActionableMentionWhisper(action)) {
            children = (
                <MentionWhisperContent
                    action={action}
                    report={report}
                    originalReport={originalReport}
                    policy={policy}
                    personalPolicyID={personalPolicyID}
                    originalReportID={originalReportID}
                    resolveActionableMentionWhisper={resolveActionableMentionWhisper}
                />
            );
        } else if (isActionableReportMentionWhisper(action)) {
            children = (
                <ReportMentionWhisperContent
                    action={action}
                    reportID={reportID}
                    report={report}
                    originalReport={originalReport}
                    isReportArchived={isReportArchived}
                    resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
                />
            );
        } else if (isActionableMentionInviteToSubmitExpenseConfirmWhisper(action)) {
            children = (
                <ConfirmWhisperContent
                    action={action}
                    reportID={reportID}
                    report={report}
                    originalReport={originalReport}
                    originalReportID={originalReportID}
                />
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM)) {
            children = <ReportActionItemBasicMessage message={translate('report.actions.type.leftTheChat')} />;
        } else if (isCardIssuedAction(action)) {
            const shouldNavigateToCardDetails = isPolicyAdmin(policy);
            children = (
                <IssueCardMessage
                    action={action}
                    policyID={report?.policyID}
                    shouldNavigateToCardDetails={shouldNavigateToCardDetails}
                />
            );
        } else if (isCardBrokenConnectionAction(action)) {
            children = <CardBrokenConnectionContent action={action} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
            children = <ExportIntegration action={action} />;
        } else if (isRenamedAction(action)) {
            const message = getRenamedAction(translate, action, isExpenseReport(report));
            children = <ReportActionItemBasicMessage message={message} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getIntegrationSyncFailedMessage(translate, action, report?.policyID, isTryNewDotNVPDismissed)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getCompanyCardConnectionBrokenMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
            children = (
                <ReportActionItemBasicMessage message="">
                    <RenderHTML html={`<comment><muted-text>${getPlaidBalanceFailureMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED) && isHarvestCreatedExpenseReport) {
            children = <CreateHarvestReportAction reportNameValuePairsOriginalID={reportNameValuePairsOriginalID} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
            children = <CreatedReportForUnapprovedTransactionsAction action={action} />;
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) || isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REROUTE)) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${getChangedApproverActionMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${getSettlementAccountLockedMessage(translate, action)}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else {
            children = (
                <ChatMessageContent
                    action={action}
                    report={report}
                    originalReport={originalReport}
                    reportID={reportID}
                    originalReportID={originalReportID}
                    displayAsGroup={displayAsGroup}
                    draftMessage={draftMessage}
                    index={index}
                    isHidden={isHidden}
                    moderationDecision={moderationDecision}
                    updateHiddenState={updateHiddenState}
                    isArchivedRoom={isArchivedRoom}
                    composerTextInputRef={composerTextInputRef}
                    isOnSearch={isOnSearch}
                    currentSearchHash={currentSearchHash}
                    contextMenuStateValue={contextMenuStateValue}
                    contextMenuActionsValue={contextMenuActionsValue}
                    userBillingFundID={userBillingFundID}
                    introSelected={introSelected}
                />
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
                {!isOnSearch && !isMessageDeleted(action) && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions
                            reportAction={action}
                            reportID={reportID}
                            shouldBlockReactions={hasErrors}
                            setIsEmojiPickerActive={setIsEmojiPickerActive}
                        />
                    </View>
                )}

                {shouldDisplayThreadReplies && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemThread
                            reportAction={action}
                            report={report}
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

    const createdActionContent = useMemo(() => {
        const transactionID = isMoneyRequestAction(parentReportActionForTransactionThread) ? getOriginalMessage(parentReportActionForTransactionThread)?.IOUTransactionID : undefined;

        return (
            <ReportActionItemContentCreated
                contextMenuStateValue={contextMenuStateValue}
                contextMenuActionsValue={contextMenuActionsValue}
                parentReportAction={parentReportAction}
                parentReport={parentReport}
                transactionID={transactionID}
                draftMessage={draftMessage}
                shouldHideThreadDividerLine={shouldHideThreadDividerLine}
            />
        );
    }, [contextMenuStateValue, contextMenuActionsValue, parentReportAction, parentReport, draftMessage, shouldHideThreadDividerLine, parentReportActionForTransactionThread]);

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && !isHarvestCreatedExpenseReport) {
        return createdActionContent;
    }

    // Should show createdActionContent if:
    // - Harvest report is shown in ReportActionsList (one-transaction view)
    const shouldShowCreatedAction = action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && !!isHarvestCreatedExpenseReport && !!parentReportActionForTransactionThread;

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

    const hasErrors = !isEmptyValueObject(action.errors);
    const whisperedTo = getWhisperedTo(action);
    const isMultipleParticipant = whisperedTo.length > 1;

    const iouReportID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUReportID ? getOriginalMessage(action)?.IOUReportID?.toString() : undefined;
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    const isWhisper = whisperedTo.length > 0 && transactionsWithReceipts.length === 0;
    const whisperedToPersonalDetails = isWhisper
        ? (Object.values(personalDetails ?? {}).filter((details) => whisperedTo.includes(details?.accountID ?? CONST.DEFAULT_NUMBER_ID)) as OnyxTypes.PersonalDetails[])
        : [];
    const isWhisperOnlyVisibleByUser = isWhisper && isCurrentUserTheOnlyParticipant(whisperedTo);
    const displayNamesWithTooltips = isWhisper ? getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant, localeCompare, formatPhoneNumber) : [];

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
                            {getChatListItemReportName(action, report, conciergeReportID)}
                        </TextLink>
                    </View>
                    {children}
                </View>
            </View>
        );
    };

    // Calculating accessibilityLabel for chat message with sender, date and time and the message content.
    const displayName = getDisplayNameOrDefault(personalDetails?.[action.actorAccountID ?? CONST.DEFAULT_NUMBER_ID]);
    const formattedTimestamp = datetimeToCalendarTime(action.created, false);
    const plainMessage = getReportActionText(action);
    const accessibilityLabel = `${displayName}, ${formattedTimestamp}, ${plainMessage}`;

    return (
        <View>
            {shouldShowCreatedAction && createdActionContent}
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
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={translate('accessibilityHints.chatMessage')}
                accessibilityRole={CONST.ROLE.BUTTON}
                sentryLabel={CONST.SENTRY_LABEL.REPORT.PURE_REPORT_ACTION_ITEM}
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
                            {shouldDisplayContextMenuValue && (
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
                                                            src={expensifyIcons.Eye}
                                                            small
                                                        />
                                                    </View>
                                                    <Text style={[styles.chatItemMessageHeaderTimestamp]}>
                                                        {translate('reportActionContextMenu.onlyVisible')}
                                                        &nbsp;
                                                    </Text>
                                                    <DisplayNames
                                                        fullTitle={getWhisperDisplayNames(translate, formatPhoneNumber, whisperedTo) ?? ''}
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
            </PressableWithSecondaryInteraction>
        </View>
    );
}

export type {PureReportActionItemProps};
export default memo(PureReportActionItem, (prevProps, nextProps) => {
    const prevParentReportAction = prevProps.parentReportAction;
    const nextParentReportAction = nextProps.parentReportAction;
    return (
        prevProps.personalPolicyID === nextProps.personalPolicyID &&
        prevProps.displayAsGroup === nextProps.displayAsGroup &&
        prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
        deepEqual(prevProps.action, nextProps.action) &&
        deepEqual(prevProps.report?.pendingFields, nextProps.report?.pendingFields) &&
        deepEqual(prevProps.report?.participants, nextProps.report?.participants) &&
        deepEqual(prevProps.report?.errorFields, nextProps.report?.errorFields) &&
        prevProps.report?.isDeletedParentAction === nextProps.report?.isDeletedParentAction &&
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
        prevProps.index === nextProps.index &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
        prevProps.report?.total === nextProps.report?.total &&
        prevProps.report?.nonReimbursableTotal === nextProps.report?.nonReimbursableTotal &&
        prevProps.report?.policyAvatar === nextProps.report?.policyAvatar &&
        prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
        deepEqual(prevProps.report?.fieldList, nextProps.report?.fieldList) &&
        deepEqual(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
        deepEqual(prevParentReportAction, nextParentReportAction) &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.iouReport?.reportID === nextProps.iouReport?.reportID &&
        deepEqual(prevProps.linkedTransactionRouteError, nextProps.linkedTransactionRouteError) &&
        prevProps.isUserValidated === nextProps.isUserValidated &&
        prevProps.parentReport?.reportID === nextProps.parentReport?.reportID &&
        deepEqual(prevProps.personalDetails, nextProps.personalDetails) &&
        deepEqual(prevProps.introSelected, nextProps.introSelected) &&
        deepEqual(prevProps.betas, nextProps.betas) &&
        prevProps.originalReportID === nextProps.originalReportID &&
        deepEqual(prevProps.originalReport?.participants, nextProps.originalReport?.participants) &&
        prevProps.isArchivedRoom === nextProps.isArchivedRoom &&
        prevProps.isChronosReport === nextProps.isChronosReport &&
        prevProps.isClosedExpenseReportWithNoExpenses === nextProps.isClosedExpenseReportWithNoExpenses &&
        deepEqual(prevProps.missingPaymentMethod, nextProps.missingPaymentMethod) &&
        prevProps.userBillingFundID === nextProps.userBillingFundID &&
        deepEqual(prevProps.taskReport, nextProps.taskReport) &&
        prevProps.shouldHighlight === nextProps.shouldHighlight &&
        deepEqual(prevProps.bankAccountList, nextProps.bankAccountList) &&
        prevProps.reportNameValuePairsOrigin === nextProps.reportNameValuePairsOrigin &&
        prevProps.reportNameValuePairsOriginalID === nextProps.reportNameValuePairsOriginalID &&
        prevProps.reportMetadata?.pendingExpenseAction === nextProps.reportMetadata?.pendingExpenseAction
    );
});
