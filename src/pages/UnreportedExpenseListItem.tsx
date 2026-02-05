import React, {useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import type {ListItem, ListItemProps, TransactionListItemType} from '@components/SelectionListWithSections/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {TransactionViolation} from '@src/types/onyx';

type UnreportedExpenseListItemProps<TItem extends ListItem> = ListItemProps<TItem> & {
    readOnly?: boolean;
    violations?: Record<string, TransactionViolation[]>;
};

function UnreportedExpenseListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    onFocus,
    readOnly,
    shouldSyncFocus,
    onSelectRow,
    violations,
}: UnreportedExpenseListItemProps<TItem>) {
    const styles = useThemeStyles();
    const transactionItem = item as unknown as TransactionListItemType;
    const isSelected = !!item.isSelected;
    const theme = useTheme();

    const pressableStyle = [styles.transactionListItemStyle, isSelected && styles.activeComponentBG];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const isItemDisabled = (!!isDisabled && !isSelected) || readOnly;

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onPress={() => {
                    onSelectRow(item);
                }}
                disabled={isItemDisabled}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                onMouseDown={(e) => e.preventDefault()}
                hoverStyle={[!item.isDisabled && !readOnly && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                style={[pressableStyle, isFocused && StyleUtils.getItemBackgroundColorStyle(!!isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG)]}
                onFocus={onFocus}
                wrapperStyle={[styles.mb2, styles.mh5, styles.flex1, animatedHighlightStyle, styles.userSelectNone]}
            >
                {({hovered}) => (
                    <TransactionItemRow
                        transactionItem={transactionItem}
                        violations={violations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionItem.transactionID}`]}
                        shouldUseNarrowLayout
                        isSelected={isSelected}
                        shouldShowTooltip={showTooltip}
                        dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                        onCheckboxPress={() => {
                            onSelectRow(item);
                        }}
                        isDisabled={isItemDisabled}
                        shouldShowCheckbox={!readOnly}
                        style={styles.p3}
                        isHover={hovered}
                    />
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default UnreportedExpenseListItem;
