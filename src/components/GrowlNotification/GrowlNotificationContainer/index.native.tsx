import React from 'react';
import {Animated} from 'react-native';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const insets = useSafeAreaInsets();

    return <Animated.View style={[StyleUtils.getSafeAreaPadding(insets), styles.growlNotificationContainer, styles.growlNotificationTranslateY(translateY)]}>{children}</Animated.View>;
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
