import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import Icon from '@components/Icon';
import TextWithTooltip from '@components/TextWithTooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExpenseTypeTranslationKey, getTransactionType, isExpensifyCardTransaction, isPending} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (icons: Record<'Car' | 'CreditCard' | 'Cash' | 'Clock' | 'CalendarSolid', IconAsset>, type?: string) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return icons.CreditCard;
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return icons.Car;
        case CONST.SEARCH.TRANSACTION_TYPE.TIME:
            return icons.Clock;
        case CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM:
            return icons.CalendarSolid;
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
        default:
            return icons.Cash;
    }
};

function TypeCell({transactionItem, shouldUseNarrowLayout, shouldShowTooltip}: TransactionDataCellProps) {
    const {translate} = useLocalize();
    const cardSelector = (cards: OnyxEntry<CardList>): OnyxEntry<Card> => cards?.[transactionItem.cardID ?? CONST.DEFAULT_NUMBER_ID];
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: cardSelector});
    const cardID = `${transactionItem.cardID}`;
    const cardList = transactionItem.cardID && card ? {[cardID]: card} : undefined;
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Car', 'CreditCard', 'CreditCardHourglass', 'Cash', 'Clock', 'CalendarSolid']);
    const type = getTransactionType(transactionItem, cardList);
    const isPendingExpensifyCardTransaction = isExpensifyCardTransaction(transactionItem) && isPending(transactionItem);
    const typeIcon = isPendingExpensifyCardTransaction ? expensifyIcons.CreditCardHourglass : getTypeIcon(expensifyIcons, type);
    const typeText = isPendingExpensifyCardTransaction ? 'iou.pending' : getExpenseTypeTranslationKey(type);
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
