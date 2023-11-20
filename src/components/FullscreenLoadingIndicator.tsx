import React from 'react';
import {ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';

type FullScreenLoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
};

function FullScreenLoadingIndicator({style}: FullScreenLoadingIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                color={theme.spinner}
                size="large"
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
