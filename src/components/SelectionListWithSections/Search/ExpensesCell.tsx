import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

type ExpensesDataCellProps = {
    count: number;

    shouldShowTooltip?: boolean;
};

function ExpensesDataCell({count, shouldShowTooltip = true}: ExpensesDataCellProps) {
    const styles = useThemeStyles();

    return (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={String(count)}
            style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre]}
        />
    );
}

ExpensesDataCell.displayName = 'ExpensesDataCell';

export default ExpensesDataCell;
