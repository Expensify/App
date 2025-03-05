import useTheme from '@hooks/useTheme';
import Icon from '@components/Icon';
import CONST from '@src/CONST';
import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Expensicons from '@components/Icon/Expensicons';
import type DataCellProps from './DateCellProps';

const getTypeIcon = (type?: string) => {
    switch (type) {
        case CONST.EXPENSE.TYPE.CASH_CARD_NAME:
            return Expensicons.Cash;
        case undefined:
            return Expensicons.Cash;
        default:
            return Expensicons.Cash;
    }
};

const getTypeText = (type?: string) => {
    switch (type) {
        case CONST.EXPENSE.TYPE.CASH_CARD_NAME:
            return "Cash";
        case undefined:
            return "Cash";
        default:
            return "CreditCard";
    }
};

function TypeCell({transactionItem, isLargeScreenWidth, showTooltip}: DataCellProps) {
    const theme = useTheme();
    const typeIcon = getTypeIcon(transactionItem.cardName);
    const typeText = getTypeText(transactionItem.cardName);
    const styles = useThemeStyles();

    return isLargeScreenWidth ? (
        <Icon
            src={typeIcon}
            fill={theme.icon}
            height={isLargeScreenWidth ? 20 : 12}
            width={isLargeScreenWidth ? 20 : 12}
        />
    ) : (<TextWithTooltip
        shouldShowTooltip={showTooltip}
        text={typeText}
        style={[styles.textLabelSupporting, styles.pre, styles.justifyContentCenter]}
    />);
}

TypeCell.displayName = 'TypeCell';
export default TypeCell;
