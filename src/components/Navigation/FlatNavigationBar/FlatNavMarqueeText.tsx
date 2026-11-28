/**
 * A one-line label the user named themselves, which may not fit its row. It is cut with an ellipsis at rest, and while
 * active scrolls once to reveal its end, holds there, and scrolls back. A tooltip shows the full name when it is cut.
 */
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import type {TextProps} from '@components/Text';
import Tooltip from '@components/Tooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import measureTextWidth from '@libs/measureTextWidth';

import type {TextVariant} from '@styles/typography';
import {textVariants} from '@styles/typography';

import CONST from '@src/CONST';

import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';

type FlatNavMarqueeTextProps = Pick<TextProps, 'color'> & {
    variant: TextVariant;

    text: string;

    /** Whether the label scrolls, as while its row is hovered or focused */
    isActive: boolean;

    /** Extra travel past the overflow in px, so the end of the label clears whatever is drawn over the row's end. Defaults to 0. */
    endInset?: number;
};

function FlatNavMarqueeText({text, isActive, endInset = 0, variant, color}: FlatNavMarqueeTextProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const [containerWidth, setContainerWidth] = useState(0);
    // Measured from the font rather than the layout, as the label is cut while at rest. Platforms that cannot measure text get no marquee and no tooltip.
    const font = textVariants[variant];
    const textWidth = measureTextWidth(text, {fontSize: font.fontSize, fontFamily: font.fontFamily, fontWeight: String(font.fontWeight)}) ?? 0;
    const offset = useSharedValue(0);

    const overflow = Math.max(textWidth - containerWidth, 0);
    const isTruncated = overflow > 0;
    const shouldScroll = isTruncated && isActive && !isReduceMotionEnabled;

    useEffect(() => {
        if (!shouldScroll) {
            offset.set(0);
            return;
        }
        const distance = overflow + endInset;
        const duration = Math.max(distance * CONST.MARQUEE_ANIMATION.MS_PER_PIXEL, CONST.MARQUEE_ANIMATION.MIN_DURATION);
        // Once out to the end, a hold, and back. Leaving the row stops it and the label returns to its ellipsis.
        offset.set(
            withSequence(withTiming(-distance, {duration, easing: Easing.linear}), withDelay(CONST.MARQUEE_ANIMATION.HOLD_DURATION, withTiming(0, {duration, easing: Easing.linear}))),
        );
    }, [shouldScroll, overflow, endInset, offset]);

    const marqueeStyle = useAnimatedStyle(() => ({transform: [{translateX: offset.get()}]}));

    const label = (
        <Text
            variant={variant}
            color={color}
            numberOfLines={1}
        >
            {text}
        </Text>
    );

    return (
        <Tooltip
            shouldRender={isTruncated}
            text={text}
        >
            <View
                style={styles.overflowHidden}
                onLayout={(event: LayoutChangeEvent) => setContainerWidth(event.nativeEvent.layout.width)}
            >
                {shouldScroll ? (
                    <ScrollView
                        horizontal
                        scrollEnabled={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <Animated.View style={marqueeStyle}>{label}</Animated.View>
                    </ScrollView>
                ) : (
                    label
                )}
            </View>
        </Tooltip>
    );
}

export default FlatNavMarqueeText;
