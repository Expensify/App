import React from 'react';
import {StyleSheet, View} from 'react-native';
import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useThemeStyles from '@hooks/useThemeStyles';

function Indicator() {
    const styles = useThemeStyles();
    const {indicatorColor, status} = useAccountTabIndicatorStatus();

    const indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator, styles.statusIndicatorColor(indicatorColor)];

    return !!status && <View style={StyleSheet.flatten(indicatorStyles)} />;
}

export default Indicator;
