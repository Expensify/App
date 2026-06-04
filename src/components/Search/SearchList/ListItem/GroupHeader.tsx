import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import type {NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
// eslint-disable-next-line no-restricted-imports
import {useOnyx as originalUseOnyx} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import {getButtonRole} from '@components/Button/utils';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import {useSearchSelectionContext} from '@components/Search/SearchContext';
import SearchTableHeader from '@components/Search/SearchTableHeader';
import type {SearchColumnType, SearchCustomColumnIds, SearchGroupBy} from '@components/Search/types';
import type {ExtendedTargetedEvent} from '@components/SelectionList/ListItem/types';
import useAnimatedHighlightStyle from '@hooks/useAnimatedHighlightStyle';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useExpandCollapseAnimation from '@hooks/useExpandCollapseAnimation';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useSyncFocus from '@hooks/useSyncFocus';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TransactionPreviewData} from '@libs/actions/Search';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import type {ModifiedMouseEvent} from '@libs/Navigation/helpers/openInternalRouteInNewTab';
import {getColumnsToShow} from '@libs/SearchUIUtils';
import {isDeletedTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    onCheckboxPress: (item: GroupHeaderItemType, itemTransactions?: TransactionListItemType[]) => void;
    onLongPressRow?: (item: SearchListItem, itemTransactions?: TransactionListItemType[]) => void;
    onFocus?: (event: NativeSyntheticEvent<ExtendedTargetedEvent>) => void;
    shouldSyncFocus?: boolean;
    isFocused?: boolean;
    isFirstItem: boolean;
    isLastItem: boolean;
    visibleColumns?: SearchCustomColumnIds[];
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
    onFocus,
    shouldSyncFocus,
    isFocused,
    isFirstItem,
    isLastItem,
    lastPaymentMethod,
    personalPolicyID,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
    visibleColumns,
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
    const oneTransactionReportID = getNonEmptyStringOnyxID(oneTransactionItem?.reportID);
    const oneTransactionID = getNonEmptyStringOnyxID(oneTransactionItem?.transactionID);
    const oneTransactionChildReportID = oneTransactionItem?.reportAction?.childReportID;
    const [parentReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionReportID}`);
    const [oneTransactionThreadReport] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionChildReportID}`);
    const [oneTransaction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${oneTransactionID}`);
    const parentReportActionSelector = (reportActions: OnyxEntry<ReportActions>): OnyxEntry<ReportAction> => reportActions?.[`${oneTransactionItem?.reportAction?.reportActionID}`];
    const [parentReportAction] = originalUseOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneTransactionReportID}`, {selector: parentReportActionSelector}, [oneTransactionItem]);
    const transactionPreviewData: TransactionPreviewData = useMemo(
        () => ({
            hasParentReport: !!parentReport,
            hasTransaction: !!oneTransaction,
            hasParentReportAction: !!parentReportAction,
            hasTransactionThreadReport: !!oneTransactionThreadReport,
        }),
        [parentReport, oneTransaction, parentReportAction, oneTransactionThreadReport],
    );

    const [transactionsSnapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${groupItem.transactionsQueryJSON?.hash}`);
    const snapshotData = transactionsSnapshot?.data;
    const snapshotSearchType = transactionsSnapshot?.search.type;

    const subHeaderColumns = useMemo(() => {
        if (isExpenseReportType) {
            return columns ?? [];
        }
        if (!snapshotData) {
            return [];
        }
        return getColumnsToShow({
            currentAccountID: currentUserDetails.accountID,
            data: snapshotData,
            visibleColumns,
            type: snapshotSearchType,
        });
    }, [isExpenseReportType, columns, snapshotData, snapshotSearchType, currentUserDetails.accountID, visibleColumns]);

    const {isSubHeaderAmountColumnWide, isSubHeaderTaxAmountColumnWide, shouldSubHeaderShowYear, isSubHeaderActionColumnWide} = useMemo(() => {
        let amountWide = false;
        let taxWide = false;
        let showYear = false;
        let actionWide = false;
        for (const transaction of groupItem.transactions) {
            if (transaction.isAmountColumnWide) {
                amountWide = true;
            }
            if (transaction.isTaxAmountColumnWide) {
                taxWide = true;
            }
            if (transaction.shouldShowYear) {
                showYear = true;
            }
            if (transaction.isActionColumnWide || isDeletedTransaction(transaction)) {
                actionWide = true;
            }
            if (amountWide && taxWide && showYear && actionWide) {
                break;
            }
        }
        return {isSubHeaderAmountColumnWide: amountWide, isSubHeaderTaxAmountColumnWide: taxWide, shouldSubHeaderShowYear: showYear, isSubHeaderActionColumnWide: actionWide};
    }, [groupItem.transactions]);

    const {isRendered: isSubHeaderRendered, animatedStyle: subHeaderAnimatedStyle, onLayout: onSubHeaderLayout} = useExpandCollapseAnimation(isExpanded);

    const hasSnapshotTransactions = !isExpenseReportType && !!snapshotData && Object.keys(snapshotData).some((key) => key.startsWith(ONYXKEYS.COLLECTION.TRANSACTION));
    const isEmpty = groupItem.transactions.length === 0 && !hasSnapshotTransactions;
    const isDisabled = item.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const isDisabledOrEmpty = isEmpty || isDisabled;

    const {isSelectAllChecked, isIndeterminate} = useMemo(() => {
        const selectedTransactionIDsSet = new Set(Object.keys(selectedTransactions));
        const filteredTransactions = groupItem.transactions.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
        const selectedCount = groupItem.transactions.reduce((acc, transaction) => (selectedTransactionIDsSet.has(transaction.transactionID) ? acc + 1 : acc), 0);
        const isEmptyReportSelected = isEmpty && item?.keyForList && selectedTransactions[item.keyForList]?.isSelected;
        const allChecked = !!isEmptyReportSelected || (selectedCount === filteredTransactions.length && filteredTransactions.length > 0);
        const indeterminate = selectedCount > 0 && selectedCount !== filteredTransactions.length;
        return {isSelectAllChecked: allChecked, isIndeterminate: indeterminate};
    }, [selectedTransactions, groupItem.transactions, isEmpty, item?.keyForList]);

    const isItemSelected = isSelectAllChecked || item?.isSelected;

    const animatedHighlightStyle = useAnimatedHighlightStyle({
        shouldHighlight: item?.shouldAnimateInHighlight ?? false,
        highlightColor: theme.messageHighlightBG,
        backgroundColor: isItemSelected ? theme.activeComponentBG : theme.highlightBG,
        shouldApplyOtherStyles: false,
    });

    const handleSelectionButtonPress = () => {
        onCheckboxPress(item, isExpenseReportType ? undefined : groupItem.transactions);
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
                    isDisabled={isDisabled}
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

        const commonProps = {
            onCheckboxPress: handleSelectionButtonPress,
            isDisabled: isDisabledOrEmpty,
            columns,
            canSelectMultiple,
            isSelectAllChecked,
            isIndeterminate,
            onDownArrowClick: onToggle,
            isExpanded,
        } as const;

        switch (groupBy) {
            case CONST.SEARCH.GROUP_BY.FROM:
                return (
                    <MemberListItemHeader
                        member={groupItem as TransactionMemberGroupListItemType}
                        {...commonProps}
                        isLargeScreenWidth={isLargeScreenWidth}
                    />
                );
            case CONST.SEARCH.GROUP_BY.CARD:
                return (
                    <CardListItemHeader
                        card={groupItem as TransactionCardGroupListItemType}
                        {...commonProps}
                        isFocused={isFocused}
                    />
                );
            case CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID:
                return (
                    <WithdrawalIDListItemHeader
                        withdrawalID={groupItem as TransactionWithdrawalIDGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.CATEGORY:
                return (
                    <CategoryListItemHeader
                        category={groupItem as TransactionCategoryGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.MERCHANT:
                return (
                    <MerchantListItemHeader
                        merchant={groupItem as TransactionMerchantGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.TAG:
                return (
                    <TagListItemHeader
                        tag={groupItem as TransactionTagGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.MONTH:
                return (
                    <MonthListItemHeader
                        month={groupItem as TransactionMonthGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.WEEK:
                return (
                    <WeekListItemHeader
                        week={groupItem as TransactionWeekGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.YEAR:
                return (
                    <YearListItemHeader
                        year={groupItem as TransactionYearGroupListItemType}
                        {...commonProps}
                    />
                );
            case CONST.SEARCH.GROUP_BY.QUARTER:
                return (
                    <QuarterListItemHeader
                        quarter={groupItem as TransactionQuarterGroupListItemType}
                        {...commonProps}
                    />
                );
            default:
                return null;
        }
    };

    const isLastItemCollapsed = isLastItem && !isExpanded && !isSubHeaderRendered;
    const pressableRef = useRef<View>(null);

    useSyncFocus(pressableRef, !!isFocused, shouldSyncFocus);

    const pressableStyle = [
        styles.transactionGroupListItemStyle,
        isLargeScreenWidth && {
            ...styles.tableRowHeight,
            borderRadius: 0,
            ...(isLastItemCollapsed ? styles.tableBottomRadius : {}),
        },
        isItemSelected && styles.activeComponentBG,
    ];

    const shouldDisplayEmptyView = isEmpty && isExpenseReportType;

    const handlePress = (event?: ModifiedMouseEvent) => {
        if (isExpenseReportType || isEmpty) {
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
                ref={pressableRef}
                onPress={handlePress}
                onLongPress={handleLongPress}
                disabled={isDisabled && !isItemSelected}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.TRANSACTION_GROUP_LIST_ITEM}
                accessibilityLabel={item.text ?? ''}
                role={getButtonRole(true)}
                isNested
                hoverStyle={[!isExpanded && !item.isDisabled && styles.hoveredComponentBG, isItemSelected && styles.activeComponentBG]}
                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                onMouseDown={(e) => e.preventDefault()}
                id={item.keyForList ?? ''}
                onFocus={onFocus}
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
                              !isLastItemCollapsed && !isExpanded && StyleUtils.getSelectedBorderBottomStyle(isItemSelected),
                          ],
                ]}
            >
                {({hovered}) => (
                    <View style={styles.flex1}>
                        <View style={[styles.flexRow, styles.alignItemsCenter, isLargeScreenWidth && styles.tableRowHeight]}>
                            <View style={styles.flex1}>{renderHeader(hovered)}</View>
                            {isLargeScreenWidth && (
                                <PressableWithFeedback
                                    onPress={() => {
                                        if (isEmpty && !shouldDisplayEmptyView) {
                                            handlePress();
                                            return;
                                        }
                                        onToggle();
                                    }}
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
                                        />
                                    )}
                                </PressableWithFeedback>
                            )}
                        </View>
                        {isLargeScreenWidth && subHeaderColumns.length > 0 && (
                            <Animated.View style={subHeaderAnimatedStyle}>
                                {(isExpanded || isSubHeaderRendered) && (
                                    <View
                                        style={styles.stickToTop}
                                        onLayout={onSubHeaderLayout}
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
                                        <View style={styles.ph3}>
                                            <View style={StyleUtils.getSelectedBorderBottomStyle(isItemSelected)} />
                                        </View>
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
