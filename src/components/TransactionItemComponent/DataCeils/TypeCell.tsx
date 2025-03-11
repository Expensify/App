import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithTooltip from '@components/TextWithTooltip';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (type?: string) => {
    switch (type) {
        case CONST.EXPENSE.TYPE.CASH_CARD_NAME:
            return Expensicons.Cash;
        case undefined:
            return Expensicons.Cash;
        default:
            return Expensicons.CreditCard;
    }
};

const getTypeText = (type?: string) => {
    switch (type) {
        case CONST.EXPENSE.TYPE.CASH_CARD_NAME:
            return 'Cash';
        case undefined:
            return 'Cash';
        default:
            return 'CreditCard';
    }
};

function TypeCell({transactionItem, shouldUseNarrowLayout, showTooltip}: TransactionDataCellProps) {
    const theme = useTheme();
    const typeIcon = getTypeIcon(transactionItem.cardName);
    const typeText = getTypeText(transactionItem.cardName);
    const styles = useThemeStyles();

    return shouldUseNarrowLayout ? (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={typeText}
            style={[styles.textMicroSupporting, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={20}
            width={20}
        />
    );
}

TypeCell.displayName = 'TypeCell';
export default TypeCell;
