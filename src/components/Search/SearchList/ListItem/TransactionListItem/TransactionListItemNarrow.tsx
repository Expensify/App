import React, {useRef} from 'react';
import type {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
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
}: TransactionListItemNarrowProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<View>(null);
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const transactionItem = item as unknown as TransactionListItemType;

    // Narrow rows don't support inline cell editing, so the press handler can skip the
    // editing-dismissal logic that the wide variant needs.
    const handleOnPress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = (event) => {
        if (isDeletedTransaction && !canSelectMultiple) {
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const pressableStyle = [
        styles.transactionListItemStyle,
        styles.ph5,
        styles.pv4,
        styles.noBorderRadius,
        item.isSelected && styles.searchRowSelectedBG,
        {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: item.isSelected ? theme.searchRowSelectedBG : theme.appBG,
        shouldApplyOtherStyles: true,
    });

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => onLongPressRow?.(item)}
                onPress={handleOnPress}
                disabled={isDisabled && !item.isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? getButtonRole(true) : 'none'}
                isNested
                hoverStyle={[!item.isDisabled && {backgroundColor: theme.hoverLight}, item.isSelected && styles.searchRowSelectedBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, !!isFocused, !!item.isDisabled, theme.searchRowSelectedBG, theme.hoverComponentBG),
                    isDeletedTransaction && styles.cursorDefault,
                ]}
                onFocus={onFocus}
                wrapperStyle={[styles.flex1, animatedHighlightStyle, styles.userSelectNone, StyleUtils.getSelectedBorderBottomStyle(item.isSelected)]}
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
                            onArrowRightPress={isDeletedTransaction ? undefined : (event) => onSelectRow(item, transactionPreviewData, event)}
                            isHover={false}
                            nonPersonalAndWorkspaceCards={nonPersonalAndWorkspaceCards}
                            reportActions={exportedReportActions}
                            isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItemNarrow;
