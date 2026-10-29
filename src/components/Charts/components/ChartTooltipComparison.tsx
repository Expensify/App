import formatAmountWithPercentage from '@components/Charts/utils/formatAmountWithPercentage';
import type {TooltipChange, TooltipRow} from '@components/Charts/utils/formatTooltipComparison';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
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
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const changeColor = StyleUtils.getSpendChangeColor(!!change?.isIncrease);

    return (
        <>
            {rows.map((row) => {
                const amountContent = formatAmountWithPercentage(row.amount, row.percentage);
                return (
                    <View
                        key={row.key}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}
                    >
                        <View style={[styles.chartTooltipDot, StyleUtils.getBackgroundColorStyle(row.color)]} />
                        <Text style={styles.chartTooltipText}>{row.label ? `${row.label}: ${amountContent}` : amountContent}</Text>
                    </View>
                );
            })}
            {!!change && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Icon
                        src={change.isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                        fill={changeColor}
                        width={variables.iconSizeXXSmall}
                        height={variables.iconSizeXXSmall}
                    />
                    <Text style={[styles.chartTooltipText, StyleUtils.getColorStyle(changeColor)]}>{formatAmountWithPercentage(change.amount, change.percentage)}</Text>
                </View>
            )}
        </>
    );
}

export default ChartTooltipComparison;
