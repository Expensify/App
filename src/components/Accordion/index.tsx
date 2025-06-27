import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import Animated, {Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';

type AccordionProps = {
    /** Giving information whether the component is open */
    isExpanded: SharedValue<boolean>;

    /** Element that is inside Accordion */
    children: ReactNode;

    /** Duration of expansion animation  */
    duration?: number;

    /** Additional external style */
    style?: StyleProp<ViewStyle>;

    /** Was toggle triggered */
    isToggleTriggered: SharedValue<boolean>;
};

function Accordion({isExpanded, children, duration = 300, isToggleTriggered, style}: AccordionProps) {
    const height = useSharedValue(0);
    const isAnimating = useSharedValue(false);

    const derivedHeight = useDerivedValue(() => {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? height.get() : 0;
        }

        const animationDuration = isExpanded.get() ? duration : duration * 0.6; // Faster closing
        return withTiming(height.get() * Number(isExpanded.get()), {
            duration: animationDuration,
            easing: Easing.inOut(Easing.quad),
        });
    });

    const derivedOpacity = useDerivedValue(() => {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? 1 : 0;
        }

        isAnimating.set(true);
        const animationDuration = isExpanded.get() ? duration : duration * 0.5; // Faster closing
        return withTiming(
            isExpanded.get() ? 1 : 0,
            {
                duration: animationDuration,
                easing: Easing.inOut(Easing.quad),
            },
            (finished) => {
                if (!finished) {
                    return;
                }
                isAnimating.set(false);
            },
        );
    });

    const animatedStyle = useAnimatedStyle(() => {
        // If not expanded and no toggle was triggered, hide immediately
        if (!isToggleTriggered.get() && !isExpanded.get()) {
            return {
                height: 0,
                opacity: 0,
                display: 'none',
            };
        }

        // During animation, always show the element
        // Only hide when animation is complete and element should be closed
        const shouldShow = isExpanded.get() || isAnimating.get();

        return {
            height: !isToggleTriggered.get() ? undefined : derivedHeight.get(),
            maxHeight: !isToggleTriggered.get() ? undefined : derivedHeight.get(),
            opacity: derivedOpacity.get(),
            overflow: isAnimating.get() ? 'hidden' : 'visible',
            display: shouldShow ? 'inline' : 'none',
        };
    });

    return (
        <Animated.View style={[animatedStyle, style]}>
            <View
                onLayout={(e) => {
                    height.set(e.nativeEvent.layout.height);
                }}
            >
                {children}
            </View>
        </Animated.View>
    );
}
Accordion.displayName = 'Accordion';

export default Accordion;
