import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useRef, useEffect, memo, useCallback} from 'react';
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
import {withBlockedFromConcierge, withNetwork, withPersonalDetails, withReportActionsDrafts} from '../../../components/OnyxProvider';
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
import personalDetailsPropType from '../../personalDetailsPropType';
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
import ReportActionItemBasicMessage from './ReportActionItemBasicMessage';
import * as store from '../../../libs/actions/ReimbursementAccount/store';
import * as BankAccounts from '../../../libs/actions/BankAccounts';

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
    personalDetailsList: PropTypes.objectOf(personalDetailsPropType),

    /** Is this the only report action on the report? */
    isOnlyReportAction: PropTypes.bool,
};

const defaultProps = {
    draftMessage: '',
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    emojiReactions: {},
    personalDetailsList: {},
    shouldShowSubscriptAvatar: false,
    hasOutstandingIOU: false,
    isOnlyReportAction: false,
};

function ReportActionItem(props) {
    const [isContextMenuActive, setIsContextMenuActive] = useState(ReportActionContextMenu.isActiveReportAction(props.action.reportActionID));
    const [isHidden, setIsHidden] = useState(false);
    const [moderationDecision, setModerationDecision] = useState(CONST.MODERATION.MODERATOR_DECISION_APPROVED);
    const textInputRef = useRef();
    const popoverAnchorRef = useRef();
    const downloadedPreviews = useRef([]);

    useEffect(
        () => () => {
            // ReportActionContextMenu and EmojiPicker are global component,
            // we use showContextMenu and showEmojiPicker to show them,
            // so we should also hide them when the current component is destroyed
            if (ReportActionContextMenu.isActiveReportAction(props.action.reportActionID)) {
                ReportActionContextMenu.hideContextMenu();
                ReportActionContextMenu.hideDeleteModal();
            }
            if (EmojiPickerAction.isActiveReportAction(props.action.reportActionID)) {
                EmojiPickerAction.hideEmojiPicker(true);
            }
        },
        [props.action.reportActionID],
    );

    const isDraftEmpty = !props.draftMessage;
    useEffect(() => {
        if (isDraftEmpty) {
            return;
        }

        focusTextInputAfterAnimation(textInputRef.current, 100);
    }, [isDraftEmpty]);

    useEffect(() => {
        const urls = ReportActionsUtils.extractLinksFromMessageHtml(props.action);
        if (_.isEqual(downloadedPreviews.current, urls) || props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        downloadedPreviews.current = urls;
        Report.expandURLPreview(props.report.reportID, props.action.reportActionID);
    }, [props.action, props.report.reportID]);

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
                props.action,
                props.draftMessage,
                () => {},
                toggleContextMenuFromActiveReportAction,
                ReportUtils.isArchivedRoom(props.report),
                ReportUtils.chatIncludesChronos(props.report),
            );
        },
        [props.draftMessage, props.action, props.report, toggleContextMenuFromActiveReportAction],
    );

    const toggleReaction = useCallback(
        (emoji) => {
            Report.toggleEmojiReaction(props.report.reportID, props.action, emoji, props.emojiReactions);
        },
        [props.report, props.action, props.emojiReactions],
    );

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @returns {Object} child component(s)
     */
    const renderItemContent = (hovered = false) => {
        let children;
        const originalMessage = lodashGet(props.action, 'originalMessage', {});

        // IOUDetails only exists when we are sending money
        const isSendingMoney = originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails');

        // Show the IOUPreview for when request was created, bill was split or money was sent
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
                />
            );
        } else if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = (
                <ReportPreview
                    iouReportID={ReportActionsUtils.getIOUReportIDFromReportActionPreview(props.action)}
                    chatReportID={props.report.reportID}
                    containerStyles={props.displayAsGroup ? [] : [styles.mt2]}
                    action={props.action}
                    isHovered={hovered}
                    contextMenuAnchor={popoverAnchorRef}
                    checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
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
            const submitterDisplayName = PersonalDetailsUtils.getDisplayNameOrDefault(props.personalDetailsList, [props.report.ownerAccountID, 'displayName'], props.report.ownerEmail);
            const shouldShowAddCreditBankAccountButton =
                ReportUtils.isCurrentUserSubmitter(props.report.reportID) && !store.hasCreditBankAccount() && !ReportUtils.isSettled(props.report.reportID);

            children = (
                <ReportActionItemBasicMessage message={props.translate('iou.waitingOnBankAccount', {submitterDisplayName})}>
                    {shouldShowAddCreditBankAccountButton ? (
                        <Button
                            success
                            style={[styles.w100, styles.requestPreviewBox]}
                            text={props.translate('bankAccount.addBankAccount')}
                            onPress={() => BankAccounts.openPersonalBankAccountSetupView(props.report.reportID)}
                            pressOnEnter
                        />
                    ) : null}
                </ReportActionItemBasicMessage>
            );
        } else {
            const message = _.last(lodashGet(props.action, 'message', [{}]));
            const hasBeenFlagged = !_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision);
            const isAttachment = _.has(props.action, 'isAttachment') ? props.action.isAttachment : ReportUtils.isReportMessageAttachment(message);
            children = (
                <ShowContextMenuContext.Provider
                    value={{
                        anchor: popoverAnchorRef,
                        report: props.report,
                        action: props.action,
                        checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
                    }}
                >
                    {!props.draftMessage ? (
                        <View style={props.displayAsGroup && hasBeenFlagged ? styles.blockquote : {}}>
                            <ReportActionItemMessage
                                action={props.action}
                                isHidden={isHidden}
                                style={[
                                    !props.displayAsGroup && isAttachment ? styles.mt2 : undefined,
                                    _.contains([..._.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), CONST.REPORT.ACTIONS.TYPE.IOU], props.action.actionName)
                                        ? styles.colorMuted
                                        : undefined,
                                ]}
                            />
                            {hasBeenFlagged && (
                                <Button
                                    small
                                    style={[styles.mt2, styles.alignSelfStart]}
                                    onPress={() => setIsHidden(!isHidden)}
                                >
                                    <Text
                                        style={styles.buttonSmallText}
                                        selectable={false}
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
                {!isHidden && !_.isEmpty(props.action.linkMetadata) && (
                    <View style={props.draftMessage ? styles.chatItemReactionsDraftRight : {}}>
                        <LinkPreviewer linkMetadata={_.filter(props.action.linkMetadata, (item) => !_.isEmpty(item))} />
                    </View>
                )}
                {!ReportActionsUtils.isMessageDeleted(props.action) && (
                    <View style={draftMessageRightAlign}>
                        <ReportActionItemEmojiReactions
                            reportActionID={props.action.reportActionID}
                            emojiReactions={props.emojiReactions}
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
                            icons={ReportUtils.getIconsForParticipants(oldestFourAccountIDs, props.personalDetailsList)}
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
     * @returns {Object} report action item
     */
    const renderReportActionItem = (hovered, isWhisper) => {
        const content = renderItemContent(hovered || isContextMenuActive);

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
                    hasBeenFlagged={!_.contains([CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING], moderationDecision)}
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}>{content}</ReportActionItemGrouped>;
    };

    if (props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        const parentReport = ReportActionsUtils.getParentReportAction(props.report);
        if (ReportActionsUtils.isTransactionThread(parentReport)) {
            return (
                <MoneyRequestView
                    report={props.report}
                    shouldShowHorizontalRule={!props.isOnlyReportAction}
                />
            );
        }
        if (ReportUtils.isTaskReport(props.report)) {
            return (
                <TaskView
                    report={props.report}
                    shouldShowHorizontalRule={!props.isOnlyReportAction}
                />
            );
        }
        if (ReportUtils.isExpenseReport(props.report) || ReportUtils.isIOUReport(props.report)) {
            return (
                <MoneyReportView
                    report={props.report}
                    shouldShowHorizontalRule={!props.isOnlyReportAction}
                />
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

    const hasErrors = !_.isEmpty(props.action.errors);
    const whisperedToAccountIDs = props.action.whisperedToAccountIDs || [];
    const isWhisper = whisperedToAccountIDs.length > 0;
    const isMultipleParticipant = whisperedToAccountIDs.length > 1;
    const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedToAccountIDs);
    const whisperedToPersonalDetails = isWhisper ? _.filter(props.personalDetailsList, (details) => _.includes(whisperedToAccountIDs, details.accountID)) : [];
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
            <Hoverable disabled={Boolean(props.draftMessage)}>
                {(hovered) => (
                    <View>
                        {props.shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={props.action.reportActionID} />}
                        <MiniReportActionContextMenu
                            reportID={props.report.reportID}
                            reportAction={props.action}
                            isArchivedRoom={ReportUtils.isArchivedRoom(props.report)}
                            displayAsGroup={props.displayAsGroup}
                            isVisible={hovered && !props.draftMessage && !hasErrors}
                            draftMessage={props.draftMessage}
                            isChronosReport={ReportUtils.chatIncludesChronos(props.report)}
                        />
                        <View
                            style={StyleUtils.getReportActionItemStyle(
                                hovered || isWhisper || isContextMenuActive || props.draftMessage,
                                (props.network.isOffline && props.action.isLoading) || props.action.error,
                            )}
                        >
                            <OfflineWithFeedback
                                onClose={() => ReportActions.clearReportActionErrors(props.report.reportID, props.action)}
                                pendingAction={props.draftMessage ? null : props.action.pendingAction}
                                shouldHideOnDelete={!ReportActionsUtils.hasCommentThread(props.action)}
                                errors={props.action.errors}
                                errorRowStyles={[styles.ml10, styles.mr2]}
                                needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(props.action)}
                            >
                                {isWhisper && (
                                    <View style={[styles.flexRow, styles.pl5, styles.pt2]}>
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
                                            textStyles={[styles.chatItemMessageHeaderTimestamp]}
                                            shouldUseFullTitle={isWhisperOnlyVisibleByUser}
                                        />
                                    </View>
                                )}
                                {renderReportActionItem(hovered, isWhisper)}
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
    withPersonalDetails(),
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${props.report.reportID}_${props.action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
    withOnyx({
        preferredSkinTone: {
            key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
        },
        emojiReactions: {
            key: ({action}) => `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${action.reportActionID}`,
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
            lodashGet(prevProps.report, 'statusNum') === lodashGet(nextProps.report, 'statusNum') &&
            lodashGet(prevProps.report, 'stateNum') === lodashGet(nextProps.report, 'stateNum') &&
            prevProps.translate === nextProps.translate &&
            // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
            ReportUtils.isTaskReport(prevProps.report) &&
            prevProps.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED &&
            ReportUtils.isTaskReport(nextProps.report) &&
            nextProps.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED &&
            prevProps.report.reportName === nextProps.report.reportName &&
            prevProps.report.description === nextProps.report.description &&
            ReportUtils.isCompletedTaskReport(prevProps.report) === ReportUtils.isCompletedTaskReport(nextProps.report) &&
            prevProps.report.managerID === nextProps.report.managerID &&
            prevProps.report.managerEmail === nextProps.report.managerEmail &&
            prevProps.isOnlyReportAction === nextProps.isOnlyReportAction,
    ),
);
