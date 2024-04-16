import React from 'react';
import {Animated} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY}: GrowlNotificationContainerProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <Animated.View
            style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, styles.growlNotificationTranslateY(translateY), isSmallScreenWidth && styles.mwn]}
        >
            {children}
        </Animated.View>
    );
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default GrowlNotificationContainer;
