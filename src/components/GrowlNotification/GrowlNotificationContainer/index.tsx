import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, progress, inactiveY, useBottomPosition}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const animatedStyles = useAnimatedStyle(() => ({transform: [{translateY: inactiveY * (1 - progress.get())}]}), [inactiveY]);

    if (useBottomPosition) {
        return <Animated.View style={[styles.growlNotificationContainerBottomRight, animatedStyles]}>{children}</Animated.View>;
    }

    return (
        <Animated.View style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, animatedStyles, shouldUseNarrowLayout && styles.mwn]}>{children}</Animated.View>
    );
}

export default GrowlNotificationContainer;
