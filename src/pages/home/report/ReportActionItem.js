import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ReportActionItemSingle from './ReportActionItemSingle';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemGrouped from './ReportActionItemGrouped';
import getReportActionItemStyles from '../../../styles/getReportActionItemStyles';
import styles from '../../../styles/styles';
import ReportActionContextMenu from './ReportActionContextMenu';
import Hoverable from '../../../components/Hoverable';
import CONST from '../../../CONST';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import PopoverWithMeasuredContent from '../../../components/PopoverWithMeasuredContent';

const POPOVER_ANCHOR_ORIGIN = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

const propTypes = {
    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    ...windowDimensionsPropTypes,
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
        };

        // The horizontal and vertical position (relative to the screen) where the popover will display.
        this.popoverAnchorPosition = {
            horizontal: 0,
            vertical: 0,
        };

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
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
    showModal(event) {
        const nativeEvent = event.nativeEvent || {};
        this.capturePressLocation(nativeEvent);
        this.setState({isModalVisible: true});
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hideModal() {
        this.setState({isModalVisible: false});
    }

    render() {
        return (
            <PressableWithSecondaryInteraction onSecondaryInteraction={this.showModal}>
                <Hoverable>
                    {hovered => (
                        <View>
                            <View style={getReportActionItemStyles(hovered)}>
                                {!this.props.displayAsGroup
                                    ? <ReportActionItemSingle action={this.props.action} />
                                    : <ReportActionItemGrouped action={this.props.action} />}
                            </View>
                            <View style={styles.miniReportActionContextMenuWrapperStyle}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={hovered && !this.state.isModalVisible}
                                    isMini
                                />
                            </View>
                            <PopoverWithMeasuredContent
                                isVisible={this.state.isModalVisible}
                                onClose={this.hideModal}
                                popoverPosition={this.popoverAnchorPosition}
                                anchorOrigin={POPOVER_ANCHOR_ORIGIN}
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
                                    isVisible={this.state.isModalVisible}
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

export default withWindowDimensions(ReportActionItem);
