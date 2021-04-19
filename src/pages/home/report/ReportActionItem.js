import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
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
import ReportActionItemIOUPreview from '../../../components/ReportActionItemIOUPreview';
import ReportActionItemMessage from './ReportActionItemMessage';
import UnreadActionIndicator from '../../../components/UnreadActionIndicator';

const propTypes = {
    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Is this the most recent IOU Action?
    isMostRecentIOUReportAction: PropTypes.bool.isRequired,

    // Whether there is an outstanding amount in IOU
    hasOutstandingIOU: PropTypes.bool.isRequired,

    // IOU report ID associated with current report
    iouReportID: PropTypes.number,

    // Should we display the new indicator on top of the comment?
    shouldDisplayNewIndicator: PropTypes.bool.isRequired,
};

const defaultProps = {
    iouReportID: undefined,
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

        this.showPopover = this.showPopover.bind(this);
        this.hidePopover = this.hidePopover.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.isPopoverVisible !== nextState.isPopoverVisible
            || this.props.displayAsGroup !== nextProps.displayAsGroup
            || this.props.isMostRecentIOUReportAction !== nextProps.isMostRecentIOUReportAction
            || this.props.hasOutstandingIOU !== nextProps.hasOutstandingIOU
            || this.props.iouReportID !== nextProps.iouReportID
            || (this.props.shouldDisplayNewIndicator !== nextProps.shouldDisplayNewIndicator)
            || !_.isEqual(this.props.action, nextProps.action);
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
        this.setState({isPopoverVisible: true});
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hidePopover() {
        this.setState({isPopoverVisible: false});
    }

    render() {
        const children = this.props.action.actionName === 'IOU'
            ? (
                <ReportActionItemIOUPreview
                    iouReportID={this.props.iouReportID}
                    hasOutstandingIOU={this.props.hasOutstandingIOU}
                    action={this.props.action}
                    isMostRecentIOUReportAction={this.props.isMostRecentIOUReportAction}
                />
            )
            : <ReportActionItemMessage action={this.props.action} />;
        return (
            <PressableWithSecondaryInteraction onSecondaryInteraction={this.showPopover}>
                <Hoverable>
                    {hovered => (
                        <View>
                            {!hovered && this.props.shouldDisplayNewIndicator && (
                                <UnreadActionIndicator />
                            )}
                            <View style={getReportActionItemStyle(hovered)}>
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
                            <View style={getMiniReportActionContextMenuWrapperStyle(this.props.displayAsGroup)}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportAction={this.props.action}
                                    isVisible={
                                        hovered
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
                                animationOutTiming={1}
                                measureContent={() => (
                                    <ReportActionContextMenu
                                        isVisible
                                        reportID={-1}
                                        reportAction={this.props.action}
                                    />
                                )}
                            >
                                <ReportActionContextMenu
                                    isVisible
                                    reportID={this.props.reportID}
                                    reportAction={this.props.action}
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
export default ReportActionItem;
