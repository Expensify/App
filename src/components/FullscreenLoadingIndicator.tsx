import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type FullScreenLoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
    isFullScreen?: boolean;
};

function FullScreenLoadingIndicator({style, isFullScreen = true}: FullScreenLoadingIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={[isFullScreen && [StyleSheet.absoluteFillObject, styles.fullScreenLoading], style]}>
            <ActivityIndicator
                color={theme.spinner}
                size="large"
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
