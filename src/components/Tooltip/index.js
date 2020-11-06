import React from 'react';
import PropTypes from 'prop-types';
import {
    Animated, Pressable, Text, View
} from 'react-native';

import Triangle from './Triangle';
import styles from './styles';

const propTypes = {
    textContent: PropTypes.string.isRequired,
};

class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipShown: false,
            isAnimating: false,
        };

        this.animation = new Animated.Value(0);

        // The outermost view rendered by this component
        this.renderedContent = null;
        this.wrappedElementWidth = 0;
        this.wrappedElementHeight = 0;

        // The distance between the left side of the rendered view and the left side of the window
        this.xOffset = 0;

        // The distance between the top of the rendered view and the top of the window
        this.yOffset = 0;

        this.getPosition = this.getPosition.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
    }

    getPosition() {
        this.renderedContent.measureInWindow((x, y, width, height) => {
            this.xOffset = x;
            this.yOffset = y;
            this.wrappedElementWidth = width;
            this.wrappedElementHeight = height;
        });
    }

    toggleTooltip() {
        Animated.timing(this.animation, {
            toValue: this.state.tooltipShown ? 0 : 1,
            duration: 200,
        }).start(() => {
            this.setState(prevState => ({tooltipShown: !prevState.tooltipShown}));
        });
    }

    render() {
        const toolTipStyle = styles.getTooltipStyle(
            this.wrappedElementWidth,
            this.wrappedElementHeight,
            this.xOffset,
            this.yOffset,
        );
        const {pointerWrapperViewStyle, shouldPointDown} = styles.getPointerStyle(
            this.wrappedElementWidth,
            this.wrappedElementHeight,
            this.xOffset,
            this.yOffset,
            toolTipStyle.top,
        );
        const interpolatedSize = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <View
                ref={e => (this.renderedContent = e)}
                onLayout={e => (this.getPosition(e))}
                collapsable={false}
            >
                <Pressable>
                    {({hovered}) => {
                        if (!this.state.isAnimating && this.state.tooltipShown !== hovered) {
                            this.toggleTooltip();
                        }
                        return (this.props.children);
                    }}
                </Pressable>
                <Animated.View style={{transform: [{scale: interpolatedSize}]}}>
                    <View style={pointerWrapperViewStyle}>
                        <Triangle isPointingDown={shouldPointDown} />
                    </View>
                    <View style={toolTipStyle}>
                        <Text style={styles.tooltipText}>{this.props.textContent}</Text>
                    </View>
                </Animated.View>
            </View>
        );
    }
}

Tooltip.propTypes = propTypes;
export default Tooltip;
