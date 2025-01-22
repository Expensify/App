import React from 'react';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();
    const animatedStyles = useAnimatedStyle(() => styles.growlNotificationTranslateY(translateY));

    return <Animated.View style={[StyleUtils.getPlatformSafeAreaPadding(insets), styles.growlNotificationContainer, animatedStyles]}>{children}</Animated.View>;
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
