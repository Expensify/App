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
import Modal from '../../../components/Modal';
import CONST from '../../../CONST';
import PressableWithSecondaryInteraction from '../../../components/PressableWithSecondaryInteraction';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import {isRightClick} from '../../../libs/PressEvents';

const propTypes = {
    // The ID of the report this action is on.
    reportID: PropTypes.number.isRequired,

    // All the data of the action item
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Should the comment have the appearance of being grouped with the previous comment?
    displayAsGroup: PropTypes.bool.isRequired,

    // Function to scroll the ReportActionsView to this item
    scrollToThis: PropTypes.func.isRequired,

    ...windowDimensionsPropTypes,
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
        };

        // The X and Y position (relative to the screen) where the popover will display.
        this.popoverAnchorX = null;
        this.popoverAnchorY = null;

        // The width and height of the ReportActionContextMenu popover.
        this.popoverWidth = null;
        this.popoverHeight = null;

        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.measurePopover = this.measurePopover.bind(this);
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
        this.popoverAnchorX = nativeEvent.screenX;
        this.popoverAnchorY = nativeEvent.screenY;
    }

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param {Object} [event] - A press event.
     */
    showModal(event) {
        const nativeEvent = event.nativeEvent || {};
        this.capturePressLocation(nativeEvent);

        // If the popover will display off-screen, scroll the ReportActionsView FlatList down to this item first.
        if (this.popoverAnchorY - this.popoverHeight < 0) {
            this.popoverAnchorY += (this.popoverHeight + 20);
            this.props.scrollToThis(this.popoverHeight + 20);
        }

        if (!this.props.isSmallScreenWidth) {
            // On large screens, only display the ReportActionContextMenu on RightClick, not LongPress.
            if (isRightClick(nativeEvent)) {
                this.setState({isModalVisible: true});
            }
        } else {
            this.setState({isModalVisible: true});
        }
    }

    /**
     * Hide the ReportActionContextMenu modal popover.
     */
    hideModal() {
        this.setState({isModalVisible: false});
    }

    /**
     * Measure the size of the ReportActionContextMenu popover.
     *
     * @param {Object} nativeEvent
     */
    measurePopover({nativeEvent}) {
        this.popoverWidth = nativeEvent.layout.width;
        this.popoverHeight = nativeEvent.layout.height;
    }

    render() {
        const {getContainerStyle, getModalStyleOverride} = getReportActionItemStyles();
        return (
            <PressableWithSecondaryInteraction onSecondaryInteraction={this.showModal}>
                <Hoverable>
                    {hovered => (
                        <View>
                            <View style={getContainerStyle(hovered)}>
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
                            <Modal
                                type={CONST.MODAL.MODAL_TYPE.POPOVER}
                                isVisible={this.state.isModalVisible}
                                onClose={this.hideModal}
                                styleOverride={getModalStyleOverride(
                                    this.props.windowWidth,
                                    this.props.windowHeight,
                                    this.popoverAnchorX,
                                    this.popoverAnchorY,
                                    this.popoverWidth,
                                    this.popoverHeight,
                                )}
                            >
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={this.state.isModalVisible}
                                />
                            </Modal>
                            {/*
                                HACK ALERT: This is an invisible view used to measure the size of the
                                ReportActionContextMenu popover before it ever needs to be displayed.
                                We do this because we need to know its dimensions in order to correctly
                                animate the popover, but we can't measure its dimensions without first animating it.
                            */}
                            <View style={{position: 'absolute', opacity: 0}} onLayout={this.measurePopover}>
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible
                                />
                            </View>
                        </View>
                    )}
                </Hoverable>
            </PressableWithSecondaryInteraction>
        );
    }
}

ReportActionItem.propTypes = propTypes;

export default withWindowDimensions(ReportActionItem);
