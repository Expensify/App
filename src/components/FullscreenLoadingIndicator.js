import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

/**
 * Loading indication component intended to cover the whole page, while the page prepares for initial render
 *
 * @returns {JSX.Element}
 */
const FullScreenLoadingIndicator = () => (
    <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading]}>
        <ActivityIndicator color={themeColors.spinner} size="large" />
    </View>
);

export default FullScreenLoadingIndicator;
