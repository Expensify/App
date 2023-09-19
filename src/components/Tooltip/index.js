import _ from 'underscore';
import React, {memo, useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import {BoundsObserver} from '@react-ng/bounds-observer';
import TooltipRenderedOnPageBody from './TooltipRenderedOnPageBody';
import Hoverable from '../Hoverable';
import * as tooltipPropTypes from './tooltipPropTypes';
import TooltipSense from './TooltipSense';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import usePrevious from '../../hooks/usePrevious';
import useLocalize from '../../hooks/useLocalize';
import useWindowDimensions from '../../hooks/useWindowDimensions';

const hasHoverSupport = DeviceCapabilities.hasHoverSupport();

/**
 * Choose the correct bounding box for the tooltip to be positioned against.
 * This handles the case where the target is wrapped across two lines, and
 * so we need to find the correct part (the one that the user is hovering
 * over) and show the tooltip there.
 *
 * This is only used when shouldUseMultilinePositioning == true.
 *
 * @param {Element} target The DOM element being hovered over.
 * @param {number} clientX The X position from the MouseEvent.
 * @param {number} clientY The Y position from the MouseEvent.
 * @param {number} slop An allowed slop factor when searching for the bounding
 * box. If the user is moving the mouse quickly we can end up getting a
 * hover event with the position outside any of our bounding boxes. We retry
 * with a small slop factor in that case, so if we have a bounding box close
 * enough then we go with that.
 * @return {DOMRect} The chosen bounding box.
 */
function chooseBoundingBox(target, clientX, clientY, slop = 0) {
    const bbs = target.getClientRects();
    for (let i = 0; i < bbs.length; i++) {
        const bb = bbs[i];
        if (bb.x - slop <= clientX && bb.x + bb.width + slop >= clientX && bb.y - slop <= clientY && bb.y + bb.height + slop >= clientY) {
            return bb;
        }
    }
    if (slop === 0) {
        // Retry with a slop factor, in case the user is moving the mouse quickly.
        return chooseBoundingBox(target, clientX, clientY, 5);
    }
    // Fall back to the full bounding box if we failed to find a matching one
    // (shouldn't happen).
    return target.getBoundingClientRect();
}

/**
 * A component used to wrap an element intended for displaying a tooltip. The term "tooltip's target" refers to the
 * wrapped element, which, upon hover, triggers the tooltip to be shown.
 * @param {propTypes} props
 * @returns {ReactNodeLike}
 */
function Tooltip(props) {
    const {children, numberOfLines, maxWidth, text, renderTooltipContent, renderTooltipContentKey, shouldUseMultilinePositioning} = props;

    const {preferredLocale} = useLocalize();
    const {windowWidth} = useWindowDimensions();

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
    const prevText = usePrevious(text);

    /**
     * Update the tooltip bounding rectangle.
     *
     * @param {Object} bounds - updated bounds
     */
    const updateBounds = useCallback((bounds) => {
        if (bounds.width === 0) {
            setIsRendered(false);
        }
        setWrapperWidth(bounds.width);
        setWrapperHeight(bounds.height);
        setXOffset(bounds.x);
        setYOffset(bounds.y);
    }, []);

    /**
     * Display the tooltip in an animation.
     */
    const showTooltip = useCallback(
        (ev) => {
            if (shouldUseMultilinePositioning) {
                if (ev) {
                    const {clientX, clientY, target} = ev;
                    const bb = chooseBoundingBox(target, clientX, clientY);
                    updateBounds(bb);
                }
            }

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
        },
        [isRendered, shouldUseMultilinePositioning, updateBounds],
    );

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // if the tooltip text changed before the initial animation was finished, then the tooltip won't be shown
        // we need to show the tooltip again
        if (isVisible && isAnimationCanceled.current && text && prevText !== text) {
            isAnimationCanceled.current = false;
            showTooltip();
        }
    }, [isVisible, text, prevText, showTooltip]);

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
    if ((_.isEmpty(text) && renderTooltipContent == null) || !hasHoverSupport) {
        return children;
    }

    const hoverableChildren = (
        <Hoverable
            onHoverIn={showTooltip}
            onHoverOut={hideTooltip}
            shouldHandleScroll={props.shouldHandleScroll}
        >
            {children}
        </Hoverable>
    );

    return (
        <>
            {isRendered && (
                <TooltipRenderedOnPageBody
                    animation={animation.current}
                    windowWidth={windowWidth}
                    xOffset={xOffset}
                    yOffset={yOffset}
                    targetWidth={wrapperWidth}
                    targetHeight={wrapperHeight}
                    shiftHorizontal={_.result(props, 'shiftHorizontal')}
                    shiftVertical={_.result(props, 'shiftVertical')}
                    text={text}
                    maxWidth={maxWidth}
                    numberOfLines={numberOfLines}
                    renderTooltipContent={renderTooltipContent}
                    // We pass a key, so whenever the content changes this component will completely remount with a fresh state.
                    // This prevents flickering/moving while remaining performant.
                    key={[text, ...renderTooltipContentKey, preferredLocale]}
                />
            )}
            {shouldUseMultilinePositioning ? (
                hoverableChildren
            ) : (
                <BoundsObserver
                    enabled={isVisible}
                    onBoundsChange={updateBounds}
                >
                    {hoverableChildren}
                </BoundsObserver>
            )}
        </>
    );
}

Tooltip.propTypes = tooltipPropTypes.propTypes;
Tooltip.defaultProps = tooltipPropTypes.defaultProps;
export default memo(Tooltip);
