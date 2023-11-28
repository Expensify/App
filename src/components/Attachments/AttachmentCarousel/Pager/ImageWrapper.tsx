import React from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import useThemeStyles from '@styles/useThemeStyles';
import ChildrenProps from '@src/types/utils/ChildrenProps';

function ImageWrapper({children}: ChildrenProps) {
    const styles = useThemeStyles();
    return (
        <Animated.View
            collapsable={false}
            style={[StyleSheet.absoluteFill, styles.justifyContentCenter, styles.alignItemsCenter]}
        >
            {children}
        </Animated.View>
    );
}

ImageWrapper.displayName = 'ImageWrapper';

export default ImageWrapper;
