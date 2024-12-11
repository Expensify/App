import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import {useSearchContext} from '@components/Search/SearchContext';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {handleActionButtonPress} from '@libs/actions/Search';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import ActionCell from './ActionCell';
import ExpenseItemHeaderNarrow from './ExpenseItemHeaderNarrow';
import TransactionListItem from './TransactionListItem';
import TransactionListItemRow from './TransactionListItemRow';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type ReportCellProps = {
    reportItem: ReportListItemType;
} & CellProps;

function TotalCell({showTooltip, isLargeScreenWidth, reportItem}: ReportCellProps) {
    const styles = useThemeStyles();

    let total = reportItem?.total ?? 0;

    // Only invert non-zero values otherwise we'll end up with -0.00
    if (total) {
        total *= reportItem?.type === CONST.REPORT.TYPE.EXPENSE || reportItem?.type === CONST.REPORT.TYPE.INVOICE ? -1 : 1;
    }

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
            text={CurrencyUtils.convertToDisplayString(total, reportItem?.currency)}
            style={[styles.optionDisplayName, styles.textNormal, styles.pre, styles.justifyContentCenter, isLargeScreenWidth ? undefined : styles.textAlignRight]}
        />
    );
}

function ReportListItem<TItem extends ListItem>({
    item,
    isFocused,
    showTooltip,
    isDisabled,
    canSelectMultiple,
    onCheckboxPress,
    onSelectRow,
    onDismissError,
    onFocus,
    onLongPressRow,
    shouldSyncFocus,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;

    const theme = useTheme();
    const styles = useThemeStyles();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    const {currentSearchHash} = useSearchContext();

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        borderRadius: variables.componentBorderRadius,
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: theme.highlightBG,
    });

    if (reportItem.transactions.length === 0) {
        return;
    }

    const listItemPressableStyle = [
        styles.selectionListPressableItemWrapper,
        styles.pv1half,
        styles.ph0,
        styles.overflowHidden,
        // Removing background style because they are added to the parent OpacityView via animatedHighlightStyle
        styles.bgTransparent,
        item.isSelected && styles.activeComponentBG,
        styles.mh0,
    ];

    const handleOnButtonPress = () => {
        handleActionButtonPress(currentSearchHash, reportItem, () => onSelectRow(item));
    };

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();

        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: transactionItem.transactionThreadReportID, backTo}));
    };

    if (!reportItem?.reportName && reportItem.transactions.length > 1) {
        return null;
    }

    const hasHeldExpenses = ReportUtils.hasHeldExpenses('', reportItem.transactions);

    const participantFrom = reportItem.from;
    const participantTo = reportItem.to;

    // These values should come as part of the item via SearchUIUtils.getSections() but ReportListItem is not yet 100% handled
    // This will be simplified in future once sorting of ReportListItem is done
    const participantFromDisplayName = participantFrom?.displayName ?? participantFrom?.login ?? '';
    const participantToDisplayName = participantTo?.displayName ?? participantTo?.login ?? '';

    if (reportItem.transactions.length === 1) {
        const transactionItem = reportItem.transactions.at(0);

        return (
            <TransactionListItem
                item={transactionItem as unknown as TItem}
                isFocused={isFocused}
                showTooltip={showTooltip}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                onCheckboxPress={() => onCheckboxPress?.(transactionItem as unknown as TItem)}
                onSelectRow={onSelectRow}
                onDismissError={onDismissError}
                onFocus={onFocus}
                onLongPressRow={onLongPressRow}
                shouldSyncFocus={shouldSyncFocus}
                isLoading={reportItem.isActionLoading}
            />
        );
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb2]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onLongPressRow={onLongPressRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
            pressableWrapperStyle={[styles.mh5, animatedHighlightStyle]}
        >
            <View style={styles.flex1}>
                {!isLargeScreenWidth && (
                    <ExpenseItemHeaderNarrow
                        participantFrom={participantFrom}
                        participantFromDisplayName={participantFromDisplayName}
                        participantTo={participantTo}
                        participantToDisplayName={participantToDisplayName}
                        action={reportItem.action}
                        onButtonPress={handleOnButtonPress}
                        containerStyle={[styles.ph3, styles.pt1half, styles.mb1half]}
                        isLoading={reportItem.isActionLoading}
                        shouldUseSuccessStyle={!hasHeldExpenses}
                    />
                )}
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, styles.ph3, styles.pv1half]}>
                    <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.justifyContentBetween, styles.mnh40]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex2]}>
                            {!!canSelectMultiple && (
                                <Checkbox
                                    onPress={() => onCheckboxPress?.(item)}
                                    isChecked={item.isSelected}
                                    containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                                    disabled={!!isDisabled || item.isDisabledCheckbox}
                                    accessibilityLabel={item.text ?? ''}
                                    shouldStopMouseDownPropagation
                                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled, !isLargeScreenWidth && styles.mr3]}
                                />
                            )}
                            <View style={[styles.flexShrink1, isLargeScreenWidth && styles.ph4]}>
                                <Text style={[styles.reportListItemTitle]}>{reportItem?.reportName}</Text>
                            </View>
                        </View>
                        <View style={[styles.flexRow, styles.flex1, styles.justifyContentEnd]}>
                            <TotalCell
                                showTooltip={showTooltip}
                                isLargeScreenWidth={isLargeScreenWidth}
                                reportItem={reportItem}
                            />
                        </View>
                    </View>
                    {isLargeScreenWidth && (
                        <View style={StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)}>
                            <ActionCell
                                action={reportItem.action}
                                shouldUseSuccessStyle={!hasHeldExpenses}
                                goToItem={handleOnButtonPress}
                                isSelected={item.isSelected}
                                isLoading={reportItem.isActionLoading}
                            />
                        </View>
                    )}
                </View>
                {reportItem.transactions.map((transaction) => (
                    <TransactionListItemRow
                        key={transaction.transactionID}
                        parentAction={reportItem.action}
                        item={transaction}
                        showTooltip={showTooltip}
                        onButtonPress={() => {
                            openReportInRHP(transaction);
                        }}
                        onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                        showItemHeaderOnNarrowLayout={false}
                        containerStyle={[transaction.isSelected && styles.activeComponentBG, styles.ph3, styles.pv1half]}
                        isChildListItem
                        isDisabled={!!isDisabled}
                        canSelectMultiple={!!canSelectMultiple}
                        isButtonSelected={transaction.isSelected}
                        shouldShowTransactionCheckbox
                    />
                ))}
            </View>
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
