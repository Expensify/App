import type {TooltipStacks} from '@components/Charts/utils/formatTooltipStacks';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import ChartTooltipRow from './ChartTooltipRow';

type ChartTooltipStacksProps = TooltipStacks;

/** Renders each stack's segments in the chart tooltip, one section per stack, followed by the average they are compared against */
function ChartTooltipStacks({stacks, averageRow}: ChartTooltipStacksProps) {
    const styles = useThemeStyles();

    return (
        <>
            {stacks.map((stack, index) => (
                <View
                    key={stack.key}
                    style={index > 0 && styles.mt2}
                >
                    {!!stack.label && <Text style={styles.chartTooltipTitle}>{stack.label}</Text>}
                    {stack.rows.map((row) => (
                        <ChartTooltipRow
                            key={row.key}
                            row={row}
                        />
                    ))}
                </View>
            ))}
            {!!averageRow && (
                <View style={stacks.length > 0 && styles.mt2}>
                    <ChartTooltipRow row={averageRow} />
                </View>
            )}
        </>
    );
}

export default ChartTooltipStacks;
