import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type TransactionDataCellProps from './TransactionDataCellProps';

// If the transaction is cash, it has the type CONST.EXPENSE.TYPE.CASH_CARD_NAME.
// If there is no credit card name, it means it couldn't be a card transaction,
// so we assume it's cash. Any other type is treated as a card transaction.
// same in getTypeText

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

const getTypeText = (type?: string): TranslationPaths => {
    switch (type) {
        case CONST.EXPENSE.TYPE.CASH_CARD_NAME:
            return 'iou.cash';
        case undefined:
            return 'iou.cash';
        default:
            return 'iou.card';
    }
};

function TypeCell({transactionItem, shouldUseNarrowLayout, shouldShowTooltip}: TransactionDataCellProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const typeIcon = getTypeIcon(transactionItem.cardName);
    const typeText = getTypeText(transactionItem.cardName);
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
