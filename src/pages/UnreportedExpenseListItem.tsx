import React, {useRef, useState} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {ListItem, ListItemProps, TransactionListItemType} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function UnreportedExpenseListItem<TItem extends ListItem>({item, isFocused, showTooltip, isDisabled, onFocus, shouldSyncFocus, onSelectRow}: ListItemProps<TItem>) {
    const styles = useThemeStyles();
    const transactionItem = item as unknown as TransactionListItemType;
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const theme = useTheme();

    const pressableStyle = [styles.transactionListItemStyle, item.isSelected && styles.activeComponentBG];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onPress={() => {
                    onSelectRow(item);
                    setIsSelected((val) => !val);
                }}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                onMouseDown={(e) => e.preventDefault()}
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, styles.flex1, animatedHighlightStyle, styles.userSelectNone]}
            >
                <TransactionItemRow
                    transactionItem={transactionItem}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip={showTooltip}
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    onCheckboxPress={() => {
                        onSelectRow(item);
                        setIsSelected((val) => !val);
                    }}
                    shouldShowCheckbox
                />
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

UnreportedExpenseListItem.displayName = 'UnreportedExpenseListItem';

export default UnreportedExpenseListItem;
