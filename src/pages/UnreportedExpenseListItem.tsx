import React, {useState} from 'react';
import {View} from 'react-native';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

function UnreportedExpenseListItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, canSelectMultiple, onFocus, shouldSyncFocus, onSelectRow}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const transactionItem = item as unknown as TransactionListItemType;
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const theme = useTheme();
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
                setIsSelected((val) => !val);
            }}
            containerStyle={[styles.p3, styles.mbn4, styles.expenseWidgetRadius]}
            hoverStyle={[styles.borderRadiusComponentNormal]}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween]}>
                <TransactionItemRow
                    transactionItem={transactionItem}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip={false}
                    dateColumnSize="normal"
                    onCheckboxPress={() => {
                        onSelectRow(item);
                        setIsSelected((val) => !val);
                    }}
                    shouldShowCheckbox
                />
            </View>
        </BaseListItem>
    );
}

UnreportedExpenseListItem.displayName = 'UnreportedExpenseListItem';

export default UnreportedExpenseListItem;
