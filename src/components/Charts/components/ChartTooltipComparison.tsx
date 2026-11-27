import type {TooltipChange, TooltipRow} from '@components/Charts/utils/formatTooltipComparison';
import formatTooltipValue from '@components/Charts/utils/formatTooltipValue';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

import ChartTooltipRow from './ChartTooltipRow';

type ChartTooltipComparisonProps = {
    /** One row per compared series */
    rows: TooltipRow[];

    /** How the primary series changed against the compared one, shown under the rows */
    change?: TooltipChange;
};

/** Renders each compared series' value in the chart tooltip, followed by the change between them */
function ChartTooltipComparison({rows, change}: ChartTooltipComparisonProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const icons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong']);
    const isIncrease = !!change?.isIncrease;

    return (
        <>
            {rows.map((row) => (
                <ChartTooltipRow
                    key={row.key}
                    row={row}
                />
            ))}
            {!!change && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Icon
                        src={isIncrease ? icons.ArrowUpLong : icons.ArrowDownLong}
                        fill={StyleUtils.getSpendChangeIconColor(isIncrease)}
                        width={variables.iconSizeXXSmall}
                        height={variables.iconSizeXXSmall}
                    />
                    <Text style={[styles.chartTooltipText, StyleUtils.getColorStyle(StyleUtils.getSpendChangeTextColor(isIncrease))]}>{formatTooltipValue(change)}</Text>
                </View>
            )}
        </>
    );
}

export default ChartTooltipComparison;
