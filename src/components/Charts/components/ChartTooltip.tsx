import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
/** The height of the chart tooltip pointer */
const TOOLTIP_POINTER_HEIGHT = 4;

/** The width of the chart tooltip pointer */
const TOOLTIP_POINTER_WIDTH = 12;

type ChartTooltipProps = {
    /** Label text (e.g., "Airfare", "Amazon") */
    label: string;

    /** Formatted amount (e.g., "$1,820.00") */
    amount: string;

    /** Optional percentage to display (e.g., "12%") */
    percentage?: string;
};

function ChartTooltip({label, amount, percentage}: ChartTooltipProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const content = percentage ? `${label} • ${amount} (${percentage})` : `${label} • ${amount}`;

    return (
        <View style={styles.chartTooltipWrapper}>
            <View style={styles.chartTooltipBox}>
                <Text style={styles.chartTooltipText}>{content}</Text>
            </View>
            <View
                style={[
                    styles.chartTooltipPointer,
                    {
                        borderLeftWidth: TOOLTIP_POINTER_WIDTH / 2,
                        borderRightWidth: TOOLTIP_POINTER_WIDTH / 2,
                        borderTopWidth: TOOLTIP_POINTER_HEIGHT,
                        borderLeftColor: theme.transparent,
                        borderRightColor: theme.transparent,
                        borderTopColor: theme.heading,
                    },
                ]}
            />
        </View>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
