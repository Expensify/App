import React, {useMemo} from 'react';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionListWithSections/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType} from '@components/SelectionListWithSections/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchPolicy, SearchReport} from '@src/types/onyx/SearchResults';
import ReportItemRow from './ReportListItemRow';

function ReportListItem<TItem extends ListItem>({
    item,
    isLoading,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onSelectRow,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
    onCheckboxPress,
    onDEWModalOpen,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;
    const styles = useThemeStyles();
    const theme = useTheme();

    const {isLargeScreenWidth} = useResponsiveLayout();
    const {currentSearchHash, currentSearchKey} = useSearchContext();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [lastPaymentMethod] = useOnyx(ONYXKEYS.NVP_LAST_PAYMENT_METHOD, {canBeMissing: true});
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchHash}`, {canBeMissing: true});

    const snapshotReport = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT}${reportItem.reportID}`] ?? {}) as SearchReport;
    }, [snapshot, reportItem.reportID]);

    const snapshotPolicy = useMemo(() => {
        return (snapshot?.data?.[`${ONYXKEYS.COLLECTION.POLICY}${reportItem.policyID}`] ?? {}) as SearchPolicy;
    }, [snapshot, reportItem.policyID]);

    const handleOnButtonPress = () => {
        handleActionButtonPress(
            currentSearchHash,
            reportItem,
            () => onSelectRow(reportItem as unknown as TItem),
            shouldUseNarrowLayout && !!canSelectMultiple,
            snapshotReport,
            snapshotPolicy,
            lastPaymentMethod,
            currentSearchKey,
            onDEWModalOpen,
        );
    };

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv3,
        styles.ph3,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const listItemWrapperStyle = [
        styles.flex1,
        styles.userSelectNone,
        isLargeScreenWidth ? {...styles.flexRow, ...styles.justifyContentBetween, ...styles.alignItemsCenter} : {...styles.flexColumn, ...styles.alignItemsStretch},
    ];

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
            isDisabled={isDisabled}
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
        >
            <ReportItemRow
                item={reportItem}
                isActionLoading={isLoading ?? reportItem.isActionLoading}
                showTooltip={showTooltip}
                canSelectMultiple={canSelectMultiple}
                onCheckboxPress={() => onCheckboxPress?.(reportItem as unknown as TItem)}
                onButtonPress={handleOnButtonPress}
                avatarBorderColor={theme.highlightBG}
                isSelectAllChecked={!!reportItem.isSelected}
                isIndeterminate={false}
                isDisabled={!!isDisabled}
            />
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
