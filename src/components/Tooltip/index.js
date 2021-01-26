import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Animated, Text, View,
} from 'react-native';
import Hoverable from '../Hoverable';
import TooltipPointer from './TooltipPointer';
import styles from '../../styles/styles';
import getTooltipStyles from '../../styles/getTooltipStyles';

const propTypes = {
    // The text to display in the tooltip.
    text: PropTypes.string.isRequired,

    // Child to wrap with Tooltip. Must be only child.
    children: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.element,
        PropTypes.instanceOf(Component),
    ]).isRequired,
};

class Tooltip extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isVisible: false,
        };

        this.animation = new Animated.Value(0);

        // The wrapper view containing the wrapped content along with the Tooltip itself.
        this.wrapperView = null;
        this.width = 0;
        this.height = 0;

        // The tooltip (popover) itself.
        this.tooltip = null;
        this.tooltipWidth = 0;
        this.tooltipHeight = 0;

        // The distance between the left side of the rendered view and the left side of the window
        this.xOffset = 0;

        // The distance between the top of the rendered view and the top of the window
        this.yOffset = 0;

        this.getPosition = this.getPosition.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
    }

    getPosition() {
        this.wrapperView.measureInWindow((x, y, width, height) => {
            this.xOffset = x;
            this.yOffset = y;
            this.width = width;
            this.height = height;
        });
        this.tooltip.measureInWindow((x, y, width, height) => {
            this.tooltipWidth = width;
            this.tooltipHeight = height;
        });
    }

    toggleTooltip() {
        Animated.timing(this.animation, {
            toValue: this.state.isVisible ? 0 : 1,
            duration: 140,
        }).start(() => {
            this.setState(prevState => ({isVisible: !prevState.isVisible}));
        });
    }

    render() {
        const interpolatedSize = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });
        const {
            animationStyle,
            tooltipWrapperStyle,
            pointerWrapperStyle,
        } = getTooltipStyles(interpolatedSize, this.xOffset, this.yOffset, this.width, this.height, this.tooltipWidth, this.tooltipHeight);

        return (
            <View
                ref={el => this.wrapperView = el}
                onLayout={this.getPosition}
                collapsable={false}
            >
                <Animated.View style={animationStyle}>
                    <View
                        ref={el => this.tooltip = el}
                        onLayout={this.getPosition}
                        style={tooltipWrapperStyle}
                    >
                        <Text style={styles.tooltipText} numberOfLines={1}>{this.props.text}</Text>
                    </View>
                    <View style={pointerWrapperStyle}>
                        <TooltipPointer />
                    </View>
                </Animated.View>
                <Hoverable>
                    {(hovered) => {
                        // If the hover state is different from the current visibility,
                        // and we're not already animating, then toggle the tooltip visibility.
                        if (this.state.isVisible !== hovered) {
                            this.toggleTooltip();
                        }
                        return this.props.children;
                    }}
                </Hoverable>
            </View>
        );
    }
}

Tooltip.propTypes = propTypes;
export default Tooltip;
