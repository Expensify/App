import React from 'react';
import {StyleSheet, View} from 'react-native';
import LoadingIndicator from './LoadingIndicator';

const FullScreenLoadingIndicator = () => (
    <View style={styles.container}>
        <LoadingIndicator size={88} />
    </View>
);

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eeeeeecc',
        zIndex: 10,
    },
});

export default FullScreenLoadingIndicator;
