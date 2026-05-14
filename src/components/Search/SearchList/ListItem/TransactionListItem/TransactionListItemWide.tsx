import React, {useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {ListItem} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TransactionListItemWideProps} from './types';

function TransactionListItemWide<TItem extends ListItem>({
    item,
    transactionItem,
    isDeletedTransaction,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onCheckboxPress,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    columns,
    isLoading,
    isActionLoading,
    isLastItem,
    transactionViolations,
    handleActionButtonPress,
    transactionPreviewData,
    exportedReportActions,
    nonPersonalAndWorkspaceCards,
    isAttendeesEnabledForMovingPolicy,
}: TransactionListItemWideProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const amountColumnSize = transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const taxAmountColumnSize = transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const dateColumnSize = transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const submittedColumnSize = transactionItem.shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const approvedColumnSize = transactionItem.shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const postedColumnSize = transactionItem.shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const exportedColumnSize = transactionItem.shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;

    const pressableStyle = [
        styles.transactionListItemStyle,
        item.isSelected && styles.activeComponentBG,
        {
            ...styles.flexRow,
            ...styles.justifyContentBetween,
            ...styles.alignItemsCenter,
            ...StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, item.isSelected),
        },
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: item.isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: false,
    });

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={isDeletedTransaction && !canSelectMultiple ? undefined : () => onSelectRow(item, transactionPreviewData)}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? getButtonRole(true) : 'none'}
                isNested
                onMouseDown={(e) => e.preventDefault()}
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    isDeletedTransaction && styles.cursorDefault,
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.mh5, styles.flex1, animatedHighlightStyle, styles.userSelectNone, isLastItem && [styles.tableBottomRadius, styles.overflowHidden]]}
            >
                {({hovered}) => (
                    <TransactionItemRow
                        transactionItem={transactionItem}
                        report={transactionItem.report}
                        policy={transactionItem.policy}
                        shouldShowTooltip={showTooltip}
                        onButtonPress={handleActionButtonPress}
                        onCheckboxPress={() => onCheckboxPress?.(item)}
                        shouldUseNarrowLayout={false}
                        isLargeScreenWidth
                        columns={columns}
                        isActionLoading={isLoading ?? isActionLoading}
                        isSelected={!!transactionItem.isSelected}
                        isDisabled={!!isDisabled}
                        dateColumnSize={dateColumnSize}
                        submittedColumnSize={submittedColumnSize}
                        approvedColumnSize={approvedColumnSize}
                        postedColumnSize={postedColumnSize}
                        exportedColumnSize={exportedColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        isActionColumnWide={transactionItem.isActionColumnWide}
                        shouldShowCheckbox={!!canSelectMultiple}
                        checkboxSentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM_CHECKBOX}
                        style={[styles.p3, styles.pv2, isLastItem ? styles.tableBottomRadius : styles.noBorderRadius]}
                        violations={transactionViolations}
                        onArrowRightPress={isDeletedTransaction ? undefined : () => onSelectRow(item, transactionPreviewData)}
                        isHover={hovered}
                        nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                        reportActions={exportedReportActions}
                        isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                    />
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItemWide;
