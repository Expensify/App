import {useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import Checkbox from '@components/Checkbox';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SortOrder} from '@components/Search/types';
import Text from '@components/Text';
import {WideRHPContext} from '@components/WideRHPContextProvider';
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
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {setOptimisticTransactionThread} from '@libs/actions/Report';
import {getReportLayoutGroupBy} from '@libs/actions/ReportLayout';
import {setActiveTransactionIDs} from '@libs/actions/TransactionThreadNavigation';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {hasNonReimbursableTransactions, isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import {navigationRef} from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {groupTransactionsByCategory, groupTransactionsByTag} from '@libs/ReportLayoutUtils';
import {
    canAddTransaction,
    getAddExpenseDropdownOptions,
    getMoneyRequestSpendBreakdown,
    getReportOfflinePendingActionAndErrors,
    isCurrentUserSubmitter,
    isExpenseReport,
    isIOUReport,
} from '@libs/ReportUtils';
import {compareValues, getColumnsToShow, isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
import {
    getAmount,
    getCategory,
    getCreated,
    getMerchant,
    getTag,
    getTransactionPendingAction,
    isTransactionPendingDelete,
    mergeProhibitedViolations,
    shouldShowExpenseBreakdown,
    shouldShowViolation,
} from '@libs/TransactionUtils';
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
import type SCREENS from '@src/SCREENS';
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

    /** Violations indexed by transaction ID */
    violations?: Record<string, OnyxTypes.TransactionViolation[]>;

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
];

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
    violations,
    hasPendingDeletionTransaction = false,
    scrollToNewTransaction,
    policy,
    hasComments,
    isLoadingInitialReportActions = false,
}: MoneyRequestReportTransactionListProps) {
    useCopySelectionHelper();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Location', 'CheckSquare', 'ReceiptPlus']);
    const {translate, localeCompare} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {markReportIDAsExpense} = useContext(WideRHPContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState<string>('');
    const {reportPendingAction} = getReportOfflinePendingActionAndErrors(report);

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const shouldShowBreakdown = useMemo(() => shouldShowExpenseBreakdown(transactions), [transactions]);
    const transactionsWithoutPendingDelete = useMemo(() => transactions.filter((t) => !isTransactionPendingDelete(t)), [transactions]);
    const currentUserDetails = useCurrentUserPersonalDetails();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const shouldShowAddExpenseButton = canAddTransaction(report, isReportArchived) && isCurrentUserSubmitter(report);
    const [lastDistanceExpenseType] = useOnyx(ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE, {canBeMissing: true});
    const [reportLayoutGroupBy] = useOnyx(ONYXKEYS.NVP_REPORT_LAYOUT_GROUP_BY, {canBeMissing: true});

    const shouldShowGroupedTransactions = isExpenseReport(report) && !isIOUReport(report);

    const addExpenseDropdownOptions = useMemo(
        () => getAddExpenseDropdownOptions(expensifyIcons, report?.reportID, policy, undefined, undefined, lastDistanceExpenseType),
        [report?.reportID, policy, lastDistanceExpenseType, expensifyIcons.Location],
    );

    const hasPendingAction = useMemo(() => {
        return hasPendingDeletionTransaction || transactions.some(getTransactionPendingAction);
    }, [hasPendingDeletionTransaction, transactions]);

    const {selectedTransactionIDs, setSelectedTransactions, clearSelectedTransactions} = useSearchContext();
    useHandleSelectionMode(selectedTransactionIDs);
    const isMobileSelectionModeEnabled = useMobileSelectionMode();

    // Filter violations based on user visibility
    const filteredViolations = useMemo(() => {
        if (!violations || !report || !policy || !transactions) {
            return violations;
        }

        const filtered: Record<string, OnyxTypes.TransactionViolation[]> = {};

        for (const transaction of transactions) {
            const transactionViolations = violations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`];
            if (transactionViolations) {
                const filteredTransactionViolations = mergeProhibitedViolations(
                    transactionViolations.filter((violation) => shouldShowViolation(report, policy, violation.name, currentUserDetails.email ?? '', true, transaction)),
                );

                if (filteredTransactionViolations.length > 0) {
                    filtered[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] = filteredTransactionViolations;
                }
            }
        }

        return filtered;
    }, [violations, report, policy, transactions, currentUserDetails.email]);

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
        return [...transactions]
            .sort((a, b) => compareValues(getTransactionValue(a, sortBy, report), getTransactionValue(b, sortBy, report), sortOrder, sortBy, localeCompare, true))
            .map((transaction) => ({
                ...transaction,
                shouldBeHighlighted: newTransactions?.includes(transaction),
            }));
    }, [newTransactions, sortBy, sortOrder, transactions, localeCompare, report]);

    // Always use default columns for money request report view (don't use user-customized search columns)
    const columnsToShow = useMemo(() => {
        return getColumnsToShow(
            currentUserDetails?.accountID,
            transactions,
            [],
            true,
            undefined,
            undefined,
            isIOUReport(report),
            isBillableEnabledOnPolicy(policy),
            hasNonReimbursableTransactions(transactions),
        );
    }, [transactions, currentUserDetails?.accountID, report, policy]);

    const currentGroupBy = getReportLayoutGroupBy(reportLayoutGroupBy);

    const groupedTransactions = useMemo(() => {
        if (!shouldShowGroupedTransactions) {
            return [];
        }
        if (currentGroupBy === CONST.REPORT_LAYOUT.GROUP_BY.TAG) {
            return groupTransactionsByTag(sortedTransactions, report, localeCompare);
        }
        return groupTransactionsByCategory(sortedTransactions, report, localeCompare);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedTransactions, currentGroupBy, report?.reportID, localeCompare, shouldShowGroupedTransactions]);

    const visualOrderTransactionIDs = useMemo(() => {
        if (!shouldShowGroupedTransactions || groupedTransactions.length === 0) {
            return sortedTransactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID);
        }
        return groupedTransactions.flatMap((group) => group.transactions.filter((transaction) => !isTransactionPendingDelete(transaction)).map((transaction) => transaction.transactionID));
    }, [groupedTransactions, sortedTransactions, shouldShowGroupedTransactions]);

    const sortedTransactionsMap = useMemo(() => {
        const map = new Map<string, OnyxTypes.Transaction>();
        for (const transaction of sortedTransactions) {
            map.set(transaction.transactionID, transaction);
        }
        return map;
    }, [sortedTransactions]);

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
                const transactionThreadReport = createTransactionThreadReport(report, iouAction, transaction);
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
        [reportActions, visualOrderTransactionIDs, sortedTransactions, report, markReportIDAsExpense],
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
            {!shouldUseNarrowLayout && (
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
                                accessibilityLabel={CONST.ROLE.CHECKBOX}
                                isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                                isChecked={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length}
                            />
                            {isMediumScreenWidth && <Text style={[styles.textStrong, styles.ph3]}>{translate('workspace.people.selectAll')}</Text>}
                        </View>
                        {!isMediumScreenWidth && (
                            <MoneyRequestReportTableHeader
                                shouldShowSorting
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                columns={columnsToShow}
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
            )}
            <View style={[listHorizontalPadding, styles.gap2, styles.pb4]}>
                {shouldShowGroupedTransactions
                    ? groupedTransactions.map((group) => {
                          const selectionState = groupSelectionState.get(group.groupKey) ?? {isSelected: false, isIndeterminate: false, isDisabled: false, pendingAction: undefined};

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
                                      const originalTransaction = sortedTransactionsMap.get(transaction.transactionID) ?? transaction;
                                      return (
                                          <MoneyRequestReportTransactionItem
                                              key={transaction.transactionID}
                                              transaction={originalTransaction}
                                              violations={filteredViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]}
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
                              violations={filteredViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]}
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
            <View
                style={[
                    styles.dFlex,
                    styles.flexRow,
                    shouldShowAddExpenseButton ? styles.justifyContentBetween : styles.justifyContentEnd,
                    styles.gap6,
                    listHorizontalPadding,
                    styles.mb2,
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
                                {text: 'cardTransactions.outOfPocket', value: formattedOutOfPocketAmount},
                                {text: 'cardTransactions.companySpend', value: formattedCompanySpendAmount},
                            ].map(({text, value}) => (
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
                                        style={[styles.textLabelSupporting, styles.mr3]}
                                        numberOfLines={1}
                                    >
                                        {translate(text as TranslationPaths)}
                                    </Text>
                                    <Text
                                        numberOfLines={1}
                                        style={[styles.textLabelSupporting, styles.textNormal, shouldUseNarrowLayout ? styles.mnw64p : styles.mnw100p, styles.textAlignRight]}
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
