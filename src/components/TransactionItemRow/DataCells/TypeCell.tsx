import React from 'react';
import Icon from '@components/Icon';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTransactionType, isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (icons: Record<'Car' | 'CreditCard' | 'Cash' | 'Clock', IconAsset>, type?: string) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return icons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return icons.Car;
        case CONST.SEARCH.TRANSACTION_TYPE.TIME:
            return icons.Clock;
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return icons.Cash;
    }
};

const getTypeText = (type?: string): TranslationPaths => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'iou.card';
        case CONST.SEARCH.TRANSACTION_TYPE.TIME:
            return 'iou.time';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return 'iou.cash';
    }
};

function TypeCell({transactionItem, shouldUseNarrowLayout, shouldShowTooltip}: TransactionDataCellProps) {
    const {translate} = useLocalize();
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Car', 'CreditCard', 'CreditCardHourglass', 'Cash', 'Clock']);
    const type = getTransactionType(transactionItem, cardList);
    const isPendingExpensifyCardTransaction = isExpensifyCardTransaction(transactionItem) && isPending(transactionItem);
    const typeIcon = isPendingExpensifyCardTransaction ? expensifyIcons.CreditCardHourglass : getTypeIcon(expensifyIcons, type);
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
            height={variables.iconSizeNormal}
            width={variables.iconSizeNormal}
        />
    );
}

export default TypeCell;
