import React from 'react';
import {View} from 'react-native';
import {getButtonRole} from '@components/Button/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import CONST from '@src/CONST';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import CardListItemHeader from './CardListItemHeader';
import CategoryListItemHeader from './CategoryListItemHeader';
import ExpandCollapseArrowButton from './ExpandCollapseArrowButton';
import MemberListItemHeader from './MemberListItemHeader';
import MerchantListItemHeader from './MerchantListItemHeader';
import MonthListItemHeader from './MonthListItemHeader';
import QuarterListItemHeader from './QuarterListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';
import TagListItemHeader from './TagListItemHeader';
import type {
    GroupHeaderItemType,
    SearchListItem,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionReportGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from './types';
import WeekListItemHeader from './WeekListItemHeader';
import WithdrawalIDListItemHeader from './WithdrawalIDListItemHeader';
import YearListItemHeader from './YearListItemHeader';

type GroupHeaderProps = {
    item: GroupHeaderItemType;
    groupBy?: SearchGroupBy;
    searchType?: SearchDataTypes;
    columns?: SearchColumnType[];
    canSelectMultiple: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onSelectRow: (item: SearchListItem, event?: ModifiedMouseEvent) => void;
    onCheckboxPress: (item: GroupHeaderItemType) => void;
    isFocused?: boolean;
    isFirstItem: boolean;
    isLastItem: boolean;
};

function GroupHeader({item, groupBy, searchType, columns, canSelectMultiple, isExpanded, onToggle, onSelectRow, onCheckboxPress, isFocused, isFirstItem, isLastItem}: GroupHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {selectedTransactions} = useSearchSelectionContext();

    const groupItem = item as unknown as TransactionGroupListItemType;
    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const selectedTransactionIDs = Object.keys(selectedTransactions);
    const selectedTransactionIDsSet = new Set(selectedTransactionIDs);
    const selectedItemsLength = groupItem.transactions.reduce((acc, transaction) => (selectedTransactionIDsSet.has(transaction.transactionID) ? acc + 1 : acc), 0);
    const transactionsWithoutPendingDelete = groupItem.transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const isEmpty = groupItem.transactions.length === 0;
    const isEmptyReportSelected = isEmpty && item?.keyForList && selectedTransactions[item.keyForList]?.isSelected;
    const isSelectAllChecked = isEmptyReportSelected || (selectedItemsLength === transactionsWithoutPendingDelete.length && transactionsWithoutPendingDelete.length > 0);
    const isIndeterminate = selectedItemsLength > 0 && selectedItemsLength !== transactionsWithoutPendingDelete.length;
    const isDisabledOrEmpty = isEmpty;

    const isItemSelected = isSelectAllChecked || item?.isSelected;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isItemSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: false,
    });

    const handleSelectionButtonPress = () => {
        onCheckboxPress(item);
    };

    const pendingAction =
        item.pendingAction ??
        (groupItem.transactions.length > 0 && groupItem.transactions.every((transaction) => transaction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
            : undefined);

    const handleSelectRow = (rowItem: SearchListItem, event?: ModifiedMouseEvent) => {
        onSelectRow(rowItem, event);
    };

    const renderHeader = () => {
        if (isExpenseReportType) {
            return (
                <ReportListItemHeader
                    report={groupItem as TransactionReportGroupListItemType}
                    onSelectRow={handleSelectRow}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            );
        }

        if (!groupBy) {
            return null;
        }

        const headers: Record<SearchGroupBy, React.JSX.Element> = {
            [CONST.SEARCH.GROUP_BY.FROM]: (
                <MemberListItemHeader
                    member={groupItem as TransactionMemberGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                    isLargeScreenWidth={isLargeScreenWidth}
                />
            ),
            [CONST.SEARCH.GROUP_BY.CARD]: (
                <CardListItemHeader
                    card={groupItem as TransactionCardGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                    isFocused={isFocused}
                />
            ),
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: (
                <WithdrawalIDListItemHeader
                    withdrawalID={groupItem as TransactionWithdrawalIDGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.CATEGORY]: (
                <CategoryListItemHeader
                    category={groupItem as TransactionCategoryGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.MERCHANT]: (
                <MerchantListItemHeader
                    merchant={groupItem as TransactionMerchantGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.TAG]: (
                <TagListItemHeader
                    tag={groupItem as TransactionTagGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.MONTH]: (
                <MonthListItemHeader
                    month={groupItem as TransactionMonthGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.WEEK]: (
                <WeekListItemHeader
                    week={groupItem as TransactionWeekGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.YEAR]: (
                <YearListItemHeader
                    year={groupItem as TransactionYearGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
            [CONST.SEARCH.GROUP_BY.QUARTER]: (
                <QuarterListItemHeader
                    quarter={groupItem as TransactionQuarterGroupListItemType}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    columns={columns}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                />
            ),
        };

        return headers[groupBy];
    };

    const pressableStyle = [
        styles.transactionGroupListItemStyle,
        isLargeScreenWidth && {
            ...styles.tableRowHeight,
            borderRadius: 0,
            ...(isLastItem ? styles.tableBottomRadius : {}),
        },
        isItemSelected && styles.activeComponentBG,
    ];

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <PressableWithFeedback
                onPress={onToggle}
                disabled={false}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_GROUP_LIST_ITEM}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={[!item.isDisabled && styles.hoveredComponentBG, isItemSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                onMouseDown={(e) => e.preventDefault()}
                id={item.keyForList ?? ''}
                style={[
                    pressableStyle,
                    isFocused && StyleUtils.getItemBackgroundColorStyle(!!isItemSelected, !!isFocused, !!item.isDisabled, theme.activeComponentBG, theme.hoverComponentBG),
                ]}
                wrapperStyle={[
                    styles.mh5,
                    animatedHighlightStyle,
                    styles.userSelectNone,
                    isLargeScreenWidth
                        ? [StyleUtils.getSearchTableGroupRowBorderStyle(isFirstItem, isLastItem, isItemSelected), isLastItem && styles.overflowHidden]
                        : [
                              isFirstItem && [styles.tableTopRadius, styles.overflowHidden],
                              isLastItem && [styles.tableBottomRadius, styles.overflowHidden],
                              !isLastItem && StyleUtils.getSelectedBorderBottomStyle(isItemSelected),
                          ],
                ]}
            >
                {() => (
                    <View style={styles.flex1}>
                        <View style={[styles.flexRow, styles.alignItemsCenter]}>
                            <View style={styles.flex1}>{renderHeader()}</View>
                            {isLargeScreenWidth && (
                                <View style={{paddingRight: 14}}>
                                    <ExpandCollapseArrowButton
                                        isExpanded={isExpanded}
                                        onPress={onToggle}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default GroupHeader;
