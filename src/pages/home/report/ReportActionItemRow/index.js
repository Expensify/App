import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable, View} from 'react-native';
import propTypes from './ReportActionItemRowPropTypes';
import styles from '../../../../styles/styles';
import Hoverable from '../../../../components/Hoverable';
import PopoverWithMeasuredContent from '../../../../components/PopoverWithMeasuredContent';
import ReportActionItem from '../ReportActionItem';
import ReportActionContextMenu from '../ReportActionContextMenu';
import getReportActionItemStyles from '../../../../styles/getReportActionItemRowStyles';

class ReportActionItemRow extends Component {
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
        // Use underscore's isEqual to do a deep comparison of props.
        // We can't use PureComponent because its shallow comparison wouldn't detect changes in the `action` prop.
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
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

        // // Only show the popover onLongPress if the longPress is a touch and not a mouse click
        // if (nativeEvent.type !== 'mousedown') {
        //     this.capturePressLocation(nativeEvent);
        //     this.setState({isPopoverVisible: true});
        // }
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hidePopover() {
        this.setState({isPopoverVisible: false});
    }

    render() {
        return (
            <Pressable onLongPress={this.showPopover}>
                <Hoverable>
                    {hovered => (
                        <View>
                            <View style={getReportActionItemStyles(hovered)}>
                                <ReportActionItem
                                    action={this.props.action}
                                    displayAsGroup={this.props.displayAsGroup}
                                />
                            </View>
                            <View style={styles.miniReportActionContextMenuWrapperStyle}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={hovered && !this.state.isPopoverVisible}
                                    isMini
                                />
                            </View>
                            <PopoverWithMeasuredContent
                                isVisible={this.state.isPopoverVisible}
                                onClose={this.hidePopover}
                                anchorPosition={this.popoverAnchorPosition}
                                animationIn="bounceIn"
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
            </Pressable>
        );
    }
}

ReportActionItemRow.propTypes = propTypes;

export default ReportActionItemRow;
