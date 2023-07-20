import _ from 'underscore';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {BoundsObserver} from '@react-ng/bounds-observer';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import withWindowDimensions from '../withWindowDimensions';
import * as tooltipPropTypes from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import compose from '../../libs/compose';
import withLocalize from '../withLocalize';
import usePrevious from '../../hooks/usePrevious';

const hasHoverSupport = DeviceCapabilities.hasHoverSupport();

/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
function Tooltip(props) {
    // Is tooltip already rendered on the page's body? happens once.
    const [isRendered, setIsRendered] = useState(false);
    // Is the tooltip currently visible?
    const [isVisible, setIsVisible] = useState(false);
    // The distance between the left side of the wrapper view and the left side of the window
    const [xOffset, setXOffset] = useState(0);
    // The distance between the top of the wrapper view and the top of the window
    const [yOffset, setYOffset] = useState(0);
    // The width and height of the wrapper view
    const [wrapperWidth, setWrapperWidth] = useState(0);
    const [wrapperHeight, setWrapperHeight] = useState(0);

    // Whether the tooltip is first tooltip to activate the TooltipSense
    const isTooltipSenseInitiator = useRef(false);
    const animation = useRef(new Animated.Value(0));
    const isAnimationCanceled = useRef(false);
    const prevText = usePrevious(props.text);

    /**
     * Display the tooltip in an animation.
     */
    const showTooltip = useCallback(() => {
        if (!isRendered) {
            setIsRendered(true);
        }

        setIsVisible(true);

        animation.current.stopAnimation();

        // When TooltipSense is active, immediately show the tooltip
        if (TooltipSense.isActive()) {
            animation.current.setValue(1);
        } else {
            isTooltipSenseInitiator.current = true;
            Animated.timing(animation.current, {
                toValue: 1,
                duration: 140,
                delay: 500,
                useNativeDriver: false,
            }).start(({finished}) => {
                isAnimationCanceled.current = !finished;
            });
        }
        TooltipSense.activate();
    }, [isRendered]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // if the tooltip text changed before the initial animation was finished, then the tooltip won't be shown
        // we need to show the tooltip again
        if (isVisible && isAnimationCanceled.current && props.text && prevText !== props.text) {
            isAnimationCanceled.current = false;
            showTooltip();
        }
    }, [isVisible, props.text, prevText, showTooltip]);

    /**
     * Update the tooltip bounding rectangle
     *
     * @param {Object} bounds - updated bounds
     */
    const updateBounds = (bounds) => {
        if (bounds.width === 0) {
            setIsRendered(false);
        }
        setWrapperWidth(bounds.width);
        setWrapperHeight(bounds.height);
        setXOffset(bounds.x);
        setYOffset(bounds.y);
    };

    /**
     * Hide the tooltip in an animation.
     */
    const hideTooltip = () => {
        animation.current.stopAnimation();

        if (TooltipSense.isActive() && !isTooltipSenseInitiator.current) {
            animation.current.setValue(0);
        } else {
            // Hide the first tooltip which initiated the TooltipSense with animation
            isTooltipSenseInitiator.current = false;
            Animated.timing(animation.current, {
                toValue: 0,
                duration: 140,
                useNativeDriver: false,
            }).start();
        }

        TooltipSense.deactivate();

        setIsVisible(false);
    };

    // Skip the tooltip and return the children if the text is empty,
    // we don't have a render function or the device does not support hovering
    if ((_.isEmpty(props.text) && props.renderTooltipContent == null) || !hasHoverSupport) {
        return props.children;
    }

    return (
        <>
            {isRendered && (
                <TooltipRenderedOnPageBody
                    animation={animation.current}
                    windowWidth={props.windowWidth}
                    xOffset={xOffset}
                    yOffset={yOffset}
                    targetWidth={wrapperWidth}
                    targetHeight={wrapperHeight}
                    shiftHorizontal={_.result(props, 'shiftHorizontal')}
                    shiftVertical={_.result(props, 'shiftVertical')}
                    text={props.text}
                    maxWidth={props.maxWidth}
                    numberOfLines={props.numberOfLines}
                    renderTooltipContent={props.renderTooltipContent}
                    // We pass a key, so whenever the content changes this component will completely remount with a fresh state.
                    // This prevents flickering/moving while remaining performant.
                    key={[props.text, ...props.renderTooltipContentKey, props.preferredLocale]}
                />
            )}
            <BoundsObserver
                enabled={isVisible}
                onBoundsChange={updateBounds}
            >
                <Hoverable
                    onHoverIn={showTooltip}
                    onHoverOut={hideTooltip}
                >
                    {props.children}
                </Hoverable>
            </BoundsObserver>
        </>
    );
}

Tooltip.propTypes = tooltipPropTypes.propTypes;
Tooltip.defaultProps = tooltipPropTypes.defaultProps;
export default compose(withWindowDimensions, withLocalize)(memo(Tooltip));
