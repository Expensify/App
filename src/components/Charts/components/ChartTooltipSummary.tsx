import formatTooltipValue from '@components/Charts/utils/formatTooltipValue';
import type {TooltipValue} from '@components/Charts/utils/formatTooltipValue';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

/** Renders a single value in the chart tooltip with its percentage, and the secondary value on a line of its own */
function ChartTooltipSummary({value, percentage, secondaryValue}: TooltipValue) {
    const styles = useThemeStyles();

    return (
        <>
            {!!value && <Text style={styles.chartTooltipText}>{formatTooltipValue({value, percentage})}</Text>}
            {!!secondaryValue && <Text style={styles.chartTooltipText}>{secondaryValue}</Text>}
        </>
    );
}

export default ChartTooltipSummary;
