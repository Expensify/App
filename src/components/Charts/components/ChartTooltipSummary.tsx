import formatValueWithNote from '@components/Charts/utils/formatValueWithNote';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ChartTooltipSummaryProps = {
    /** Formatted value, like "$1,820.00" or "841 expenses" */
    value: string;

    /** Optional note shown in parentheses after the value, like its share of total spend */
    note?: string;

    /** Optional line under the value, like "841 expenses" under an amount or "$1,820.00" under an expense count */
    detail?: string;
};

/** Renders a single value in the chart tooltip, with its note and the line under it */
function ChartTooltipSummary({value, note, detail}: ChartTooltipSummaryProps) {
    const styles = useThemeStyles();
    const content = formatValueWithNote(value, note);

    return (
        <>
            {!!content && <Text style={styles.chartTooltipText}>{content}</Text>}
            {!!detail && <Text style={styles.chartTooltipText}>{detail}</Text>}
        </>
    );
}

export default ChartTooltipSummary;
