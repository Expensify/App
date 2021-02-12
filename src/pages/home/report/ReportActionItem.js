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

    ...windowDimensionsPropTypes,
};

class ReportActionItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
        };

        // The X and Y position (relative to the page) where the popover will display.
        this.popoverAnchorX = null;
        this.popoverAnchorY = null;

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
                                )}
                            >
                                <ReportActionContextMenu
                                    reportID={this.props.reportID}
                                    reportActionID={this.props.action.sequenceNumber}
                                    isVisible={this.state.isModalVisible}
                                />
                            </Modal>
                        </View>
                    )}
                </Hoverable>
            </PressableWithSecondaryInteraction>
        );
    }
}

ReportActionItem.propTypes = propTypes;

export default withWindowDimensions(ReportActionItem);
