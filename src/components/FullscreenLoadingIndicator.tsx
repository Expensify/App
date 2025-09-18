import React from 'react';
import type {ActivityIndicatorProps, StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type FullScreenLoadingIndicatorIconSize = ActivityIndicatorProps['size'];

type FullScreenLoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
    iconSize?: FullScreenLoadingIndicatorIconSize;
    testID?: string;
};

function FullScreenLoadingIndicator({style, iconSize = 'large', testID = ''}: FullScreenLoadingIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                color={theme.spinner}
                size={iconSize}
                testID={testID}
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;

export type {FullScreenLoadingIndicatorIconSize};
