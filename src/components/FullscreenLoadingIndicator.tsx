import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

type FullScreenLoadingIndicatorProps = {
    style: Record<string, unknown> | Array<Record<string, unknown>>;
};

function FullScreenLoadingIndicator({style = []}: FullScreenLoadingIndicatorProps) {
    const additionalStyles = Array.isArray(style) ? style : [style];
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading, ...additionalStyles]}>
            <ActivityIndicator
                color={themeColors.spinner}
                size="large"
            />
        </View>
    );
}

FullScreenLoadingIndicator.displayName = 'FullScreenLoadingIndicator';

export default FullScreenLoadingIndicator;
