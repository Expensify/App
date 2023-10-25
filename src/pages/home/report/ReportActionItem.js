import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useRef, useEffect, memo, useCallback, useContext, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import Button from '../../../components/Button';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import MoneyRequestAction from '../../../components/ReportActionItem/MoneyRequestAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemThread from './ReportActionItemThread';
import LinkPreviewer from './LinkPreviewer';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from './ContextMenu/ContextMenuActions';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';
import {usePersonalDetails, withBlockedFromConcierge, withNetwork, withReportActionsDrafts} from '../../../components/OnyxProvider';
import RenameAction from '../../../components/ReportActionItem/RenameAction';
import InlineSystemMessage from '../../../components/InlineSystemMessage';
import styles from '../../../styles/styles';
import SelectionScraper from '../../../libs/SelectionScraper';
import focusTextInputAfterAnimation from '../../../libs/focusTextInputAfterAnimation';
import * as User from '../../../libs/actions/User';
import * as ReportUtils from '../../../libs/ReportUtils';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReportActions from '../../../libs/actions/ReportActions';
import reportPropTypes from '../../reportPropTypes';
import {ShowContextMenuContext} from '../../../components/ShowContextMenuContext';
import ChronosOOOListActions from '../../../components/ReportActionItem/ChronosOOOListActions';
import ReportActionItemEmojiReactions from '../../../components/Reactions/ReportActionItemEmojiReactions';
import * as Report from '../../../libs/actions/Report';
import withLocalize from '../../../components/withLocalize';
import Icon from '../../../components/Icon';
import * as Expensicons from '../../../components/Icon/Expensicons';
import Text from '../../../components/Text';
import DisplayNames from '../../../components/DisplayNames';
import ReportPreview from '../../../components/ReportActionItem/ReportPreview';
import ReportActionItemDraft from './ReportActionItemDraft';
import TaskPreview from '../../../components/ReportActionItem/TaskPreview';
import TaskAction from '../../../components/ReportActionItem/TaskAction';
import EmojiReactionsPropTypes from '../../../components/Reactions/EmojiReactionsPropTypes';
import TaskView from '../../../components/ReportActionItem/TaskView';
import MoneyReportView from '../../../components/ReportActionItem/MoneyReportView';
import * as Session from '../../../libs/actions/Session';
import MoneyRequestView from '../../../components/ReportActionItem/MoneyRequestView';
import {hideContextMenu} from './ContextMenu/ReportActionContextMenu';
import * as PersonalDetailsUtils from '../../../libs/PersonalDetailsUtils';
import * as store from '../../../libs/actions/ReimbursementAccount/store';
import * as BankAccounts from '../../../libs/actions/BankAccounts';
import {ReactionListContext} from '../ReportScreenContext';
import usePrevious from '../../../hooks/usePrevious';
import Permissions from '../../../libs/Permissions';
import themeColors from '../../../styles/themes/default';
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import RenderHTML from '../../../components/RenderHTML';
import ReportAttachmentsContext from './ReportAttachmentsContext';
import ROUTES from '../../../ROUTES';
import Navigation from '../../../libs/Navigation/Navigation';
import KYCWall from '../../../components/KYCWall';
import userWalletPropTypes from '../../EnablePayments/userWalletPropTypes';

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

    /* Whether the option has an outstanding IOU */
    // eslint-disable-next-line react/no-unused-prop-types
    hasOutstandingIOU: PropTypes.bool,

    /** Stores user's preferred skin tone */
    preferredSkinTone: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

    ...windowDimensionsPropTypes,
    emojiReactions: EmojiReactionsPropTypes,

    /** IOU report for this action, if any */
    iouReport: reportPropTypes,

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine: PropTypes.bool,

    /** The user's wallet account */
    userWallet: userWalletPropTypes,
};

const defaultProps = {
    draftMessage: '',
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    emojiReactions: {},
    shouldShowSubscriptAvatar: false,
    hasOutstandingIOU: false,
    iouReport: undefined,
    shouldHideThreadDividerLine: false,
    userWallet: {},
};

function ReportActionItem(props) {
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
    const isReportActionLinked = props.linkedReportActionID === props.action.reportActionID;

    const highlightedBackgroundColorIfNeeded = useMemo(() => (isReportActionLinked ? StyleUtils.getBackgroundColorStyle(themeColors.highlightBG) : {}), [isReportActionLinked]);
    const originalMessage = lodashGet(props.action, 'originalMessage', {});

    // IOUDetails only exists when we are sending money
    const isSendingMoney = originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails');

    // When active action changes, we need to update the `isContextMenuActive` state
    const isActiveReportActionForMenu = ReportActionContextMenu.isActiveReportAction(props.action.reportActionID);
    useEffect(() => {
        setIsContextMenuActive(isActiveReportActionForMenu);
    }, [isActiveReportActionForMenu]);

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
        if (prevDraftMessage || !props.draftMessage) {
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
        if (!props.draftMessage || !ReportActionsUtils.isDeletedAction(props.action)) {
            return;
        }
        Report.saveReportActionDraft(props.report.reportID, props.action, '');
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
        if (!_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], latestDecision)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, props.action.actionName]);

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
            if (props.draftMessage || !_.isEmpty(props.action.errors)) {
                return;
            }

            setIsContextMenuActive(true);
            const selection = SelectionScraper.getCurrentSelection();
            ReportActionContextMenu.showContextMenu(
                ContextMenuActions.CONTEXT_MENU_TYPES.REPORT_ACTION,
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
                    chatReportID={props.report.reportID}
                    requestReportID={iouReportID}
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
                />
            );
        } else if (
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED ||
            props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        ) {
            children = (
                <TaskAction
                    taskReportID={props.action.originalMessage.taskReportID.toString()}
                    actionName={props.action.actionName}
                />
            );
        } else if (ReportActionsUtils.isCreatedTaskReportAction(props.action)) {
            children = (
                <TaskPreview
                    taskReportID={props.action.originalMessage.taskReportID.toString()}
                    action={props.action}
                    isHovered={hovered}
                />
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED) {
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(personalDetails, [props.report.ownerAccountID, 'displayName'], props.report.ownerEmail);
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
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
            children = <ReportActionItemBasicMessage message={ReportUtils.getModifiedExpenseMessage(props.action)} />;
        } else {
            const hasBeenFlagged = !_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision);
            children = (
                <ShowContextMenuContext.Provider value={contextValue}>
                    {!props.draftMessage ? (
                        <View style={props.displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                            <ReportActionItemMessage
                                reportID={props.report.reportID}
                                action={props.action}
                                displayAsGroup={props.displayAsGroup}
                                isHidden={isHidden}
                                style={[
                                    _.contains(
                                        [..._.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), CONST.REPORT.ACTIONS.TYPE.IOU, CONST.REPORT.ACTIONS.TYPE.APPROVED],
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
                                        style={styles.buttonSmallText}
                                        selectable={false}
                                        dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                                    >
                                        {isHidden ? props.translate('moderation.revealMessage') : props.translate('moderation.hideMessage')}
                                    </Text>
                                </Button>
                            )}
                        </View>
                    ) : (
                        <ReportActionItemMessageEdit
                            action={props.action}
                            draftMessage={props.draftMessage}
                            reportID={props.report.reportID}
                            index={props.index}
                            ref={textInputRef}
                            report={props.report}
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
        const hasReplies = numberOfThreadReplies > 0;

        const shouldDisplayThreadReplies = hasReplies && props.action.childCommenterCount && !ReportUtils.isThreadFirstChat(props.action, props.report.reportID);
        const oldestFourAccountIDs = _.map(lodashGet(props.action, 'childOldestFourAccountIDs', '').split(','), (accountID) => Number(accountID));
        const draftMessageRightAlign = props.draftMessage ? styles.chatItemReactionsDraftRight : {};

        return (
            <>
                {children}
                {Permissions.canUseLinkPreviews() && !isHidden && !_.isEmpty(props.action.linkMetadata) && (
                    <View style={props.draftMessage ? styles.chatItemReactionsDraftRight : {}}>
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

        if (props.draftMessage) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!props.displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={props.action}
                    showHeader={!props.draftMessage}
                    wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}
                    shouldShowSubscriptAvatar={props.shouldShowSubscriptAvatar}
                    report={props.report}
                    iouReport={props.iouReport}
                    isHovered={hovered}
                    hasBeenFlagged={!_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision)}
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}>{content}</ReportActionItemGrouped>;
    };

    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        let content = (
            <ReportActionItemCreated
                reportID={props.report.reportID}
                policyID={props.report.policyID}
            />
        );
        const parentReportAction = ReportActionsUtils.getParentReportAction(props.report);
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            content = (
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
                content = (
                    <>
                        <ReportActionItemSingle
                            action={parentReportAction}
                            showHeader={!props.draftMessage}
                            wrapperStyles={[styles.chatItem]}
                            report={props.report}
                        >
                            <RenderHTML html={`<comment>${props.translate('parentReportAction.deletedTask')}</comment>`} />
                        </ReportActionItemSingle>
                        <View style={styles.reportHorizontalRule} />
                    </>
                );
            } else {
                content = (
                    <TaskView
                        report={props.report}
                        shouldShowHorizontalRule={!props.shouldHideThreadDividerLine}
                    />
                );
            }
        }
        if (ReportUtils.isExpenseReport(props.report) || ReportUtils.isIOUReport(props.report)) {
            content = (
                <OfflineWithFeedback pendingAction={props.action.pendingAction}>
                    <MoneyReportView
                        report={props.report}
                        shouldShowHorizontalRule={!props.shouldHideThreadDividerLine}
                    />
                </OfflineWithFeedback>
            );
        }

        const isNormalCreatedAction =
            !ReportActionsUtils.isTransactionThread(parentReportAction) &&
            !ReportUtils.isTaskReport(props.report) &&
            !ReportUtils.isExpenseReport(props.report) &&
            !ReportUtils.isIOUReport(props.report);
        return <View style={[props.shouldHideThreadDividerLine && !isNormalCreatedAction && styles.mb2]}>{content}</View>;
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

    const hasErrors = !_.isEmpty(props.action.errors);
    const whisperedToAccountIDs = props.action.whisperedToAccountIDs || [];
    const isWhisper = whisperedToAccountIDs.length > 0;
    const isMultipleParticipant = whisperedToAccountIDs.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedToAccountIDs);
    const whisperedToPersonalDetails = isWhisper ? _.filter(personalDetails, (details) => _.includes(whisperedToAccountIDs, details.accountID)) : [];
    const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];
    return (
        <PressableWithSecondaryInteraction
            pointerEvents={props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? 'none' : 'auto'}
            ref={popoverAnchorRef}
            onPressIn={() => props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
            onPressOut={() => ControlSelection.unblock()}
            onSecondaryInteraction={showPopover}
            preventDefaultContextMenu={!props.draftMessage && !hasErrors}
            withoutFocusOnSecondaryInteraction
            accessibilityLabel={props.translate('accessibilityHints.chatMessage')}
        >
            <Hoverable
                shouldHandleScroll
                disabled={Boolean(props.draftMessage)}
            >
                {(hovered) => (
                    <View style={highlightedBackgroundColorIfNeeded}>
                        {props.shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={props.action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={props.report.reportID}
                            reportActionID={props.action.reportActionID}
                            originalReportID={originalReportID}
                            isArchivedRoom={ReportUtils.isArchivedRoom(props.report)}
                            displayAsGroup={props.displayAsGroup}
                            isVisible={hovered && !props.draftMessage && !hasErrors}
                            draftMessage={props.draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(originalReport)}
                        />
                        <View style={StyleUtils.getReportActionItemStyle(hovered || isWhisper || isContextMenuActive || props.draftMessage)}>
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearReportActionErrors(props.report.reportID, props.action)}
                                pendingAction={props.draftMessage ? null : props.action.pendingAction}
                                shouldHideOnDelete={!ReportActionsUtils.isThreadParentMessage(props.action, props.report.reportID)}
                                errors={props.action.errors}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(props.action)}
                                shouldDisableStrikeThrough
                            >
                                {isWhisper && (
                                    <View style={[styles.flexRow, styles.pl5, styles.pt2, styles.pr3]}>
                                        <View style={[styles.pl6, styles.mr3]}>
                                            <Icon
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
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}_${props.action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
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
        emojiReactions: {
            key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`,
            initialValue: {},
        },
        userWallet: {
            key: ONYXKEYS.USER_WALLET,
        },
    }),
)(
    memo(
        ReportActionItem,
        (prevProps, nextProps) =>
            prevProps.displayAsGroup === nextProps.displayAsGroup &&
            prevProps.draftMessage === nextProps.draftMessage &&
            prevProps.isMostRecentIOUReportAction === nextProps.isMostRecentIOUReportAction &&
            prevProps.hasOutstandingIOU === nextProps.hasOutstandingIOU &&
            prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
            _.isEqual(prevProps.emojiReactions, nextProps.emojiReactions) &&
            _.isEqual(prevProps.action, nextProps.action) &&
            _.isEqual(prevProps.report.pendingFields, nextProps.report.pendingFields) &&
            _.isEqual(prevProps.report.isDeletedParentAction, nextProps.report.isDeletedParentAction) &&
            _.isEqual(prevProps.report.errorFields, nextProps.report.errorFields) &&
            lodashGet(prevProps.report, 'statusNum') === lodashGet(nextProps.report, 'statusNum') &&
            lodashGet(prevProps.report, 'stateNum') === lodashGet(nextProps.report, 'stateNum') &&
            prevProps.translate === nextProps.translate &&
            // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
            ReportUtils.isTaskReport(prevProps.report) === ReportUtils.isTaskReport(nextProps.report) &&
            prevProps.action.actionName === nextProps.action.actionName &&
            prevProps.report.reportName === nextProps.report.reportName &&
            prevProps.report.description === nextProps.report.description &&
            ReportUtils.isCompletedTaskReport(prevProps.report) === ReportUtils.isCompletedTaskReport(nextProps.report) &&
            prevProps.report.managerID === nextProps.report.managerID &&
            prevProps.report.managerEmail === nextProps.report.managerEmail &&
            prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
            lodashGet(prevProps.report, 'total', 0) === lodashGet(nextProps.report, 'total', 0) &&
            lodashGet(prevProps.report, 'nonReimbursableTotal', 0) === lodashGet(nextProps.report, 'nonReimbursableTotal', 0) &&
            prevProps.linkedReportActionID === nextProps.linkedReportActionID,
    ),
);
