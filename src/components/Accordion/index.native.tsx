import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import Animated, {Easing, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';

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
    const styles = useThemeStyles();

    const derivedHeight = useDerivedValue(() => {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? height.get() : 0;
        }

        return withTiming(height.get() * Number(isExpanded.get()), {
            duration,
            easing: Easing.inOut(Easing.quad),
        });
    });

    const derivedOpacity = useDerivedValue(() => {
        if (!isToggleTriggered.get()) {
            return isExpanded.get() ? 1 : 0;
        }

        return withTiming(isExpanded.get() ? 1 : 0, {
            duration,
            easing: Easing.inOut(Easing.quad),
        });
    });

    const animatedStyle = useAnimatedStyle(() => {
        if (!isToggleTriggered.get() && !isExpanded.get()) {
            return {
                height: 0,
                opacity: 0,
            };
        }
        return {
            height: !isToggleTriggered.get() ? height.get() : derivedHeight.get(),
            opacity: derivedOpacity.get(),
        };
    });

    return (
        <Animated.View style={[animatedStyle, style]}>
            <View
                onLayout={(e) => {
                    height.set(e.nativeEvent.layout.height);
                }}
                style={[styles.pAbsolute, styles.l0, styles.r0, styles.t0]}
            >
                {children}
            </View>
        </Animated.View>
    );
}

export default Accordion;
