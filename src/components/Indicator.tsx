import React from 'react';
import {StyleSheet, View} from 'react-native';
import useAccountTabIndicatorStatus from '@hooks/useAccountTabIndicatorStatus';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

function Indicator() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {indicatorColor, status} = useAccountTabIndicatorStatus();

    const indicatorStyles = [styles.alignItemsCenter, styles.justifyContentCenter, styles.statusIndicator, styles.statusIndicatorColor(indicatorColor)];

    const isError = indicatorColor === theme.danger;
    const accessibilityLabel = isError ? translate('accessibilityHints.hasItemsToReview') : translate('accessibilityHints.hasActionToTake');

    return !!status && <View style={StyleSheet.flatten(indicatorStyles)} accessibilityLabel={accessibilityLabel} role="img" />;
}

export default Indicator;
