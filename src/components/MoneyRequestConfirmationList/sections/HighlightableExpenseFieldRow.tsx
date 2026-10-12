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
 * The flash drives the `Animated.View` the row is wrapped in rather than the row itself, since the row draws its
 * own background over anything behind it. Being the row's parent, the fade carries the row's content with it, the
 * same way `HighlightableMenuItemWithTopDescription` does through its outer wrapper.
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
