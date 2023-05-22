import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import MoneyRequestAction from '../../../components/ReportActionItem/MoneyRequestAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemCreated from './ReportActionItemCreated';
import ReportActionItemThread from './ReportActionItemThread';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import * as DeviceCapabilities from '../../../libs/DeviceCapabilities';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from './ContextMenu/ContextMenuActions';
import {withBlockedFromConcierge, withNetwork, withPersonalDetails, withReportActionsDrafts} from '../../../components/OnyxProvider';
import RenameAction from '../../../components/ReportActionItem/RenameAction';
import InlineSystemMessage from '../../../components/InlineSystemMessage';
import styles from '../../../styles/styles';
import SelectionScraper from '../../../libs/SelectionScraper';
import * as User from '../../../libs/actions/User';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReportActions from '../../../libs/actions/ReportActions';
import * as ReportActionsUtils from '../../../libs/ReportActionsUtils';
import reportPropTypes from '../../reportPropTypes';
import {ShowContextMenuContext} from '../../../components/ShowContextMenuContext';
import focusTextInputAfterAnimation from '../../../libs/focusTextInputAfterAnimation';
import ChronosOOOListActions from '../../../components/ReportActionItem/ChronosOOOListActions';
import ReportActionItemReactions from '../../../components/Reactions/ReportActionItemReactions';
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
import Permissions from '../../../libs/Permissions';

const propTypes = {
    /** Report for this action */
    report: reportPropTypes.isRequired,

    /** All the data of the action item */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool.isRequired,

    /** Is this the most recent IOU Action? */
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: PropTypes.bool,

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

    /** All of the personalDetails */
    personalDetails: PropTypes.objectOf(personalDetailsPropType),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    draftMessage: '',
    hasOutstandingIOU: false,
    preferredSkinTone: CONST.EMOJI_DEFAULT_SKIN_TONE,
    personalDetails: {},
    shouldShowSubscriptAvatar: false,
    betas: [],
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);
        this.popoverAnchor = undefined;
        this.state = {
            isContextMenuActive: ReportActionContextMenu.isActiveReportAction(props.action.reportActionID),
        };
        this.checkIfContextMenuActive = this.checkIfContextMenuActive.bind(this);
        this.showPopover = this.showPopover.bind(this);
        this.renderItemContent = this.renderItemContent.bind(this);
        this.toggleReaction = this.toggleReaction.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props.displayAsGroup !== nextProps.displayAsGroup ||
            this.props.draftMessage !== nextProps.draftMessage ||
            this.props.isMostRecentIOUReportAction !== nextProps.isMostRecentIOUReportAction ||
            this.props.hasOutstandingIOU !== nextProps.hasOutstandingIOU ||
            this.props.shouldDisplayNewMarker !== nextProps.shouldDisplayNewMarker ||
            !_.isEqual(this.props.action, nextProps.action) ||
            this.state.isContextMenuActive !== nextState.isContextMenuActive ||
            lodashGet(this.props.report, 'statusNum') !== lodashGet(nextProps.report, 'statusNum') ||
            lodashGet(this.props.report, 'stateNum') !== lodashGet(nextProps.report, 'stateNum') ||
            this.props.translate !== nextProps.translate
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.draftMessage || !this.props.draftMessage) {
            return;
        }

        // Only focus the input when user edits a message, skip it for existing drafts being edited of the report.
        // There is an animation when the comment is hidden and the edit form is shown, and there can be bugs on different mobile platforms
        // if the input is given focus in the middle of that animation which can prevent the keyboard from opening.
        focusTextInputAfterAnimation(this.textInput, 100);
    }

    checkIfContextMenuActive() {
        this.setState({isContextMenuActive: ReportActionContextMenu.isActiveReportAction(this.props.action.reportActionID)});
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    showPopover(event) {
        // Block menu on the message being Edited or if the report action item has errors
        if (this.props.draftMessage || !_.isEmpty(this.props.action.errors)) {
            return;
        }

        this.setState({isContextMenuActive: true});

        const selection = SelectionScraper.getCurrentSelection();
        ReportActionContextMenu.showContextMenu(
            ContextMenuActions.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            this.popoverAnchor,
            this.props.report.reportID,
            this.props.action,
            this.props.draftMessage,
            undefined,
            this.checkIfContextMenuActive,
            ReportUtils.isArchivedRoom(this.props.report),
            ReportUtils.chatIncludesChronos(this.props.report),
            this.props.action.childReportID,
        );
    }

    toggleReaction(emoji) {
        Report.toggleEmojiReaction(this.props.report.reportID, this.props.action, emoji);
    }

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @returns {Object} child component(s)
     */
    renderItemContent(hovered = false) {
        let children;
        const originalMessage = lodashGet(this.props.action, 'originalMessage', {});

        // IOUDetails only exists when we are sending money
        const isSendingMoney = originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails');

        // Show the IOUPreview for when request was created, bill was split or money was sent
        if (
            this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
            originalMessage &&
            // For the pay flow, we only want to show MoneyRequestAction when sending money. When paying, we display a regular system message
            (originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT || isSendingMoney)
        ) {
            // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
            const iouReportID = originalMessage.IOUReportID ? originalMessage.IOUReportID.toString() : '0';
            children = (
                <MoneyRequestAction
                    chatReportID={this.props.report.reportID}
                    requestReportID={iouReportID}
                    action={this.props.action}
                    isMostRecentIOUReportAction={this.props.isMostRecentIOUReportAction}
                    isHovered={hovered}
                    contextMenuAnchor={this.popoverAnchor}
                    checkIfContextMenuActive={this.checkIfContextMenuActive}
                    style={this.props.displayAsGroup ? [] : [styles.mt2]}
                />
            );
        } else if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) {
            children = (
                <ReportPreview
                    iouReportID={this.props.action.originalMessage.linkedReportID}
                    chatReportID={this.props.report.reportID}
                    action={this.props.action}
                    isHovered={hovered}
                    contextMenuAnchor={this.popoverAnchor}
                    checkIfContextMenuActive={this.checkIfContextMenuActive}
                />
            );
        } else if (
            this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
            this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELED ||
            this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        ) {
            children = (
                <TaskAction
                    taskReportID={this.props.action.originalMessage.taskReportID.toString()}
                    actionName={this.props.action.actionName}
                    isHovered={hovered}
                />
            );
        } else if (ReportActionsUtils.isCreatedTaskReportAction(this.props.action)) {
            children = (
                <TaskPreview
                    taskReportID={this.props.action.originalMessage.taskReportID.toString()}
                    action={this.props.action}
                    isHovered={hovered}
                />
            );
        } else {
            const message = _.last(lodashGet(this.props.action, 'message', [{}]));
            const isAttachment = _.has(this.props.action, 'isAttachment') ? this.props.action.isAttachment : ReportUtils.isReportMessageAttachment(message);
            children = (
                <ShowContextMenuContext.Provider
                    value={{
                        anchor: this.popoverAnchor,
                        report: this.props.report,
                        action: this.props.action,
                        checkIfContextMenuActive: this.checkIfContextMenuActive,
                    }}
                >
                    {!this.props.draftMessage ? (
                        <ReportActionItemMessage
                            action={this.props.action}
                            style={[
                                !this.props.displayAsGroup && isAttachment ? styles.mt2 : undefined,
                                _.contains([..._.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), CONST.REPORT.ACTIONS.TYPE.IOU], this.props.action.actionName)
                                    ? styles.colorMuted
                                    : undefined,
                            ]}
                        />
                    ) : (
                        <ReportActionItemMessageEdit
                            action={this.props.action}
                            draftMessage={this.props.draftMessage}
                            reportID={this.props.report.reportID}
                            index={this.props.index}
                            ref={(el) => (this.textInput = el)}
                            report={this.props.report}
                            // Avoid defining within component due to an existing Onyx bug
                            preferredSkinTone={this.props.preferredSkinTone}
                            shouldDisableEmojiPicker={
                                (ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge)) ||
                                ReportUtils.isArchivedRoom(this.props.report)
                            }
                        />
                    )}
                </ShowContextMenuContext.Provider>
            );
        }

        const reactions = _.get(this.props, ['action', 'message', 0, 'reactions'], []);
        const hasReactions = reactions.length > 0;
        const numberOfThreadReplies = _.get(this.props, ['action', 'childVisibleActionCount'], 0);
        const hasReplies = numberOfThreadReplies > 0;

        const shouldDisplayThreadReplies =
            hasReplies &&
            this.props.action.childCommenterCount &&
            Permissions.canUseThreads(this.props.betas) &&
            !ReportUtils.isThreadFirstChat(this.props.action, this.props.report.reportID);
        const oldestFourEmails = lodashGet(this.props.action, 'childOldestFourEmails', '').split(',');

        return (
            <>
                {children}
                {hasReactions && (
                    <View style={this.props.draftMessage ? styles.chatItemReactionsDraftRight : {}}>
                        <ReportActionItemReactions
                            reportActionID={this.props.action.reportActionID}
                            reactions={reactions}
                            toggleReaction={this.toggleReaction}
                        />
                    </View>
                )}
                {shouldDisplayThreadReplies && (
                    <ReportActionItemThread
                        childReportID={`${this.props.action.childReportID}`}
                        numberOfReplies={numberOfThreadReplies}
                        mostRecentReply={`${this.props.action.childLastVisibleActionCreated}`}
                        isHovered={hovered}
                        icons={ReportUtils.getIconsForParticipants(oldestFourEmails, this.props.personalDetails)}
                    />
                )}
            </>
        );
    }

    /**
     * Get ReportActionItem with a proper wrapper
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @param {Boolean} isWhisper whether the ReportActionItem is a whisper
     * @returns {Object} report action item
     */
    renderReportActionItem(hovered, isWhisper) {
        const content = this.renderItemContent(hovered || this.state.isContextMenuActive);

        if (this.props.draftMessage) {
            return <ReportActionItemDraft>{content}</ReportActionItemDraft>;
        }

        if (!this.props.displayAsGroup) {
            return (
                <ReportActionItemSingle
                    action={this.props.action}
                    showHeader={!this.props.draftMessage}
                    wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}
                    shouldShowSubscriptAvatar={this.props.shouldShowSubscriptAvatar}
                    report={this.props.report}
                >
                    {content}
                </ReportActionItemSingle>
            );
        }

        return <ReportActionItemGrouped wrapperStyles={[styles.chatItem, isWhisper ? styles.pt1 : {}]}>{content}</ReportActionItemGrouped>;
    }

    render() {
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return <ReportActionItemCreated reportID={this.props.report.reportID} />;
        }
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            return <RenameAction action={this.props.action} />;
        }
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST) {
            return (
                <ChronosOOOListActions
                    action={this.props.action}
                    reportID={this.props.report.reportID}
                />
            );
        }

        const hasErrors = !_.isEmpty(this.props.action.errors);
        const whisperedTo = lodashGet(this.props.action, 'whisperedTo', []);
        const isWhisper = whisperedTo.length > 0;
        const isMultipleParticipant = whisperedTo.length > 1;
        const isWhisperOnlyVisibleByUser = isWhisper && ReportUtils.isCurrentUserTheOnlyParticipant(whisperedTo);
        const whisperedToPersonalDetails = isWhisper ? _.filter(this.props.personalDetails, (details) => _.includes(whisperedTo, details.login)) : [];
        const displayNamesWithTooltips = isWhisper ? ReportUtils.getDisplayNamesWithTooltips(whisperedToPersonalDetails, isMultipleParticipant) : [];
        return (
            <PressableWithSecondaryInteraction
                pointerEvents={this.props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ? 'none' : 'auto'}
                ref={(el) => (this.popoverAnchor = el)}
                onPressIn={() => this.props.isSmallScreenWidth && DeviceCapabilities.canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onSecondaryInteraction={this.showPopover}
                preventDefaultContextMenu={!this.props.draftMessage && !hasErrors}
                withoutFocusOnSecondaryInteraction
            >
                <Hoverable>
                    {(hovered) => (
                        <View accessibilityLabel={this.props.translate('accessibilityHints.chatMessage')}>
                            {this.props.shouldDisplayNewMarker && <UnreadActionIndicator reportActionID={this.props.action.reportActionID} />}
                            <MiniReportActionContextMenu
                                reportID={this.props.report.reportID}
                                reportAction={this.props.action}
                                isArchivedRoom={ReportUtils.isArchivedRoom(this.props.report)}
                                displayAsGroup={this.props.displayAsGroup}
                                isVisible={hovered && !this.props.draftMessage && !hasErrors}
                                draftMessage={this.props.draftMessage}
                                isChronosReport={ReportUtils.chatIncludesChronos(this.props.report)}
                            />
                            <View
                                style={StyleUtils.getReportActionItemStyle(
                                    hovered || isWhisper || this.state.isContextMenuActive || this.props.draftMessage,
                                    (this.props.network.isOffline && this.props.action.isLoading) || this.props.action.error,
                                )}
                            >
                                <OfflineWithFeedback
                                    onClose={() => ReportActions.clearReportActionErrors(this.props.report.reportID, this.props.action)}
                                    pendingAction={this.props.draftMessage ? null : this.props.action.pendingAction}
                                    errors={this.props.action.errors}
                                    errorRowStyles={[styles.ml10, styles.mr2]}
                                    needsOffscreenAlphaCompositing={ReportActionsUtils.isMoneyRequestAction(this.props.action)}
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
                                                {this.props.translate('reportActionContextMenu.onlyVisible')}
                                                &nbsp;
                                            </Text>
                                            <DisplayNames
                                                fullTitle={ReportUtils.getWhisperDisplayNames(whisperedTo)}
                                                displayNamesWithTooltips={displayNamesWithTooltips}
                                                tooltipEnabled
                                                numberOfLines={1}
                                                textStyles={[styles.chatItemMessageHeaderTimestamp]}
                                                shouldUseFullTitle={isWhisperOnlyVisibleByUser}
                                            />
                                        </View>
                                    )}
                                    {this.renderReportActionItem(hovered, isWhisper)}
                                </OfflineWithFeedback>
                            </View>
                        </View>
                    )}
                </Hoverable>
                <View style={styles.reportActionSystemMessageContainer}>
                    <InlineSystemMessage message={this.props.action.error} />
                </View>
            </PressableWithSecondaryInteraction>
        );
    }
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
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(ReportActionItem);
