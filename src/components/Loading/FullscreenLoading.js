import React from 'react';
import {StyleSheet, View} from 'react-native';
import LoadingIndicator from './LoadingIndicator';
import styles from '../../styles/styles';

const FullScreenLoadingIndicator = () => (
    <View style={[StyleSheet.absoluteFillObject, styles.fullScreenLoading]}>
        <LoadingIndicator size={88} />
    </View>
);

export default FullScreenLoadingIndicator;
