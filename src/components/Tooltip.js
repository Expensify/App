import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Animated, Text, View} from 'react-native';
import Hoverable from './Hoverable';
import withWindowDimensions, {windowDimensionsPropTypes} from './withWindowDimensions';
import getTooltipStyles from '../styles/getTooltipStyles';

const propTypes = {
    // The text to display in the tooltip.
    text: PropTypes.string.isRequired,

    // Children to wrap with Tooltip.
    children: PropTypes.node.isRequired,

    // Props inherited from withWindowDimensions
    ...windowDimensionsPropTypes,
};

class Tooltip extends Component {
    constructor(props) {
        super(props);

        this.animation = new Animated.Value(0);

        // The wrapper view containing the wrapped content along with the Tooltip itself.
        this.wrapperView = null;
        this.wrapperWidth = 0;
        this.wrapperHeight = 0;

        // The tooltip (popover) itself.
        this.tooltip = null;
        this.tooltipWidth = 0;
        this.tooltipHeight = 0;

        // The distance between the left side of the rendered view and the left side of the window
        this.xOffset = 0;

        // The distance between the top of the rendered view and the top of the window
        this.yOffset = 0;

        this.measureWrapperAndGetPosition = this.measureWrapperAndGetPosition.bind(this);
        this.measureTooltip = this.measureTooltip.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    /**
     * Measure the size and position of the wrapper view.
     */
    measureWrapperAndGetPosition() {
        // We need to use `measureInWindow` instead of the layout props provided by `onLayout`
        // because `measureInWindow` provides the x and y offset relative to the window, rather than the parent element.
        this.wrapperView.measureInWindow((x, y, width, height) => {
            this.xOffset = x;
            this.yOffset = y;
            this.wrapperWidth = width;
            this.wrapperHeight = height;
        });
    }

    /**
     * Measure the size of the tooltip itself.
     */
    measureTooltip() {
        // We need to use `measureInWindow` instead of the layout props provided by `onLayout`
        // because `measureInWindow` provides the x and y offset relative to the window, rather than the parent element.
        this.tooltip.measureInWindow((x, y, width, height) => {
            this.tooltipWidth = width;
            this.tooltipHeight = height;
        });
    }

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        Animated.timing(this.animation, {
            toValue: 1,
            duration: 140,
        }).start();
    }

    /**
     * Hide the tooltip in an animation.
     */
    hideTooltip() {
        Animated.timing(this.animation, {
            toValue: 0,
            duration: 140,
        }).start();
    }

    render() {
        const interpolatedSize = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
        const {
            animationStyle,
            tooltipWrapperStyle,
            tooltipTextStyle,
            pointerWrapperStyle,
            pointerStyle,
        } = getTooltipStyles(
            interpolatedSize,
            this.props.windowDimensions.width,
            this.xOffset,
            this.yOffset,
            this.wrapperWidth,
            this.wrapperHeight,
            this.tooltipWidth,
            this.tooltipHeight,
        );

        return (
            <Hoverable
                onHoverIn={this.showTooltip}
                onHoverOut={this.hideTooltip}
            >
                <View
                    ref={el => this.wrapperView = el}
                    onLayout={this.measureWrapperAndGetPosition}
                >
                    <Animated.View style={animationStyle}>
                        <View
                            ref={el => this.tooltip = el}
                            onLayout={this.measureTooltip}
                            style={tooltipWrapperStyle}
                        >
                            <Text style={tooltipTextStyle} numberOfLines={1}>{this.props.text}</Text>
                        </View>
                        <View style={pointerWrapperStyle}>
                            <View style={pointerStyle} />
                        </View>
                    </Animated.View>
                    {this.props.children}
                </View>
            </Hoverable>
        );
    }
}

Tooltip.propTypes = propTypes;
export default withWindowDimensions(Tooltip);
