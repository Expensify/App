import formatValueWithNote from '@components/Charts/utils/formatValueWithNote';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ChartTooltipSummaryProps = {
    /** Formatted value, like "$1,820.00" or "841 expenses" */
    value: string;

    /** Optional note shown in parentheses after the value, like its share of total spend */
    note?: string;

    /** Optional translated expense count (e.g., "841 expenses") */
    expenseCount?: string;
};

/** Renders a single value in the chart tooltip, with its note and expense count */
function ChartTooltipSummary({value, note, expenseCount}: ChartTooltipSummaryProps) {
    const styles = useThemeStyles();
    const content = formatValueWithNote(value, note);

    return (
        <>
            {!!content && <Text style={styles.chartTooltipText}>{content}</Text>}
            {!!expenseCount && <Text style={styles.chartTooltipText}>{expenseCount}</Text>}
        </>
    );
}

export default ChartTooltipSummary;
