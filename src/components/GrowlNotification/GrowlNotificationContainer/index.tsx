import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const animatedStyles = useAnimatedStyle(() => styles.growlNotificationTranslateY(translateY));

    return (
        <Animated.View style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, animatedStyles, shouldUseNarrowLayout && styles.mwn]}>{children}</Animated.View>
    );
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
