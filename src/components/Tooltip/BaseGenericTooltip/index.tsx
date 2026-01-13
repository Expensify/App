import React, {useContext, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import AnimatedPressableWithoutFeedback from '@components/AnimatedPressableWithoutFeedback';
import TransparentOverlay from '@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay';
import {PopoverContext} from '@components/PopoverProvider';
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
    minWidth,
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
    onTooltipPress,
}: BaseGenericTooltipProps) {
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    const [contentMeasuredWidth, setContentMeasuredWidth] = useState<number>();
    // The height of tooltip's wrapper.
    const [wrapperMeasuredHeight, setWrapperMeasuredHeight] = useState<number>();
    const contentRef = useRef<HTMLDivElement>(null);
    const rootWrapper = useRef<HTMLDivElement>(null);

    const StyleUtils = useStyleUtils();
    const {setActivePopoverExtraAnchorRef} = useContext(PopoverContext);

    useEffect(() => {
        if (!isEducationTooltip) {
            return;
        }
        setActivePopoverExtraAnchorRef(rootWrapper);
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
                minWidth,
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
            minWidth,
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
        content = (
            <View
                ref={viewRef(contentRef)}
                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
            >
                {renderTooltipContent()}
            </View>
        );
    } else {
        content = (
            <Text
                numberOfLines={numberOfLines}
                style={textStyle}
                fsClass={CONST.FULLSTORY.CLASS.UNMASK}
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

    const AnimatedWrapper = isEducationTooltip ? AnimatedPressableWithoutFeedback : Animated.View;

    const body = document.querySelector('body');

    if (!body) {
        return null;
    }

    return ReactDOM.createPortal(
        <>
            {shouldUseOverlay && <TransparentOverlay onPress={onHideTooltip} />}
            <AnimatedWrapper
                ref={viewRef(rootWrapper)}
                style={[rootWrapperStyle, animationStyle]}
                onPress={isEducationTooltip ? onTooltipPress : undefined}
                role={isEducationTooltip ? CONST.ROLE.TOOLTIP : undefined}
                accessibilityLabel={isEducationTooltip ? CONST.ROLE.TOOLTIP : undefined}
                interactive={isEducationTooltip ? !!onTooltipPress : undefined}
            >
                {content}
                <View style={pointerWrapperStyle}>
                    <View style={pointerStyle} />
                </View>
            </AnimatedWrapper>
        </>,
        body,
    );
}

BaseGenericTooltip.displayName = 'BaseGenericTooltip';

export default React.memo(BaseGenericTooltip);
