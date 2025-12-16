import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionType, isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (icons: Record<'Car', IconAsset>, type?: string) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return Expensicons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return icons.Car;
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
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Car']);
    const type = getTransactionType(transactionItem, cardList);
    const isPendingExpensifyCardTransaction = isExpensifyCardTransaction(transactionItem) && isPending(transactionItem);
    const typeIcon = isPendingExpensifyCardTransaction ? Expensicons.CreditCardHourglass : getTypeIcon(expensifyIcons, type);
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
