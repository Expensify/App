import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import type {SharedValue} from 'react-native-reanimated';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import useThemeStyles from '@hooks/useThemeStyles';

type AccordionProps = {
    /** Giving information whether the component is open */
    isExpanded: SharedValue<boolean>;

    /** Element that is inside Accordion */
    children: ReactNode;

    /** Duration of expansion animation  */
    duration?: number;
};

function Accordion({isExpanded, children, duration = 300}: AccordionProps) {
    const height = useSharedValue(0);
    const styles = useThemeStyles();
    const derivedHeight = useDerivedValue(() =>
        withTiming(height.get() * Number(isExpanded.get()), {
            duration,
        }),
    );
    const bodyStyle = useAnimatedStyle(() => ({
        height: derivedHeight.get(),
    }));

    return (
        <Animated.View style={[bodyStyle, styles.overflowHidden]}>
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
