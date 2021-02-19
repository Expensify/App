import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Modal from './Modal';
import {propTypes as modalPropTypes, defaultProps as defaultModalProps} from './Modal/ModalPropTypes';
import {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';
import styles from '../styles/styles';

const propTypes = {
    // All modal props except type, popoverAnchorPosition, and the windowDimensions prop types
    ...(_.omit(modalPropTypes, ['type', 'popoverAnchorPosition', ...(_.keys(windowDimensionsPropTypes))])),

    // The horizontal and vertical anchors points for the popover
    popoverPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    // Where the popover should be positioned relative to the anchor points.
    anchorOrigin: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    // Optionally pass in a function with content to measure.
    // Will use this.props.children by default, but if children are not displayed, then the measurement will not work.
    measureContent: PropTypes.func,
};

const defaultProps = {
    // Default modal props
    ...(_.omit(defaultModalProps, ['type', 'popoverAnchorPosition'])),

    // Default positioning of the popover
    anchorOrigin: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },

    // If this prop is null or undefined, then we'll measure the children instead
    measureContent: null,
};

class PopoverWithMeasuredContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isContentMeasured: false,
        };

        this.popoverWidth = 0;
        this.popoverHeight = 0;

        this.measurePopover = this.measurePopover.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    }

    /**
     * Measure the size of the popover's content.
     *
     * @param {Object} nativeEvent
     */
    measurePopover({nativeEvent}) {
        this.popoverWidth = nativeEvent.layout.width;
        this.popoverHeight = nativeEvent.layout.height;
        this.setState({isContentMeasured: true});
    }

    /**
     * Calculate the adjusted position of the popover.
     *
     * @returns {Object}
     */
    calculateAdjustedPopoverPosition() {
        let horizontalConstraint;
        switch (this.props.anchorOrigin.horizontal) {
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                horizontalConstraint = {left: this.props.popoverPosition.horizontal - this.popoverWidth};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                horizontalConstraint = {
                    left: Math.floor(this.props.popoverPosition.horizontal - (this.popoverWidth / 2)),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
            default:
                horizontalConstraint = {left: this.props.popoverPosition.horizontal};
        }

        let verticalConstraint;
        switch (this.props.anchorOrigin.vertical) {
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM:
                verticalConstraint = {top: this.props.popoverPosition.vertical - this.popoverHeight};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER:
                verticalConstraint = {
                    top: Math.floor(this.props.popoverPosition.vertical - (this.popoverHeight / 2)),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP:
            default:
                verticalConstraint = {top: this.props.popoverPosition.vertical};
        }

        return {
            ...horizontalConstraint,
            ...verticalConstraint,
        };
    }

    render() {
        return this.state.isContentMeasured
            ? (
                <Modal
                    type={CONST.MODAL.MODAL_TYPE.POPOVER}
                    isVisible={this.props.isVisible}
                    onClose={this.props.onClose}
                    popoverAnchorPosition={this.calculateAdjustedPopoverPosition()}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                >
                    {this.props.children}
                </Modal>
            ) : (

                /*
                    This is an invisible view used to measure the size of the popover,
                    before it ever needs to be displayed.
                    We do this because we need to know its dimensions in order to correctly animate the popover,
                    but we can't measure its dimensions without first animating it.
                */
                <View style={styles.invisible} onLayout={this.measurePopover}>
                    {(this.props.measureContent || (() => this.props.children))()}
                </View>
            );
    }
}

PopoverWithMeasuredContent.propTypes = propTypes;
PopoverWithMeasuredContent.defaultProps = defaultProps;

export default PopoverWithMeasuredContent;
