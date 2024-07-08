import React from 'react';
import {View} from 'react-native';
import Checkbox from '@components/Checkbox';
import BaseListItem from '@components/SelectionList/BaseListItem';
import type {ListItem, ReportListItemProps, ReportListItemType, TransactionListItemType} from '@components/SelectionList/types';
import Text from '@components/Text';
import TextWithTooltip from '@components/TextWithTooltip';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getSearchParams} from '@libs/SearchUtils';
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
        total *= reportItem?.type === CONST.REPORT.TYPE.EXPENSE ? -1 : 1;
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
    shouldSyncFocus,
}: ReportListItemProps<TItem>) {
    const reportItem = item as unknown as ReportListItemType;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isLargeScreenWidth} = useWindowDimensions();
    const StyleUtils = useStyleUtils();

    if (reportItem.transactions.length === 0) {
        return;
    }

    const listItemPressableStyle = [styles.selectionListPressableItemWrapper, styles.pv3, item.isSelected && styles.activeComponentBG, isFocused && styles.sidebarLinkActive];

    const handleOnButtonPress = () => {
        onSelectRow(item);
    };

    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const searchParams = getSearchParams();
        const currentQuery = searchParams?.query ?? CONST.SEARCH.TAB.ALL;
        Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(currentQuery, transactionItem.transactionThreadReportID));
    };

    if (!reportItem?.reportName && reportItem.transactions.length > 1) {
        return null;
    }

    const participantFrom = reportItem.from;
    const participantTo = reportItem.to;

    // These values should come as part of the item via SearchUtils.getSections() but ReportListItem is not yet 100% handled
    // This will be simplified in future once sorting of ReportListItem is done
    const participantFromDisplayName = participantFrom?.name ?? participantFrom?.displayName ?? participantFrom?.login ?? '';
    const participantToDisplayName = participantTo?.name ?? participantTo?.displayName ?? participantTo?.login ?? '';

    if (reportItem.transactions.length === 1) {
        const transactionItem = reportItem.transactions[0];

        return (
            <TransactionListItem
                item={transactionItem as unknown as TItem}
                isFocused={isFocused}
                showTooltip={showTooltip}
                isDisabled={isDisabled}
                canSelectMultiple={canSelectMultiple}
                onCheckboxPress={() => onCheckboxPress?.(transactionItem as unknown as TItem)}
                onSelectRow={() => openReportInRHP(transactionItem)}
                onDismissError={onDismissError}
                onFocus={onFocus}
                shouldSyncFocus={shouldSyncFocus}
            />
        );
    }

    return (
        <BaseListItem
            item={item}
            pressableStyle={listItemPressableStyle}
            wrapperStyle={[styles.flexRow, styles.flex1, styles.justifyContentBetween, styles.userSelectNone, styles.alignItemsCenter]}
            containerStyle={[styles.mb3]}
            isFocused={isFocused}
            isDisabled={isDisabled}
            showTooltip={showTooltip}
            canSelectMultiple={canSelectMultiple}
            onSelectRow={onSelectRow}
            onDismissError={onDismissError}
            errors={item.errors}
            pendingAction={item.pendingAction}
            keyForList={item.keyForList}
            onFocus={onFocus}
            shouldSyncFocus={shouldSyncFocus}
            hoverStyle={item.isSelected && styles.activeComponentBG}
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
                    />
                )}
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap3, isLargeScreenWidth && styles.mr4]}>
                    <View style={[styles.flexRow, styles.flex1, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex2]}>
                            {canSelectMultiple && (
                                <Checkbox
                                    onPress={() => onCheckboxPress?.(item)}
                                    isChecked={item.isSelected}
                                    containerStyle={[StyleUtils.getCheckboxContainerStyle(20), StyleUtils.getMultiselectListStyles(!!item.isSelected, !!item.isDisabled)]}
                                    disabled={!!isDisabled || item.isDisabledCheckbox}
                                    accessibilityLabel={item.text ?? ''}
                                    style={[styles.cursorUnset, StyleUtils.getCheckboxPressableStyle(), item.isDisabledCheckbox && styles.cursorDisabled]}
                                />
                            )}
                            <View style={[styles.flexShrink1, isLargeScreenWidth && styles.ph4]}>
                                <Text style={[styles.reportListItemTitle]}>{reportItem?.reportName}</Text>
                                <Text style={[styles.textMicroSupporting]}>{`${reportItem.transactions.length} ${translate('search.groupedExpenses')}`}</Text>
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
                        <>
                            {/** We add an empty view with type style to align the total with the table header */}
                            <View style={StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.TYPE)} />
                            <View style={StyleUtils.getSearchTableColumnStyles(CONST.SEARCH.TABLE_COLUMNS.ACTION)}>
                                <ActionCell
                                    isLargeScreenWidth={isLargeScreenWidth}
                                    onButtonPress={handleOnButtonPress}
                                    action={reportItem.action}
                                    isSelected={item.isSelected}
                                />
                            </View>
                        </>
                    )}
                </View>
                <View style={[styles.mt3, styles.reportListItemSeparator]} />
                {reportItem.transactions.map((transaction) => (
                    <TransactionListItemRow
                        item={transaction}
                        showTooltip={showTooltip}
                        onButtonPress={() => {
                            openReportInRHP(transaction);
                        }}
                        onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                        showItemHeaderOnNarrowLayout={false}
                        containerStyle={styles.mt3}
                        isChildListItem
                        isDisabled={!!isDisabled}
                        canSelectMultiple={!!canSelectMultiple}
                        isButtonSelected={item.isSelected}
                    />
                ))}
            </View>
        </BaseListItem>
    );
}

ReportListItem.displayName = 'ReportListItem';

export default ReportListItem;
