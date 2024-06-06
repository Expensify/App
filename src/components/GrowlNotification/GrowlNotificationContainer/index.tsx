import React from 'react';
import {Animated} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <Animated.View
            style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, styles.growlNotificationTranslateY(translateY), shouldUseNarrowLayout && styles.mwn]}
        >
            {children}
        </Animated.View>
    );
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
