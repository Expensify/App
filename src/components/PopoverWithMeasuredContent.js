import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import Popover from './Popover';
import {propTypes as popoverPropTypes, defaultProps as defaultPopoverProps} from './Popover/popoverPropTypes';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';
import styles from '../styles/styles';
import {computeHorizontalShift, computeVerticalShift} from '../styles/getPopoverWithMeasuredContentStyles';

const propTypes = {
    // All popover props except:
    // 1) anchorPosition (which is overridden for this component)
    ...(_.omit(popoverPropTypes, ['anchorPosition'])),

    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    /** Where the popover should be positioned relative to the anchor points. */
    anchorOrigin: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /** A function with content to measure. This component will use this.props.children by default,
    but in the case the children are not displayed, the measurement will not work. */
    measureContent: PropTypes.func.isRequired,

    /** Static dimensions for the popover.
     * Note: When passed, it will skip dimensions measuring of the popover, and provided dimensions will be used to calculate the anchor position.
     */
    popoverDimensions: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
    }),

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    ...defaultPopoverProps,

    // Default positioning of the popover
    anchorOrigin: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    popoverDimensions: {
        height: 0,
        width: 0,
    },
};

/**
 * This is a convenient wrapper around the regular Popover component that allows us to use a more sophisticated
 * positioning schema responsively (without having to provide a static width and height for the popover content).
 * This way, we can shift the position of popover so that the content is anchored where we want it relative to the
 * anchor position.
 */
class PopoverWithMeasuredContent extends Component {
    constructor(props) {
        super(props);

        this.popoverWidth = lodashGet(this.props, 'popoverDimensions.width', 0);
        this.popoverHeight = lodashGet(this.props, 'popoverDimensions.height', 0);

        this.state = {
            isContentMeasured: this.popoverWidth > 0 && this.popoverHeight > 0,
            isVisible: false,
        };

        this.measurePopover = this.measurePopover.bind(this);
    }

    /**
     * When Popover becomes visible, we need to recalculate the Dimensions.
     * Skip render on Popover until recalculations have done by setting isContentMeasured false as early as possible.
     *
     * @static
     * @param {Object} props
     * @param {Object} state
     * @return {Object|null}
     */
    static getDerivedStateFromProps(props, state) {
        // When Popover is shown recalculate
        if (!state.isVisible && props.isVisible) {
            return {isContentMeasured: lodashGet(props, 'popoverDimensions.width', 0) > 0 && lodashGet(props, 'popoverDimensions.height', 0) > 0, isVisible: true};
        }
        if (!props.isVisible) {
            return {isVisible: false};
        }
        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.isVisible
            && (nextProps.windowWidth !== this.props.windowWidth
            || nextProps.windowHeight !== this.props.windowHeight)) {
            return true;
        }

        // This component does not require re-render until any prop or state changes as we get the necessary info
        // at first render. This component is attached to each message on the Chat list thus we prevent its re-renders
        return !_.isEqual(
            _.omit(this.props, ['windowWidth', 'windowHeight']),
            _.omit(nextProps, ['windowWidth', 'windowHeight']),
        ) || !_.isEqual(this.state, nextState);
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
    calculateAdjustedAnchorPosition() {
        let horizontalConstraint;
        switch (this.props.anchorOrigin.horizontal) {
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                horizontalConstraint = {left: this.props.anchorPosition.horizontal - this.popoverWidth};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                horizontalConstraint = {
                    left: Math.floor(this.props.anchorPosition.horizontal - (this.popoverWidth / 2)),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
            default:
                horizontalConstraint = {left: this.props.anchorPosition.horizontal};
        }

        let verticalConstraint;
        switch (this.props.anchorOrigin.vertical) {
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM:
                verticalConstraint = {top: this.props.anchorPosition.vertical - this.popoverHeight};
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER:
                verticalConstraint = {
                    top: Math.floor(this.props.anchorPosition.vertical - (this.popoverHeight / 2)),
                };
                break;
            case CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP:
            default:
                verticalConstraint = {top: this.props.anchorPosition.vertical};
        }

        return {
            ...horizontalConstraint,
            ...verticalConstraint,
        };
    }

    render() {
        const adjustedAnchorPosition = this.calculateAdjustedAnchorPosition();
        const horizontalShift = computeHorizontalShift(
            adjustedAnchorPosition.left,
            this.popoverWidth,
            this.props.windowWidth,
        );
        const verticalShift = computeVerticalShift(
            adjustedAnchorPosition.top,
            this.popoverHeight,
            this.props.windowHeight,
        );
        const shifedAnchorPosition = {
            left: adjustedAnchorPosition.left + horizontalShift,
            top: adjustedAnchorPosition.top + verticalShift,
        };
        return this.state.isContentMeasured
            ? (
                <Popover
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    anchorPosition={shifedAnchorPosition}
                >
                    {this.props.measureContent()}
                </Popover>
            ) : (

                /*
                    This is an invisible view used to measure the size of the popover,
                    before it ever needs to be displayed.
                    We do this because we need to know its dimensions in order to correctly animate the popover,
                    but we can't measure its dimensions without first rendering it.
                */
                <View style={styles.invisible} onLayout={this.measurePopover}>
                    {this.props.children}
                </View>
            );
    }
}

PopoverWithMeasuredContent.propTypes = propTypes;
PopoverWithMeasuredContent.defaultProps = defaultProps;

export default withWindowDimensions(PopoverWithMeasuredContent);
