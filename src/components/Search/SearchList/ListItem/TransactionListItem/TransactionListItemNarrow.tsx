import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import UserInfoAndActionButtonRow from '@components/Search/SearchList/ListItem/UserInfoAndActionButtonRow';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import type {ListItem} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';

import useCopyableTextRowPress, {isPressStartOnCopyableText} from '@hooks/useCopyableTextRowPress';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {COPYABLE_ROW_DATA_SET} from '@libs/SelectionScraper';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React, {useRef} from 'react';

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
    shouldDisableActionPointerEvents,
    transactionPreviewData,
    reportActions,
    nonPersonalAndWorkspaceCards,
    isAttendeesEnabledForMovingPolicy,
}: TransactionListItemNarrowProps<TItem>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const pressableRef = useRef<ComponentRef<typeof View>>(null);
    const {markMouseDownOnCopyableText, markTouchStartOnCopyableText, shouldSuppressCopyableTextRowFocus, shouldSuppressCopyableTextRowLongPress, shouldSuppressCopyableTextRowPress} =
        useCopyableTextRowPress();
    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const transactionItem = item as unknown as TransactionListItemType;
    const {isSelected} = useRowSelection(item.keyForList, transactionItem.selectionGroupKey);

    const handleOnPress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = (event) => {
        if (shouldSuppressCopyableTextRowPress()) {
            return;
        }

        // A deleted transaction has no report to open, so a row press toggles its selection instead of dead-ending in navigation.
        if (isDeletedTransaction) {
            if (canSelectMultiple) {
                onCheckboxPress?.(item);
            }
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const pressableStyle = [
        styles.transactionListItemStyle,
        styles.p4,
        styles.noBorderRadius,
        isSelected && styles.activeComponentBG,
        // A selected row paints an opaque background here, on top of the rounded wrapper below, so the outer
        // corners have to be rounded on this element too or the list's top/bottom corners look square.
        isFirstItem && styles.tableTopRadius,
        isLastItem && styles.tableBottomRadius,
        {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

    return (
        <OfflineWithFeedback pendingAction={item.pendingAction}>
            <PressableWithFeedback
                ref={pressableRef}
                onLongPress={() => {
                    if (shouldSuppressCopyableTextRowLongPress()) {
                        return;
                    }
                    onLongPressRow?.(item);
                }}
                onPress={handleOnPress}
                disabled={isDisabled && !isSelected}
                accessibilityLabel={item.text ?? ''}
                role={!isDeletedTransaction ? CONST.ROLE.BUTTON : 'none'}
                isNested
                shouldAllowTextSelection
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={{...COPYABLE_ROW_DATA_SET, [CONST.INNER_BOX_SHADOW_ELEMENT]: true}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                    isDeletedTransaction && styles.cursorDefault,
                ]}
                onFocus={(event) => {
                    if (shouldSuppressCopyableTextRowFocus()) {
                        return;
                    }
                    onFocus?.(event);
                }}
                onMouseDown={(event) => {
                    const isCopyableTarget = markMouseDownOnCopyableText(event?.target);
                    if (isCopyableTarget) {
                        return;
                    }
                    event.preventDefault();
                }}
                onTouchStart={(event) => {
                    markTouchStartOnCopyableText(event, isPressStartOnCopyableText(event));
                }}
                wrapperStyle={[
                    styles.mh5,
                    styles.flex1,
                    StyleUtils.getSearchRowBackgroundStyle(isSelected),
                    styles.userSelectNone,
                    isFirstItem && styles.tableTopRadius,
                    isLastItem && styles.tableBottomRadius,
                    !isLastItem && StyleUtils.getSelectedBorderBottomStyle(isSelected),
                ]}
            >
                {() => (
                    <>
                        <UserInfoAndActionButtonRow
                            item={transactionItem}
                            shouldShowUserInfo={!isDeletedTransaction && !!transactionItem?.from}
                            stateNum={transactionItem.report?.stateNum}
                            statusNum={transactionItem.report?.statusNum}
                            isSelected={isSelected}
                            shouldAllowStatusTextSelection
                        />
                        <TransactionItemRow
                            transactionItem={transactionItem}
                            report={transactionItem.report}
                            policy={transactionItem.policy}
                            shouldShowTooltip={showTooltip}
                            onButtonPress={handleActionButtonPress}
                            onCheckboxPress={(_transactionID, shiftKey) => onCheckboxPress?.(item, undefined, shiftKey)}
                            shouldUseNarrowLayout
                            isLargeScreenWidth={false}
                            columns={columns}
                            isActionLoading={isLoading ?? isActionLoading}
                            isSelected={isSelected}
                            isDisabled={!!isDisabled}
                            shouldDisableActionPointerEvents={shouldDisableActionPointerEvents}
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
                            reportActions={reportActions}
                            isAttendeesEnabledForMovingPolicy={isAttendeesEnabledForMovingPolicy}
                        />
                    </>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default TransactionListItemNarrow;
