import {Portal} from '@gorhom/portal';
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {View as RNView} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import TransparentOverlay from '@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';
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
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    wrapperStyle = {},
    shouldUseOverlay = false,
    onHideTooltip = () => {},
}: BaseGenericTooltipProps) {
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidthState, setContentMeasuredWidth] = useState<number>();
    const contentMeasuredWidthAnimated = useSharedValue<number>(0);

    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeightState, setWrapperMeasuredHeight] = useState<number>();
    const wrapperMeasuredHeightAnimated = useSharedValue<number>(0);
    const rootWrapper = useRef<RNView>(null);

    const StyleUtils = useStyleUtils();
    const {rootWrapperStyle, textStyle, pointerWrapperStyle, pointerStyle} = useMemo(
        () =>
            StyleUtils.getTooltipStyles({
                // eslint-disable-next-line react-compiler/react-compiler
                tooltip: rootWrapper.current,
                windowWidth,
                xOffset,
                yOffset,
                tooltipTargetWidth: targetWidth,
                tooltipTargetHeight: targetHeight,
                maxWidth,
                tooltipContentWidth: contentMeasuredWidthState,
                tooltipWrapperHeight: wrapperMeasuredHeightState,
                manualShiftHorizontal: shiftHorizontal,
                manualShiftVertical: shiftVertical,
                shouldForceRenderingBelow,
                anchorAlignment,
                wrapperStyle,
                shouldAddHorizontalPadding: false,
            }),
        [
            StyleUtils,
            windowWidth,
            xOffset,
            yOffset,
            targetWidth,
            targetHeight,
            maxWidth,
            contentMeasuredWidthState,
            wrapperMeasuredHeightState,
            shiftHorizontal,
            shiftVertical,
            shouldForceRenderingBelow,
            anchorAlignment,
            wrapperStyle,
        ],
    );

    const animationStyle = useAnimatedStyle(() => {
        return StyleUtils.getTooltipAnimatedStyles({
            tooltipContentWidth: contentMeasuredWidthAnimated.get(),
            tooltipWrapperHeight: wrapperMeasuredHeightAnimated.get(),
            currentSize: animation,
        });
    });

    let content;
    if (renderTooltipContent) {
        content = <View>{renderTooltipContent()}</View>;
    } else {
        content = (
            <Text
                numberOfLines={numberOfLines}
                style={textStyle}
            >
                <Text style={textStyle}>{text}</Text>
            </Text>
        );
    }

    return (
        <Portal hostName={!shouldUseOverlay ? 'modal' : undefined}>
            {shouldUseOverlay && <TransparentOverlay onPress={onHideTooltip} />}
            <Animated.View
                ref={rootWrapper}
                style={[rootWrapperStyle, animationStyle]}
                onLayout={(e) => {
                    const {height, width} = e.nativeEvent.layout;
                    if (height === wrapperMeasuredHeightAnimated.get()) {
                        return;
                    }
                    // To avoid unnecessary re-renders of the content container when passing state values to useAnimatedStyle,
                    // we use SharedValue for managing content and wrapper measurements.
                    contentMeasuredWidthAnimated.set(width);
                    wrapperMeasuredHeightAnimated.set(height);

                    setContentMeasuredWidth(width);
                    setWrapperMeasuredHeight(height);
                }}
            >
                {content}
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </Animated.View>
        </Portal>
    );
}

BaseGenericTooltip.displayName = 'BaseGenericTooltip';

export default React.memo(BaseGenericTooltip);
