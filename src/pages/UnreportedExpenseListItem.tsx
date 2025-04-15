import React, {useState} from 'react';
import {View} from 'react-native';
import type {ViewStyle} from 'react-native';
import SelectCircle from '@components/SelectCircle';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ListItemProps} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type Transaction from '@src/types/onyx/Transaction';

const emptyStylesArray: ViewStyle[] = [];

function UnreportedExpenseListItem<TItem extends ListItem & Transaction>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onFocus,
    shouldSyncFocus,
    onSelectRow,
}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const theme = useTheme();

    const backgroundColor = isSelected ? styles.buttonDefaultBG : styles.highlightBG;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
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
            pressableWrapperStyle={[animatedHighlightStyle, backgroundColor]}
            onSelectRow={() => {
                onSelectRow(item);
                setIsSelected((val) => !val);
            }}
            containerStyle={[styles.p3, styles.mbn4, styles.expenseWidgetRadius]}
            hoverStyle={[styles.borderRadiusComponentNormal]}
        >
            <View style={[{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}]}>
                <TransactionItemRow
                    transactionItem={item}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip={false}
                    dateColumnSize="normal"
                    onCheckboxPress={() => {}}
                    containerStyles={emptyStylesArray}
                />
                <View style={[styles.pb3, styles.justifyContentCenter, styles.alignItemsCenter, styles.expenseWidgetSelectCircle, styles.mln2, styles.pr2]}>
                    <SelectCircle isChecked={isSelected} />
                </View>
            </View>
        </BaseListItem>
    );
}

UnreportedExpenseListItem.displayName = 'unreportedExpenseListItem';

export default UnreportedExpenseListItem;
