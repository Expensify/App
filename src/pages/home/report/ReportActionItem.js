import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ReportActionPropTypes from './ReportActionPropTypes';
import styles from '../../../styles/styles';
import getReportActionItemStyles from '../../../styles/getReportActionItemStyles';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionContextMenu from './ReportActionContextMenu';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';

const propTypes = {
    // The index of this action in the flatList
    index: PropTypes.number.isRequired,

    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Function to trigger when mark as unread is selected
    onMarkAsUnread: PropTypes.func.isRequired,

    /* --- Onyx Props --- */
    // List of betas for the current user.
    betas: PropTypes.arrayOf(PropTypes.string),

    // The report currently being looked at
    report: PropTypes.shape({
        // Number of actions unread
        unreadActionCount: PropTypes.number,
    }),
};

const defaultProps = {
    betas: {},
    report: {
        unreadActionCount: 0,
    },
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPopoverVisible: false,
        };

        // The horizontal and vertical position (relative to the screen) where the popover will display.
        this.popoverAnchorPosition = {
            horizontal: 0,
            vertical: 0,
        };

        this.isInReportActionContextMenuBeta = this.isInReportActionContextMenuBeta.bind(this);
        this.showPopover = this.showPopover.bind(this);
        this.hidePopover = this.hidePopover.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const hasNewDisplayChanged = nextProps.report.unreadActionCount > 0
            && ((this.props.index === this.props.report.unreadActionCount - 1)
                !== (nextProps.index === nextProps.report.unreadActionCount - 1));

        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.props.displayAsGroup !== nextProps.displayAsGroup
            || hasNewDisplayChanged
            || !_.isEqual(this.props.action, nextProps.action);
    }

    /**
     * Is the current user in the ReportActionContextMenu beta?
     *
     * @returns {Boolean}
     */
    isInReportActionContextMenuBeta() {
        return _.contains(this.props.betas, CONST.BETAS.REPORT_ACTION_CONTEXT_MENU)
            || _.contains(this.props.betas, CONST.BETAS.ALL);
    }

    /**
     * Save the location of a native press event.
     *
     * @param {Object} nativeEvent
     */
    capturePressLocation(nativeEvent) {
        this.popoverAnchorPosition = {
            horizontal: nativeEvent.pageX,
            vertical: nativeEvent.pageY,
        };
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    showPopover(event) {
        const nativeEvent = event.nativeEvent || {};
        this.capturePressLocation(nativeEvent);
        if (this.isInReportActionContextMenuBeta()) {
            this.setState({isPopoverVisible: true});
        }
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hidePopover() {
        this.setState({isPopoverVisible: false});
    }

    render() {
        const displayNewIndicator = this.props.report.unreadActionCount > 0
            && this.props.index === this.props.report.unreadActionCount - 1;
        return (
            <PressableWithSecondaryInteraction onSecondaryInteraction={this.showPopover}>
                <Hoverable>
                    {hovered => (
                        <View>
                            {displayNewIndicator && <UnreadActionIndicator />}
                            <View style={getReportActionItemStyles(hovered)}>
                                {!this.props.displayAsGroup
                                    ? <ReportActionItemSingle action={this.props.action} />
                                    : <ReportActionItemGrouped action={this.props.action} />}
                            </View>
                            <View style={styles.miniReportActionContextMenuWrapperStyle}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={
                                        hovered
                                        && this.isInReportActionContextMenuBeta()
                                        && !this.state.isPopoverVisible
                                    }
                                    onMarkAsUnread={this.props.onMarkAsUnread}
                                    isMini
                                />
                            </View>
                            <PopoverWithMeasuredContent
                                isVisible={this.state.isPopoverVisible}
                                onClose={this.hidePopover}
                                anchorPosition={this.popoverAnchorPosition}
                                animationIn="fadeIn"
                                measureContent={() => (
                                    <ReportActionContextMenu
                                        isVisible
                                        reportID={-1}
                                        reportActionID={-1}
                                    />
                                )}
                            >
                                <ReportActionContextMenu
                                    isVisible={this.state.isPopoverVisible}
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    onMarkAsUnread={this.props.onMarkAsUnread}
                                />
                            </PopoverWithMeasuredContent>
                        </View>
                    )}
                </Hoverable>
            </PressableWithSecondaryInteraction>
        );
    }
}

ReportActionItem.propTypes = propTypes;
ReportActionItem.defaultProps = defaultProps;

export default withOnyx({
    betas: {
        key: ONYXKEYS.BETAS,
    },
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
})(ReportActionItem);
