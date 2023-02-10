import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Animated, View} from 'react-native';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import {propTypes, defaultProps} from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import makeCancellablePromise from '../../libs/MakeCancellablePromise';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

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
        };

        // Whether the tooltip is first tooltip to activate the TooltipSense
        this.isTooltipSenseInitiator = false;
        this.shouldStartShowAnimation = false;
        this.animation = new Animated.Value(0);
        this.hasHoverSupport = DeviceCapabilities.hasHoverSupport();

        this.getWrapperPosition = this.getWrapperPosition.bind(this);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.windowWidth === prevProps.windowWidth && this.props.windowHeight === prevProps.windowHeight) {
            return;
        }

        this.getWrapperPositionPromise = makeCancellablePromise(this.getWrapperPosition());
        this.getWrapperPositionPromise.promise
            .then(({x, y}) => this.setState({xOffset: x, yOffset: y}));
    }

    componentWillUnmount() {
        if (!this.getWrapperPositionPromise) {
            return;
        }

        this.getWrapperPositionPromise.cancel();
    }

    /**
     * Measure the position of the wrapper view relative to the window.
     *
     * @returns {Promise}
     */
    getWrapperPosition() {
        return new Promise(((resolve) => {
            // Make sure the wrapper is mounted before attempting to measure it.
            if (this.wrapperView && _.isFunction(this.wrapperView.measureInWindow)) {
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
        this.getWrapperPositionPromise = makeCancellablePromise(this.getWrapperPosition());
        this.getWrapperPositionPromise.promise
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
                    // When TooltipSense is active, immediately show the tooltip
                    if (TooltipSense.isActive()) {
                        this.animation.setValue(1);
                    } else {
                        this.isTooltipSenseInitiator = true;
                        Animated.timing(this.animation, {
                            toValue: 1,
                            duration: 140,
                            delay: 500,
                            useNativeDriver: false,
                        }).start();
                    }
                    TooltipSense.activate();
                }
            });
    }

    /**
     * Hide the tooltip in an animation.
     */
    hideTooltip() {
        this.animation.stopAnimation();
        this.shouldStartShowAnimation = false;
        if (TooltipSense.isActive() && !this.isTooltipSenseInitiator) {
            this.animation.setValue(0);
        } else {
            // Hide the first tooltip which initiated the TooltipSense with animation
            this.isTooltipSenseInitiator = false;
            Animated.timing(this.animation, {
                toValue: 0,
                duration: 140,
                useNativeDriver: false,
            }).start();
        }
        TooltipSense.deactivate();
    }

    render() {
        // Skip the tooltip and return the children if the text is empty or the device does not support hovering
        if (_.isEmpty(this.props.text) || !this.hasHoverSupport) {
            return this.props.children;
        }
        let child = (
            <View
                ref={el => this.wrapperView = el}
                style={this.props.containerStyles}
                onBlur={this.hideTooltip}
                focusable
            >
                {this.props.children}
            </View>
        );

        if (this.props.absolute && React.isValidElement(this.props.children)) {
            child = React.cloneElement(React.Children.only(this.props.children), {
                ref: (el) => {
                    this.wrapperView = el;

                    // Call the original ref, if any
                    const {ref} = this.props.children;
                    if (_.isFunction(ref)) {
                        ref(el);
                    }
                },
                onBlur: (el) => {
                    this.hideTooltip();

                    // Call the original onBlur, if any
                    const {onBlur} = this.props.children;
                    if (_.isFunction(onBlur)) {
                        onBlur(el);
                    }
                },
                focusable: true,
            });
        }
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
                        shiftHorizontal={_.result(this.props, 'shiftHorizontal')}
                        shiftVertical={_.result(this.props, 'shiftVertical')}
                        text={this.props.text}
                        maxWidth={this.props.maxWidth}
                        numberOfLines={this.props.numberOfLines}
                    />
                )}
                <Hoverable
                    absolute={this.props.absolute}
                    containerStyles={this.props.containerStyles}
                    onHoverIn={this.showTooltip}
                    onHoverOut={this.hideTooltip}
                >
                    {child}
                </Hoverable>
            </>
        );
    }
}

Tooltip.propTypes = propTypes;
Tooltip.defaultProps = defaultProps;
export default withWindowDimensions(Tooltip);
