import Text from '@components/Text';
import Tooltip from '@components/Tooltip';

import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';

import type {LayoutChangeEvent, StyleProp, TextStyle} from 'react-native';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming} from 'react-native-reanimated';

/** How long the label takes to travel one pixel, so a longer name scrolls for longer rather than faster. */
const MARQUEE_MS_PER_PIXEL = 25;
const MARQUEE_MIN_DURATION_MS = 600;

/** Extra travel past the overflow, so the tail of the name clears the hover control rather than stopping under it. */
const MARQUEE_END_GUTTER = 40;

/** How long the end of the name stays in view before the label travels back to the start. */
const MARQUEE_HOLD_MS = 2000;

/** `target` is a DOM node on web only; the measurement, and so the marquee, is skipped everywhere else. */
type WebLayoutEvent = {target?: {scrollWidth: number}};

type FlatNavMarqueeLabelProps = {
    text: string;
    style: StyleProp<TextStyle>;
    isHovered: boolean;
};

/**
 * A label the user named themselves, which may not fit its row. It truncates at rest, and on hover scrolls to
 * reveal the rest of the name. The tooltip stays, for pointers that never settle and for screen readers.
 */
function FlatNavMarqueeLabel({text, style, isHovered}: FlatNavMarqueeLabelProps) {
    const styles = useThemeStyles();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    // Measured apart so the scroll distance stays right when the row reserves space for its hover control: the
    // container narrows on hover, and its own layout reports that, while the text's full width does not change.
    const [textWidth, setTextWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const offset = useSharedValue(0);

    const overflow = Math.max(textWidth - containerWidth, 0);
    const isTruncated = overflow > 0;
    const shouldScroll = isTruncated && isHovered && !isReduceMotionEnabled;

    useEffect(() => {
        if (!shouldScroll) {
            offset.set(withTiming(0, {duration: MARQUEE_MIN_DURATION_MS, easing: Easing.out(Easing.ease)}));
            return;
        }

        const distance = overflow + MARQUEE_END_GUTTER;
        const duration = Math.max(distance * MARQUEE_MS_PER_PIXEL, MARQUEE_MIN_DURATION_MS);
        // Out, hold on the end of the name, then back. Leaving the row interrupts this with the reset above.
        offset.set(withSequence(withTiming(-distance, {duration, easing: Easing.linear}), withDelay(MARQUEE_HOLD_MS, withTiming(0, {duration, easing: Easing.linear}))));
    }, [shouldScroll, overflow, offset]);

    const marqueeStyle = useAnimatedStyle(() => ({transform: [{translateX: offset.get()}]}));

    const onTextLayout = (event: LayoutChangeEvent) => {
        // react-native's LayoutChangeEvent has no `target`; on web it carries the DOM node, whose scrollWidth is the
        // text's full width even while an ellipsis is showing.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const target = (event.nativeEvent as unknown as WebLayoutEvent).target;
        if (!target) {
            return;
        }
        setTextWidth(target.scrollWidth);
    };

    return (
        <Tooltip
            shouldRender={isTruncated}
            text={text}
        >
            <View
                style={styles.overflowHidden}
                onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
            >
                {shouldScroll ? (
                    // Sized to its own text so there is something to scroll to; the container crops it, with no ellipsis.
                    <Animated.View style={[styles.alignSelfStart, marqueeStyle]}>
                        <Text
                            numberOfLines={1}
                            style={[style, styles.pre]}
                        >
                            {text}
                        </Text>
                    </Animated.View>
                ) : (
                    <Text
                        numberOfLines={1}
                        style={style}
                        onLayout={onTextLayout}
                    >
                        {text}
                    </Text>
                )}
            </View>
        </Tooltip>
    );
}

export default FlatNavMarqueeLabel;
