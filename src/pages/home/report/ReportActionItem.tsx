import lodashIsEqual from 'lodash/isEqual';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {Emoji} from '@assets/emojis/types';
import Button from '@components/Button';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import InlineSystemMessage from '@components/InlineSystemMessage';
import KYCWall from '@components/KYCWall';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useBlockedFromConcierge, usePersonalDetails, useReportActionsDrafts} from '@components/OnyxProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';
import ChronosOOOListActions from '@components/ReportActionItem/ChronosOOOListActions';
import MoneyReportView from '@components/ReportActionItem/MoneyReportView';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import MoneyRequestView from '@components/ReportActionItem/MoneyRequestView';
import RenameAction from '@components/ReportActionItem/RenameAction';
import ReportPreview from '@components/ReportActionItem/ReportPreview';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TaskView from '@components/ReportActionItem/TaskView';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import UnreadActionIndicator from '@components/UnreadActionIndicator';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import ControlSelection from '@libs/ControlSelection';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as ErrorUtils from '@libs/ErrorUtils';
import focusTextInputAfterAnimation from '@libs/focusTextInputAfterAnimation';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import * as TransactionUtils from '@libs/TransactionUtils';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import * as BankAccounts from '@userActions/BankAccounts';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as Policy from '@userActions/Policy';
import * as Report from '@userActions/Report';
import * as ReportActions from '@userActions/ReportActions';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {OriginalMessageActionableMentionWhisper, OriginalMessageActionableTrackedExpenseWhisper, OriginalMessageJoinPolicyChangeLog} from '@src/types/onyx/OriginalMessage';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AnimatedEmptyStateBackground from './AnimatedEmptyStateBackground';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import {hideContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemDraft from './ReportActionItemDraft';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionItemMessage from './ReportActionItemMessage';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemThread from './ReportActionItemThread';
import ReportAttachmentsContext from './ReportAttachmentsContext';

const getDraftMessage = (drafts: OnyxCollection<OnyxTypes.ReportActionsDrafts>, reportID: string, action: OnyxTypes.ReportAction): string | undefined => {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, action);
    const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`;
    const draftMessage = drafts?.[draftKey]?.[action.reportActionID];
    return typeof draftMessage === 'string' ? draftMessage : draftMessage?.message;
};

type ReportActionItemOnyxProps = {
    /** Stores user's preferred skin tone */
    preferredSkinTone: OnyxEntry<string | number>;

    /** IOU report for this action, if any */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    emojiReactions: OnyxEntry<OnyxTypes.ReportActionReactions>;

    /** The user's wallet account */
    userWallet: OnyxEntry<OnyxTypes.UserWallet>;

    /** The policy which the user has access to and which the report is tied to */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** Transaction associated with this report, if any */
    transaction: OnyxEntry<OnyxTypes.Transaction>;
};

type ReportActionItemProps = {
    /** Report for this action */
    report: OnyxTypes.Report;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** Array of report actions for the report for this action */
    // eslint-disable-next-line react/no-unused-prop-types
    reportActions: OnyxTypes.ReportAction[];

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: boolean;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar?: boolean;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    linkedReportActionID?: string;

    /** Callback to be called on onPress */
    onPress?: () => void;
} & ReportActionItemOnyxProps;

const isIOUReport = (actionObj: OnyxEntry<OnyxTypes.ReportAction>): actionObj is OnyxTypes.ReportActionBase & OnyxTypes.OriginalMessageIOU =>
    actionObj?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;

function ReportActionItem({
    action,
    report,
    transactionThreadReport,
    linkedReportActionID,
    displayAsGroup,
    emojiReactions,
    index,
    iouReport,
    isMostRecentIOUReportAction,
    parentReportAction,
    preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE,
    shouldDisplayNewMarker,
    userWallet,
    shouldHideThreadDividerLine = false,
    shouldShowSubscriptAvatar = false,
    policy,
    transaction,
    onPress = undefined,
}: ReportActionItemProps) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const blockedFromConcierge = useBlockedFromConcierge();
    const reportActionDrafts = useReportActionsDrafts();
    const draftMessage = useMemo(() => getDraftMessage(reportActionDrafts, report.reportID, action), [action, report.reportID, reportActionDrafts]);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => ReportActionContextMenu.isActiveReportAction(action.reportActionID));
    const [isEmojiPickerActive, setIsEmojiPickerActive] = useState<boolean | undefined>();

    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState<OnyxTypes.DecisionName>(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
    const reactionListRef = useContext(ReactionListContext);
    const {updateHiddenAttachments} = useContext(ReportAttachmentsContext);
    const textInputRef = useRef<TextInput & HTMLTextAreaElement>();
    const popoverAnchorRef = useRef<Exclude<ReportActionContextMenu.ContextMenuAnchor, TextInput>>(null);
    const downloadedPreviews = useRef<string[]>([]);
    const prevDraftMessage = usePrevious(draftMessage);
    const originalReportID = ReportUtils.getOriginalReportID(report.reportID, action);
    const originalReport = report.reportID === originalReportID ? report : ReportUtils.getReport(originalReportID);
    const isReportActionLinked = linkedReportActionID && action.reportActionID && linkedReportActionID === action.reportActionID;
    const transactionCurrency = TransactionUtils.getCurrency(transaction);
    const reportScrollManager = useReportScrollManager();

    const highlightedBackgroundColorIfNeeded = useMemo(
        () => (isReportActionLinked ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {}),
        [StyleUtils, isReportActionLinked, theme.messageHighlightBG],
    );

    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(action);
    const prevActionResolution = usePrevious(ReportActionsUtils.isActionableMentionWhisper(action) ? action.originalMessage.resolution : null);

    // IOUDetails only exists when we are sending money
    const isSendingMoney = isIOUReport(action) && action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && action.originalMessage.IOUDetails;

    const updateHiddenState = useCallback(
        (isHiddenValue: boolean) => {
            setIsHidden(isHiddenValue);
            const isAttachment = ReportUtils.isReportMessageAttachment(action.message?.at(-1));
            if (!isAttachment) {
                return;
            }
            updateHiddenAttachments(action.reportActionID, isHiddenValue);
        },
        [action.reportActionID, action.message, updateHiddenAttachments],
    );

    useEffect(
        () => () => {
            // ReportActionContextMenu, EmojiPicker and PopoverReactionList are global components,
            // we should also hide them when the current component is destroyed
            if (ReportActionContextMenu.isActiveReportAction(action.reportActionID)) {
                ReportActionContextMenu.hideContextMenu();
                ReportActionContextMenu.hideDeleteModal();
            }
            if (EmojiPickerAction.isActive(action.reportActionID)) {
                EmojiPickerAction.hideEmojiPicker(true);
            }
            if (reactionListRef?.current?.isActiveReportAction(action.reportActionID)) {
                reactionListRef?.current?.hideReactionList();
            }
        },
        [action.reportActionID, reactionListRef],
    );

    useEffect(() => {
        // We need to hide EmojiPicker when this is a deleted parent action
        if (!isDeletedParentAction || !EmojiPickerAction.isActive(action.reportActionID)) {
            return;
        }

        EmojiPickerAction.hideEmojiPicker(true);
    }, [isDeletedParentAction, action.reportActionID]);

    useEffect(() => {
        if (prevDraftMessage !== undefined || draftMessage === undefined) {
            return;
        }

        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [prevDraftMessage, draftMessage]);

    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = ReportActionsUtils.extractLinksFromMessageHtml(action);
        if (lodashIsEqual(downloadedPreviews.current, urls) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        downloadedPreviews.current = urls;
        Report.expandURLPreview(report.reportID, action.reportActionID);
    }, [action, report.reportID]);

    useEffect(() => {
        if (draftMessage === undefined || !ReportActionsUtils.isDeletedAction(action)) {
            return;
        }
        Report.deleteReportActionDraft(report.reportID, action);
    }, [draftMessage, action, report.reportID]);

    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    const latestDecision = action.message?.[0]?.moderationDecision?.decision ?? '';
    useEffect(() => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT) {
            return;
        }

        // Hide reveal message button and show the message if latestDecision is changed to empty
        if (!latestDecision) {
            setModerationDecision(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
            setIsHidden(false);
            return;
        }

        setModerationDecision(latestDecision);
        if (
            ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === latestDecision) &&
            !ReportActionsUtils.isPendingRemove(action)
        ) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(ReportActionContextMenu.isActiveReportAction(action.reportActionID));
    }, [action.reportActionID]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    const showPopover = useCallback(
        (event: GestureResponderEvent | MouseEvent) => {
            // Block menu on the message being Edited or if the report action item has errors
            if (draftMessage !== undefined || !isEmptyObject(action.errors)) {
                return;
            }

            setIsContextMenuActive(true);
            const selection = SelectionScraper.getCurrentSelection();
            ReportActionContextMenu.showContextMenu(
                CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                event,
                selection,
                popoverAnchorRef.current,
                report.reportID,
                action.reportActionID,
                originalReportID,
                draftMessage ?? '',
                () => setIsContextMenuActive(true),
                toggleContextMenuFromActiveReportAction,
                ReportUtils.isArchivedRoom(originalReport),
                ReportUtils.chatIncludesChronos(originalReport),
                false,
                false,
                [],
                false,
                setIsEmojiPickerActive as () => void,
            );
        },
        [draftMessage, action, report.reportID, toggleContextMenuFromActiveReportAction, originalReport, originalReportID],
    );

    // Handles manual scrolling to the bottom of the chat when the last message is an actionable whisper and it's resolved.
    // This fixes an issue where InvertedFlatList fails to auto scroll down and results in an empty space at the bottom of the chat in IOS.
    useEffect(() => {
        const isActionableWhisper = ReportActionsUtils.isActionableMentionWhisper(action) || ReportActionsUtils.isActionableTrackExpense(action);
        if (index !== 0 || !isActionableWhisper) {
            return;
        }

        if (ReportActionsUtils.isActionableMentionWhisper(action) && prevActionResolution !== (action.originalMessage.resolution ?? null)) {
            reportScrollManager.scrollToIndex(index);
        }
    }, [index, action, prevActionResolution, reportScrollManager]);

    const toggleReaction = useCallback(
        (emoji: Emoji) => {
            Report.toggleEmojiReaction(report.reportID, action, emoji, emojiReactions);
        },
        [report, action, emojiReactions],
    );

    const contextValue = useMemo(
        () => ({
            anchor: popoverAnchorRef.current,
            report,
            action,
            transactionThreadReport,
            checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
        }),
        [report, action, toggleContextMenuFromActiveReportAction, transactionThreadReport],
    );

    const actionableItemButtons: ActionableItem[] = useMemo(() => {
        const isWhisperResolution = (action?.originalMessage as OriginalMessageActionableMentionWhisper['originalMessage'])?.resolution !== null;
        const isJoinChoice = (action?.originalMessage as OriginalMessageJoinPolicyChangeLog['originalMessage'])?.choice === '';

        if (
            !(
                ((ReportActionsUtils.isActionableMentionWhisper(action) || ReportActionsUtils.isActionableTrackExpense(action)) && isWhisperResolution) ||
                (ReportActionsUtils.isActionableJoinRequest(action) && isJoinChoice)
            )
        ) {
            return [];
        }

        if (ReportActionsUtils.isActionableTrackExpense(action)) {
            const transactionID = (action?.originalMessage as OriginalMessageActionableTrackedExpenseWhisper['originalMessage'])?.transactionID;
            return [
                {
                    text: 'actionableMentionTrackExpense.request',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-request`,
                    onPress: () => {
                        ReportUtils.createDraftTransactionAndNavigateToParticipantSelector(transactionID, report.reportID, CONST.IOU.ACTION.MOVE, action.reportActionID);
                    },
                    isMediumSized: true,
                },
                {
                    text: 'actionableMentionTrackExpense.categorize',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-categorize`,
                    onPress: () => {
                        ReportUtils.createDraftTransactionAndNavigateToParticipantSelector(transactionID, report.reportID, CONST.IOU.ACTION.CATEGORIZE, action.reportActionID);
                    },
                    isMediumSized: true,
                },
                {
                    text: 'actionableMentionTrackExpense.share',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-share`,
                    onPress: () => {
                        ReportUtils.createDraftTransactionAndNavigateToParticipantSelector(transactionID, report.reportID, CONST.IOU.ACTION.SHARE, action.reportActionID);
                    },
                    isMediumSized: true,
                },
                {
                    text: 'actionableMentionTrackExpense.nothing',
                    key: `${action.reportActionID}-actionableMentionTrackExpense-nothing`,
                    onPress: () => {
                        Report.dismissTrackExpenseActionableWhisper(report.reportID, action);
                    },
                    isMediumSized: true,
                },
            ];
        }

        if (ReportActionsUtils.isActionableJoinRequest(action)) {
            return [
                {
                    text: 'actionableMentionJoinWorkspaceOptions.accept',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.ACCEPT}`,
                    onPress: () => Policy.acceptJoinRequest(report.reportID, action),
                    isPrimary: true,
                },
                {
                    text: 'actionableMentionJoinWorkspaceOptions.decline',
                    key: `${action.reportActionID}-actionableMentionJoinWorkspace-${CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION.DECLINE}`,
                    onPress: () => Policy.declineJoinRequest(report.reportID, action),
                },
            ];
        }
        return [
            {
                text: 'actionableMentionWhisperOptions.invite',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
                onPress: () => Report.resolveActionableMentionWhisper(report.reportID, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE),
                isPrimary: true,
            },
            {
                text: 'actionableMentionWhisperOptions.nothing',
                key: `${action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                onPress: () => Report.resolveActionableMentionWhisper(report.reportID, action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING),
            },
        ];
    }, [action, report.reportID]);

    /**
     * Get the content of ReportActionItem
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the report action is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns child component(s)
     */
    const renderItemContent = (hovered = false, isWhisper = false, hasErrors = false): React.JSX.Element => {
        let children;

        // Show the MoneyRequestPreview for when request was created, bill was split or money was sent
        if (
            isIOUReport(action) &&
            action.originalMessage &&
            // For the pay flow, we only want to show MoneyRequestAction when sending money. When paying, we display a regular system message
            (action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT ||
                action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK ||
                isSendingMoney)
        ) {
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = action.originalMessage.IOUReportID ? action.originalMessage.IOUReportID.toString() : '0';
            children = (
                <MoneyRequestAction
                    // If originalMessage.iouReportID is set, this is a 1:1 money request in a DM chat whose reportID is report.chatReportID
                    chatReportID={action.originalMessage.IOUReportID ? report.chatReportID ?? '' : report.reportID}
                    requestReportID={iouReportID}
                    reportID={report.reportID}
                    action={action}
                    isMostRecentIOUReportAction={isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef.current}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={displayAsGroup ? [] : [styles.mt2]}
                    isWhisper={isWhisper}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = ReportUtils.isClosedExpenseReportWithNoExpenses(iouReport) ? (
                <RenderHTML html={`<comment>${translate('parentReportAction.deletedReport')}</comment>`} />
            ) : (
                <ReportPreview
                    iouReportID={ReportActionsUtils.getIOUReportIDFromReportActionPreview(action)}
                    chatReportID={report.reportID}
                    policyID={report.policyID ?? ''}
                    containerStyles={displayAsGroup ? [] : [styles.mt2]}
                    action={action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef.current}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    isWhisper={isWhisper}
                />
            );
        } else if (ReportActionsUtils.isTaskAction(action)) {
            children = <TaskAction action={action} />;
        } else if (ReportActionsUtils.isCreatedTaskReportAction(action)) {
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <TaskPreview
                        taskReportID={action.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT ? action.originalMessage.taskReportID?.toString() ?? '' : ''}
                        chatReportID={report.reportID}
                        action={action}
                        isHovered={hovered}
                        contextMenuAnchor={popoverAnchorRef.current}
                        checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                        policyID={report.policyID ?? ''}
                    />
                </ShowContextMenuContext.Provider>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED) {
            const linkedReport = ReportUtils.isChatThread(report) ? ReportUtils.getReport(report.parentReportID) : report;
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails[linkedReport?.ownerAccountID ?? -1]);
            const paymentType = action.originalMessage.paymentType ?? '';

            const missingPaymentMethod = ReportUtils.getIndicatedMissingPaymentMethod(userWallet, linkedReport?.reportID ?? '', action);
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
                                onPress={() => BankAccounts.openPersonalBankAccountSetupView(Navigation.getTopmostReportId() ?? linkedReport?.reportID)}
                                pressOnEnter
                                large
                            />
                        )}
                        {missingPaymentMethod === 'wallet' && (
                            <KYCWall
                                onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                chatReportID={linkedReport?.reportID}
                                iouReport={iouReport}
                            >
                                {(triggerKYCFlow, buttonRef) => (
                                    <Button
                                        ref={buttonRef}
                                        success
                                        large
                                        style={[styles.w100, styles.requestPreviewBox]}
                                        text={translate('iou.enableWallet')}
                                        onPress={triggerKYCFlow}
                                    />
                                )}
                            </KYCWall>
                        )}
                    </>
                </ReportActionItemBasicMessage>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTDEQUEUED) {
            children = <ReportActionItemBasicMessage message={ReportUtils.getReimbursementDeQueuedActionMessage(action, report)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
            children = <ReportActionItemBasicMessage message={ModifiedExpenseMessage.getForReportAction(report.reportID, action)} />;
        } else if (ReportActionsUtils.isOldDotReportAction(action)) {
            // This handles all historical actions from OldDot that we just want to display the message text
            children = <ReportActionItemBasicMessage message={ReportActionsUtils.getMessageOfOldDotReportAction(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
            children = <ReportActionItemBasicMessage message={translate('iou.heldRequest')} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLDCOMMENT) {
            children = <ReportActionItemBasicMessage message={action.message?.[0]?.text ?? ''} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
            children = <ReportActionItemBasicMessage message={translate('iou.unheldRequest')} />;
        } else {
            const hasBeenFlagged =
                ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) &&
                !ReportActionsUtils.isPendingRemove(action);
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    {draftMessage === undefined ? (
                        <View style={displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                            <ReportActionItemMessage
                                reportID={report.reportID}
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
                                    layout={ReportActionsUtils.isActionableTrackExpense(action) ? 'vertical' : 'horizontal'}
                                />
                            )}
                        </View>
                    ) : (
                        <ReportActionItemMessageEdit
                            action={action}
                            draftMessage={draftMessage}
                            reportID={report.reportID}
                            index={index}
                            ref={textInputRef}
                            // Avoid defining within component due to an existing Onyx bug
                            preferredSkinTone={preferredSkinTone}
                            shouldDisableEmojiPicker={(ReportUtils.chatIncludesConcierge(report) && User.isBlockedFromConcierge(blockedFromConcierge)) || ReportUtils.isArchivedRoom(report)}
                        />
                    )}
                </ShowContextMenuContext.Provider>
            );
        }
        const numberOfThreadReplies = action.childVisibleActionCount ?? 0;

        const shouldDisplayThreadReplies = ReportUtils.shouldDisplayThreadReplies(action, report.reportID);
        const oldestFourAccountIDs =
            action.childOldestFourAccountIDs
                ?.split(',')
                .map((accountID) => Number(accountID))
                .filter((accountID): accountID is number => typeof accountID === 'number') ?? [];
        const draftMessageRightAlign = draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {};

        return (
            <>
                {children}
                {Permissions.canUseLinkPreviews() && !isHidden && (action.linkMetadata?.length ?? 0) > 0 && (
                    <View style={draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {}}>
                        <LinkPreviewer linkMetadata={action.linkMetadata?.filter((item) => !isEmptyObject(item))} />
                    </View>
                )}
                {!ReportActionsUtils.isMessageDeleted(action) && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions
                            reportAction={action}
                            emojiReactions={emojiReactions}
                            shouldBlockReactions={hasErrors}
                            toggleReaction={(emoji) => {
                                if (Session.isAnonymousUser()) {
                                    hideContextMenu(false);

                                    InteractionManager.runAfterInteractions(() => {
                                        Session.signOutAndRedirectToSignIn();
                                    });
                                } else {
                                    toggleReaction(emoji);
                                }
                            }}
                            setIsEmojiPickerActive={setIsEmojiPickerActive}
                        />
                    </View>
                )}

                {shouldDisplayThreadReplies && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemThread
                            childReportID={`${action.childReportID}`}
                            numberOfReplies={numberOfThreadReplies}
                            mostRecentReply={`${action.childLastVisibleActionCreated}`}
                            isHovered={hovered}
                            icons={ReportUtils.getIconsForParticipants(oldestFourAccountIDs, personalDetails)}
                            onSecondaryInteraction={showPopover}
                        />
                    </View>
                )}
            </>
        );
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

        if (draftMessage !== undefined) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={action}
                    showHeader={draftMessage === undefined}
                    wrapperStyle={isWhisper ? styles.pt1 : {}}
                    shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
                    report={report}
                    iouReport={iouReport}
                    isHovered={hovered}
                    hasBeenFlagged={
                        ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision) &&
                        !ReportActionsUtils.isPendingRemove(action)
                    }
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{content}</ReportActionItemGrouped>;
    };

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            const isReversedTransaction = ReportActionsUtils.isReversedTransaction(parentReportAction);
            if (ReportActionsUtils.isDeletedParentAction(parentReportAction) || isReversedTransaction) {
                let message: TranslationPaths;
                if (isReversedTransaction) {
                    message = 'parentReportAction.reversedTransaction';
                } else if (ReportActionsUtils.isTrackExpenseAction(parentReportAction)) {
                    message = 'parentReportAction.deletedExpense';
                } else {
                    message = 'parentReportAction.deletedRequest';
                }
                return (
                    <View>
                        <AnimatedEmptyStateBackground />
                        <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                            <OfflineWithFeedback pendingAction={parentReportAction?.pendingAction ?? null}>
                                <ReportActionItemSingle
                                    action={parentReportAction}
                                    showHeader
                                    report={report}
                                >
                                    <RenderHTML html={`<comment>${translate(message)}</comment>`} />
                                </ReportActionItemSingle>
                                <View style={styles.threadDividerLine} />
                            </OfflineWithFeedback>
                        </View>
                    </View>
                );
            }
            return (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <MoneyRequestView
                        report={report}
                        shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                        shouldShowAnimatedBackground
                    />
                </ShowContextMenuContext.Provider>
            );
        }
        if (ReportUtils.isTaskReport(report)) {
            if (ReportUtils.isCanceledTaskReport(report, parentReportAction)) {
                return (
                    <View>
                        <AnimatedEmptyStateBackground />
                        <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                            <OfflineWithFeedback pendingAction={parentReportAction?.pendingAction}>
                                <ReportActionItemSingle
                                    action={parentReportAction}
                                    showHeader={draftMessage === undefined}
                                    report={report}
                                >
                                    <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />
                                </ReportActionItemSingle>
                            </OfflineWithFeedback>
                            <View style={styles.reportHorizontalRule} />
                        </View>
                    </View>
                );
            }
            return (
                <View>
                    <AnimatedEmptyStateBackground />
                    <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                        <TaskView
                            report={report}
                            shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                        />
                    </View>
                </View>
            );
        }
        if (ReportUtils.isExpenseReport(report) || ReportUtils.isIOUReport(report)) {
            return (
                <OfflineWithFeedback pendingAction={action.pendingAction}>
                    {transactionThreadReport && !isEmptyObject(transactionThreadReport) ? (
                        <>
                            {transactionCurrency !== report.currency && (
                                <MoneyReportView
                                    report={report}
                                    policy={policy}
                                    shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                                />
                            )}
                            <ShowContextMenuContext.Provider value={contextValue}>
                                <MoneyRequestView
                                    report={transactionThreadReport}
                                    shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                                    shouldShowAnimatedBackground={transactionCurrency === report.currency}
                                />
                            </ShowContextMenuContext.Provider>
                        </>
                    ) : (
                        <MoneyReportView
                            report={report}
                            policy={policy}
                            shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                        />
                    )}
                </OfflineWithFeedback>
            );
        }

        return (
            <ReportActionItemCreated
                reportID={report.reportID}
                policyID={report.policyID}
            />
        );
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return <RenameAction action={action} />;
    }
    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST) {
        return (
            <ChronosOOOListActions
                action={action}
                reportID={report.reportID}
            />
        );
    }

    // For the `pay` IOU action on non-send money flow, we don't want to render anything if `isWaitingOnBankAccount` is true
    // Otherwise, we will see two system messages informing the payee needs to add a bank account or wallet
    if (isIOUReport(action) && !!report?.isWaitingOnBankAccount && action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney) {
        return null;
    }

    // if action is actionable mention whisper and resolved by user, then we don't want to render anything
    if (ReportActionsUtils.isActionableMentionWhisper(action) && (action.originalMessage.resolution ?? null)) {
        return null;
    }

    // if action is actionable track expense whisper and resolved by user, then we don't want to render anything
    if (ReportActionsUtils.isActionableTrackExpense(action) && (action.originalMessage as OriginalMessageActionableTrackedExpenseWhisper['originalMessage']).resolution) {
        return null;
    }

    // We currently send whispers to all report participants and hide them in the UI for users that shouldn't see them.
    // This is a temporary solution needed for comment-linking.
    // The long term solution will leverage end-to-end encryption and only targeted users will be able to decrypt.
    if (ReportActionsUtils.isWhisperActionTargetedToOthers(action)) {
        return null;
    }

    const hasErrors = !isEmptyObject(action.errors);
    const whisperedToAccountIDs = action.whisperedToAccountIDs ?? [];
    const isWhisper = whisperedToAccountIDs.length > 0;
    const isMultipleParticipant = whisperedToAccountIDs.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedToAccountIDs);
    const whisperedToPersonalDetails = isWhisper
        ? (Object.values(personalDetails ?? {}).filter((details) => whisperedToAccountIDs.includes(details?.accountID ?? -1)) as OnyxTypes.PersonalDetails[])
        : [];
    const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];

    return (
        <PressableWithSecondaryInteraction
            ref={popoverAnchorRef}
            onPress={draftMessage === undefined ? onPress : undefined}
            style={[action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.pointerEventsNone : styles.pointerEventsAuto]}
            onPressIn={() => isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
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
            >
                {(hovered) => (
                    <View style={highlightedBackgroundColorIfNeeded}>
                        {shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={report.reportID}
                            reportActionID={action.reportActionID}
                            anchor={popoverAnchorRef}
                            originalReportID={originalReportID ?? ''}
                            isArchivedRoom={ReportUtils.isArchivedRoom(report)}
                            displayAsGroup={displayAsGroup}
                            isVisible={hovered && draftMessage === undefined && !hasErrors}
                            draftMessage={draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(originalReport)}
                            checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                            setIsEmojiPickerActive={setIsEmojiPickerActive}
                        />
                        <View style={StyleUtils.getReportActionItemStyle(hovered || isWhisper || isContextMenuActive || !!isEmojiPickerActive || draftMessage !== undefined, !!onPress)}>
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearAllRelatedReportActionErrors(report.reportID, action)}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                pendingAction={
                                    draftMessage !== undefined ? undefined : action.pendingAction ?? (action.isOptimisticAction ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : undefined)
                                }
                                shouldHideOnDelete={!ReportActionsUtils.isThreadParentMessage(action, report.reportID)}
                                errors={ErrorUtils.getLatestErrorMessageField(action as ErrorUtils.OnyxDataWithErrors)}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(action)}
                                shouldDisableStrikeThrough
                            >
                                {isWhisper && (
                                    <View style={[styles.flexRow, styles.pl5, styles.pt2, styles.pr3]}>
                                        <View style={[styles.pl6, styles.mr3]}>
                                            <Icon
                                                fill={theme.icon}
                                                src={Expensicons.Eye}
                                                small
                                            />
                                        </View>
                                        <Text style={[styles.chatItemMessageHeaderTimestamp]}>
                                            {translate('reportActionContextMenu.onlyVisible')}
                                            &nbsp;
                                        </Text>
                                        <DisplayNames
                                            fullTitle={ReportUtils.getWhisperDisplayNames(whisperedToAccountIDs) ?? ''}
                                            displayNamesWithTooltips={displayNamesWithTooltips}
                                            tooltipEnabled
                                            numberOfLines={1}
                                            textStyles={[styles.chatItemMessageHeaderTimestamp, styles.flex1]}
                                            shouldUseFullTitle={isWhisperOnlyVisibleByUser}
                                        />
                                    </View>
                                )}
                                {renderReportActionItem(!!hovered || !!isReportActionLinked, isWhisper, hasErrors)}
                            </OfflineWithFeedback>
                        </View>
                    </View>
                )}
            </Hoverable>
            <View style={styles.reportActionSystemMessageContainer}>
                <InlineSystemMessage message={action.error} />
            </View>
        </PressableWithSecondaryInteraction>
    );
}

export default withOnyx<ReportActionItemProps, ReportActionItemOnyxProps>({
    preferredSkinTone: {
        key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE,
    },
    iouReport: {
        key: ({action}) => {
            const iouReportID = ReportActionsUtils.getIOUReportIDFromReportActionPreview(action);
            return `${ONYXKEYS.COLLECTION.REPORT}${iouReportID ?? 0}`;
        },
        initialValue: {} as OnyxTypes.Report,
    },
    policy: {
        key: ({report}) => `${ONYXKEYS.COLLECTION.POLICY}${report.policyID ?? 0}`,
        initialValue: {} as OnyxTypes.Policy,
    },
    emojiReactions: {
        key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`,
        initialValue: {},
    },
    userWallet: {
        key: ONYXKEYS.USER_WALLET,
    },
    transaction: {
        key: ({transactionThreadReport, reportActions}) => {
            const parentReportActionID = isEmptyObject(transactionThreadReport) ? '0' : transactionThreadReport.parentReportActionID;
            const action = reportActions?.find((reportAction) => reportAction.reportActionID === parentReportActionID);
            const transactionID = (action as OnyxTypes.OriginalMessageIOU)?.originalMessage.IOUTransactionID ? (action as OnyxTypes.OriginalMessageIOU).originalMessage.IOUTransactionID : 0;
            return `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`;
        },
    },
})(
    memo(ReportActionItem, (prevProps, nextProps) => {
        const prevParentReportAction = prevProps.parentReportAction;
        const nextParentReportAction = nextProps.parentReportAction;
        return (
            prevProps.displayAsGroup === nextProps.displayAsGroup &&
            prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction &&
            prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
            lodashIsEqual(prevProps.emojiReactions, nextProps.emojiReactions) &&
            lodashIsEqual(prevProps.action, nextProps.action) &&
            lodashIsEqual(prevProps.iouReport, nextProps.iouReport) &&
            lodashIsEqual(prevProps.report.pendingFields, nextProps.report.pendingFields) &&
            lodashIsEqual(prevProps.report.isDeletedParentAction, nextProps.report.isDeletedParentAction) &&
            lodashIsEqual(prevProps.report.errorFields, nextProps.report.errorFields) &&
            prevProps.report?.statusNum === nextProps.report?.statusNum &&
            prevProps.report?.stateNum === nextProps.report?.stateNum &&
            prevProps.report?.parentReportID === nextProps.report?.parentReportID &&
            prevProps.report?.parentReportActionID === nextProps.report?.parentReportActionID &&
            // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
            ReportUtils.isTaskReport(prevProps.report) === ReportUtils.isTaskReport(nextProps.report) &&
            prevProps.action.actionName === nextProps.action.actionName &&
            prevProps.report.reportName === nextProps.report.reportName &&
            prevProps.report.description === nextProps.report.description &&
            ReportUtils.isCompletedTaskReport(prevProps.report) === ReportUtils.isCompletedTaskReport(nextProps.report) &&
            prevProps.report.managerID === nextProps.report.managerID &&
            prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
            prevProps.report?.total === nextProps.report?.total &&
            prevProps.report?.nonReimbursableTotal === nextProps.report?.nonReimbursableTotal &&
            prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
            lodashIsEqual(prevProps.report.fieldList, nextProps.report.fieldList) &&
            lodashIsEqual(prevProps.policy, nextProps.policy) &&
            lodashIsEqual(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
            lodashIsEqual(prevProps.reportActions, nextProps.reportActions) &&
            lodashIsEqual(prevProps.transaction, nextProps.transaction) &&
            lodashIsEqual(prevParentReportAction, nextParentReportAction)
        );
    }),
);
