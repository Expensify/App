/* eslint-disable react-compiler/react-compiler */
import React, {useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import TransparentOverlay from '@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay';
import {PopoverContext} from '@components/PopoverProvider';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import CONST from '@src/CONST';
import textRef from '@src/types/utils/textRef';
import viewRef from '@src/types/utils/viewRef';
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
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    shouldUseOverlay = false,
    onHideTooltip = () => {},
    isEducationTooltip = false,
    onTooltipPress = () => {},
}: BaseGenericTooltipProps) {
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();
    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const contentRef = useRef<HTMLDivElement>(null);
    const rootWrapper = useRef<HTMLDivElement>(null);
    const pressableRef = useRef<HTMLDivElement>(null);

    const StyleUtils = useStyleUtils();
    const {setActivePopoverExtraAnchorRef} = useContext(PopoverContext);

    useEffect(() => {
        if (!isEducationTooltip) {
            return;
        }
        setActivePopoverExtraAnchorRef(pressableRef);
    }, [isEducationTooltip, setActivePopoverExtraAnchorRef]);

    useLayoutEffect(() => {
        // Calculate the tooltip width and height before the browser repaints the screen to prevent flicker
        // because of the late update of the width and the height from onLayout.
        const rootWrapperStyle = rootWrapper?.current?.style;
        const isScaled = rootWrapperStyle?.transform === 'scale(0)';
        if (isScaled) {
            // Temporarily reset the scale caused by animation to get the untransformed size.
            rootWrapperStyle.transform = 'scale(1)';
        }
        setContentMeasuredWidth(contentRef.current?.getBoundingClientRect().width);
        setWrapperMeasuredHeight(rootWrapper.current?.getBoundingClientRect().height);
        if (isScaled) {
            rootWrapperStyle.transform = 'scale(0)';
        }
    }, []);

    const {rootWrapperStyle, textStyle, pointerWrapperStyle, pointerStyle} = useMemo(
        () =>
            StyleUtils.getTooltipStyles({
                tooltip: rootWrapper.current,
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
                isEducationTooltip,
            }),
        [
            StyleUtils,
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
            isEducationTooltip,
        ],
    );

    const animationStyle = useAnimatedStyle(() => {
        return StyleUtils.getTooltipAnimatedStyles({tooltipContentWidth: contentMeasuredWidth, tooltipWrapperHeight: wrapperMeasuredHeight, currentSize: animation});
    });

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
        <>
            {shouldUseOverlay && <TransparentOverlay onPress={onHideTooltip} />}
            <Animated.View
                ref={viewRef(rootWrapper)}
                style={[rootWrapperStyle, animationStyle]}
            >
                <PressableWithoutFeedback
                    onPress={onTooltipPress}
                    ref={pressableRef}
                    role={CONST.ROLE.TOOLTIP}
                    accessibilityLabel={CONST.ROLE.TOOLTIP}
                >
                    {content}
                </PressableWithoutFeedback>
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </Animated.View>
        </>,
        body,
    );
}

BaseGenericTooltip.displayName = 'BaseGenericTooltip';

export default React.memo(BaseGenericTooltip);
