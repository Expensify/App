import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Popover from './Popover';
import {propTypes as popoverPropTypes, defaultProps as defaultPopoverProps} from './Popover/PopoverPropTypes';
import {windowDimensionsPropTypes} from './withWindowDimensions';
import CONST from '../CONST';
import styles from '../styles/styles';

const propTypes = {
    // All popover props except:
    // 1) anchorPosition (which is overridden for this component)
    // 2) windowDimensionsPropTypes, which is unneeded.
    ...(_.omit(popoverPropTypes, ['anchorPosition', ...(_.keys(windowDimensionsPropTypes))])),

    // The horizontal and vertical anchors points for the popover
    anchorPosition: PropTypes.shape({
        horizontal: PropTypes.number.isRequired,
        vertical: PropTypes.number.isRequired,
    }).isRequired,

    // Where the popover should be positioned relative to the anchor points.
    anchorOrigin: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    // A function with content to measure. This component will use this.props.children by default,
    // but in the case the children are not displayed, the measurement will not work.
    measureContent: PropTypes.func.isRequired,
};

const defaultProps = {
    ...defaultPopoverProps,

    // Default positioning of the popover
    anchorOrigin: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
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
        return this.state.isContentMeasured
            ? (
                <Popover
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    anchorPosition={this.calculateAdjustedAnchorPosition()}
                >
                    {this.props.children}
                </Popover>
            ) : (

                /*
                    This is an invisible view used to measure the size of the popover,
                    before it ever needs to be displayed.
                    We do this because we need to know its dimensions in order to correctly animate the popover,
                    but we can't measure its dimensions without first rendering it.
                */
                <View style={styles.invisible} onLayout={this.measurePopover}>
                    {this.props.measureContent()}
                </View>
            );
    }
}

PopoverWithMeasuredContent.propTypes = propTypes;
PopoverWithMeasuredContent.defaultProps = defaultProps;

export default PopoverWithMeasuredContent;
