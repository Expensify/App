import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type TransactionDataCellProps from './TransactionDataCellProps';

// If the transaction is cash, it has the type CONST.EXPENSE.TYPE.CASH_CARD_NAME.
// If there is no credit card name, it means it couldn't be a card transaction,
// so we assume it's cash. Any other type is treated as a card transaction.
// same in getTypeText
const getType = (cardName?: string) => {
    if (!cardName || cardName.includes(CONST.EXPENSE.TYPE.CASH_CARD_NAME)) {
        return CONST.SEARCH.TRANSACTION_TYPE.CASH;
    }
    return CONST.SEARCH.TRANSACTION_TYPE.CARD;
};

const getTypeIcon = (type?: string) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return Expensicons.Car;
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return Expensicons.Cash;
    }
};

const getTypeText = (type?: string): TranslationPaths => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'iou.card';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return 'iou.cash';
    }
};

function TypeCell({transactionItem, shouldUseNarrowLayout, shouldShowTooltip}: TransactionDataCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const type = transactionItem.transactionType ?? getType(transactionItem.cardName);
    const isPendingExpensifyCardTransaction = isExpensifyCardTransaction(transactionItem) && isPending(transactionItem);
    const typeIcon = isPendingExpensifyCardTransaction ? Expensicons.CreditCardHourglass : getTypeIcon(type);
    const typeText = isPendingExpensifyCardTransaction ? 'iou.pending' : getTypeText(type);
    const styles = useThemeStyles();

    return shouldUseNarrowLayout ? (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={translate(typeText)}
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
