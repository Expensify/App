import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';

const FullScreenActivityIndicator = () => (
    <View
        style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}
    >
        <ActivityIndicator color={themeColors.text} />
    </View>
);

FullScreenActivityIndicator.displayName = 'FullScreenActivityIndicator';
export default FullScreenActivityIndicator;
