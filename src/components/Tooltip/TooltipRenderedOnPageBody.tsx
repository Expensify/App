import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {Animated, View} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import Log from '@libs/Log';
import textRef from '@src/types/utils/textRef';
import viewRef from '@src/types/utils/viewRef';
import TooltipProps from './types';

type TooltipRenderedOnPageBodyProps = {
    /** Window width */
    windowWidth: number;

    /** Tooltip Animation value */
    animation: Animated.Value;

    /** The distance between the left side of the wrapper view and the left side of the window */
    xOffset: number;

    /** The distance between the top of the wrapper view and the top of the window */
    yOffset: number;

    /** The width of the tooltip's target */
    targetWidth: number;

    /** The height of the tooltip's target */
    targetHeight: number;

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal?: number;

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical?: number;
} & Pick<TooltipProps, 'renderTooltipContent' | 'maxWidth' | 'numberOfLines' | 'text'>;

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memoize this one.
function TooltipRenderedOnPageBody({
    animation,
    windowWidth,
    xOffset,
    yOffset,
    targetWidth,
    targetHeight,
    shiftHorizontal = 0,
    shiftVertical = 0,
    text,
    numberOfLines,
    maxWidth = 0,
    renderTooltipContent,
}: TooltipRenderedOnPageBodyProps) {
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();
    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const contentRef = useRef<HTMLDivElement>(null);
    const rootWrapper = useRef<HTMLDivElement>(null);

    const StyleUtils = useStyleUtils();

    useEffect(() => {
        if (!renderTooltipContent || !text) {
            return;
        }
        Log.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
    }, [text, renderTooltipContent]);

    useLayoutEffect(() => {
        // Calculate the tooltip width and height before the browser repaints the screen to prevent flicker
        // because of the late update of the width and the height from onLayout.
        setContentMeasuredWidth(contentRef.current?.getBoundingClientRect().width);
        setWrapperMeasuredHeight(rootWrapper.current?.getBoundingClientRect().height);
    }, []);

    const {animationStyle, rootWrapperStyle, textStyle, pointerWrapperStyle, pointerStyle} = useMemo(
        () =>
            StyleUtils.getTooltipStyles({
                tooltip: rootWrapper.current,
                currentSize: animation,
                windowWidth,
                xOffset,
                yOffset,
                tooltipTargetWidth: targetWidth,
                tooltipTargetHeight: targetHeight,
                maxWidth,
                tooltipContentWidth: contentMeasuredWidth,
                tooltipWrapperHeight: wrapperMeasuredHeight,
                manualShiftHorizontal: shiftHorizontal,
                manualShiftVertical: shiftVertical,
            }),
        [StyleUtils, animation, windowWidth, xOffset, yOffset, targetWidth, targetHeight, maxWidth, contentMeasuredWidth, wrapperMeasuredHeight, shiftHorizontal, shiftVertical],
    );

    let content;
    if (renderTooltipContent) {
        content = <View ref={viewRef(contentRef)}>{renderTooltipContent()}</View>;
    } else {
        content = (
            <Text
                numberOfLines={numberOfLines}
                style={textStyle}
            >
                <Text
                    style={textStyle}
                    ref={textRef(contentRef)}
                >
                    {text}
                </Text>
            </Text>
        );
    }

    const body = document.querySelector('body');

    if (!body) {
        return null;
    }

    return ReactDOM.createPortal(
        <Animated.View
            ref={viewRef(rootWrapper)}
            style={[rootWrapperStyle, animationStyle]}
        >
            {content}
            <View style={pointerWrapperStyle}>
                <View style={pointerStyle} />
            </View>
        </Animated.View>,
        body,
    );
}

TooltipRenderedOnPageBody.displayName = 'TooltipRenderedOnPageBody';

export default React.memo(TooltipRenderedOnPageBody);
