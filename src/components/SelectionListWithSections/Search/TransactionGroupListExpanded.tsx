import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import ScrollView from '@components/ScrollView';
import SearchTableHeader from '@components/SelectionListWithSections/SearchTableHeader';
import type {ListItem, TransactionGroupListExpandedProps, TransactionListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {createAndOpenSearchTransactionThread, getColumnsToShow, getTableMinWidth} from '@libs/SearchUIUtils';
import {getTransactionViolations} from '@libs/TransactionUtils';
import {setActiveTransactionIDs} from '@userActions/TransactionThreadNavigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {columnsSelector} from '@src/selectors/AdvancedSearchFiltersForm';

function TransactionGroupListExpanded<TItem extends ListItem>({
    transactionsQueryJSON,
    showTooltip,
    canSelectMultiple,
    onCheckboxPress,
    columns,
    groupBy,
    accountID,
    isOffline,
    violations,
    transactions,
    transactionsVisibleLimit,
    setTransactionsVisibleLimit,
    isEmpty,
    isExpenseReportType,
    transactionsSnapshot,
    shouldDisplayEmptyView,
    searchTransactions,
    isInSingleTransactionReport,
    onLongPress,
}: TransactionGroupListExpandedProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();
    const currentUserDetails = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const [isMobileSelectionModeEnabled] = useOnyx(ONYXKEYS.MOBILE_SELECTION_MODE, {canBeMissing: true});
    const [visibleColumns] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true, selector: columnsSelector});

    const transactionsSnapshotMetadata = useMemo(() => {
        return transactionsSnapshot?.search;
    }, [transactionsSnapshot?.search]);

    const visibleTransactions = useMemo(() => {
        if (isExpenseReportType) {
            return transactions.slice(0, transactionsVisibleLimit);
        }
        return transactions;
    }, [transactions, transactionsVisibleLimit, isExpenseReportType]);

    const isLastTransaction = useCallback(
        (index: number) => {
            return index === visibleTransactions.length - 1;
        },
        [visibleTransactions.length],
    );

    const currentColumns = useMemo(() => {
        if (isExpenseReportType) {
            return columns ?? [];
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        return getColumnsToShow(accountID, transactionsSnapshot?.data, visibleColumns, false, transactionsSnapshot?.search.type);
    }, [accountID, columns, isExpenseReportType, transactionsSnapshot?.data, transactionsSnapshot?.search.type, visibleColumns]);

    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayShowMoreButton = isExpenseReportType ? transactions.length > transactionsVisibleLimit : !!transactionsSnapshotMetadata?.hasMoreResults && !isOffline;
    const currentOffset = transactionsSnapshotMetadata?.offset ?? 0;
    const shouldShowLoadingOnSearch = !!(!transactions?.length && transactionsSnapshotMetadata?.isLoading) || currentOffset > 0;
    const shouldDisplayLoadingIndicator = !isExpenseReportType && !!transactionsSnapshotMetadata?.isLoading && shouldShowLoadingOnSearch;
    const {isLargeScreenWidth} = useResponsiveLayout();

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        const isAmountColumnWide = transactions.some((transaction) => transaction.isAmountColumnWide);
        const isTaxAmountColumnWide = transactions.some((transaction) => transaction.isTaxAmountColumnWide);
        const shouldShowYearForSomeTransaction = transactions.some((transaction) => transaction.shouldShowYear);
        return {
            amountColumnSize: isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactions]);

    const {markReportIDAsExpense} = useContext(WideRHPContext);
    const openReportInRHP = (transactionItem: TransactionListItemType) => {
        const backTo = Navigation.getActiveRoute();
        const reportID = getReportIDForTransaction(transactionItem, transactionItem?.reportAction?.childReportID);

        const navigateToTransactionThread = () => {
            if (!transactionItem?.reportAction?.childReportID) {
                createAndOpenSearchTransactionThread(transactionItem, backTo, transactionItem?.reportAction?.childReportID);
                return;
            }
            markReportIDAsExpense(reportID);
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        };

        // The arrow navigation in RHP is only allowed for group-by:reports
        if (!isExpenseReportType) {
            navigateToTransactionThread();
            return;
        }

        const siblingTransactionIDs = transactions
            .filter((transaction) => transaction.reportAction?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .map((transaction) => transaction.transactionID);

        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        setActiveTransactionIDs(siblingTransactionIDs).then(() => {
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            navigateToTransactionThread();
        });
    };

    const onShowMoreButtonPress = useCallback(() => {
        if (isExpenseReportType) {
            setTransactionsVisibleLimit((currentPageSize) => currentPageSize + CONST.TRANSACTION.RESULTS_PAGE_SIZE);
        } else if (!isOffline && transactionsQueryJSON) {
            searchTransactions(CONST.SEARCH.RESULTS_PAGE_SIZE);
        }
    }, [isExpenseReportType, isOffline, transactionsQueryJSON, setTransactionsVisibleLimit, searchTransactions]);

    if (shouldDisplayEmptyView) {
        return (
            <View style={[styles.alignItemsCenter, styles.justifyContentCenter, styles.mnh13]}>
                <Text
                    style={[styles.textLabelSupporting]}
                    numberOfLines={1}
                >
                    {translate('search.moneyRequestReport.emptyStateTitle')}
                </Text>
            </View>
        );
    }

    const handleOnPress = (transaction: TransactionListItemType) => {
        if (isMobileSelectionModeEnabled) {
            onCheckboxPress?.(transaction as unknown as TItem);
            return;
        }
        openReportInRHP(transaction);
    };

    const minTableWidth = getTableMinWidth(currentColumns.filter((column) => !column.startsWith(CONST.SEARCH.GROUP_COLUMN_PREFIX)) ?? []);
    const shouldScrollHorizontally = isLargeScreenWidth && minTableWidth > windowWidth;

    const content = (
        <View style={[styles.flexColumn, styles.flex1]}>
            {isLargeScreenWidth && (
                <View style={[styles.searchListHeaderContainerStyle, styles.groupSearchListTableContainerStyle, styles.bgTransparent, styles.pl9, styles.pr11]}>
                    <SearchTableHeader
                        canSelectMultiple
                        type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                        onSortPress={() => {}}
                        sortOrder={undefined}
                        sortBy={undefined}
                        shouldShowYear={dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE}
                        isAmountColumnWide={amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE}
                        isTaxAmountColumnWide={taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE}
                        shouldShowSorting={false}
                        columns={currentColumns}
                        groupBy={groupBy}
                        isExpenseReportView
                    />
                </View>
            )}
            {visibleTransactions.map((transaction, index) => {
                const shouldShowBottomBorder = !isLastTransaction(index) && !isLargeScreenWidth;
                const exportedReportActions = Object.values(transactionsSnapshot?.data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction?.reportID}`] ?? {});

                const transactionRow = (
                    <TransactionItemRow
                        report={transaction.report}
                        transactionItem={transaction}
                        violations={getTransactionViolations(transaction, violations, currentUserDetails.email ?? '', currentUserDetails.accountID, transaction.report, transaction.policy)}
                        isSelected={!!transaction.isSelected}
                        dateColumnSize={dateColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        shouldShowTooltip={showTooltip}
                        shouldUseNarrowLayout={!isLargeScreenWidth}
                        shouldShowCheckbox={!!canSelectMultiple}
                        onCheckboxPress={() => onCheckboxPress?.(transaction as unknown as TItem)}
                        columns={currentColumns}
                        onButtonPress={() => {
                            openReportInRHP(transaction);
                        }}
                        style={[styles.noBorderRadius, styles.p3, isLargeScreenWidth && [styles.pv1Half], styles.flex1]}
                        isReportItemChild
                        isInSingleTransactionReport={isInSingleTransactionReport}
                        shouldShowBottomBorder={shouldShowBottomBorder}
                        onArrowRightPress={() => openReportInRHP(transaction)}
                        shouldShowArrowRightOnNarrowLayout
                        reportActions={exportedReportActions}
                    />
                );
                return (
                    <OfflineWithFeedback
                        pendingAction={transaction.pendingAction}
                        key={transaction.transactionID}
                    >
                        {!isLargeScreenWidth ? (
                            <PressableWithFeedback
                                onPress={() => handleOnPress(transaction)}
                                onLongPress={() => onLongPress?.(transaction)}
                                accessibilityRole={CONST.ROLE.BUTTON}
                                accessibilityLabel={transaction.text ?? ''}
                                isNested
                                onMouseDown={(e) => e.preventDefault()}
                                hoverStyle={[!transaction.isDisabled && styles.hoveredComponentBG]}
                                dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true, [CONST.INNER_BOX_SHADOW_ELEMENT]: false}}
                                id={transaction.transactionID}
                            >
                                {transactionRow}
                            </PressableWithFeedback>
                        ) : (
                            transactionRow
                        )}
                    </OfflineWithFeedback>
                );
            })}
            {shouldDisplayShowMoreButton && !shouldDisplayLoadingIndicator && (
                <View style={[styles.w100, styles.flexRow, isLargeScreenWidth && styles.pl10]}>
                    <Button
                        text={translate('common.showMore')}
                        onPress={onShowMoreButtonPress}
                        link
                        shouldUseDefaultHover={false}
                        isNested
                        medium
                        innerStyles={[styles.ph3]}
                        textStyles={[styles.fontSizeNormal]}
                    />
                </View>
            )}
            {shouldDisplayLoadingIndicator && (
                <View style={[isLargeScreenWidth && styles.pl10, styles.pt3, isEmpty && styles.pb3]}>
                    <ActivityIndicator
                        color={theme.spinner}
                        size={25}
                        style={[styles.pl3, !isEmpty && styles.alignItemsStart]}
                    />
                </View>
            )}
        </View>
    );

    return shouldScrollHorizontally ? (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={styles.flex1}
            contentContainerStyle={{width: minTableWidth}}
        >
            {content}
        </ScrollView>
    ) : (
        content
    );
}

export default TransactionGroupListExpanded;
