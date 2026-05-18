import React, {useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import UserInfoAndActionButtonRow from '@components/Search/SearchList/ListItem/UserInfoAndActionButtonRow';
import type {ListItem} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TransactionListItemNarrowProps} from './types';

function TransactionListItemNarrow<TItem extends ListItem>({
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
    isFirstItem,
    transactionViolations,
    handleActionButtonPress,
    transactionPreviewData,
    exportedReportActions,
    nonPersonalAndWorkspaceCards,
    isAttendeesEnabledForMovingPolicy,
    shouldDisableHoverStyle,
    onPressRow,
    onMouseDownRow,
    onHoverInRow,
    onEditDate,
    onEditMerchant,
    onEditDescription,
    onEditCategory,
    onEditAmount,
    onEditTag,
    canEditDate,
    canEditMerchant,
    canEditDescription,
    canEditCategory,
    canEditAmount,
    canEditTag,
}: TransactionListItemNarrowProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const pressableStyle = [
        styles.transactionListItemStyle,
        styles.p4,
        styles.noBorderRadius,
        item.isSelected && styles.activeComponentBG,
        {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: item.isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: true,
    });

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={onPressRow}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? getButtonRole(true) : 'none'}
                isNested
                onMouseDown={onMouseDownRow}
                onHoverIn={onHoverInRow}
                hoverStyle={[!item.isDisabled && !shouldDisableHoverStyle && styles.hoveredComponentBG, item.isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    isDeletedTransaction && styles.cursorDefault,
                ]}
                onFocus={onFocus}
                wrapperStyle={[
                    styles.mh5,
                    styles.flex1,
                    animatedHighlightStyle,
                    styles.userSelectNone,
                    isFirstItem && styles.tableTopRadius,
                    isLastItem && styles.tableBottomRadius,
                    !isLastItem && StyleUtils.getSelectedBorderBottomStyle(item.isSelected),
                ]}
            >
                {() => (
                    <>
                        <UserInfoAndActionButtonRow
                            item={transactionItem}
                            shouldShowUserInfo={!isDeletedTransaction && !!transactionItem?.from}
                            stateNum={transactionItem.report?.stateNum}
                            statusNum={transactionItem.report?.statusNum}
                            isSelected={!!transactionItem.isSelected}
                        />
                        <TransactionItemRow
                            transactionItem={transactionItem}
                            report={transactionItem.report}
                            policy={transactionItem.policy}
                            shouldShowTooltip={showTooltip}
                            onButtonPress={handleActionButtonPress}
                            onCheckboxPress={() => onCheckboxPress?.(item)}
                            shouldUseNarrowLayout
                            isLargeScreenWidth={false}
                            columns={columns}
                            isActionLoading={isLoading ?? isActionLoading}
                            isSelected={!!transactionItem.isSelected}
                            isDisabled={!!isDisabled}
                            dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                            shouldShowCheckbox={!!canSelectMultiple}
                            checkboxSentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM_CHECKBOX}
                            style={[styles.p3, styles.pv2, styles.p0, styles.pt3, isLastItem ? styles.tableBottomRadius : styles.noBorderRadius]}
                            violations={transactionViolations}
                            onArrowRightPress={isDeletedTransaction ? undefined : () => onSelectRow(item, transactionPreviewData)}
                            isHover={false}
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
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItemNarrow;
