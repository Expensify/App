import React from 'react';
import PropTypes from 'prop-types';
import {Animated, View} from 'react-native';
import ReactDOM from 'react-dom';
import getTooltipStyles from '../../styles/getTooltipStyles';
import Text from '../Text';

const propTypes = {
    /** Window width */
    windowWidth: PropTypes.number.isRequired,

    /** Tooltip Animation value */
    // eslint-disable-next-line react/forbid-prop-types
    animation: PropTypes.object.isRequired,

    /** The distance between the left side of the wrapper view and the left side of the window */
    xOffset: PropTypes.number.isRequired,

    /** The distance between the top of the wrapper view and the top of the window */
    yOffset: PropTypes.number.isRequired,

    /** The width of the tooltip wrapper */
    wrapperWidth: PropTypes.number.isRequired,

    /** The Height of the tooltip wrapper */
    wrapperHeight: PropTypes.number.isRequired,

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: PropTypes.number.isRequired,

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: PropTypes.number.isRequired,

    /** Text to be shown in the tooltip */
    text: PropTypes.string.isRequired,

    /** Number of pixels to set max-width on tooltip  */
    maxWidth: PropTypes.number.isRequired,

    /** Maximum number of lines to show in tooltip */
    numberOfLines: PropTypes.number.isRequired,
};

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memorize this one.
class TooltipRenderedOnPageBody extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            // The width of toolttip's inner text
            tooltipTextWidth: 0,

            // The width and height of the tooltip itself
            tooltipWidth: 0,
            tooltipHeight: 0,
        };

        this.measureTooltip = this.measureTooltip.bind(this);
    }

    componentDidMount() {
        this.setState({
            tooltipTextWidth: this.textRef.offsetWidth,
        });
    }

    /**
     * Measure the size of the tooltip itself.
     *
     * @param {Object} nativeEvent
     */
    measureTooltip({nativeEvent}) {
        this.setState({
            tooltipWidth: nativeEvent.layout.width,
            tooltipHeight: nativeEvent.layout.height,
        });
    }

    render() {
        const {
            animationStyle,
            tooltipWrapperStyle,
            tooltipTextStyle,
            pointerWrapperStyle,
            pointerStyle,
        } = getTooltipStyles(
            this.props.animation,
            this.props.windowWidth,
            this.props.xOffset,
            this.props.yOffset,
            this.props.wrapperWidth,
            this.props.wrapperHeight,
            this.props.maxWidth,
            this.state.tooltipWidth,
            this.state.tooltipHeight,
            this.state.tooltipTextWidth,
            this.props.shiftHorizontal,
            this.props.shiftVertical,
        );
        return ReactDOM.createPortal(
            <Animated.View
                onLayout={this.measureTooltip}
                style={[tooltipWrapperStyle, animationStyle]}
            >
                <Text numberOfLines={this.props.numberOfLines} style={tooltipTextStyle}>
                    <Text style={tooltipTextStyle} ref={ref => this.textRef = ref}>{this.props.text}</Text>
                </Text>
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </Animated.View>,
            document.querySelector('body'),
        );
    }
}

TooltipRenderedOnPageBody.propTypes = propTypes;

export default TooltipRenderedOnPageBody;
