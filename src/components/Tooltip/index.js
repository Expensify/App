import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Animated, View} from 'react-native';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import {propTypes, defaultProps} from './TooltipPropTypes';

class Tooltip extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // Is tooltip rendered?
            isRendered: false,

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

        this.isComponentMounted = false;
        this.shouldStartShowAnimation = false;
        this.animation = new Animated.Value(0);

        this.getWrapperPosition = this.getWrapperPosition.bind(this);
        this.measureTooltip = this.measureTooltip.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    componentDidMount() {
        this.isComponentMounted = true;
    }

    componentDidUpdate(prevProps) {
        if (this.props.windowWidth !== prevProps.windowWidth || this.props.windowHeight !== prevProps.windowHeight) {
            this.getWrapperPosition()
                .then(({x, y}) => this.setStateIfMounted({xOffset: x, yOffset: y}));
        }
    }

    componentWillUnmount() {
        this.isComponentMounted = false;
    }

    /**
     * Call setState only if this component is mounted. It's necessary to check because we need to call setState
     * after an asynchronous `measureInWindow` call, and by the time it completes this component may have unmounted
     * and calling setState on an unmounted component results in an error.
     *
     * @param {Object} newState
     */
    setStateIfMounted(newState) {
        if (this.isComponentMounted) {
            this.setState(newState);
        }
    }

    /**
     * Measure the position of the wrapper view relative to the window.
     *
     * @returns {Promise}
     */
    getWrapperPosition() {
        return new Promise(((resolve) => {
            // Make sure the wrapper is mounted before attempting to measure it.
            if (this.wrapperView) {
                this.wrapperView.measureInWindow((x, y, width, height) => resolve({
                    x, y, width, height,
                }));
            } else {
                resolve({
                    x: 0, y: 0, width: 0, height: 0,
                });
            }
        }));
    }

    /**
     * Measure the size of the tooltip itself.
     *
     * @param {Object} nativeEvent
     */
    measureTooltip({nativeEvent}) {
        this.setStateIfMounted({
            tooltipWidth: nativeEvent.layout.width,
            tooltipHeight: nativeEvent.layout.height,
        });
    }

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        if (!this.state.isRendered) {
            this.setState({isRendered: true});
        }
        this.animation.stopAnimation();
        this.shouldStartShowAnimation = true;

        // We have to dynamically calculate the position here as tooltip could have been rendered on some elments
        // that has changed its position
        this.getWrapperPosition()
            .then(({
                x, y, width, height,
            }) => {
                this.setState({
                    wrapperWidth: width,
                    wrapperHeight: height,
                    xOffset: x,
                    yOffset: y,
                });

                // We may need this check due to the reason that the animation start will fire async
                // and hideTooltip could fire before it thus keeping the Tooltip visible
                if (this.shouldStartShowAnimation) {
                    Animated.timing(this.animation, {
                        toValue: 1,
                        duration: 140,
                        delay: 500,
                        useNativeDriver: false,
                    }).start();
                }
            });
    }

    /**
     * Hide the tooltip in an animation.
     */
    hideTooltip() {
        this.animation.stopAnimation();
        this.shouldStartShowAnimation = false;
        Animated.timing(this.animation, {
            toValue: 0,
            duration: 140,
            useNativeDriver: false,
        }).start();
    }

    render() {
        return (
            <>
                {this.state.isRendered && (
                <TooltipRenderedOnPageBody
                    animation={this.animation}
                    windowWidth={this.props.windowWidth}
                    xOffset={this.state.xOffset}
                    yOffset={this.state.yOffset}
                    wrapperWidth={this.state.wrapperWidth}
                    wrapperHeight={this.state.wrapperHeight}
                    tooltipWidth={this.state.tooltipWidth}
                    tooltipHeight={this.state.tooltipHeight}
                    setTooltipRef={el => this.tooltip = el}
                    shiftHorizontal={_.result(this.props, 'shiftHorizontal')}
                    shiftVertical={_.result(this.props, 'shiftVertical')}
                    measureTooltip={this.measureTooltip}
                    text={this.props.text}
                />
                )}
                <Hoverable
                    containerStyle={this.props.containerStyle}
                    onHoverIn={this.showTooltip}
                    onHoverOut={this.hideTooltip}
                >
                    <View
                        ref={el => this.wrapperView = el}
                        style={this.props.containerStyle}
                    >
                        {this.props.children}
                    </View>
                </Hoverable>
            </>
        );
    }
}

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
export default withWindowDimensions(Tooltip);
