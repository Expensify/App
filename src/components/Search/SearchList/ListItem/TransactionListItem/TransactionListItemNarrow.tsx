import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import UserInfoAndActionButtonRow from '@components/Search/SearchList/ListItem/UserInfoAndActionButtonRow';
import {useRowSelection} from '@components/Search/SearchSelectionProvider';
import type {ListItem} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';

import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import durationHighlightItem from '@libs/Navigation/helpers/getDurationHighlightItem';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';

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
    const {isSelected} = useRowSelection(item.keyForList);

    const handleOnPress: React.ComponentProps<typeof PressableWithFeedback>['onPress'] = (event) => {
        // A deleted transaction has no report to open, so a row press toggles its selection instead of dead-ending in navigation.
        if (isDeletedTransaction) {
            if (canSelectMultiple) {
                onCheckboxPress?.(item);
            }
            return;
        }
        onSelectRow(item, transactionPreviewData, event);
    };

    const pressableStyle = [styles.transactionListItemStyle, styles.p4, styles.noBorderRadius, isSelected && styles.activeComponentBG, {...styles.flexColumn, ...styles.alignItemsStretch}];

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: 0,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: true,
    });

    // The highlight animation is applied to the row wrapper, which sits behind this pressable. A focused
    // row paints an opaque background on the pressable itself, which would cover the highlight - so after
    // splitting an expense the newly-created row that receives focus never appears highlighted. Suppress
    // the opaque focus background for the full highlight animation so the highlight shows. shouldAnimateInHighlight
    // only stays true for the brief queue window, so latch it for durationHighlightItem.
    const shouldAnimateInHighlight = !!item?.shouldAnimateInHighlight;

    // Initialize from the prop so a row that mounts already flagged (the split/search highlight case this
    // fixes) latches immediately - otherwise the render-time guard below never fires on first mount.
    const [isHighlighting, setIsHighlighting] = useState(shouldAnimateInHighlight);
    const [wasAnimatingHighlight, setWasAnimatingHighlight] = useState(shouldAnimateInHighlight);

    // Start the latch during render (React's "storing information from previous renders" pattern) to avoid
    // calling setState synchronously inside an effect. The effect below only clears it via an async timer.
    if (shouldAnimateInHighlight !== wasAnimatingHighlight) {
        setWasAnimatingHighlight(shouldAnimateInHighlight);
        if (shouldAnimateInHighlight) {
            setIsHighlighting(true);
        }
    }
    useEffect(() => {
        if (!isHighlighting) {
            return;
        }
        const timer = setTimeout(() => setIsHighlighting(false), durationHighlightItem);
        return () => clearTimeout(timer);
    }, [isHighlighting]);
    const shouldShowFocusBackground = !!isFocused && !isHighlighting;

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
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, isSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                id={item.keyForList ?? ''}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_LIST_ITEM}
                style={[
                    pressableStyle,
                    shouldShowFocusBackground && StyleUtils.getItemBackgroundColorStyle(isSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
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
