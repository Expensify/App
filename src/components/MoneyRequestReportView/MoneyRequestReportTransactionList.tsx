import {findFocusedRoute, useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
// ScrollView type is needed for the horizontal scroll ref; the project ScrollView component is used for rendering.
// eslint-disable-next-line no-restricted-imports
import type {NativeScrollEvent, NativeSyntheticEvent, ScrollView as RNScrollView} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Button from '@components/Button';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useSearchActionsContext, useSearchStateContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchCustomColumnIds, SortOrder} from '@components/Search/types';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import {useWideRHPActions} from '@components/WideRHPContextProvider';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHandleSelectionMode from '@hooks/useHandleSelectionMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {getReportLayoutGroupBy, setReportLayoutGroupBy} from '@libs/actions/ReportLayout';
import {clearActiveTransactionIDs, setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {hasNonReimbursableTransactions, isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import {navigationRef} from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {isPolicyTaxEnabled} from '@libs/PolicyUtils';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {groupTransactionsByCategory, groupTransactionsByTag} from '@libs/ReportLayoutUtils';
import {
    canAddTransaction,
    getAddExpenseDropdownOptions,
    getBillableAndTaxTotal,
    getMoneyRequestSpendBreakdown,
    getReportOfflinePendingActionAndErrors,
    isCurrentUserSubmitter,
    isExpenseReport,
    isIOUReport,
} from '@libs/ReportUtils';
import {compareValues, getColumnsToShow, getTableMinWidth, isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
import {getAmount, getCategory, getCreated, getMerchant, getTag, getTransactionPendingAction, isTransactionPendingDelete, shouldShowExpenseBreakdown} from '@libs/TransactionUtils';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import Navigation from '@navigation/Navigation';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import variables from '@styles/variables';
import {createTransactionThreadReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import MoneyRequestReportGroupHeader from './MoneyRequestReportGroupHeader';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';
import MoneyRequestReportTotalSpend from './MoneyRequestReportTotalSpend';
import MoneyRequestReportTransactionItem from './MoneyRequestReportTransactionItem';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

type MoneyRequestReportTransactionListProps = {
    /** The money request report containing the transactions */
    report: OnyxTypes.Report;

    /** The workspace to which the report belongs */
    policy?: OnyxTypes.Policy;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** Whether there is a pending delete transaction */
    hasPendingDeletionTransaction?: boolean;

    /** List of transactions that arrived when the report was open */
    newTransactions: OnyxTypes.Transaction[];

    /** Array of report actions for the report that these transactions belong to */
    reportActions: OnyxTypes.ReportAction[];

    /** scrollToNewTransaction callback used for scrolling to new transaction when it is created */
    scrollToNewTransaction: (offset: number) => void;

    /** Whether the report that these transactions belong to has any chat comments */
    hasComments: boolean;

    /** Whether the report actions are being loaded, used to show 'Comments' during loading state */
    isLoadingInitialReportActions?: boolean;
};

type TransactionWithOptionalHighlight = OnyxTypes.Transaction & {
    /** Whether the transaction should be highlighted, when it is added to the report */
    shouldBeHighlighted?: boolean;
};

const sortableColumnNames = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
] as const satisfies readonly SearchColumnType[];

type ReportScreenNavigationProps = ReportsSplitNavigatorParamList[typeof SCREENS.REPORT];

type SortableColumnName = TupleToUnion<typeof sortableColumnNames>;

type SortedTransactions = {
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

const isSortableColumnName = (key: unknown): key is SortableColumnName => !!sortableColumnNames.find((val) => val === key);

const getTransactionValue = (transaction: OnyxTypes.Transaction, key: SortableColumnName, reportToSort: OnyxTypes.Report) => {
    switch (key) {
        case CONST.SEARCH.TABLE_COLUMNS.DATE:
            return getCreated(transaction);
        case CONST.SEARCH.TABLE_COLUMNS.MERCHANT:
            return getMerchant(transaction);
        case CONST.SEARCH.TABLE_COLUMNS.CATEGORY:
            return getCategory(transaction);
        case CONST.SEARCH.TABLE_COLUMNS.TAG:
            return getTag(transaction);
        case CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT:
            return getAmount(transaction, isExpenseReport(reportToSort), transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID);
        case CONST.SEARCH.TABLE_COLUMNS.DESCRIPTION:
            return Parser.htmlToText(transaction.comment?.comment ?? '');
        default:
            return transaction[key];
    }
};

function MoneyRequestReportTransactionList({
    report,
    transactions,
    newTransactions,
    reportActions,
    hasPendingDeletionTransaction = false,
    scrollToNewTransaction,
    policy,
    hasComments,
    isLoadingInitialReportActions = false,
}: MoneyRequestReportTransactionListProps) {
    useCopySelectionHelper();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'CheckSquare', 'ReceiptPlus', 'Columns']);
    const {translate, localeCompare} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {markReportIDAsExpense} = useWideRHPActions();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState<string>('');
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    const isTaxEnabled = isPolicyTaxEnabled(policy);
    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const {billableTotal, taxTotal} = getBillableAndTaxTotal(report, transactions);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const formattedBillableAmount = convertToDisplayString(billableTotal, report?.currency);
    const formattedTaxAmount = convertToDisplayString(taxTotal, report?.currency);
    const shouldShowExpenseReportBreakDown = shouldShowExpenseBreakdown(transactions);
    const shouldShowBreakdown = shouldShowExpenseReportBreakDown || !!billableTotal || (!!taxTotal && isTaxEnabled);
    const transactionsWithoutPendingDelete = useMemo(() => transactions.filter((t) => !isTransactionPendingDelete(t)), [transactions]);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const shouldShowAddExpenseButton = canAddTransaction(report, isReportArchived) && isCurrentUserSubmitter(report);
    const [userBillingGraceEndPeriodCollection] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_USER_BILLING_GRACE_PERIOD_END);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE);
    const [reportLayoutGroupBy] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY);
    const [reportDetailsColumns] = useOnyx(ONYXKEYS.NVP_REPORT_DETAILS_COLUMNS);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);

    const shouldShowGroupedTransactions = isExpenseReport(report) && !isIOUReport(report);

    const addExpenseDropdownOptions = useMemo(
        () => getAddExpenseDropdownOptions(translate, expensifyIcons, report?.reportID, policy, userBillingGraceEndPeriodCollection, undefined, undefined, lastDistanceExpenseType),
        [translate, expensifyIcons, report?.reportID, policy, userBillingGraceEndPeriodCollection, lastDistanceExpenseType],
    );

    const hasPendingAction = useMemo(() => {
        return hasPendingDeletionTransaction || transactions.some(getTransactionPendingAction);
    }, [hasPendingDeletionTransaction, transactions]);

    const {selectedTransactionIDs} = useSearchStateContext();
    const {setSelectedTransactions, clearSelectedTransactions} = useSearchActionsContext();
    useHandleSelectionMode(selectedTransactionIDs);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    const toggleTransaction = useCallback(
        (transactionID: string) => {
            let newSelectedTransactionIDs = selectedTransactionIDs;
            if (selectedTransactionIDs.includes(transactionID)) {
                newSelectedTransactionIDs = selectedTransactionIDs.filter((t) => t !== transactionID);
            } else {
                newSelectedTransactionIDs = [...selectedTransactionIDs, transactionID];
            }
            setSelectedTransactions(newSelectedTransactionIDs);
        },
        [setSelectedTransactions, selectedTransactionIDs],
    );

    const isTransactionSelected = useCallback((transactionID: string) => selectedTransactionIDs.includes(transactionID), [selectedTransactionIDs]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                if (navigationRef?.getRootState()?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                    return;
                }
                clearSelectedTransactions(true);
            };
        }, [clearSelectedTransactions]),
    );

    const reportID = report?.reportID;

    useEffect(() => {
        clearSelectedTransactions(true);
        // We don't want to run the effect on change of clearSelectedTransactions since it can cause an infinite loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reportID]);

    const [sortConfig, setSortConfig] = useState<SortedTransactions>({
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    });

    const {sortBy, sortOrder} = sortConfig;

    const sortedTransactions: TransactionWithOptionalHighlight[] = useMemo(() => {
        return [...transactions].sort((a, b) => compareValues(getTransactionValue(a, sortBy, report), getTransactionValue(b, sortBy, report), sortOrder, sortBy, localeCompare, true));
    }, [sortBy, sortOrder, transactions, localeCompare, report]);

    const highlightedTransactionIDs = useMemo(() => new Set(newTransactions.map(({transactionID}) => transactionID)), [newTransactions]);

    // Always use default columns for money request report view (don't use user-customized search columns)
    const isExpenseReportViewFromIOUReport = isIOUReport(report);
    const shouldShowBillableColumn = isBillableEnabledOnPolicy(policy);
    const columnsToShow = useMemo(() => {
        return getColumnsToShow(
            currentUserDetails?.accountID,
            transactions,
            (reportDetailsColumns ?? []) as SearchCustomColumnIds[],
            true,
            undefined,
            undefined,
            isExpenseReportViewFromIOUReport,
            shouldShowBillableColumn,
            hasNonReimbursableTransactions(transactions),
        );
    }, [transactions, currentUserDetails?.accountID, isExpenseReportViewFromIOUReport, shouldShowBillableColumn, reportDetailsColumns]);

    const {windowWidth, windowHeight} = useWindowDimensions();
    const minTableWidth = getTableMinWidth(columnsToShow);
    const shouldScrollHorizontally = !shouldUseNarrowLayout && minTableWidth > windowWidth;
    const horizontalScrollViewRef = useRef<RNScrollView>(null);
    const horizontalScrollOffsetRef = useRef(0);

    const handleHorizontalScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        horizontalScrollOffsetRef.current = event.nativeEvent.contentOffset.x;
    }, []);

    // Restore horizontal scroll position synchronously before paint when transactions change
    useLayoutEffect(() => {
        if (!shouldScrollHorizontally || horizontalScrollOffsetRef.current <= 0) {
            return;
        }
        horizontalScrollViewRef.current?.scrollTo({x: horizontalScrollOffsetRef.current, animated: false});
    }, [sortedTransactions, shouldScrollHorizontally]);

    const currentGroupBy = getReportLayoutGroupBy(reportLayoutGroupBy);

    const groupedTransactions = useMemo(() => {
        if (!shouldShowGroupedTransactions) {
            return [];
        }
        if (currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG) {
            return groupTransactionsByTag(sortedTransactions, report, localeCompare);
        }
        return groupTransactionsByCategory(sortedTransactions, report, localeCompare);
        // groupTransactionsByTag() and groupTransactionsByCategory() use the full report object to perform a null check.
        // We skip including the report as a dependency to avoid unnecessary re-renders as it changes often and we only need to recalculate when currency changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedTransactions, currentGroupBy, report?.reportID, report?.currency, localeCompare, shouldShowGroupedTransactions]);

    const visualOrderTransactionIDs = useMemo(() => {
        if (!shouldShowGroupedTransactions || groupedTransactions.length === 0) {
            return sortedTransactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID);
        }
        return groupedTransactions.flatMap((group) => group.transactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID));
    }, [groupedTransactions, sortedTransactions, shouldShowGroupedTransactions]);

    useEffect(() => {
        const focusedRoute = findFocusedRoute(navigationRef.getRootState());
        if (focusedRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT) {
            return;
        }
        setActiveTransactionIDs(visualOrderTransactionIDs);
    }, [visualOrderTransactionIDs]);

    useEffect(() => {
        return () => {
            clearActiveTransactionIDs();
        };
    }, []);

    const groupSelectionState = useMemo(() => {
        const state = new Map<string, {isSelected: boolean; isIndeterminate: boolean; isDisabled: boolean; pendingAction?: PendingAction}>();

        for (const group of groupedTransactions) {
            const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
            const groupPendingAction = group.transactions.some((t) => getTransactionPendingAction(t)) ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : undefined;

            if (groupTransactionIDs.length === 0) {
                state.set(group.groupKey, {isSelected: false, isIndeterminate: false, isDisabled: true, pendingAction: groupPendingAction});
                continue;
            }

            const selectedCount = groupTransactionIDs.filter((id) => selectedTransactionIDs.includes(id)).length;
            state.set(group.groupKey, {
                isSelected: selectedCount === groupTransactionIDs.length,
                isIndeterminate: selectedCount > 0 && selectedCount < groupTransactionIDs.length,
                isDisabled: false,
                pendingAction: groupPendingAction,
            });
        }

        return state;
    }, [groupedTransactions, selectedTransactionIDs]);

    const toggleGroupSelection = useCallback(
        (groupKey: string) => {
            const group = groupedTransactions.find((g) => g.groupKey === groupKey);
            if (!group) {
                return;
            }
            const groupTransactionIDs = group.transactions.filter((t) => !isTransactionPendingDelete(t)).map((t) => t.transactionID);
            const anySelected = groupTransactionIDs.some((id) => selectedTransactionIDs.includes(id));

            let newSelectedTransactionIDs = selectedTransactionIDs;
            if (anySelected) {
                newSelectedTransactionIDs = selectedTransactionIDs.filter((id) => !groupTransactionIDs.includes(id));
            } else {
                newSelectedTransactionIDs = [...selectedTransactionIDs, ...groupTransactionIDs];
            }
            setSelectedTransactions(newSelectedTransactionIDs);
        },
        [groupedTransactions, selectedTransactionIDs, setSelectedTransactions],
    );

    /**
     * Navigate to the transaction thread for a transaction, creating one optimistically if it doesn't yet exist.
     */
    const navigateToTransaction = useCallback(
        (activeTransactionID: string) => {
            const iouAction = getIOUActionForTransactionID(reportActions, activeTransactionID);
            const backTo = Navigation.getActiveRoute();
            let reportIDToNavigate = iouAction?.childReportID;

            const routeParams = {
                reportID: reportIDToNavigate,
                backTo,
            } as ReportScreenNavigationProps;

            if (!reportIDToNavigate) {
                const transaction = sortedTransactions.find((t) => t.transactionID === activeTransactionID);
                const transactionThreadReport = createTransactionThreadReport(introSelected, report, iouAction, transaction);
                if (transactionThreadReport) {
                    reportIDToNavigate = transactionThreadReport.reportID;
                    routeParams.reportID = reportIDToNavigate;
                }
            } else {
                setOptimisticTransactionThread(reportIDToNavigate, report?.reportID, iouAction?.reportActionID, report?.policyID);
            }

            // Single transaction report will open in RHP, and we need to find every other report ID for the rest of transactions
            // to display prev/next arrows in RHP for navigation - use visual order from grouped transactions
            setActiveTransactionIDs(visualOrderTransactionIDs).then(() => {
                if (reportIDToNavigate) {
                    markReportIDAsExpense(reportIDToNavigate);
                }
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute(routeParams));
            });
        },
        [reportActions, visualOrderTransactionIDs, sortedTransactions, report, markReportIDAsExpense, introSelected],
    );

    const {amountColumnSize, dateColumnSize, taxAmountColumnSize} = useMemo(() => {
        const isAmountColumnWide = transactions.some((transaction) => isTransactionAmountTooLong(transaction));
        const isTaxAmountColumnWide = transactions.some((transaction) => isTransactionTaxAmountTooLong(transaction));
        const shouldShowYearForSomeTransaction = transactions.some((transaction) => shouldShowTransactionYear(transaction));
        return {
            amountColumnSize: isAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            taxAmountColumnSize: isTaxAmountColumnWide ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
            dateColumnSize: shouldShowYearForSomeTransaction ? CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE : CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL,
        };
    }, [transactions]);

    const isEmptyTransactions = isEmpty(transactions);

    const handleLongPress = useCallback(
        (transactionID: string) => {
            if (!isSmallScreenWidth) {
                return;
            }
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(transactionID);
                return;
            }
            setSelectedTransactionID(transactionID);
            setIsModalVisible(true);
        },
        [isSmallScreenWidth, isMobileSelectionModeEnabled, toggleTransaction, setSelectedTransactionID, setIsModalVisible],
    );

    const handleOnPress = useCallback(
        (transactionID: string) => {
            if (isMobileSelectionModeEnabled) {
                toggleTransaction(transactionID);
                return;
            }

            navigateToTransaction(transactionID);
        },
        [isMobileSelectionModeEnabled, toggleTransaction, navigateToTransaction],
    );

    const handleArrowRightPress = useCallback(
        (transactionID: string) => {
            navigateToTransaction(transactionID);
        },
        [navigateToTransaction],
    );

    const listHorizontalPadding = styles.ph5;

    const groupByItems = useMemo(
        () => [
            {
                text: translate('reportLayout.groupBy.category'),
                value: CONST.REPORT_LAYOUT.GROUP_BY.CATEGORY,
            },
            {
                text: translate('reportLayout.groupBy.tag'),
                value: CONST.REPORT_LAYOUT.GROUP_BY.TAG,
            },
        ],
        [translate],
    );

    const selectedGroupByItem = useMemo(() => groupByItems.find((item) => item.value === currentGroupBy) ?? groupByItems.at(0), [groupByItems, currentGroupBy]);

    const groupByOptions = useMemo(
        () =>
            groupByItems.map((item) => ({
                text: item.text,
                keyForList: item.value,
                isSelected: item.value === currentGroupBy,
            })),
        [groupByItems, currentGroupBy],
    );

    const openColumnsPage = useCallback(() => {
        Navigation.navigate(ROUTES.REPORT_SETTINGS_COLUMNS.getRoute(report.reportID));
    }, [report.reportID]);

    const groupByPopoverComponent = useCallback(
        (props: {closeOverlay: () => void}) => (
            <View style={[styles.pt4, styles.pb1]}>
                <View style={styles.getSelectionListPopoverHeight(groupByOptions.length || 1, windowHeight, false)}>
                    <SelectionList
                        data={groupByOptions}
                        shouldSingleExecuteRowSelect
                        ListItem={SingleSelectListItem}
                        onSelectRow={(item) => {
                            if (!item.keyForList) {
                                return;
                            }
                            setReportLayoutGroupBy(item.keyForList, reportLayoutGroupBy);
                            props.closeOverlay();
                        }}
                    />
                </View>
            </View>
        ),
        [groupByOptions, reportLayoutGroupBy, styles, windowHeight],
    );

    const transactionListContent = (
        <View style={[listHorizontalPadding, styles.gap2, styles.pb4, styles.mb2]}>
            {shouldShowGroupedTransactions
                ? groupedTransactions.map((group) => {
                      const selectionState = groupSelectionState.get(group.groupKey) ?? {
                          isSelected: false,
                          isIndeterminate: false,
                          isDisabled: false,
                          pendingAction: undefined,
                      };

                      return (
                          <View
                              key={group.groupKey}
                              style={styles.gap2}
                          >
                              <MoneyRequestReportGroupHeader
                                  group={group}
                                  groupKey={group.groupKey}
                                  currency={report?.currency ?? ''}
                                  isGroupedByTag={currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG}
                                  isSelectionModeEnabled={isMobileSelectionModeEnabled}
                                  isSelected={selectionState.isSelected}
                                  isIndeterminate={selectionState.isIndeterminate}
                                  isDisabled={selectionState.isDisabled}
                                  onToggleSelection={toggleGroupSelection}
                                  pendingAction={selectionState.pendingAction}
                              />
                              {group.transactions.map((transaction) => {
                                  return (
                                      <MoneyRequestReportTransactionItem
                                          key={transaction.transactionID}
                                          transaction={transaction}
                                          shouldBeHighlighted={highlightedTransactionIDs.has(transaction.transactionID)}
                                          columns={columnsToShow}
                                          report={report}
                                          isSelectionModeEnabled={isMobileSelectionModeEnabled}
                                          toggleTransaction={toggleTransaction}
                                          isSelected={isTransactionSelected(transaction.transactionID)}
                                          handleOnPress={handleOnPress}
                                          handleLongPress={handleLongPress}
                                          dateColumnSize={dateColumnSize}
                                          amountColumnSize={amountColumnSize}
                                          taxAmountColumnSize={taxAmountColumnSize}
                                          scrollToNewTransaction={transaction.transactionID === newTransactions?.at(0)?.transactionID ? scrollToNewTransaction : undefined}
                                          onArrowRightPress={handleArrowRightPress}
                                      />
                                  );
                              })}
                          </View>
                      );
                  })
                : sortedTransactions.map((transaction) => (
                      <MoneyRequestReportTransactionItem
                          key={transaction.transactionID}
                          transaction={transaction}
                          shouldBeHighlighted={highlightedTransactionIDs.has(transaction.transactionID)}
                          columns={columnsToShow}
                          report={report}
                          isSelectionModeEnabled={isMobileSelectionModeEnabled}
                          toggleTransaction={toggleTransaction}
                          isSelected={isTransactionSelected(transaction.transactionID)}
                          handleOnPress={handleOnPress}
                          handleLongPress={handleLongPress}
                          dateColumnSize={dateColumnSize}
                          amountColumnSize={amountColumnSize}
                          taxAmountColumnSize={taxAmountColumnSize}
                          scrollToNewTransaction={transaction.transactionID === newTransactions?.at(0)?.transactionID ? scrollToNewTransaction : undefined}
                          onArrowRightPress={handleArrowRightPress}
                      />
                  ))}
        </View>
    );

    const tableHeaderContent = (
        <OfflineWithFeedback pendingAction={reportPendingAction}>
            <View style={[styles.dFlex, styles.flexRow, styles.pl5, styles.pr16, styles.alignItemsCenter]}>
                <View style={[styles.dFlex, styles.flexRow, styles.pv2, styles.pr4, StyleUtils.getPaddingLeft(variables.w12)]}>
                    <Checkbox
                        onPress={() => {
                            if (selectedTransactionIDs.length !== 0) {
                                clearSelectedTransactions(true);
                            } else {
                                setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                            }
                        }}
                        accessibilityLabel={translate('accessibilityHints.selectAllTransactions')}
                        isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                        isChecked={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length}
                    />
                    {isMediumScreenWidth && !shouldScrollHorizontally && <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>}
                </View>
                {(!isMediumScreenWidth || shouldScrollHorizontally) && (
                    <MoneyRequestReportTableHeader
                        shouldShowSorting
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        columns={columnsToShow}
                        sortableColumns={sortableColumnNames}
                        dateColumnSize={dateColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        onSortPress={(selectedSortBy, selectedSortOrder) => {
                            if (!isSortableColumnName(selectedSortBy)) {
                                return;
                            }
                            setSortConfig((prevState) => ({...prevState, sortBy: selectedSortBy, sortOrder: selectedSortOrder}));
                        }}
                    />
                )}
            </View>
        </OfflineWithFeedback>
    );

    if (isEmptyTransactions) {
        return (
            <>
                <SearchMoneyRequestReportEmptyState
                    report={report}
                    policy={policy}
                />
                <MoneyRequestReportTotalSpend
                    isEmptyTransactions={isEmptyTransactions}
                    totalDisplaySpend={totalDisplaySpend}
                    report={report}
                    hasPendingAction={hasPendingAction}
                    hasComments={hasComments}
                    isLoadingReportActions={isLoadingInitialReportActions}
                />
            </>
        );
    }

    return (
        <>
            <View style={[styles.flexRow, styles.gap2, styles.alignItemsCenter, styles.ph5, styles.pb2]}>
                {shouldShowGroupedTransactions && (
                    <DropdownButton
                        label={translate('search.groupBy')}
                        value={selectedGroupByItem?.text ?? ''}
                        PopoverComponent={groupByPopoverComponent}
                    />
                )}
            </View>
            {!shouldUseNarrowLayout && !shouldScrollHorizontally && tableHeaderContent}
            {shouldScrollHorizontally ? (
                <ScrollView
                    ref={horizontalScrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator
                    style={styles.flex1}
                    contentContainerStyle={{width: minTableWidth}}
                    onScroll={handleHorizontalScroll}
                    scrollEventThrottle={16}
                >
                    <View style={[styles.flex1]}>
                        {tableHeaderContent}
                        {transactionListContent}
                    </View>
                </ScrollView>
            ) : (
                transactionListContent
            )}
            <View
                style={[
                    styles.dFlex,
                    styles.flexRow,
                    shouldShowAddExpenseButton ? styles.justifyContentBetween : styles.justifyContentEnd,
                    styles.gap6,
                    listHorizontalPadding,
                    styles.mv2,
                    styles.alignItemsStart,
                    styles.minHeight7,
                    shouldUseNarrowLayout && styles.flexColumn,
                ]}
            >
                {shouldShowAddExpenseButton && (
                    <OfflineWithFeedback pendingAction={reportPendingAction}>
                        <ButtonWithDropdownMenu
                            onPress={() => {}}
                            shouldAlwaysShowDropdownMenu
                            customText={translate('iou.addExpense')}
                            options={addExpenseDropdownOptions}
                            isSplitButton={false}
                            buttonSize={CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                            success={false}
                            anchorAlignment={{
                                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
                            }}
                        />
                    </OfflineWithFeedback>
                )}
                <View style={[styles.flexShrink1, shouldUseNarrowLayout && styles.w100]}>
                    {shouldShowBreakdown && (
                        <View style={[styles.dFlex, styles.alignItemsEnd, styles.gap2, styles.mb2, styles.flex1]}>
                            {[
                                {text: 'cardTransactions.outOfPocket', value: formattedOutOfPocketAmount, shouldShow: shouldShowExpenseReportBreakDown},
                                {text: 'cardTransactions.companySpend', value: formattedCompanySpendAmount, shouldShow: shouldShowExpenseReportBreakDown},
                                {text: 'common.billable', value: formattedBillableAmount, shouldShow: !!billableTotal},
                                {text: 'common.tax', value: formattedTaxAmount, shouldShow: !!taxTotal && isTaxEnabled},
                            ]
                                .filter(({shouldShow}) => shouldShow)
                                .map(({text, value}) => (
                                    <View
                                        key={text}
                                        style={[
                                            styles.dFlex,
                                            styles.flexRow,
                                            styles.alignItemsCenter,
                                            styles.pr3,
                                            styles.mw100,
                                            shouldUseNarrowLayout && [styles.justifyContentBetween, styles.w100],
                                        ]}
                                    >
                                        <Text
                                            style={[styles.textLabelSupporting, styles.mr3, hasPendingAction && styles.opacitySemiTransparent]}
                                            numberOfLines={1}
                                        >
                                            {translate(text as TranslationPaths)}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[
                                                styles.textLabelSupporting,
                                                styles.textNormal,
                                                shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p,
                                                styles.textAlignRight,
                                                hasPendingAction && styles.opacitySemiTransparent,
                                            ]}
                                        >
                                            {value}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    )}

                    <MoneyRequestReportTotalSpend
                        isEmptyTransactions={isEmptyTransactions}
                        totalDisplaySpend={totalDisplaySpend}
                        report={report}
                        hasPendingAction={hasPendingAction}
                    />
                </View>
            </View>
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={expensifyIcons.CheckSquare}
                    onPress={() => {
                        if (!isMobileSelectionModeEnabled) {
                            turnOnMobileSelectionMode();
                        }
                        toggleTransaction(selectedTransactionID);
                        setIsModalVisible(false);
                    }}
                />
            </Modal>
        </>
    );
}

export default memo(MoneyRequestReportTransactionList);
export type {TransactionWithOptionalHighlight};
