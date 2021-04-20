import React from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Text from './Text';

const UnreadActionIndicator = () => (
    <View style={styles.unreadIndicatorContainer}>
        <View style={styles.unreadIndicatorLine} />
        <Text style={styles.unreadIndicatorText}>
            NEW
        </Text>
    </View>
);

UnreadActionIndicator.displayName = 'UnreadActionIndicator';
export default UnreadActionIndicator;
