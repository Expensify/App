import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {Text as RNText, View as RNView} from 'react-native';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import type {BaseGenericTooltipProps} from './types';

// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memoize this one.
function BaseGenericTooltip({
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
    shouldForceRenderingBelow = false,
    wrapperStyle = {},
}: BaseGenericTooltipProps) {
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();

    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const textContentRef = useRef<RNText>(null);
    const viewContentRef = useRef<RNView>(null);
    const rootWrapper = useRef<RNView>(null);

    const StyleUtils = useStyleUtils();

    // Measure content width
    useEffect(() => {
        if (!textContentRef.current && !viewContentRef.current) {
            return;
        }
        const contentRef = viewContentRef.current ?? textContentRef.current;
        contentRef?.measure((x, y, width) => setContentMeasuredWidth(width));
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
                shouldForceRenderingBelow,
                wrapperStyle,
            }),
        [
            StyleUtils,
            animation,
            windowWidth,
            xOffset,
            yOffset,
            targetWidth,
            targetHeight,
            maxWidth,
            contentMeasuredWidth,
            wrapperMeasuredHeight,
            shiftHorizontal,
            shiftVertical,
            shouldForceRenderingBelow,
            wrapperStyle,
        ],
    );

    let content;
    if (renderTooltipContent) {
        content = <View ref={viewContentRef}>{renderTooltipContent()}</View>;
    } else {
        content = (
            <Text
                numberOfLines={numberOfLines}
                style={textStyle}
            >
                <Text
                    style={textStyle}
                    ref={textContentRef}
                >
                    {text}
                </Text>
            </Text>
        );
    }

    return (
        <Animated.View
            ref={rootWrapper}
            style={[rootWrapperStyle, animationStyle]}
            onLayout={(e) => {
                const {height} = e.nativeEvent.layout;
                if (height === wrapperMeasuredHeight) {
                    return;
                }
                setWrapperMeasuredHeight(height);
            }}
        >
            {content}
            <View style={pointerWrapperStyle}>
                <View style={pointerStyle} />
            </View>
        </Animated.View>
    );
}

BaseGenericTooltip.displayName = 'BaseGenericTooltip';

export default React.memo(BaseGenericTooltip);
