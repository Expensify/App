import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Animated, Text, View,
} from 'react-native';
import Hoverable from '../Hoverable';
import TooltipPointer from './TooltipPointer';
import styles, {getTooltipStyles} from '../../styles/styles';

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

        // The distance between the left side of the rendered view and the left side of the window
        this.xOffset = 0;

        // The distance between the top of the rendered view and the top of the window
        this.yOffset = 0;

        this.getPosition = this.getPosition.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
    }

    getPosition() {
        this.wrapperView.measureInWindow((x, y) => {
            this.xOffset = x;
            this.yOffset = y;
        });
    }

    toggleTooltip() {
        Animated.timing(this.animation, {
            toValue: this.state.isVisible ? 0 : 1,
            duration: 200,
        }).start(() => {
            this.setState(prevState => ({isVisible: !prevState.isVisible}));
        });
    }

    render() {
        const interpolatedSize = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        });

        return (
            <View
                ref={el => this.wrapperView = el}
                onLayout={el => this.getPosition(el)}
                collapsable={false}
            >
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
                <Animated.View style={getTooltipStyles(interpolatedSize)}>
                    <View>
                        <Text style={styles.tooltipText}>{this.props.text}</Text>
                    </View>
                    <View>
                        <TooltipPointer />
                    </View>
                </Animated.View>
            </View>
        );
    }
}

Tooltip.propTypes = propTypes;
export default Tooltip;
