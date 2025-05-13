import React from 'react';
import type {ActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type FullScreenLoadingIndicatorIconSize = ActivityIndicatorProps['size'];

type FullScreenLoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
    iconSize?: FullScreenLoadingIndicatorIconSize;
};

function FullScreenLoadingIndicator({style, iconSize = 'large'}: FullScreenLoadingIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                color={theme.spinner}
                size={iconSize}
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;

export type {FullScreenLoadingIndicatorIconSize};
