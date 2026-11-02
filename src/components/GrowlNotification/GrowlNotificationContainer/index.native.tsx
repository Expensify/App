import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, progress, inactiveY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    // `progress` is a SharedValue read via .get() inside the worklet, so it's intentionally
    // omitted from the deps array — only the plain JS value `inactiveY` needs to invalidate the style.
    const animatedStyles = useAnimatedStyle(() => ({transform: [{translateY: inactiveY * (1 - progress.get())}]}), [inactiveY]);

    // The app root leaves the horizontal safe area free for the native tab bar, so the growl keeps out of it itself.
    const horizontalSafeAreaPadding = {paddingLeft: insets.left + variables.growlNotificationInset, paddingRight: insets.right + variables.growlNotificationInset};

    return (
        <Animated.View style={[StyleUtils.getPlatformSafeAreaPadding(insets), styles.growlNotificationContainer, horizontalSafeAreaPadding, animatedStyles]}>
            <View style={styles.growlNotificationNativeContent}>{children}</View>
        </Animated.View>
    );
}

export default GrowlNotificationContainer;
