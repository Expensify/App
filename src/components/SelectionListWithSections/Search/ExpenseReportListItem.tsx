import React, {useCallback, useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {ExpenseReportListItemProps, ExpenseReportListItemType, ListItem} from '@components/SelectionListWithSections/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import {isActionLoadingSelector} from '@src/selectors/ReportMetaData';
import type {Policy} from '@src/types/onyx';
import type {SearchReport} from '@src/types/onyx/SearchResults';
import ExpenseReportListItemRow from './ExpenseReportListItemRow';

function ExpenseReportListItem<TItem extends ListItem>({
    item,
    isLoading,
    isFocused,
    showTooltip,
    canSelectMultiple,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    onCheckboxPress,
    onDEWModalOpen,
}: ExpenseReportListItemProps<TItem>) {
    const reportItem = item as unknown as ExpenseReportListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey} = useSearchContext();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});
    const [isActionLoading] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportItem.reportID}`, {canBeMissing: true, selector: isActionLoadingSelector});

    const snapshotData = snapshot?.data;

    const snapshotReport = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return (snapshotData?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as SearchReport;
    }, [snapshotData, reportItem.reportID]);

    const snapshotPolicy = useMemo(() => {
        return (snapshotData?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as Policy;
    }, [snapshotData, reportItem.policyID]);

    const isDisabledCheckbox = useMemo(() => {
        const isEmpty = reportItem.transactions.length === 0;
        return isEmpty ?? reportItem.isDisabled ?? reportItem.isDisabledCheckbox;
    }, [reportItem.isDisabled, reportItem.isDisabledCheckbox, reportItem.transactions.length]);

    const handleOnButtonPress = useCallback(() => {
        handleActionButtonPress(
            currentSearchHash,
            reportItem,
            () => onSelectRow(reportItem as unknown as TItem),
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            currentSearchKey,
            onDEWModalOpen,
        );
    }, [currentSearchHash, reportItem, onSelectRow, snapshotReport, snapshotPolicy, lastPaymentMethod, currentSearchKey, onDEWModalOpen]);

    const handleCheckboxPress = useCallback(() => {
        onCheckboxPress?.(reportItem as unknown as TItem);
    }, [onCheckboxPress, reportItem]);

    const listItemPressableStyle = useMemo(
        () => [
            styles.selectionListPressableItemWrapper,
            styles.pv3,
            styles.ph3,
            // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
            styles.bgTransparent,
            item.isSelected && styles.activeComponentBG,
            styles.mh0,
        ],
        [styles, item.isSelected],
    );

    const listItemWrapperStyle = useMemo(
        () => [
            styles.flex1,
            styles.userSelectNone,
            isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
        ],
        [styles, isLargeScreenWidth],
    );

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={listItemWrapperStyle}
            containerStyle={[styles.mb2]}
            isFocused={isFocused}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            onLongPressRow={onLongPressRow}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
            shouldShowRightCaret={isLargeScreenWidth}
            shouldUseDefaultRightHandSideCheckmark={false}
        >
            {(hovered) => (
                <ExpenseReportListItemRow
                    item={reportItem}
                    policy={snapshotPolicy}
                    isActionLoading={isActionLoading ?? isLoading}
                    showTooltip={showTooltip}
                    canSelectMultiple={canSelectMultiple}
                    onCheckboxPress={handleCheckboxPress}
                    onButtonPress={handleOnButtonPress}
                    isSelectAllChecked={!!reportItem.isSelected}
                    isIndeterminate={false}
                    isDisabledCheckbox={isDisabledCheckbox}
                    isHovered={hovered}
                    isFocused={isFocused}
                />
            )}
        </BaseListItem>
    );
}

ExpenseReportListItem.displayName = 'ExpenseReportListItem';

export default ExpenseReportListItem;
