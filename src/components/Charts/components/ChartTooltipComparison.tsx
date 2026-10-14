import type {TooltipChange, TooltipRow} from '@components/Charts/utils/formatTooltipComparison';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type ChartTooltipComparisonProps = {
    /** One row per compared series */
    rows: TooltipRow[];

    /** How the primary series changed against the compared one, shown under the rows */
    change?: TooltipChange;
};

/** Renders each compared series' amount in the chart tooltip, followed by the change between them */
function ChartTooltipComparison({rows, change}: ChartTooltipComparisonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const changeColor = change?.isIncrease ? theme.danger : theme.successHover;

    return (
        <>
            {rows.map((row) => {
                const amountContent = row.percentage ? `${row.amount} (${row.percentage})` : row.amount;
                return (
                    <View
                        key={row.key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}
                    >
                        <View style={[styles.pieChartLegendDot, StyleUtils.getBackgroundColorStyle(row.color)]} />
                        <Text style={styles.chartTooltipText}>{row.label ? `${row.label}: ${amountContent}` : amountContent}</Text>
                    </View>
                );
            })}
            {!!change && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Icon
                        src={change.isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                        fill={changeColor}
                        width={variables.iconSizeExtraSmall}
                        height={variables.iconSizeExtraSmall}
                    />
                    <Text style={[styles.chartTooltipText, StyleUtils.getColorStyle(changeColor)]}>{change.percentage ? `${change.amount} (${change.percentage})` : change.amount}</Text>
                </View>
            )}
        </>
    );
}

export default ChartTooltipComparison;
