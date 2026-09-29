import Icon from '@components/Icon';
import TextWithTooltip from '@components/TextWithTooltip';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {isTravelCardTransaction} from '@libs/CardUtils';
import {
    getDetailedExpenseTypeTranslationKey,
    getExpenseTypeTranslationKey,
    getTransactionType,
    isExpensifyCardTransaction,
    isManagedCardTransaction,
    isPending,
} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (
    icons: Record<'Car' | 'CreditCard' | 'CreditCardLock' | 'CreditCardWithPlane' | 'ExpensifyCard' | 'Cash' | 'Clock' | 'CalendarSolid', IconAsset>,
    type?: string,
    isExpensifyCard?: boolean,
    isManagedCard?: boolean,
    isTravelBillingCard?: boolean,
) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            // Travel billing cards are technically Expensify-issued (bank === EXPENSIFY_CARD.BANK), so this branch must come before the isExpensifyCard branch.
            if (isTravelBillingCard) {
                return icons.CreditCardWithPlane;
            }
            if (isExpensifyCard) {
                return icons.ExpensifyCard;
            }
            if (isManagedCard) {
                return icons.CreditCardLock;
            }
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
    const [card] = useOnyx(ONYXKEYS.CARD_LIST, {selector: (cardList) => (transactionItem.cardID ? cardList?.[transactionItem.cardID] : undefined)});
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons([
        'Car',
        'CreditCard',
        'CreditCardHourglass',
        'CreditCardLock',
        'CreditCardWithPlane',
        'CreditCardWithPlaneHourglass',
        'ExpensifyCard',
        'ExpensifyCardHourglass',
        'Cash',
        'Clock',
        'CalendarSolid',
    ]);
    const type = getTransactionType(transactionItem, card);
    const isExpensifyCard = isExpensifyCardTransaction(transactionItem);
    const isManagedCard = isManagedCardTransaction(transactionItem);
    const isTravelBillingCard = isTravelCardTransaction(transactionItem.feedCountry, card);
    const isPendingCardTransaction = isPending(transactionItem);
    const getPendingIcon = () => {
        if (isTravelBillingCard) {
            return expensifyIcons.CreditCardWithPlaneHourglass;
        }
        if (isExpensifyCard) {
            return expensifyIcons.ExpensifyCardHourglass;
        }
        return expensifyIcons.CreditCardHourglass;
    };
    const pendingIcon = getPendingIcon();
    const typeIcon = isPendingCardTransaction ? pendingIcon : getTypeIcon(expensifyIcons, type, isExpensifyCard, isManagedCard, isTravelBillingCard);
    const typeText = isPendingCardTransaction ? 'iou.pending' : getExpenseTypeTranslationKey(type);
    const styles = useThemeStyles();

    return shouldUseNarrowLayout ? (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={translate(typeText)}
            style={[styles.mutedNormalTextLabel, styles.pre, styles.justifyContentCenter, styles.flexShrink0]}
        />
    ) : (
        <Tooltip text={translate(getDetailedExpenseTypeTranslationKey(transactionItem, card))}>
            <View>
                <Icon
                    src={typeIcon}
                    fill={theme.icon}
                    height={variables.iconSizeSmall}
                    width={variables.iconSizeSmall}
                />
            </View>
        </Tooltip>
    );
}

export default TypeCell;
