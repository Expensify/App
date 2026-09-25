import type {ChartSeries} from '@components/Charts/types';
import Text from '@components/Text';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type ChartLegendProps = {
    /** One entry is drawn per series, in the order the chart draws them */
    series: ChartSeries[];
};

/** Names the series a bar or line chart plots. A chart plotting one unnamed series draws nothing. */
function ChartLegend({series}: ChartLegendProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const namedSeries = series.filter((seriesItem) => !!seriesItem.label);

    if (namedSeries.length < 2) {
        return null;
    }

    return (
        <View style={[styles.chartLegendContainer, {marginBottom: shouldUseNarrowLayout ? 20 : 32}]}>
            {namedSeries.map((seriesItem) => (
                <View
                    key={seriesItem.key}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}
                >
                    <View style={[styles.pieChartLegendDot, {backgroundColor: seriesItem.color}]} />
                    <Text style={styles.textLabel}>{seriesItem.label}</Text>
                </View>
            ))}
        </View>
    );
}

export default ChartLegend;
