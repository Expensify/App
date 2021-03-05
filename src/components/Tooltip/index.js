import React, {PureComponent} from 'react';
import {Animated, Text, View} from 'react-native';
import ReactDOM from 'react-dom';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import getTooltipStyles from '../../styles/getTooltipStyles';
import tooltipPropTypes from './TooltipPropTypes';

const defaultProps = {
    shiftHorizontal: 0,
    shiftVertical: 0,
};

class Tooltip extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // The distance between the left side of the wrapper view and the left side of the window
            xOffset: 0,

            // The distance between the top of the wrapper view and the top of the window
            yOffset: 0,

            // The width and height of the wrapper view
            wrapperWidth: 0,
            wrapperHeight: 0,

            // The width and height of the tooltip itself
            tooltipWidth: 0,
            tooltipHeight: 0,
        };

        // The wrapper view containing the wrapped content along with the Tooltip itself.
        this.wrapperView = null;

        // The tooltip (popover) itself.
        this.tooltip = null;

        this.animation = new Animated.Value(0);

        this.getWrapperPosition = this.getWrapperPosition.bind(this);
        this.measureWrapperAndGetPosition = this.measureWrapperAndGetPosition.bind(this);
        this.measureTooltip = this.measureTooltip.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.createPortal = this.createPortal.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.windowWidth !== prevProps.windowWidth || this.props.windowHeight !== prevProps.windowHeight) {
            this.getWrapperPosition()
                .then(({x, y}) => {
                    this.setState({xOffset: x, yOffset: y});
                });
        }
    }

    /**
     * Measure the position of the wrapper view relative to the window.
     *
     * @returns {Promise}
     */
    getWrapperPosition() {
        return new Promise((resolve => this.wrapperView.measureInWindow((x, y) => resolve({x, y}))));
    }

    /**
     * Measure the size and position of the wrapper view.
     *
     * @param {Object} nativeEvent
     */
    measureWrapperAndGetPosition({nativeEvent}) {
        const {width, height} = nativeEvent.layout;

        // We need to use `measureInWindow` instead of the layout props provided by `onLayout`
        // because `measureInWindow` provides the x and y offset relative to the window, rather than the parent element.
        this.getWrapperPosition()
            .then(({x, y}) => this.setState({
                wrapperWidth: width,
                wrapperHeight: height,
                xOffset: x,
                yOffset: y,
            }));
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

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        this.getWrapperPosition()
            .then(({x, y}) => this.setState({
                xOffset: x,
                yOffset: y,
            }));
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

    createPortal() {
        const {
            animationStyle,
            tooltipWrapperStyle,
            tooltipTextStyle,
            pointerWrapperStyle,
            pointerStyle,
        } = getTooltipStyles(
            this.animation,
            this.props.windowWidth,
            this.state.xOffset,
            this.state.yOffset,
            this.state.wrapperWidth,
            this.state.wrapperHeight,
            this.state.tooltipWidth,
            this.state.tooltipHeight,
            this.props.shiftHorizontal,
            this.props.shiftVertical,
        );
        return ReactDOM.createPortal(
            <Animated.View
                ref={el => this.tooltip = el}
                onLayout={this.measureTooltip}
                style={{...tooltipWrapperStyle, ...animationStyle}}
            >
                <Text style={tooltipTextStyle} numberOfLines={1}>{this.props.text}</Text>
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </Animated.View>, document.querySelector('body'),
        );
    }

    render() {
        return (
            <>
                {this.createPortal()}
                <Hoverable
                    containerStyle={this.props.containerStyle}
                    onHoverIn={this.showTooltip}
                    onHoverOut={this.hideTooltip}
                >
                    <View
                        ref={el => this.wrapperView = el}
                        onLayout={this.measureWrapperAndGetPosition}
                        style={this.props.containerStyle}
                    >
                        {this.props.children}
                    </View>
                </Hoverable>
            </>
        );
    }
}

Tooltip.propTypes = tooltipPropTypes;
Tooltip.defaultProps = defaultProps;
export default withWindowDimensions(Tooltip);
