import formatAmountWithPercentage from '@components/Charts/utils/formatAmountWithPercentage';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';

type ChartTooltipSummaryProps = {
    /** Formatted amount (e.g., "$1,820.00") */
    amount: string;

    /** Optional percentage to display (e.g., "12%") */
    percentage?: string;

    /** Optional translated expense count (e.g., "841 expenses") */
    expenseCount?: string;
};

/** Renders a single amount in the chart tooltip, with its share and expense count */
function ChartTooltipSummary({amount, percentage, expenseCount}: ChartTooltipSummaryProps) {
    const styles = useThemeStyles();
    const amountContent = formatAmountWithPercentage(amount, percentage);

    return (
        <>
            {!!amountContent && <Text style={styles.chartTooltipText}>{amountContent}</Text>}
            {!!expenseCount && <Text style={styles.chartTooltipText}>{expenseCount}</Text>}
        </>
    );
}

export default ChartTooltipSummary;
