import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, progress, inactiveY, useBottomPosition}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const {paddingTop, paddingBottom, insets} = useSafeAreaPaddings();
    // `progress` is a SharedValue read via .get() inside the worklet, so it's intentionally
    // omitted from the deps array — only the plain JS value `inactiveY` needs to invalidate the style.
    const animatedStyles = useAnimatedStyle(() => ({transform: [{translateY: inactiveY * (1 - progress.get())}]}), [inactiveY]);

    // The app root leaves the horizontal safe area free for the native tab bar, so the growl keeps out of it itself.
    const safeAreaPadding = {
        paddingTop,
        paddingBottom,
        paddingLeft: insets.left + variables.growlNotificationInset,
        paddingRight: insets.right + variables.growlNotificationInset,
    };

    const containerStyle = useBottomPosition ? [styles.growlNotificationContainerBottomRight, styles.pAbsolute] : styles.growlNotificationContainer;

    return (
        <Animated.View
            pointerEvents={useBottomPosition ? 'box-none' : undefined}
            style={[containerStyle, safeAreaPadding, animatedStyles]}
        >
            <View style={styles.growlNotificationNativeContent}>{children}</View>
        </Animated.View>
    );
}

export default GrowlNotificationContainer;
