import React, {forwardRef, memo, useCallback, useEffect, useRef, useState} from 'react';
import {Animated} from 'react-native';
import type {LayoutChangeEvent, LayoutRectangle} from 'react-native';
import TooltipRenderedOnPageBody from '@components/Tooltip/TooltipRenderedOnPageBody';
import TooltipSense from '@components/Tooltip/TooltipSense';
import type TooltipProps from '@components/Tooltip/types';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useWindowDimensions from '@hooks/useWindowDimensions';
import StringUtils from '@libs/StringUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import callOrReturn from '@src/types/utils/callOrReturn';

function Tooltip(
    {
        children,
        numberOfLines = CONST.TOOLTIP_MAX_LINES,
        maxWidth = variables.sideBarWidth,
        text = '',
        renderTooltipContent,
        renderTooltipContentKey = [],
        shiftHorizontal = 0,
        shiftVertical = 0,
        shouldForceRenderingBelow = false,
        wrapperStyle = {},
        shouldRenderWithoutHover = false,
        shouldForceRenderingLeft = false,
    }: TooltipProps,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ref: unknown,
) {
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
     * Display the tooltip in an animation.
     */
    const showTooltip = useCallback(() => {
        setIsRendered(true);
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
    }, []);

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
     * Update the tooltip bounding rectangle
     */
    const updateBounds = (bounds: LayoutRectangle) => {
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
    const hideTooltip = useCallback(() => {
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
    }, []);

    useEffect(() => {
        const intervalID = setInterval(hideTooltip, 5000);
        return () => {
            clearInterval(intervalID);
        };
    }, [hideTooltip]);

    // Skip the tooltip and return the children if the text is empty.
    // Only render tooltip if shouldRenderWithoutHover because hover event is DOM-specific.
    if ((StringUtils.isEmptyString(text) && renderTooltipContent == null) || !shouldRenderWithoutHover) {
        return children;
    }

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
                    shiftHorizontal={callOrReturn(shiftHorizontal)}
                    shiftVertical={callOrReturn(shiftVertical)}
                    text={text}
                    maxWidth={maxWidth}
                    numberOfLines={numberOfLines}
                    renderTooltipContent={renderTooltipContent}
                    // We pass a key, so whenever the content changes this component will completely remount with a fresh state.
                    // This prevents flickering/moving while remaining performant.
                    key={[text, ...renderTooltipContentKey, preferredLocale].join('-')}
                    shouldForceRenderingBelow={shouldForceRenderingBelow}
                    shouldForceRenderingLeft={shouldForceRenderingLeft}
                    wrapperStyle={wrapperStyle}
                />
            )}

            {React.isValidElement(children) ? (
                <>
                    {React.cloneElement(children as React.ReactElement, {
                        onLayout: ({nativeEvent}: LayoutChangeEvent) => {
                            updateBounds(nativeEvent.layout);
                            showTooltip();
                        },
                    })}
                </>
            ) : (
                children
            )}
        </>
    );
}

Tooltip.displayName = 'Tooltip';

export default memo(forwardRef(Tooltip));
