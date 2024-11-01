import React from 'react';
import {StyleSheet, View} from 'react-native';
import useIndicatorStatus from '@hooks/useIndicatorStatus';
import useThemeStyles from '@hooks/useThemeStyles';

function Indicator() {
    const styles = useThemeStyles();
    const {indicatorColor, status} = useIndicatorStatus();

    const indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator(indicatorColor)];

    return !!status && <View style={StyleSheet.flatten(indicatorStyles)} />;
}

Indicator.displayName = 'Indicator';

export default Indicator;
