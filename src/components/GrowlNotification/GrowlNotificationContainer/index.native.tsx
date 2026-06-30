import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, progress, inactiveY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    // `progress` is a SharedValue read via .get() inside the worklet, so it's intentionally
    // omitted from the deps array — only the plain JS value `inactiveY` needs to invalidate the style.
    const animatedStyles = useAnimatedStyle(() => ({transform: [{translateY: inactiveY * (1 - progress.get())}]}), [inactiveY]);

    return <Animated.View style={[StyleUtils.getPlatformSafeAreaPadding(insets), styles.growlNotificationContainer, animatedStyles]}>{children}</Animated.View>;
}

export default GrowlNotificationContainer;
