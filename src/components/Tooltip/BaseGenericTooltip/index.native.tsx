import {Portal} from '@gorhom/portal';
import React, {useMemo, useRef, useState} from 'react';
import {Animated, InteractionManager, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {View as RNView} from 'react-native';
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
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();

    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const rootWrapper = useRef<RNView>(null);

    const StyleUtils = useStyleUtils();

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
                anchorAlignment,
                wrapperStyle,
                shouldAddHorizontalPadding: false,
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
            anchorAlignment,
            wrapperStyle,
        ],
    );

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
                    const {height} = e.nativeEvent.layout;
                    if (height === wrapperMeasuredHeight) {
                        return;
                    }
                    setWrapperMeasuredHeight(height);
                    // When tooltip is used inside an animated view (e.g. popover), we need to wait for the animation to finish before measuring content.
                    const target = e.target;
                    setTimeout(() => {
                        InteractionManager.runAfterInteractions(() => {
                            target.measure((x, y, width) => {
                                setContentMeasuredWidth(width);
                            });
                        });
                    }, CONST.ANIMATED_TRANSITION);
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
