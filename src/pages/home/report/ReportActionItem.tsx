import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {GestureResponderEvent, InteractionManager, TextInput, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import {Emoji} from '@assets/emojis/types';
import Button from '@components/Button';
import DisplayNames from '@components/DisplayNames';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import InlineSystemMessage from '@components/InlineSystemMessage';
import KYCWall from '@components/KYCWall';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails, withBlockedFromConcierge, withNetwork, withReportActionsDrafts} from '@components/OnyxProvider';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
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
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';
import ControlSelection from '@libs/ControlSelection';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import focusTextInputAfterAnimation from '@libs/focusTextInputAfterAnimation';
import ModifiedExpenseMessage from '@libs/ModifiedExpenseMessage';
import Navigation from '@libs/Navigation/Navigation';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import * as BankAccounts from '@userActions/BankAccounts';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import * as store from '@userActions/ReimbursementAccount/store';
import * as Report from '@userActions/Report';
import * as ReportActions from '@userActions/ReportActions';
import * as Session from '@userActions/Session';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {DecisionName, OriginalMessageIOU} from '@src/types/onyx/OriginalMessage';
import {ReportActionBase} from '@src/types/onyx/ReportAction';
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

type ReportActionItemOnyxProps = {
    /** Stores user's preferred skin tone */
    preferredSkinTone: OnyxEntry<string | number>;

    /** IOU report for this action, if any */
    iouReport: OnyxEntry<OnyxTypes.Report>;

    emojiReactions: OnyxEntry<OnyxTypes.ReportActionReactions>;

    /** The user's wallet account */
    userWallet: OnyxEntry<OnyxTypes.UserWallet>;

    /** All the report actions belonging to the report's parent */
    parentReportActions: OnyxEntry<OnyxTypes.ReportActions>;
};

type ReportActionItemProps = {
    /** Report for this action */
    report: OnyxTypes.Report;

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

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage?: string;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    linkedReportActionID?: string;
} & ReportActionItemOnyxProps;

const isIOUReport = (actionObj: OnyxEntry<OnyxTypes.ReportAction>): actionObj is ReportActionBase & OriginalMessageIOU => actionObj?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;

function ReportActionItem({
    action,
    report,
    draftMessage = undefined,
    linkedReportActionID,
    displayAsGroup,
    emojiReactions,
    index,
    iouReport,
    isMostRecentIOUReportAction,
    parentReportActions,
    preferredSkinTone = CONST.EMOJI_DEFAULT_SKIN_TONE,
    shouldDisplayNewMarker,
    userWallet,
    shouldHideThreadDividerLine = false,
    shouldShowSubscriptAvatar = false,
}: ReportActionItemProps) {
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => ReportActionContextMenu.isActiveReportAction(action.reportActionID));
    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState<DecisionName>(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
    const reactionListRef = useContext(ReactionListContext);
    const {updateHiddenAttachments} = useContext(ReportAttachmentsContext);
    const textInputRef = useRef<TextInput & HTMLTextAreaElement>();
    const popoverAnchorRef = useRef<View>(null);
    const downloadedPreviews = useRef<string[]>([]);
    const prevDraftMessage = usePrevious(draftMessage);
    const originalReportID = ReportUtils.getOriginalReportID(report.reportID, action);
    const originalReport = report.reportID === originalReportID ? report : ReportUtils.getReport(originalReportID);
    const isReportActionLinked = linkedReportActionID === action.reportActionID;
    console.log('hello', action.actionName, action.originalMessage);
    const highlightedBackgroundColorIfNeeded = useMemo(
        () => (isReportActionLinked ? StyleUtils.getBackgroundColorStyle(theme.hoverComponentBG) : {}),
        [StyleUtils, isReportActionLinked, theme.hoverComponentBG],
    );
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(action);

    // IOUDetails only exists when we are sending money
    const isSendingMoney = isIOUReport(action) && action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && action.originalMessage.IOUDetails;

    const updateHiddenState = useCallback(
        (isHiddenValue: boolean) => {
            setIsHidden(isHiddenValue);
            const isAttachment = ReportUtils.isReportMessageAttachment(action.message?.[action.message?.length - 1]);
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
        if (!!prevDraftMessage || !draftMessage) {
            return;
        }

        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [prevDraftMessage, draftMessage]);

    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = ReportActionsUtils.extractLinksFromMessageHtml(action);
        if (
            (downloadedPreviews.current.length === urls.length && downloadedPreviews.current.every((value, arrIndex) => value === urls[arrIndex])) ||
            action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
        ) {
            return;
        }

        downloadedPreviews.current = urls;
        Report.expandURLPreview(report.reportID, action.reportActionID);
    }, [action, report.reportID]);

    useEffect(() => {
        if (!draftMessage || !ReportActionsUtils.isDeletedAction(action)) {
            return;
        }
        Report.deleteReportActionDraft(report.reportID, action);
    }, [draftMessage, action, report.reportID]);

    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    const latestDecision = action.message?.[0].moderationDecision?.decision ?? '';
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
        if (![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === latestDecision)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action.actionName]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(ReportActionContextMenu.isActiveReportAction(action.reportActionID));
    }, [action.reportActionID]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = useCallback(
        (event: GestureResponderEvent | MouseEvent) => {
            // Block menu on the message being Edited or if the report action item has errors
            if (!!draftMessage || !isEmptyObject(action.errors)) {
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
            );
        },
        [draftMessage, action, report.reportID, toggleContextMenuFromActiveReportAction, originalReport, originalReportID],
    );

    const toggleReaction = useCallback(
        (emoji: Emoji) => {
            Report.toggleEmojiReaction(report.reportID, action, emoji, emojiReactions ?? undefined);
        },
        [report, action, emojiReactions],
    );

    const contextValue = useMemo(
        () => ({
            anchor: popoverAnchorRef,
            report,
            action,
            checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
        }),
        [report, action, toggleContextMenuFromActiveReportAction],
    );

    /**
     * Get the content of ReportActionItem
     * @param hovered whether the ReportActionItem is hovered
     * @param isWhisper whether the report action is a whisper
     * @param hasErrors whether the report action has any errors
     * @returns child component(s)
     */
    const renderItemContent = (hovered = false, isWhisper = false, hasErrors = false) => {
        let children;

        // Show the MoneyRequestPreview for when request was created, bill was split or money was sent
        if (
            action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
            action.originalMessage &&
            // For the pay flow, we only want to show MoneyRequestAction when sending money. When paying, we display a regular system message
            (action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT || isSendingMoney)
        ) {
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = action.originalMessage.IOUReportID ? action.originalMessage.IOUReportID.toString() : '0';
            children = (
                <MoneyRequestAction
                    chatReportID={report.reportID}
                    requestReportID={iouReportID}
                    action={action}
                    isMostRecentIOUReportAction={isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={displayAsGroup ? [] : [styles.mt2]}
                    isWhisper={isWhisper}
                />
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = (
                <ReportPreview
                    iouReportID={ReportActionsUtils.getIOUReportIDFromReportActionPreview(action)}
                    chatReportID={report.reportID}
                    policyID={report.policyID}
                    containerStyles={displayAsGroup ? [] : [styles.mt2]}
                    action={action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    isWhisper={isWhisper}
                />
            );
        } else if (
            action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED ||
            action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        ) {
            children = <TaskAction actionName={action.actionName} />;
        } else if (ReportActionsUtils.isCreatedTaskReportAction(action)) {
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <TaskPreview
                        taskReportID={action.originalMessage.taskReportID.toString()}
                        chatReportID={report.reportID}
                        policyID={ReportUtils.getRootParentReport(report)?.policyID}
                        action={action}
                        isHovered={hovered}
                        contextMenuAnchor={popoverAnchorRef}
                        checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    />
                </ShowContextMenuContext.Provider>
            );
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED) {
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails[report.ownerAccountID ?? -1]);
            const paymentType = action.originalMessage.paymentType ?? '';

            const isSubmitterOfUnsettledReport = ReportUtils.isCurrentUserSubmitter(report.reportID) && !ReportUtils.isSettled(report.reportID);
            const shouldShowAddCreditBankAccountButton = isSubmitterOfUnsettledReport && !store.hasCreditBankAccount() && paymentType !== CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
            const shouldShowEnableWalletButton =
                isSubmitterOfUnsettledReport && (isEmptyObject(userWallet) || userWallet?.tierName === CONST.WALLET.TIER_NAME.SILVER) && paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY;

            children = (
                <ReportActionItemBasicMessage
                    message={translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', {submitterDisplayName})}
                >
                    <>
                        {shouldShowAddCreditBankAccountButton && (
                            <Button
                                success
                                style={[styles.w100, styles.requestPreviewBox]}
                                text={translate('bankAccount.addBankAccount')}
                                onPress={() => BankAccounts.openPersonalBankAccountSetupView(report.reportID)}
                                pressOnEnter
                            />
                        )}
                        {shouldShowEnableWalletButton && (
                            <KYCWall
                                onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                chatReportID={report.reportID}
                                iouReport={iouReport}
                            >
                                {(triggerKYCFlow, buttonRef) => (
                                    <Button
                                        ref={buttonRef}
                                        success
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
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails[report.ownerAccountID ?? -1]);
            const amount = CurrencyUtils.convertToDisplayString(report.total, report.currency);

            children = <ReportActionItemBasicMessage message={translate('iou.canceledRequest', {submitterDisplayName, amount})} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
            children = <ReportActionItemBasicMessage message={ModifiedExpenseMessage.getForReportAction(action)} />;
        } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED) {
            children = <ReportActionItemBasicMessage message={ReportActionsUtils.getMarkedReimbursedMessage(action)} />;
        } else {
            const hasBeenFlagged = ![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision);
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    {!draftMessage ? (
                        <View style={displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                            <ReportActionItemMessage
                                reportID={report.reportID}
                                action={action}
                                displayAsGroup={displayAsGroup}
                                isHidden={isHidden}
                                style={[
                                    [
                                        ...Object.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG),
                                        CONST.REPORT.ACTIONS.TYPE.IOU,
                                        CONST.REPORT.ACTIONS.TYPE.APPROVED,
                                        CONST.REPORT.ACTIONS.TYPE.MOVED,
                                    ].includes(action.actionName)
                                        ? styles.colorMuted
                                        : undefined,
                                ]}
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
                        </View>
                    ) : (
                        <ReportActionItemMessageEdit
                            action={action}
                            draftMessage={draftMessage}
                            reportID={report.reportID}
                            index={index}
                            ref={textInputRef}
                            report={report}
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
        const oldestFourAccountIDs = action.childOldestFourAccountIDs
            ?.split(',')
            .map((accountID) => Number(accountID))
            // eslint-disable-next-line no-restricted-globals
            .filter((accountID): accountID is number => !isNaN(accountID));
        const draftMessageRightAlign = draftMessage ? styles.chatItemReactionsDraftRight : {};

        return (
            <>
                {children}
                {Permissions.canUseLinkPreviews() && !isHidden && (action.linkMetadata?.length ?? 0) > 0 && (
                    <View style={draftMessage ? styles.chatItemReactionsDraftRight : {}}>
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
    const renderReportActionItem = (hovered: boolean, isWhisper: boolean, hasErrors: boolean) => {
        const content = renderItemContent(hovered || isContextMenuActive, isWhisper, hasErrors);

        if (draftMessage) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={action}
                    showHeader={!draftMessage}
                    wrapperStyle={isWhisper ? styles.pt1 : {}}
                    shouldShowSubscriptAvatar={shouldShowSubscriptAvatar}
                    report={report}
                    iouReport={iouReport}
                    isHovered={hovered}
                    hasBeenFlagged={![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === moderationDecision)}
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{content}</ReportActionItemGrouped>;
    };

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        const parentReportAction = parentReportActions?.[report.parentReportActionID ?? ''] ?? null;
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            return (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <MoneyRequestView
                        report={report}
                        shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                    />
                </ShowContextMenuContext.Provider>
            );
        }
        if (ReportUtils.isTaskReport(report)) {
            if (ReportUtils.isCanceledTaskReport(report, parentReportAction)) {
                return (
                    <>
                        <AnimatedEmptyStateBackground />
                        <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                            <ReportActionItemSingle
                                action={parentReportAction}
                                showHeader={!draftMessage}
                                report={report}
                            >
                                <RenderHTML html={`<comment>${translate('parentReportAction.deletedTask')}</comment>`} />
                            </ReportActionItemSingle>
                            <View style={styles.reportHorizontalRule} />
                        </View>
                    </>
                );
            }
            return (
                <>
                    <AnimatedEmptyStateBackground />
                    <View style={[StyleUtils.getReportWelcomeTopMarginStyle(isSmallScreenWidth)]}>
                        <TaskView
                            report={report}
                            shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                        />
                    </View>
                </>
            );
        }
        if (ReportUtils.isExpenseReport(report) || ReportUtils.isIOUReport(report)) {
            return (
                <OfflineWithFeedback pendingAction={action.pendingAction}>
                    <MoneyReportView
                        report={report}
                        shouldShowHorizontalRule={!shouldHideThreadDividerLine}
                    />
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
    if (
        action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        !!report?.isWaitingOnBankAccount &&
        originalMessage &&
        originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY &&
        !isSendingMoney
    ) {
        return null;
    }

    const hasErrors = !_.isEmpty(action.errors);
    const whisperedToAccountIDs = action.whisperedToAccountIDs || [];
    const isWhisper = whisperedToAccountIDs.length > 0;
    const isMultipleParticipant = whisperedToAccountIDs.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedToAccountIDs);
    const whisperedToPersonalDetails = isWhisper ? Object.values(personalDetails ?? {}).filter((details) => whisperedToAccountIDs.includes(details?.accountID ?? -1)) : [];
    const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];
    return (
        <PressableWithSecondaryInteraction
            ref={popoverAnchorRef}
            style={[action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.pointerEventsNone : styles.pointerEventsAuto]}
            onPressIn={() => isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContextMenu={!draftMessage && !hasErrors}
            withoutFocusOnSecondaryInteraction
            accessibilityLabel={translate('accessibilityHints.chatMessage')}
        >
            <Hoverable
                shouldHandleScroll
                isDisabled={!!draftMessage}
            >
                {(hovered) => (
                    <View style={highlightedBackgroundColorIfNeeded}>
                        {shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={report.reportID}
                            reportActionID={action.reportActionID}
                            originalReportID={originalReportID ?? ''}
                            isArchivedRoom={ReportUtils.isArchivedRoom(report)}
                            displayAsGroup={displayAsGroup}
                            isVisible={hovered && !draftMessage && !hasErrors}
                            draftMessage={draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(originalReport)}
                        />
                        <View style={StyleUtils.getReportActionItemStyle(hovered || isWhisper || isContextMenuActive || !!draftMessage)}>
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearReportActionErrors(report.reportID, action)}
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                                pendingAction={draftMessage ? null : action.pendingAction || (action.isOptimisticAction ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : '')}
                                shouldHideOnDelete={!ReportActionsUtils.isThreadParentMessage(action, report.reportID)}
                                errors={action.errors}
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
                                {renderReportActionItem(hovered || isReportActionLinked, isWhisper, hasErrors)}
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

export default compose(
    withNetwork(),
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const originalReportID = ReportUtils.getOriginalReportID(props.report.reportID, props.action);
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`;
            console.log('hej', drafts?.[draftKey][props.action.reportActionID].message);
            return drafts?.[draftKey][props.action.reportActionID].message;
        },
    }),
    withOnyx<ReportActionItemProps, ReportActionItemOnyxProps>({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE,
        },
        iouReport: {
            key: ({action}) => {
                const iouReportID = ReportActionsUtils.getIOUReportIDFromReportActionPreview(action);
                return `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`;
            },
        },
        emojiReactions: {
            key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`,
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID ?? ''}`,
            canEvict: false,
        },
    }),
)(
    memo(
        ReportActionItem,
        (prevProps, nextProps) =>
            prevProps.displayAsGroup === nextProps.displayAsGroup &&
            prevProps.draftMessage === nextProps.draftMessage &&
            prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction &&
            prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
            _.isEqual(prevProps.emojiReactions, nextProps.emojiReactions) &&
            _.isEqual(prevProps.action, nextProps.action) &&
            _.isEqual(prevProps.iouReport, nextProps.iouReport) &&
            _.isEqual(prevProps.report.pendingFields, nextProps.report.pendingFields) &&
            _.isEqual(prevProps.report.isDeletedParentAction, nextProps.report.isDeletedParentAction) &&
            _.isEqual(prevProps.report.errorFields, nextProps.report.errorFields) &&
            lodashGet(prevProps.report, 'statusNum') === lodashGet(nextProps.report, 'statusNum') &&
            lodashGet(prevProps.report, 'stateNum') === lodashGet(nextProps.report, 'stateNum') &&
            lodashGet(prevProps.report, 'parentReportID') === lodashGet(nextProps.report, 'parentReportID') &&
            lodashGet(prevProps.report, 'parentReportActionID') === lodashGet(nextProps.report, 'parentReportActionID') &&
            prevProps.translate === nextProps.translate &&
            // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
            ReportUtils.isTaskReport(prevProps.report) === ReportUtils.isTaskReport(nextProps.report) &&
            prevProps.action.actionName === nextProps.action.actionName &&
            prevProps.report.reportName === nextProps.report.reportName &&
            prevProps.report.description === nextProps.report.description &&
            ReportUtils.isCompletedTaskReport(prevProps.report) === ReportUtils.isCompletedTaskReport(nextProps.report) &&
            prevProps.report.managerID === nextProps.report.managerID &&
            prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
            lodashGet(prevProps.report, 'total', 0) === lodashGet(nextProps.report, 'total', 0) &&
            lodashGet(prevProps.report, 'nonReimbursableTotal', 0) === lodashGet(nextProps.report, 'nonReimbursableTotal', 0) &&
            prevProps.linkedReportActionID === nextProps.linkedReportActionID,
    ),
);
