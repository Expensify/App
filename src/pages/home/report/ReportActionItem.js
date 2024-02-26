import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
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
import EmojiReactionsPropTypes from '@components/Reactions/EmojiReactionsPropTypes';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
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
import withLocalize from '@components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '@components/withWindowDimensions';
import usePrevious from '@hooks/usePrevious';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
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
import userWalletPropTypes from '@pages/EnablePayments/userWalletPropTypes';
import {ReactionListContext} from '@pages/home/ReportScreenContext';
import reportPropTypes from '@pages/reportPropTypes';
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
import reportActionPropTypes from './reportActionPropTypes';
import ReportAttachmentsContext from './ReportAttachmentsContext';

const propTypes = {
    ...windowDimensionsPropTypes,

    /** Report for this action */
    report: reportPropTypes.isRequired,

    /** All the data of the action item */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: PropTypes.bool.isRequired,

    /** Determines if the avatar is displayed as a subscript (positioned lower than normal) */
    shouldShowSubscriptAvatar: PropTypes.bool,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    emojiReactions: EmojiReactionsPropTypes,

    /** IOU report for this action, if any */
    iouReport: reportPropTypes,

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: PropTypes.bool,

    /** The user's wallet account */
    userWallet: userWalletPropTypes,

    /** All the report actions belonging to the report's parent */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** Callback to be called on onPress */
    onPress: PropTypes.func,
};

const defaultProps = {
    draftMessage: undefined,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    emojiReactions: {},
    shouldShowSubscriptAvatar: false,
    iouReport: undefined,
    shouldHideThreadDividerLine: false,
    userWallet: {},
    parentReportActions: {},
    onPress: undefined,
};

function ReportActionItem(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
    const reactionListRef = useContext(ReactionListContext);
    const {updateHiddenAttachments} = useContext(ReportAttachmentsContext);
    const textInputRef = useRef();
    const popoverAnchorRef = useRef();
    const downloadedPreviews = useRef([]);
    const prevDraftMessage = usePrevious(props.draftMessage);
    const originalReportID = ReportUtils.getOriginalReportID(props.report.reportID, props.action);
    const originalReport = props.report.reportID === originalReportID ? props.report : ReportUtils.getReport(originalReportID);
    const isReportActionLinked = props.linkedReportActionID && props.action.reportActionID && props.linkedReportActionID === props.action.reportActionID;

    const reportScrollManager = useReportScrollManager();

    const highlightedBackgroundColorIfNeeded = useMemo(
        () => (isReportActionLinked ? StyleUtils.getBackgroundColorStyle(theme.hoverComponentBG) : {}),
        [StyleUtils, isReportActionLinked, theme.hoverComponentBG],
    );
    const originalMessage = lodashGet(props.action, 'originalMessage', {});
    const isDeletedParentAction = ReportActionsUtils.isDeletedParentAction(props.action);
    const prevActionResolution = usePrevious(lodashGet(props.action, 'originalMessage.resolution', null));

    // IOUDetails only exists when we are sending money
    const isSendingMoney = originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails');

    const updateHiddenState = useCallback(
        (isHiddenValue) => {
            setIsHidden(isHiddenValue);
            const isAttachment = ReportUtils.isReportMessageAttachment(_.last(props.action.message));
            if (!isAttachment) {
                return;
            }
            updateHiddenAttachments(props.action.reportActionID, isHiddenValue);
        },
        [props.action.reportActionID, props.action.message, updateHiddenAttachments],
    );

    useEffect(
        () => () => {
            // ReportActionContextMenu, EmojiPicker and PopoverReactionList are global components,
            // we should also hide them when the current component is destroyed
            if (ReportActionContextMenu.isActiveReportAction(props.action.reportActionID)) {
                ReportActionContextMenu.hideContextMenu();
                ReportActionContextMenu.hideDeleteModal();
            }
            if (EmojiPickerAction.isActive(props.action.reportActionID)) {
                EmojiPickerAction.hideEmojiPicker(true);
            }
            if (reactionListRef.current && reactionListRef.current.isActiveReportAction(props.action.reportActionID)) {
                reactionListRef.current.hideReactionList();
            }
        },
        [props.action.reportActionID, reactionListRef],
    );

    useEffect(() => {
        // We need to hide EmojiPicker when this is a deleted parent action
        if (!isDeletedParentAction || !EmojiPickerAction.isActive(props.action.reportActionID)) {
            return;
        }

        EmojiPickerAction.hideEmojiPicker(true);
    }, [isDeletedParentAction, props.action.reportActionID]);

    useEffect(() => {
        if (!_.isUndefined(prevDraftMessage) || _.isUndefined(props.draftMessage)) {
            return;
        }

        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [prevDraftMessage, props.draftMessage]);

    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = ReportActionsUtils.extractLinksFromMessageHtml(props.action);
        if (_.isEqual(downloadedPreviews.current, urls) || props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        downloadedPreviews.current = urls;
        Report.expandURLPreview(props.report.reportID, props.action.reportActionID);
    }, [props.action, props.report.reportID]);

    useEffect(() => {
        if (_.isUndefined(props.draftMessage) || !ReportActionsUtils.isDeletedAction(props.action)) {
            return;
        }
        Report.deleteReportActionDraft(props.report.reportID, props.action);
    }, [props.draftMessage, props.action, props.report.reportID]);

    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    const latestDecision = lodashGet(props, ['action', 'message', 0, 'moderationDecision', 'decision'], '');
    useEffect(() => {
        if (props.action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT) {
            return;
        }

        // Hide reveal message button and show the message if latestDecision is changed to empty
        if (_.isEmpty(latestDecision)) {
            setModerationDecision(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
            setIsHidden(false);
            return;
        }

        setModerationDecision(latestDecision);
        if (!_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], latestDecision) && !ReportActionsUtils.isPendingRemove(props.action)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, props.action]);

    const toggleContextMenuFromActiveReportAction = useCallback(() => {
        setIsContextMenuActive(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    }, [props.action.reportActionID]);

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    const showPopover = useCallback(
        (event) => {
            // Block menu on the message being Edited or if the report action item has errors
            if (!_.isUndefined(props.draftMessage) || !_.isEmpty(props.action.errors)) {
                return;
            }

            setIsContextMenuActive(true);
            const selection = SelectionScraper.getCurrentSelection();
            ReportActionContextMenu.showContextMenu(
                CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                event,
                selection,
                popoverAnchorRef,
                props.report.reportID,
                props.action.reportActionID,
                originalReportID,
                props.draftMessage,
                () => setIsContextMenuActive(true),
                toggleContextMenuFromActiveReportAction,
                ReportUtils.isArchivedRoom(originalReport),
                ReportUtils.chatIncludesChronos(originalReport),
            );
        },
        [props.draftMessage, props.action, props.report.reportID, toggleContextMenuFromActiveReportAction, originalReport, originalReportID],
    );

    // Handles manual scrolling to the bottom of the chat when the last message is an actionable mention whisper and it's resolved.
    // This fixes an issue where InvertedFlatList fails to auto scroll down and results in an empty space at the bottom of the chat in IOS.
    useEffect(() => {
        if (props.index !== 0 || !ReportActionsUtils.isActionableMentionWhisper(props.action)) {
            return;
        }

        if (prevActionResolution !== lodashGet(props.action, 'originalMessage.resolution', null)) {
            reportScrollManager.scrollToIndex(props.index);
        }
    }, [props.index, props.action, prevActionResolution, reportScrollManager]);

    const toggleReaction = useCallback(
        (emoji) => {
            Report.toggleEmojiReaction(props.report.reportID, props.action, emoji, props.emojiReactions);
        },
        [props.report, props.action, props.emojiReactions],
    );

    const contextValue = useMemo(
        () => ({
            anchor: popoverAnchorRef,
            report: props.report,
            action: props.action,
            checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
        }),
        [props.report, props.action, toggleContextMenuFromActiveReportAction],
    );

    const actionableItemButtons = useMemo(() => {
        if (!(ReportActionsUtils.isActionableMentionWhisper(props.action) && !lodashGet(props.action, 'originalMessage.resolution', null))) {
            return [];
        }
        return [
            {
                text: 'actionableMentionWhisperOptions.invite',
                key: `${props.action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE}`,
                onPress: () => Report.resolveActionableMentionWhisper(props.report.reportID, props.action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.INVITE),
                isPrimary: true,
            },
            {
                text: 'actionableMentionWhisperOptions.nothing',
                key: `${props.action.reportActionID}-actionableMentionWhisper-${CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING}`,
                onPress: () => Report.resolveActionableMentionWhisper(props.report.reportID, props.action, CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION.NOTHING),
            },
        ];
    }, [props.action, props.report.reportID]);

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @param {Boolean} isWhisper whether the report action is a whisper
     * @param {Boolean} hasErrors whether the report action has any errors
     * @returns {Object} child component(s)
     */
    const renderItemContent = (hovered = false, isWhisper = false, hasErrors = false) => {
        let children;

        // Show the MoneyRequestPreview for when request was created, bill was split or money was sent
        if (
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
            originalMessage &&
            // For the pay flow, we only want to show MoneyRequestAction when sending money. When paying, we display a regular system message
            (originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT || isSendingMoney)
        ) {
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = originalMessage.IOUReportID ? originalMessage.IOUReportID.toString() : '0';
            children = (
                <MoneyRequestAction
                    // If originalMessage.iouReportID is set, this is a 1:1 money request in a DM chat whose reportID is props.report.chatReportID
                    chatReportID={originalMessage.IOUReportID ? props.report.chatReportID : props.report.reportID}
                    requestReportID={iouReportID}
                    reportID={props.report.reportID}
                    action={props.action}
                    isMostRecentIOUReportAction={props.isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    style={props.displayAsGroup ? [] : [styles.mt2]}
                    isWhisper={isWhisper}
                />
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = (
                <ReportPreview
                    iouReportID={ReportActionsUtils.getIOUReportIDFromReportActionPreview(props.action)}
                    chatReportID={props.report.reportID}
                    policyID={props.report.policyID}
                    containerStyles={props.displayAsGroup ? [] : [styles.mt2]}
                    action={props.action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    isWhisper={isWhisper}
                    transactionViolations={props.transactionViolations}
                />
            );
        } else if (
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        ) {
            children = <TaskAction actionName={props.action.actionName} />;
        } else if (ReportActionsUtils.isCreatedTaskReportAction(props.action)) {
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    <TaskPreview
                        taskReportID={props.action.originalMessage.taskReportID.toString()}
                        chatReportID={props.report.reportID}
                        action={props.action}
                        isHovered={hovered}
                        contextMenuAnchor={popoverAnchorRef}
                        checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                    />
                </ShowContextMenuContext.Provider>
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED) {
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(lodashGet(personalDetails, props.report.ownerAccountID));
            const paymentType = lodashGet(props.action, 'originalMessage.paymentType', '');

            const isSubmitterOfUnsettledReport = ReportUtils.isCurrentUserSubmitter(props.report.reportID) && !ReportUtils.isSettled(props.report.reportID);
            const shouldShowAddCreditBankAccountButton = isSubmitterOfUnsettledReport && !store.hasCreditBankAccount() && paymentType !== CONST.IOU.PAYMENT_TYPE.EXPENSIFY;
            const shouldShowEnableWalletButton =
                isSubmitterOfUnsettledReport &&
                (_.isEmpty(props.userWallet) || props.userWallet.tierName === CONST.WALLET.TIER_NAME.SILVER) &&
                paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY;

            children = (
                <ReportActionItemBasicMessage
                    message={props.translate(paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'iou.waitingOnEnabledWallet' : 'iou.waitingOnBankAccount', {submitterDisplayName})}
                >
                    <>
                        {shouldShowAddCreditBankAccountButton && (
                            <Button
                                success
                                style={[styles.w100, styles.requestPreviewBox]}
                                text={props.translate('bankAccount.addBankAccount')}
                                onPress={() => BankAccounts.openPersonalBankAccountSetupView(props.report.reportID)}
                                pressOnEnter
                            />
                        )}
                        {shouldShowEnableWalletButton && (
                            <KYCWall
                                onSuccessfulKYC={() => Navigation.navigate(ROUTES.ENABLE_PAYMENTS)}
                                enablePaymentsRoute={ROUTES.ENABLE_PAYMENTS}
                                addBankAccountRoute={ROUTES.BANK_ACCOUNT_PERSONAL}
                                addDebitCardRoute={ROUTES.SETTINGS_ADD_DEBIT_CARD}
                                chatReportID={props.report.reportID}
                                iouReport={props.iouReport}
                            >
                                {(triggerKYCFlow, buttonRef) => (
                                    <Button
                                        ref={buttonRef}
                                        success
                                        style={[styles.w100, styles.requestPreviewBox]}
                                        text={props.translate('iou.enableWallet')}
                                        onPress={triggerKYCFlow}
                                    />
                                )}
                            </KYCWall>
                        )}
                    </>
                </ReportActionItemBasicMessage>
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTDEQUEUED) {
            children = <ReportActionItemBasicMessage message={ReportUtils.getReimbursementDeQueuedActionMessage(props.action, props.report)} />;
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
            children = <ReportActionItemBasicMessage message={ModifiedExpenseMessage.getForReportAction(props.report.reportID, props.action)} />;
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.HOLD) {
            children = <ReportActionItemBasicMessage message={props.translate('iou.heldRequest', {comment: lodashGet(props, 'action.message[1].text', '')})} />;
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.UNHOLD) {
            children = <ReportActionItemBasicMessage message={props.translate('iou.unheldRequest')} />;
        } else {
            const hasBeenFlagged =
                !_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision) &&
                !ReportActionsUtils.isPendingRemove(props.action);
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    {_.isUndefined(props.draftMessage) ? (
                        <View style={props.displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                            <ReportActionItemMessage
                                reportID={props.report.reportID}
                                action={props.action}
                                displayAsGroup={props.displayAsGroup}
                                isHidden={isHidden}
                                style={[
                                    _.contains(
                                        [
                                            ..._.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG),
                                            CONST.REPORT.ACTIONS.TYPE.IOU,
                                            CONST.REPORT.ACTIONS.TYPE.APPROVED,
                                            CONST.REPORT.ACTIONS.TYPE.MOVED,
                                        ],
                                        props.action.actionName,
                                    )
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
                                        {isHidden ? props.translate('moderation.revealMessage') : props.translate('moderation.hideMessage')}
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
                                    action={props.action}
                                    items={actionableItemButtons}
                                />
                            )}
                        </View>
                    ) : (
                        <ReportActionItemMessageEdit
                            action={props.action}
                            draftMessage={props.draftMessage}
                            reportID={props.report.reportID}
                            index={props.index}
                            ref={textInputRef}
                            // Avoid defining within component due to an existing Onyx bug
                            preferredSkinTone={props.preferredSkinTone}
                            shouldDisableEmojiPicker={
                                (ReportUtils.chatIncludesConcierge(props.report) && User.isBlockedFromConcierge(props.blockedFromConcierge)) || ReportUtils.isArchivedRoom(props.report)
                            }
                        />
                    )}
                </ShowContextMenuContext.Provider>
            );
        }
        const numberOfThreadReplies = _.get(props, ['action', 'childVisibleActionCount'], 0);

        const shouldDisplayThreadReplies = ReportUtils.shouldDisplayThreadReplies(props.action, props.report.reportID);
        const oldestFourAccountIDs = _.map(lodashGet(props.action, 'childOldestFourAccountIDs', '').split(','), (accountID) => Number(accountID));
        const draftMessageRightAlign = !_.isUndefined(props.draftMessage) ? styles.chatItemReactionsDraftRight : {};

        return (
            <>
                {children}
                {Permissions.canUseLinkPreviews() && !isHidden && !_.isEmpty(props.action.linkMetadata) && (
                    <View style={!_.isUndefined(props.draftMessage) ? styles.chatItemReactionsDraftRight : {}}>
                        <LinkPreviewer linkMetadata={_.filter(props.action.linkMetadata, (item) => !_.isEmpty(item))} />
                    </View>
                )}
                {!ReportActionsUtils.isMessageDeleted(props.action) && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions
                            reportAction={props.action}
                            emojiReactions={props.emojiReactions}
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
                            childReportID={`${props.action.childReportID}`}
                            numberOfReplies={numberOfThreadReplies}
                            mostRecentReply={`${props.action.childLastVisibleActionCreated}`}
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
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @param {Boolean} isWhisper whether the ReportActionItem is a whisper
     * @param {Boolean} hasErrors whether the report action has any errors
     * @returns {Object} report action item
     */
    const renderReportActionItem = (hovered, isWhisper, hasErrors) => {
        const content = renderItemContent(hovered || isContextMenuActive, isWhisper, hasErrors);

        if (!_.isUndefined(props.draftMessage)) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!props.displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={props.action}
                    showHeader={_.isUndefined(props.draftMessage)}
                    wrapperStyle={isWhisper ? styles.pt1 : {}}
                    shouldShowSubscriptAvatar={props.shouldShowSubscriptAvatar}
                    report={props.report}
                    iouReport={props.iouReport}
                    isHovered={hovered}
                    hasBeenFlagged={
                        !_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision) &&
                        !ReportActionsUtils.isPendingRemove(props.action)
                    }
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyle={isWhisper ? styles.pt1 : {}}>{content}</ReportActionItemGrouped>;
    };

    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        const parentReportAction = props.parentReportActions[props.report.parentReportActionID];
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            const isReversedTransaction = ReportActionsUtils.isReversedTransaction(parentReportAction);
            if (ReportActionsUtils.isDeletedParentAction(parentReportAction) || isReversedTransaction) {
                return (
                    <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth, true), styles.justifyContentEnd]}>
                        <AnimatedEmptyStateBackground />
                        <View style={[StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}>
                            <OfflineWithFeedback pendingAction={lodashGet(parentReportAction, 'pendingAction', null)}>
                                <ReportActionItemSingle
                                    action={parentReportAction}
                                    showHeader
                                    report={props.report}
                                >
                                    <RenderHTML
                                        html={`<comment>${props.translate(isReversedTransaction ? 'parentReportAction.reversedTransaction' : 'parentReportAction.deletedRequest')}</comment>`}
                                    />
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
                        report={props.report}
                        shouldShowHorizontalRule={!props.shouldHideThreadDividerLine}
                    />
                </ShowContextMenuContext.Provider>
            );
        }
        if (ReportUtils.isTaskReport(props.report)) {
            if (ReportUtils.isCanceledTaskReport(props.report, parentReportAction)) {
                return (
                    <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth)]}>
                        <AnimatedEmptyStateBackground />
                        <View style={[StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}>
                            <ReportActionItemSingle
                                action={parentReportAction}
                                showHeader={_.isUndefined(props.draftMessage)}
                                report={props.report}
                            >
                                <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedTask')}</comment>`} />
                            </ReportActionItemSingle>
                        </View>
                    </View>
                );
            }
            return (
                <View style={[StyleUtils.getReportWelcomeContainerStyle(props.isSmallScreenWidth, true)]}>
                    <AnimatedEmptyStateBackground />
                    <View style={[StyleUtils.getReportWelcomeTopMarginStyle(props.isSmallScreenWidth)]}>
                        <TaskView
                            report={props.report}
                            shouldShowHorizontalRule={!props.shouldHideThreadDividerLine}
                        />
                    </View>
                </View>
            );
        }
        if (ReportUtils.isExpenseReport(props.report) || ReportUtils.isIOUReport(props.report)) {
            return (
                <OfflineWithFeedback pendingAction={props.action.pendingAction}>
                    <MoneyReportView
                        report={props.report}
                        policy={props.policy}
                        policyReportFields={_.values(props.policyReportFields)}
                        shouldShowHorizontalRule={!props.shouldHideThreadDividerLine}
                    />
                </OfflineWithFeedback>
            );
        }

        return (
            <ReportActionItemCreated
                reportID={props.report.reportID}
                policyID={props.report.policyID}
            />
        );
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return <RenameAction action={props.action} />;
    }
    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST) {
        return (
            <ChronosOOOListActions
                action={props.action}
                reportID={props.report.reportID}
            />
        );
    }

    // For the `pay` IOU action on non-send money flow, we don't want to render anything if `isWaitingOnBankAccount` is true
    // Otherwise, we will see two system messages informing the payee needs to add a bank account or wallet
    if (
        props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        lodashGet(props.report, 'isWaitingOnBankAccount', false) &&
        originalMessage &&
        originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY &&
        !isSendingMoney
    ) {
        return null;
    }

    // if action is actionable mention whisper and resolved by user, then we don't want to render anything
    if (ReportActionsUtils.isActionableMentionWhisper(props.action) && lodashGet(props.action, 'originalMessage.resolution', null)) {
        return null;
    }

    // We currently send whispers to all report participants and hide them in the UI for users that shouldn't see them.
    // This is a temporary solution needed for comment-linking.
    // The long term solution will leverage end-to-end encryption and only targeted users will be able to decrypt.
    if (ReportActionsUtils.isWhisperActionTargetedToOthers(props.action)) {
        return null;
    }

    const hasErrors = !_.isEmpty(props.action.errors);
    const whisperedToAccountIDs = props.action.whisperedToAccountIDs || [];
    const isWhisper = whisperedToAccountIDs.length > 0;
    const isMultipleParticipant = whisperedToAccountIDs.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedToAccountIDs);
    const whisperedToPersonalDetails = isWhisper ? _.filter(personalDetails, (details) => _.includes(whisperedToAccountIDs, details.accountID)) : [];
    const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];
    return (
        <PressableWithSecondaryInteraction
            ref={popoverAnchorRef}
            onPress={props.onPress}
            style={[props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? styles.pointerEventsNone : styles.pointerEventsAuto]}
            onPressIn={() => props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContextMenu={_.isUndefined(props.draftMessage) && !hasErrors}
            withoutFocusOnSecondaryInteraction
            accessibilityLabel={props.translate('accessibilityHints.chatMessage')}
        >
            <Hoverable
                shouldHandleScroll
                isDisabled={!_.isUndefined(props.draftMessage)}
            >
                {(hovered) => (
                    <View style={highlightedBackgroundColorIfNeeded}>
                        {props.shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={props.action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={props.report.reportID}
                            reportActionID={props.action.reportActionID}
                            anchor={popoverAnchorRef}
                            originalReportID={originalReportID}
                            isArchivedRoom={ReportUtils.isArchivedRoom(props.report)}
                            displayAsGroup={props.displayAsGroup}
                            isVisible={hovered && _.isUndefined(props.draftMessage) && !hasErrors}
                            draftMessage={props.draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(originalReport)}
                            checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                        />
                        <View style={StyleUtils.getReportActionItemStyle(hovered || isWhisper || isContextMenuActive || !_.isUndefined(props.draftMessage))}>
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearReportActionErrors(props.report.reportID, props.action)}
                                pendingAction={
                                    !_.isUndefined(props.draftMessage) ? null : props.action.pendingAction || (props.action.isOptimisticAction ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : '')
                                }
                                shouldHideOnDelete={!ReportActionsUtils.isThreadParentMessage(props.action, props.report.reportID)}
                                errors={ErrorUtils.getLatestErrorMessageField(props.action)}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(props.action)}
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
                                            {props.translate('reportActionContextMenu.onlyVisible')}
                                            &nbsp;
                                        </Text>
                                        <DisplayNames
                                            fullTitle={ReportUtils.getWhisperDisplayNames(whisperedToAccountIDs)}
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
                <InlineSystemMessage message={props.action.error} />
            </View>
        </PressableWithSecondaryInteraction>
    );
}

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
    withNetwork(),
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const originalReportID = ReportUtils.getOriginalReportID(props.report.reportID, props.action);
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`;
            return lodashGet(drafts, [draftKey, props.action.reportActionID, 'message']);
        },
    }),
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
            initialValue: CONST.EMOJI_DEFAULT_SKIN_TONE,
        },
        iouReport: {
            key: ({action}) => {
                const iouReportID = ReportActionsUtils.getIOUReportIDFromReportActionPreview(action);
                return iouReportID ? `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}` : undefined;
            },
            initialValue: {},
        },
        policyReportFields: {
            key: ({report}) => (report && 'policyID' in report ? `${ONYXKEYS.COLLECTION.POLICY_REPORT_FIELDS}${report.policyID}` : undefined),
            initialValue: [],
        },
        policy: {
            key: ({report}) => (report && 'policyID' in report ? `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}` : undefined),
            initialValue: {},
        },
        emojiReactions: {
            key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`,
            initialValue: {},
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
        parentReportActions: {
            key: ({report}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID || 0}`,
            canEvict: false,
        },
    }),
)(
    memo(ReportActionItem, (prevProps, nextProps) => {
        const prevParentReportAction = prevProps.parentReportActions[prevProps.report.parentReportActionID];
        const nextParentReportAction = nextProps.parentReportActions[nextProps.report.parentReportActionID];
        return (
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
            prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
            _.isEqual(prevProps.policyReportFields, nextProps.policyReportFields) &&
            _.isEqual(prevProps.report.reportFields, nextProps.report.reportFields) &&
            _.isEqual(prevProps.policy, nextProps.policy) &&
            _.isEqual(prevParentReportAction, nextParentReportAction)
        );
    }),
);
