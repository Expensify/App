import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import TextWithTooltip from '@components/TextWithTooltip';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getExpenseTypeTranslationKey, getTransactionType, isExpensifyCardTransaction, isManagedCardTransaction, isPending} from '@libs/TransactionUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type IconAsset from '@src/types/utils/IconAsset';
import type TransactionDataCellProps from './TransactionDataCellProps';

const getTypeIcon = (
    icons: Record<'Car' | 'CreditCard' | 'CreditCardLock' | 'ExpensifyCard' | 'Cash' | 'Clock' | 'CalendarSolid', IconAsset>,
    type?: string,
    isExpensifyCard?: boolean,
    isManagedCard?: boolean,
) => {
    switch (type) {
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
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
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Car', 'CreditCard', 'CreditCardLock', 'ExpensifyCard', 'ExpensifyCardHourglass', 'Cash', 'Clock', 'CalendarSolid']);
    const type = getTransactionType(transactionItem, cardList);
    const isExpensifyCard = isExpensifyCardTransaction(transactionItem);
    const isManagedCard = isManagedCardTransaction(transactionItem);
    const isPendingExpensifyCardTransaction = isExpensifyCard && isPending(transactionItem);
    const typeIcon = isPendingExpensifyCardTransaction ? expensifyIcons.ExpensifyCardHourglass : getTypeIcon(expensifyIcons, type, isExpensifyCard, isManagedCard);
    const typeText = isPendingExpensifyCardTransaction ? 'iou.pending' : getExpenseTypeTranslationKey(type);
    const styles = useThemeStyles();

    const getTooltipText = () => {
        if (isPendingExpensifyCardTransaction) {
            return translate('iou.pending');
        }
        if (isExpensifyCard) {
            return translate('cardTransactions.expensifyCard');
        }
        if (isManagedCard) {
            return translate('cardTransactions.companyCard');
        }
        if (type === CONST.SEARCH.TRANSACTION_TYPE.CARD) {
            return translate('cardTransactions.personalCard');
        }
        return translate(typeText);
    };

    return shouldUseNarrowLayout ? (
        <TextWithTooltip
            shouldShowTooltip={shouldShowTooltip}
            text={translate(typeText)}
            style={[styles.textMicroSupporting, styles.pre, styles.justifyContentCenter]}
        />
    ) : (
        <Tooltip text={getTooltipText()}>
            <View>
                <Icon
                    src={typeIcon}
                    fill={theme.icon}
                    height={variables.iconSizeNormal}
                    width={variables.iconSizeNormal}
                />
            </View>
        </Tooltip>
    );
}

export default TypeCell;
