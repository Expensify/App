import formatValueWithNote from '@components/Charts/utils/formatValueWithNote';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ChartTooltipSummaryProps = {
    /** Formatted value, like "$1,820.00" or "841 expenses" */
    value: string;

    /** Optional note shown in parentheses after the value, like its share of total spend */
    note?: string;

    /** Optional translated count (e.g., "841 expenses") */
    countLabel?: string;
};

/** Renders a single value in the chart tooltip, with its note and count */
function ChartTooltipSummary({value, note, countLabel}: ChartTooltipSummaryProps) {
    const styles = useThemeStyles();
    const content = formatValueWithNote(value, note);

    return (
        <>
            {!!content && <Text style={styles.chartTooltipText}>{content}</Text>}
            {!!countLabel && <Text style={styles.chartTooltipText}>{countLabel}</Text>}
        </>
    );
}

export default ChartTooltipSummary;
