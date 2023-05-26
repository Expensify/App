import _ from 'underscore';
import React, {PureComponent} from 'react';
import {Animated} from 'react-native';
import {BoundsObserver} from '@react-ng/bounds-observer';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import * as tooltipPropTypes from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 */
class Tooltip extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            // Is tooltip already rendered on the page's body? This happens once.
            isRendered: false,

            // Is the tooltip currently visible?
            isVisible: false,

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
        this.animation = new Animated.Value(0);
        this.hasHoverSupport = DeviceCapabilities.hasHoverSupport();

        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.updateBounds = this.updateBounds.bind(this);
    }

    /**
     * Update the tooltip bounding rectangle
     *
     * @param {Object} bounds - updated bounds
     */
    updateBounds(bounds) {
        this.setState({
            wrapperWidth: bounds.width,
            wrapperHeight: bounds.height,
            xOffset: bounds.x,
            yOffset: bounds.y,
        });
    }

    /**
     * Display the tooltip in an animation.
     */
    showTooltip() {
        if (!this.state.isRendered) {
            this.setState({isRendered: true});
        }

        this.setState({isVisible: true});

        this.animation.stopAnimation();

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

    /**
     * Hide the tooltip in an animation.
     */
    hideTooltip() {
        this.animation.stopAnimation();

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

        this.setState({isVisible: false});
    }

    render() {
        // Skip the tooltip and return the children if the text is empty,
        // we don't have a render function or the device does not support hovering
        if ((_.isEmpty(this.props.text) && this.props.renderTooltipContent == null) || !this.hasHoverSupport) {
            return this.props.children;
        }

        if (!React.isValidElement(this.props.children)) {
            throw Error('Children is not a valid element.');
        }

        const target = React.cloneElement(React.Children.only(this.props.children), {
            ref: (el) => {
                this.wrapperView = el;

                // Call the original ref, if any
                const {ref} = this.props.children;
                if (_.isFunction(ref)) {
                    ref(el);
                }
            },
        });

        return (
            <>
                {this.state.isRendered && (
                    <TooltipRenderedOnPageBody
                        animation={this.animation}
                        windowWidth={this.props.windowWidth}
                        xOffset={this.state.xOffset}
                        yOffset={this.state.yOffset}
                        targetWidth={this.state.wrapperWidth}
                        targetHeight={this.state.wrapperHeight}
                        shiftHorizontal={_.result(this.props, 'shiftHorizontal')}
                        shiftVertical={_.result(this.props, 'shiftVertical')}
                        text={this.props.text}
                        maxWidth={this.props.maxWidth}
                        numberOfLines={this.props.numberOfLines}
                        renderTooltipContent={this.props.renderTooltipContent}
                        // We pass a key, so whenever the content changes this component will completely remount with a fresh state.
                        // This prevents flickering/moving while remaining performant.
                        key={[this.props.text, ...this.props.renderTooltipContentKey]}
                    />
                )}
                <BoundsObserver
                    enabled={this.state.isVisible}
                    onBoundsChange={this.updateBounds}
                >
                    <Hoverable
                        onHoverIn={this.showTooltip}
                        onHoverOut={this.hideTooltip}
                    >
                        {target}
                    </Hoverable>
                </BoundsObserver>
            </>
        );
    }
}

Tooltip.propTypes = tooltipPropTypes.propTypes;
Tooltip.defaultProps = tooltipPropTypes.defaultProps;
export default withWindowDimensions(Tooltip);
