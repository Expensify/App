import React from 'react';
import {Animated} from 'react-native';
import withWindowDimensions from '@components/withWindowDimensions';
import {WindowDimensionsProps} from '@components/withWindowDimensions/types';
import useThemeStyles from '@styles/useThemeStyles';
import GrowlNotificationContainerProps from './types';

function GrowlNotificationContainer({children, translateY, isSmallScreenWidth}: GrowlNotificationContainerProps & WindowDimensionsProps) {
    const styles = useThemeStyles();

    return (
        <Animated.View
            style={[styles.growlNotificationContainer, styles.growlNotificationDesktopContainer, styles.growlNotificationTranslateY(translateY), isSmallScreenWidth && styles.mwn]}
        >
            {children}
        </Animated.View>
    );
}

GrowlNotificationContainer.displayName = 'GrowlNotificationContainer';

export default withWindowDimensions(GrowlNotificationContainer);
