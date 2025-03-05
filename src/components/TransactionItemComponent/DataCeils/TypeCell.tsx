import useTheme from '@hooks/useTheme';
import Icon from '@components/Icon';
import type {SearchTransactionType} from '@src/types/onyx/SearchResults';
import CONST from '@src/CONST';
import * as Expensicons from '@components/Icon/Expensicons';
import type {TransactionListItemType} from '@components/SelectionList/types';
import React from 'react';
import TextWithTooltip from '@components/TextWithTooltip';
import useThemeStyles from '@hooks/useThemeStyles';

const getTypeIcon = (type?: SearchTransactionType) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return Expensicons.Cash;
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return Expensicons.Car;
        default:
            return Expensicons.Cash;
    }
};

const getTypeText = (type?: SearchTransactionType) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return "Cash";
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return "CreditCard";
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return "Car";
        default:
            return "Cash";
    }
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

function TypeCell({transactionItem, isLargeScreenWidth, showTooltip}: TransactionCellProps) {
    const theme = useTheme();
    const typeIcon = getTypeIcon(transactionItem.transactionType);
    const typeText = getTypeText(transactionItem.transactionType);
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
