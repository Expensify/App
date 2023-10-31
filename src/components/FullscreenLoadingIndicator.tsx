import React from 'react';
import {ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import styles from '@styles/styles';
import themeColors from '@styles/themes/default';

type FullScreenLoadingIndicatorProps = {
    style?: StyleProp<ViewStyle>;
};

function FullScreenLoadingIndicator({style}: FullScreenLoadingIndicatorProps) {
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, style]}>
            <ActivityIndicator
                color={themeColors.spinner}
                size="large"
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
