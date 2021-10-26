import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import reportActionPropTypes from './reportActionPropTypes';
import {
    getReportActionItemStyle,
} from '../../../styles/getReportActionItemStyles';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import IOUAction from '../../../components/ReportActionItem/IOUAction';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';
import ReportActionItemMessageEdit from './ReportActionItemMessageEdit';
import compose from '../../../libs/compose';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import ControlSelection from '../../../libs/ControlSelection';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import {isActiveReportAction, showContextMenu} from './ContextMenu/ReportActionContextMenu';
import {CONTEXT_MENU_TYPES} from './ContextMenu/ContextMenuActions';
import {withReportActionsDrafts} from '../../../components/OnyxProvider';

const propTypes = {
    /** The ID of the report this action is on. */
    reportID: PropTypes.number.isRequired,

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
            isContextMenuActive: isActiveReportAction(props.action.reportActionID),
        };
        this.checkIfContextMenuActive = this.checkIfContextMenuActive.bind(this);
        this.showPopover = this.showPopover.bind(this);
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

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     * @param {string} [selection] - A copy text.
     */
    showPopover(event, selection) {
        // Block menu on the message being Edited
        if (this.props.draftMessage) {
            return;
        }
        showContextMenu(
            CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection,
            this.popoverAnchor,
            this.props.reportID,
            this.props.action,
            this.props.draftMessage,
            this.checkIfContextMenuActive,
            this.checkIfContextMenuActive,
        );
    }

    checkIfContextMenuActive() {
        this.setState({isContextMenuActive: isActiveReportAction(this.props.action.reportActionID)});
    }

    render() {
        let children;
        if (this.props.action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
            children = (
                <IOUAction
                    chatReportID={this.props.reportID}
                    action={this.props.action}
                    isMostRecentIOUReportAction={this.props.isMostRecentIOUReportAction}
                />
            );
        } else {
            children = !this.props.draftMessage
                ? <ReportActionItemMessage action={this.props.action} />
                : (
                    <ReportActionItemMessageEdit
                            action={this.props.action}
                            draftMessage={this.props.draftMessage}
                            reportID={this.props.reportID}
                            index={this.props.index}
                    />
                );
        }
        return (
            <PressableWithSecondaryInteraction
                ref={el => this.popoverAnchor = el}
                onPressIn={() => this.props.isSmallScreenWidth && canUseTouchScreen() && ControlSelection.block()}
                onPressOut={() => ControlSelection.unblock()}
                onSecondaryInteraction={this.showPopover}
                preventDefaultContentMenu={!this.props.draftMessage}

            >
                <Hoverable resetsOnClickOutside={false}>
                    {hovered => (
                        <View>
                            {this.props.shouldDisplayNewIndicator && (
                                <UnreadActionIndicator />
                            )}
                            <View
                                style={getReportActionItemStyle(
                                    hovered
                                    || this.state.isContextMenuActive
                                    || this.props.draftMessage,
                                )}
                            >
                                {!this.props.displayAsGroup
                                    ? (
                                        <ReportActionItemSingle action={this.props.action}>
                                            {children}
                                        </ReportActionItemSingle>
                                    )
                                    : (
                                        <ReportActionItemGrouped>
                                            {children}
                                        </ReportActionItemGrouped>
                                    )}
                            </View>
                            <MiniReportActionContextMenu
                                reportID={this.props.reportID}
                                reportAction={this.props.action}
                                displayAsGroup={this.props.displayAsGroup}
                                isVisible={
                                    hovered
                                    && !this.state.isContextMenuActive
                                    && !this.props.draftMessage

                                }
                                draftMessage={this.props.draftMessage}
                            />
                        </View>
                    )}
                </Hoverable>
            </PressableWithSecondaryInteraction>
        );
    }
}
ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withReportActionsDrafts({
        propName: 'draftMessage',
        transformValue: (drafts, props) => {
            const {reportID, action} = props;
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}_${action.reportActionID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
)(ReportActionItem);
