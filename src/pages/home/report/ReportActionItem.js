import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import CONST from '../../../CONST';
import ONYXKEYS from '../../../ONYXKEYS';
import ReportActionPropTypes from './ReportActionPropTypes';
import {
    getReportActionItemStyle,
    getMiniReportActionContextMenuWrapperStyle,
} from '../../../styles/getReportActionItemStyles';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import Hoverable from '../../../components/Hoverable';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import ReportActionContextMenu from './ReportActionContextMenu';

const propTypes = {
    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReport: PropTypes.bool.isRequired,

    /* --- Onyx Props --- */
    // List of betas for the current user.
    betas: PropTypes.arrayOf(PropTypes.string),

    // The report currently being looked at
    report: PropTypes.shape({

        // IOU report ID associated with current report
        iouReportID: PropTypes.number,
    }).isRequired,
};

const defaultProps = {
    betas: {},
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
        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.props.displayAsGroup !== nextProps.displayAsGroup
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
        return (
            <PressableWithSecondaryInteraction onSecondaryInteraction={this.showPopover}>
                <Hoverable>
                    {hovered => (
                        <View>
                            <View style={getReportActionItemStyle(hovered)}>
                                {!this.props.displayAsGroup
                                    ? (
                                        <ReportActionItemSingle
                                            action={this.props.action}
                                            iouReportID={this.props.report.iouReportID}
                                            isMostRecentIOUReport={this.props.isMostRecentIOUReport}
                                        />
                                    )
                                    : (
                                        <ReportActionItemGrouped
                                            action={this.props.action}
                                            iouReportID={this.props.report.iouReportID}
                                            isMostRecentIOUReport={this.props.isMostRecentIOUReport}
                                        />
                                    )}
                            </View>
                            <View style={getMiniReportActionContextMenuWrapperStyle(this.props.displayAsGroup)}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={
                                        hovered
                                        && this.isInReportActionContextMenuBeta()
                                        && !this.state.isPopoverVisible
                                    }
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
