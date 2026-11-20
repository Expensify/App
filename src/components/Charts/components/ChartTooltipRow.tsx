import type {TooltipRow} from '@components/Charts/utils/formatTooltipComparison';
import formatTooltipValue from '@components/Charts/utils/formatTooltipValue';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type ChartTooltipRowProps = {
    row: TooltipRow;
};

/** Renders one series' value in the chart tooltip, after a dot in the series' color, or a short dash for an average */
function ChartTooltipRow({row}: ChartTooltipRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const content = formatTooltipValue(row);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <View style={row.isAverage ? styles.chartTooltipAverageDash : [styles.chartTooltipDot, StyleUtils.getBackgroundColorStyle(row.color)]} />
            <Text style={styles.chartTooltipText}>{row.label ? `${row.label}: ${content}` : content}</Text>
        </View>
    );
}

export default ChartTooltipRow;
