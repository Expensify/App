import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import * as StyleUtils from '../../../styles/StyleUtils';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import IOUAction from '../../../components/ReportActionItem/IOUAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import ReportActionItemCreated from './ReportActionItemCreated';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import * as ReportActionContextMenu from './ContextMenu/ReportActionContextMenu';
import * as ContextMenuActions from './ContextMenu/ContextMenuActions';
import {withBlockedFromConcierge, withNetwork, withReportActionsDrafts} from '../../../components/OnyxProvider';
import RenameAction from '../../../components/ReportActionItem/RenameAction';
import InlineSystemMessage from '../../../components/InlineSystemMessage';
import styles from '../../../styles/styles';
import SelectionScraper from '../../../libs/SelectionScraper';
import * as User from '../../../libs/actions/User';
import * as ReportUtils from '../../../libs/ReportUtils';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as ReportActions from '../../../libs/actions/ReportActions';
import reportPropTypes from '../../reportPropTypes';
import focusTextInputAfterAnimation from '../../../libs/focusTextInputAfterAnimation';

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

    /** Should we display the new indicator on top of the comment? */
    shouldDisplayNewIndicator: PropTypes.bool.isRequired,

    /** Position index of the report action in the overall report FlatList view */
    index: PropTypes.number.isRequired,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    draftMessage: '',
    hasOutstandingIOU: false,
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
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.displayAsGroup !== nextProps.displayAsGroup
            || this.props.draftMessage !== nextProps.draftMessage
            || this.props.isMostRecentIOUReportAction !== nextProps.isMostRecentIOUReportAction
            || this.props.hasOutstandingIOU !== nextProps.hasOutstandingIOU
            || this.props.shouldDisplayNewIndicator !== nextProps.shouldDisplayNewIndicator
            || !_.isEqual(this.props.action, nextProps.action)
            || this.state.isContextMenuActive !== nextState.isContextMenuActive;
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
        // Block menu on the message being Edited
        if (this.props.draftMessage) {
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
        );
    }

    /**
     * Get the content of ReportActionItem
     * @param {Boolean} hovered whether the ReportActionItem is hovered
     * @returns {Object} child component(s)
     */
    renderItemContent(hovered = false) {
        let children;
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
            children = (
                <IOUAction
                    chatReportID={this.props.report.reportID}
                    action={this.props.action}
                    isMostRecentIOUReportAction={this.props.isMostRecentIOUReportAction}
                    isHovered={hovered}
                />
            );
        } else {
            children = !this.props.draftMessage
                ? (
                    <ReportActionItemMessage action={this.props.action} />
                ) : (
                    <ReportActionItemMessageEdit
                        action={this.props.action}
                        draftMessage={this.props.draftMessage}
                        reportID={this.props.report.reportID}
                        index={this.props.index}
                        ref={el => this.textInput = el}
                        report={this.props.report}
                        shouldDisableEmojiPicker={
                            (ReportUtils.chatIncludesConcierge(this.props.report) && User.isBlockedFromConcierge(this.props.blockedFromConcierge))
                            || ReportUtils.isArchivedRoom(this.props.report)
                        }
                    />
                );
        }
        return children;
    }

    render() {
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return <ReportActionItemCreated reportID={this.props.report.reportID} />;
        }
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
            return <RenameAction action={this.props.action} />;
        }
        return (
            <PressableWithSecondaryInteraction
                ref={el => this.popoverAnchor = el}
                onPressIn={() => this.props.isSmallScreenWidth && canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onSecondaryInteraction={this.showPopover}
                preventDefaultContentMenu={!this.props.draftMessage}
            >
                <Hoverable>
                    {hovered => (
                        <View accessibilityLabel="Chat message">
                            {this.props.shouldDisplayNewIndicator && (
                                <UnreadActionIndicator sequenceNumber={this.props.action.sequenceNumber} />
                            )}
                            <View
                                style={StyleUtils.getReportActionItemStyle(
                                    hovered
                                    || this.state.isContextMenuActive
                                    || this.props.draftMessage,
                                    (this.props.network.isOffline && this.props.action.isLoading) || this.props.action.error,
                                )}
                            >
                                <OfflineWithFeedback
                                    onClose={() => {
                                        if (this.props.action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
                                            const sequenceNumber = this.props.action.actionName
                                              === CONST.REPORT.ACTIONS.TYPE.IOU
                                                ? this.props.action
                                                    .sequenceNumber
                                                : this.props.action.clientID;
                                            ReportActions.deleteOptimisticReportAction(this.props.report.reportID, sequenceNumber);
                                        } else {
                                            ReportActions.clearReportActionErrors(this.props.report.reportID, this.props.action.sequenceNumber);
                                        }
                                    }}
                                    pendingAction={this.props.draftMessage ? null : this.props.action.pendingAction}
                                    errors={this.props.action.errors}
                                    errorRowStyles={[styles.ml10, styles.mr2]}
                                >
                                    {!this.props.displayAsGroup
                                        ? (
                                            <ReportActionItemSingle action={this.props.action} showHeader={!this.props.draftMessage}>
                                                {this.renderItemContent(hovered || this.state.isContextMenuActive)}
                                            </ReportActionItemSingle>
                                        )
                                        : (
                                            <ReportActionItemGrouped>
                                                {this.renderItemContent(hovered || this.state.isContextMenuActive)}
                                            </ReportActionItemGrouped>
                                        )}
                                </OfflineWithFeedback>
                            </View>
                            <MiniReportActionContextMenu
                                reportID={this.props.report.reportID}
                                reportAction={this.props.action}
                                isArchivedRoom={ReportUtils.isArchivedRoom(this.props.report)}
                                displayAsGroup={this.props.displayAsGroup}
                                isVisible={
                                    hovered
                                    && !this.state.isContextMenuActive
                                    && !this.props.draftMessage
                                }
                                draftMessage={this.props.draftMessage}
                                isChronosReport={ReportUtils.chatIncludesChronos(this.props.report)}
                            />
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
    withNetwork(),
    withBlockedFromConcierge({propName: 'blockedFromConcierge'}),
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${props.report.reportID}_${props.action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
)(ReportActionItem);
