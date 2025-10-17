import React, {useCallback, useContext, useMemo} from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import Button from '@components/Button';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SearchColumnType} from '@components/Search/types';
import SearchTableHeader, {getExpenseHeaders} from '@components/SelectionListWithSections/SearchTableHeader';
import type {ListItem, TransactionGroupListExpandedProps, TransactionListItemType} from '@components/SelectionListWithSections/types';
import Text from '@components/Text';
import TransactionItemRow from '@components/TransactionItemRow';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {getReportIDForTransaction} from '@libs/MoneyRequestReportUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getReportAction} from '@libs/ReportActionsUtils';
import {createAndOpenSearchTransactionThread, getColumnsToShow} from '@libs/SearchUIUtils';
import {getTransactionViolations} from '@libs/TransactionUtils';
import {setActiveTransactionIDs} from '@userActions/TransactionThreadNavigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
    areAllOptionalColumnsHidden: areAllOptionalColumnsHiddenProp,
    transactions,
    transactionsVisibleLimit,
    setTransactionsVisibleLimit,
    isEmpty,
    isGroupByReports,
    transactionsSnapshot,
    shouldDisplayEmptyView,
    searchTransactions,
    isInSingleTransactionReport,
}: TransactionGroupListExpandedProps<TItem>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentSearchHash} = useSearchContext();
    const transactionsSnapshotMetadata = useMemo(() => {
        return transactionsSnapshot?.search;
    }, [transactionsSnapshot]);

    const visibleTransactions = useMemo(() => {
        if (isGroupByReports) {
            return transactions.slice(0, transactionsVisibleLimit);
        }
        return transactions;
    }, [transactions, transactionsVisibleLimit, isGroupByReports]);

    const currentColumns = useMemo(() => {
        if (isGroupByReports) {
            return columns ?? [];
        }
        if (!transactionsSnapshot?.data) {
            return [];
        }
        const columnsToShow = getColumnsToShow(accountID, transactionsSnapshot?.data, false, transactionsSnapshot?.search.type === CONST.SEARCH.DATA_TYPES.TASK);

        return (Object.keys(columnsToShow) as SearchColumnType[]).filter((col) => columnsToShow[col]);
    }, [accountID, columns, isGroupByReports, transactionsSnapshot?.data, transactionsSnapshot?.search.type]);

    const areAllOptionalColumnsHidden = useMemo(() => {
        if (isGroupByReports) {
            return areAllOptionalColumnsHiddenProp ?? false;
        }
        const canBeMissingColumns = getExpenseHeaders(groupBy)
            .filter((header) => header.canBeMissing)
            .map((header) => header.columnName);
        return canBeMissingColumns.every((column) => !currentColumns.includes(column));
    }, [areAllOptionalColumnsHiddenProp, currentColumns, groupBy, isGroupByReports]);

    // Currently only the transaction report groups have transactions where the empty view makes sense
    const shouldDisplayShowMoreButton = isGroupByReports ? transactions.length > transactionsVisibleLimit : !!transactionsSnapshotMetadata?.hasMoreResults && !isOffline;
    const currentOffset = transactionsSnapshotMetadata?.offset ?? 0;
    const shouldShowLoadingOnSearch = !!(!transactions?.length && transactionsSnapshotMetadata?.isLoading) || currentOffset > 0;
    const shouldDisplayLoadingIndicator = !isGroupByReports && !!transactionsSnapshotMetadata?.isLoading && shouldShowLoadingOnSearch;
    const {isLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

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
        const reportID = getReportIDForTransaction(transactionItem);

        const navigateToTransactionThread = () => {
            if (transactionItem.transactionThreadReportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
                const iouAction = getReportAction(transactionItem.report?.reportID, transactionItem.moneyRequestReportActionID);
                createAndOpenSearchTransactionThread(transactionItem, iouAction, currentSearchHash, backTo);
                return;
            }
            markReportIDAsExpense(reportID);
            Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID, backTo}));
        };

        // The arrow navigation in RHP is only allowed for group-by:reports
        if (!isGroupByReports) {
            navigateToTransactionThread();
            return;
        }

        const siblingTransactionIDs = transactions.map((transaction) => transaction.transactionID);

        // When opening the transaction thread in RHP we need to find every other ID for the rest of transactions
        // to display prev/next arrows in RHP for navigation
        setActiveTransactionIDs(siblingTransactionIDs).then(() => {
            // If we're trying to open a transaction without a transaction thread, let's create the thread and navigate the user
            navigateToTransactionThread();
        });
    };

    const onShowMoreButtonPress = useCallback(() => {
        if (isGroupByReports) {
            setTransactionsVisibleLimit((currentPageSize) => currentPageSize + CONST.TRANSACTION.RESULTS_PAGE_SIZE);
        } else if (!isOffline && transactionsQueryJSON) {
            searchTransactions(CONST.SEARCH.RESULTS_PAGE_SIZE);
        }
    }, [isGroupByReports, isOffline, transactionsQueryJSON, setTransactionsVisibleLimit, searchTransactions]);

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

    return (
        <>
            {isLargeScreenWidth && (
                <View
                    style={[styles.searchListHeaderContainerStyle, styles.groupSearchListTableContainerStyle, styles.bgTransparent, styles.pl9, isGroupByReports ? styles.pr10 : styles.pr3]}
                >
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
                        areAllOptionalColumnsHidden={areAllOptionalColumnsHidden ?? false}
                        groupBy={groupBy}
                    />
                </View>
            )}
            {visibleTransactions.map((transaction) => (
                <OfflineWithFeedback
                    pendingAction={transaction.pendingAction}
                    key={transaction.transactionID}
                >
                    <TransactionItemRow
                        report={transaction.report}
                        transactionItem={transaction}
                        violations={getTransactionViolations(transaction, violations)}
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
                        style={[styles.noBorderRadius, shouldUseNarrowLayout ? [styles.p3, styles.pt2] : [styles.ph3, styles.pv1Half], isGroupByReports && styles.pr10]}
                        isReportItemChild
                        isInSingleTransactionReport={isInSingleTransactionReport}
                        areAllOptionalColumnsHidden={areAllOptionalColumnsHidden}
                    />
                </OfflineWithFeedback>
            ))}
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
        </>
    );
}

TransactionGroupListExpanded.displayName = 'TransactionGroupListExpanded';

export default TransactionGroupListExpanded;
