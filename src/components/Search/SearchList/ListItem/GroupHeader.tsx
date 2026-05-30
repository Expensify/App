import React, {useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import {easing} from '@components/Modal/ReanimatedModal/utils';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchSelectionContext} from '@components/Search/SearchContext';
import SearchTableHeader from '@components/Search/SearchTableHeader';
import type {SearchColumnType, SearchGroupBy} from '@components/Search/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TransactionPreviewData} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {getColumnsToShow} from '@libs/SearchUIUtils';
import {isDeletedTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import CardListItemHeader from './CardListItemHeader';
import CategoryListItemHeader from './CategoryListItemHeader';
import MemberListItemHeader from './MemberListItemHeader';
import MerchantListItemHeader from './MerchantListItemHeader';
import MonthListItemHeader from './MonthListItemHeader';
import QuarterListItemHeader from './QuarterListItemHeader';
import ReportListItemHeader from './ReportListItemHeader';
import TagListItemHeader from './TagListItemHeader';
import type {
    GroupHeaderItemType,
    SearchListActionProps,
    SearchListItem,
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionGroupListItemType,
    TransactionListItemType,
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

type GroupHeaderProps = SearchListActionProps & {
    item: GroupHeaderItemType;
    groupBy?: SearchGroupBy;
    searchType?: SearchDataTypes;
    columns?: SearchColumnType[];
    canSelectMultiple: boolean;
    isExpanded: boolean;
    onToggle: () => void;
    onSelectRow: (item: SearchListItem, transactionPreviewData?: TransactionPreviewData, event?: ModifiedMouseEvent) => void;
    onCheckboxPress: (item: GroupHeaderItemType) => void;
    onLongPressRow?: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    isFocused?: boolean;
    isFirstItem: boolean;
    isLastItem: boolean;
};

function GroupHeader({
    item,
    groupBy,
    searchType,
    columns,
    canSelectMultiple,
    isExpanded,
    onToggle,
    onSelectRow,
    onCheckboxPress,
    onLongPressRow,
    isFocused,
    isFirstItem,
    isLastItem,
    lastPaymentMethod,
    personalPolicyID,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
}: GroupHeaderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {isLargeScreenWidth} = useResponsiveLayout();
    const {selectedTransactions} = useSearchSelectionContext();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['UpArrow', 'DownArrow']);
    const currentUserDetails = useCurrentUserPersonalDetails();

    const groupItem = item as unknown as TransactionGroupListItemType;
    const isExpenseReportType = searchType === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT;

    const oneTransactionItem = groupItem.isOneTransactionReport ? groupItem.transactions.at(0) : undefined;
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`);
    const [oneTransactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionItem?.reportAction?.childReportID}`);
    const [oneTransaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(oneTransactionItem?.transactionID)}`);
    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${oneTransactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(oneTransactionItem?.reportID)}`, {selector: parentReportActionSelector}, [
        oneTransactionItem,
    ]);
    const transactionPreviewData: TransactionPreviewData = {
        hasParentReport: !!parentReport,
        hasTransaction: !!oneTransaction,
        hasParentReportAction: !!parentReportAction,
        hasTransactionThreadReport: !!oneTransactionThreadReport,
    };

    // Compute sub-header columns (same logic as TransactionGroupListExpanded)
    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`);
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {selector: columnsSelector});

    let subHeaderColumns = columns ?? [];
    if (!isExpenseReportType) {
        if (!transactionsSnapshot?.data) {
            subHeaderColumns = [];
        } else {
            subHeaderColumns = getColumnsToShow({
                currentAccountID: currentUserDetails.accountID,
                data: transactionsSnapshot?.data,
                visibleColumns,
                type: transactionsSnapshot?.search.type,
            });
        }
    }

    // Compute sub-header column widths from transactions
    const isSubHeaderAmountColumnWide = groupItem.transactions.some((transaction) => transaction.isAmountColumnWide);
    const isSubHeaderTaxAmountColumnWide = groupItem.transactions.some((transaction) => transaction.isTaxAmountColumnWide);
    const shouldSubHeaderShowYear = groupItem.transactions.some((transaction) => transaction.shouldShowYear);
    const isSubHeaderActionColumnWide = groupItem.transactions.some((transaction) => !!transaction.isActionColumnWide || isDeletedTransaction(transaction));

    // Animated sub-header (SearchTableHeader) height
    const subHeaderHeight = useSharedValue(0);
    const hasExpanded = useSharedValue(isExpanded);
    const [isSubHeaderRendered, setIsSubHeaderRendered] = useState(isExpanded);

    hasExpanded.set(isExpanded);
    if (isExpanded && !isSubHeaderRendered) {
        setIsSubHeaderRendered(true);
    }

    const animatedSubHeaderHeight = useDerivedValue(() => {
        if (!subHeaderHeight.get()) {
            return 0;
        }
        const target = hasExpanded.get() ? subHeaderHeight.get() : 0;
        return withTiming(target, {duration: 300, easing}, (finished) => {
            if (!finished || target) {
                return;
            }
            scheduleOnRN(setIsSubHeaderRendered, false);
        });
    }, []);

    const subHeaderAnimatedStyle = useAnimatedStyle(() => ({
        height: animatedSubHeaderHeight.get(),
        overflow: 'hidden' as const,
    }));

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
        onSelectRow(rowItem, transactionPreviewData, event);
    };

    const renderHeader = (hovered: boolean) => {
        if (isExpenseReportType) {
            return (
                <ReportListItemHeader
                    report={groupItem as TransactionReportGroupListItemType}
                    onSelectRow={handleSelectRow}
                    onCheckboxPress={handleSelectionButtonPress}
                    isDisabled={isDisabledOrEmpty}
                    isFocused={isFocused}
                    canSelectMultiple={canSelectMultiple}
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={isIndeterminate}
                    isHovered={hovered}
                    onDownArrowClick={onToggle}
                    isExpanded={isExpanded}
                    lastPaymentMethod={lastPaymentMethod}
                    personalPolicyID={personalPolicyID}
                    userBillingGracePeriodEnds={userBillingGracePeriodEnds}
                    ownerBillingGracePeriodEnd={ownerBillingGracePeriodEnd}
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

    const isLastItemCollapsed = isLastItem && !isExpanded && !isSubHeaderRendered;

    const pressableStyle = [
        styles.transactionGroupListItemStyle,
        isLargeScreenWidth && {
            borderRadius: 0,
            ...(isLastItemCollapsed ? styles.tableBottomRadius : {}),
        },
        isItemSelected && styles.activeComponentBG,
        {minHeight: 0},
    ];

    const handlePress = (event?: ModifiedMouseEvent) => {
        if (isExpenseReportType) {
            onSelectRow(item, transactionPreviewData, event);
        }
        if (!isExpenseReportType) {
            onToggle();
        }
    };

    const handleLongPress = () => {
        onLongPressRow?.(item, isExpenseReportType ? undefined : groupItem.transactions);
    };

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <PressableWithFeedback
                onPress={handlePress}
                onLongPress={handleLongPress}
                disabled={false}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_GROUP_LIST_ITEM}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={[!isExpanded && !item.isDisabled && styles.hoveredComponentBG, isItemSelected && styles.activeComponentBG]}
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
                        ? [StyleUtils.getSearchTableGroupRowBorderStyle(isFirstItem, isLastItemCollapsed, isItemSelected), isLastItemCollapsed && styles.overflowHidden]
                        : [
                              isFirstItem && [styles.tableTopRadius, styles.overflowHidden],
                              isLastItemCollapsed && [styles.tableBottomRadius, styles.overflowHidden],
                              !isLastItemCollapsed && StyleUtils.getSelectedBorderBottomStyle(isItemSelected),
                          ],
                ]}
            >
                {({hovered}) => (
                    <View style={styles.flex1}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth && styles.tableRowHeight]}>
                            <View style={styles.flex1}>{renderHeader(hovered)}</View>
                            {isLargeScreenWidth && (
                                <PressableWithFeedback
                                    onPress={onToggle}
                                    style={[styles.p3Half, styles.justifyContentCenter, styles.alignItemsCenter, styles.pv2]}
                                    accessibilityRole={CONST.ROLE.BUTTON}
                                    accessibilityLabel={isExpanded ? CONST.ACCESSIBILITY_LABELS.COLLAPSE : CONST.ACCESSIBILITY_LABELS.EXPAND}
                                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.GROUP_EXPAND_TOGGLE}
                                >
                                    {({hovered: arrowHovered}) => (
                                        <Icon
                                            src={isExpanded ? expensifyIcons.UpArrow : expensifyIcons.DownArrow}
                                            fill={theme.icon}
                                            additionalStyles={!arrowHovered && styles.opacitySemiTransparent}
                                            small
                                        />
                                    )}
                                </PressableWithFeedback>
                            )}
                        </View>
                        {isLargeScreenWidth && (
                            <Animated.View style={subHeaderAnimatedStyle}>
                                {(isExpanded || isSubHeaderRendered) && (
                                    <View
                                        style={styles.stickToTop}
                                        onLayout={(e) => {
                                            const height = e.nativeEvent.layout.height;
                                            if (height) {
                                                subHeaderHeight.set(height);
                                            }
                                        }}
                                    >
                                        <View style={[styles.ph3, styles.pb1]}>
                                            <View style={[styles.borderBottom, styles.borderNone]} />
                                        </View>
                                        <View style={[styles.searchListHeaderContainerStyle, styles.groupSearchListTableContainerStyle, styles.bgTransparent, styles.pl8, styles.borderNone]}>
                                            <SearchTableHeader
                                                canSelectMultiple
                                                type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                                                onSortPress={() => {}}
                                                sortOrder={undefined}
                                                sortBy={undefined}
                                                shouldShowYear={shouldSubHeaderShowYear}
                                                isAmountColumnWide={isSubHeaderAmountColumnWide}
                                                isTaxAmountColumnWide={isSubHeaderTaxAmountColumnWide}
                                                shouldShowSorting={false}
                                                columns={subHeaderColumns}
                                                groupBy={groupBy}
                                                isExpenseReportView
                                                isActionColumnWide={isSubHeaderActionColumnWide}
                                            />
                                        </View>
                                        <View style={[StyleUtils.getSelectedBorderBottomStyle(isItemSelected), styles.ml3, styles.mr3, {marginBottom: 1}]} />
                                    </View>
                                )}
                            </Animated.View>
                        )}
                    </View>
                )}
            </PressableWithFeedback>
        </OfflineWithFeedback>
    );
}

export default GroupHeader;
