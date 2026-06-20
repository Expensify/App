import React, {useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import type {ListItem} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import {useEditingCellState} from '@components/TransactionItemRow/EditableCell';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionInlineEdit from '@hooks/useTransactionInlineEdit';
import CONST from '@src/CONST';
import type {TransactionListItemWideProps} from './types';

function TransactionListItemWide<TItem extends ListItem>({
    item,
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
    shouldDisableActionPointerEvents,
    transactionPreviewData,
    exportedReportActions,
    policyCategories,
    nonPersonalAndWorkspaceCards,
    isAttendeesEnabledForMovingPolicy,
    currentSearchHash,
}: TransactionListItemWideProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const transactionItem = item as unknown as TransactionListItemType;
    const {isSelected} = useRowSelection(item.keyForList);

    const {isEditingCell, wasRecentlyEditingCell} = useEditingCellState();
    const [shouldDisableHoverStyle, setShouldDisableHoverStyle] = useState(false);

    // When a popover is opened during inline editing, onHoverOut never fires after editing ends, leaving the hover style stuck.
    // Disable it until the next intentional hover (onHoverIn).
    // See: https://github.com/Expensify/App/pull/83127#issuecomment-4114490080
    useEffect(() => {
        if (!wasRecentlyEditingCell) {
            return;
        }
        queueMicrotask(() => setShouldDisableHoverStyle(true));
    }, [wasRecentlyEditingCell]);

    const {
        canEditDate,
        canEditMerchant,
        canEditDescription,
        canEditCategory,
        canEditAmount,
        canEditTag,
        onEditDate,
        onEditMerchant,
        onEditDescription,
        onEditCategory,
        onEditAmount,
        onEditTag,
        wasEditingOnMouseDownRef,
    } = useTransactionInlineEdit({
        transactionID: transactionItem.transactionID,
        hash: currentSearchHash,
        linkedReportAction: transactionItem.reportAction,
    });

    const handleOnPress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = (event) => {
        // Consume the tap that dismissed an editing cell — a second tap will open the row.
        // We check the ref rather than isEditingCell because blur fires before onPress and resets the state.
        if (wasEditingOnMouseDownRef.current) {
            wasEditingOnMouseDownRef.current = false;
            return;
        }
        // react-native-web fires onPress on Space for role="button" elements; suppress it while a cell is being edited.
        if (isEditingCell) {
            return;
        }
        if (isDeletedTransaction && !canSelectMultiple) {
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const handleOnMouseDown = (e?: React.MouseEvent) => {
        wasEditingOnMouseDownRef.current = isEditingCell;

        // Skip preventDefault when editing so the browser naturally blurs the input (triggering save/cancel).
        if (!isEditingCell) {
            e?.preventDefault();
        }
    };

    const handleOnHoverIn = () => setShouldDisableHoverStyle(false);

    const amountColumnSize = transactionItem.isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const taxAmountColumnSize = transactionItem.isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const dateColumnSize = transactionItem.shouldShowYear ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const submittedColumnSize = transactionItem.shouldShowYearSubmitted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const approvedColumnSize = transactionItem.shouldShowYearApproved ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const postedColumnSize = transactionItem.shouldShowYearPosted ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;
    const exportedColumnSize = transactionItem.shouldShowYearExported ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL;

    const pressableStyle = [
        styles.transactionListItemStyle,
        isSelected && styles.activeComponentBG,
        {
            ...styles.flexRow,
            ...styles.justifyContentBetween,
            ...styles.alignItemsCenter,
            ...StyleUtils.getSearchTableRowPressableStyle(!!isLastItem, isSelected),
        },
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: false,
    });

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={handleOnPress}
                disabled={isDisabled && !isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? getButtonRole(true) : 'none'}
                isNested
                onMouseDown={handleOnMouseDown}
                onHoverIn={handleOnHoverIn}
                hoverStyle={[!item.isDisabled && !shouldDisableHoverStyle && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
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
                        policyCategories={policyCategories}
                        shouldShowTooltip={showTooltip}
                        onButtonPress={handleActionButtonPress}
                        onCheckboxPress={() => onCheckboxPress?.(item)}
                        shouldUseNarrowLayout={false}
                        isLargeScreenWidth
                        columns={columns}
                        isActionLoading={isLoading ?? isActionLoading}
                        isSelected={isSelected}
                        isDisabled={!!isDisabled}
                        shouldDisableActionPointerEvents={shouldDisableActionPointerEvents}
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
                        onArrowRightPress={isDeletedTransaction ? undefined : (event) => onSelectRow(item, transactionPreviewData, event)}
                        isHover={hovered}
                        nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                        reportActions={exportedReportActions}
                        isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                        onEditDate={onEditDate}
                        onEditMerchant={onEditMerchant}
                        onEditDescription={onEditDescription}
                        onEditCategory={onEditCategory}
                        onEditAmount={onEditAmount}
                        onEditTag={onEditTag}
                        canEditDate={canEditDate}
                        canEditMerchant={canEditMerchant}
                        canEditDescription={canEditDescription}
                        canEditCategory={canEditCategory}
                        canEditAmount={canEditAmount}
                        canEditTag={canEditTag}
                    />
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItemWide;
