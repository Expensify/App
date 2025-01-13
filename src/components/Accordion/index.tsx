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

    /** Should active animation */
    shouldActiveAnimation?: React.RefObject<boolean>;
};

function Accordion({isExpanded, children, duration = 300, style, shouldActiveAnimation = React.useRef(true)}: AccordionProps) {
    const height = useSharedValue(0);
    const styles = useThemeStyles();

    const derivedHeight = useDerivedValue(() =>
        shouldActiveAnimation.current
            ? withTiming(height.get() * Number(isExpanded.get()), {
                  duration,
                  easing: Easing.inOut(Easing.quad),
              })
            : height.get() * Number(isExpanded.get()),
    );

    const derivedOpacity = useDerivedValue(() => {
        if (shouldActiveAnimation.current) {
            return withTiming(isExpanded.get() ? 1 : 0, {
                duration,
                easing: Easing.inOut(Easing.quad),
            });
        }
        return isExpanded.get() ? 1 : 0;
    });

    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.get(),
        opacity: derivedOpacity.get(),
    }));

    return (
        <Animated.View style={[bodyStyle, style]}>
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
