import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';

import variables from '@styles/variables';

import React from 'react';

import type {ExpenseFieldRowProps} from './ExpenseFieldRow';

import ExpenseFieldRow from './ExpenseFieldRow';

type HighlightableExpenseFieldRowProps = Omit<ExpenseFieldRowProps, 'backgroundStyle'> & {
    /** Whether the row flashes once when it mounts, to point out a field that just appeared */
    shouldHighlight?: boolean;
};

/**
 * An `ExpenseFieldRow` that flashes once when it appears, for a field the form only just started asking for.
 *
 * The flash drives the row's fill rather than its own wrapper, since the row draws its background over anything
 * behind it.
 */
function HighlightableExpenseFieldRow({shouldHighlight = false, ...props}: HighlightableExpenseFieldRowProps) {
    const theme = useTheme();
    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.appBG,
        borderRadius: variables.componentBorderRadiusNormal,
        itemEnterDelay: 0,
    });

    return (
        <ExpenseFieldRow
            {...props}
            backgroundStyle={animatedHighlightStyle}
        />
    );
}

export default HighlightableExpenseFieldRow;
