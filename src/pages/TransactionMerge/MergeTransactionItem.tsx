import React from 'react';
import {View} from 'react-native';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function MergeTransactionItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, canSelectMultiple, onFocus, shouldSyncFocus, onSelectRow}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const transactionItem = item as unknown as TransactionListItemType;
    const theme = useTheme();
    const isSelected = item.isSelected ?? false;
    const backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;

    const hoveredTransactionStyles = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    return (
        <BaseListItem
            item={item}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            pressableWrapperStyle={[hoveredTransactionStyles, backgroundColor]}
            onSelectRow={() => {
                onSelectRow(item);
            }}
            containerStyle={[styles.p3, styles.mbn4, styles.expenseWidgetRadius]}
            hoverStyle={[styles.borderRadiusComponentNormal]}
            shouldUseDefaultRightHandSideCheckmark={false}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <TransactionItemRow
                    transactionItem={transactionItem}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip={false}
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    shouldShowRadioButton
                    onRadioButtonPress={() => {
                        onSelectRow(item);
                    }}
                />
            </View>
        </BaseListItem>
    );
}

MergeTransactionItem.displayName = 'MergeTransactionItem';

export default MergeTransactionItem;
