import {useFocusEffect} from '@react-navigation/native';
import isEmpty from 'lodash/isEmpty';
import React, {memo, useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import Checkbox from '@components/Checkbox';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import Modal from '@components/Modal';
import {useSearchContext} from '@components/Search/SearchContext';
import type {SortOrder} from '@components/Search/types';
import Text from '@components/Text';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useLocalize from '@hooks/useLocalize';
import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {turnOnMobileSelectionMode} from '@libs/actions/MobileSelectionMode';
import {setActiveTransactionThreadIDs} from '@libs/actions/TransactionThreadNavigation';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import {getThreadReportIDsForTransactions} from '@libs/MoneyRequestReportUtils';
import {navigationRef} from '@libs/Navigation/Navigation';
import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {getMoneyRequestSpendBreakdown} from '@libs/ReportUtils';
import {compareValues, getColumnsToShow, isTransactionAmountTooLong, isTransactionTaxAmountTooLong} from '@libs/SearchUIUtils';
import {getTransactionPendingAction, isTransactionPendingDelete} from '@libs/TransactionUtils';
import shouldShowTransactionYear from '@libs/TransactionUtils/shouldShowTransactionYear';
import Navigation from '@navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';
import MoneyRequestReportTotalSpend from './MoneyRequestReportTotalSpend';
import MoneyRequestReportTransactionItem from './MoneyRequestReportTransactionItem';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

type MoneyRequestReportTransactionListProps = {
    report: OnyxTypes.Report;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** List of transactions that arrived when the report was open */
    newTransactions: OnyxTypes.Transaction[];

    /** Array of report actions for the report that these transactions belong to */
    reportActions: OnyxTypes.ReportAction[];

    /** Whether the report that these transactions belong to has any chat comments */
    hasComments: boolean;

    /** Whether the report actions are being loaded, used to show 'Comments' during loading state */
    isLoadingInitialReportActions?: boolean;

    /** scrollToNewTransaction callback used for scrolling to new transaction when it is created */
    scrollToNewTransaction: (offset: number) => void;
};

type TransactionWithOptionalHighlight = OnyxTypes.Transaction & {
    /** Whether the transaction should be highlighted, when it is added to the report */
    shouldBeHighlighted?: boolean;
};

const sortableColumnNames = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

type SortableColumnName = TupleToUnion<typeof sortableColumnNames>;

type SortedTransactions = {
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

const isSortableColumnName = (key: unknown): key is SortableColumnName => !!sortableColumnNames.find((val) => val === key);

const getTransactionKey = (transaction: OnyxTypes.Transaction, key: SortableColumnName) => {
    const dateKey = transaction.modifiedCreated ? 'modifiedCreated' : 'created';
    return key === CONST.SEARCH.TABLE_COLUMNS.DATE ? dateKey : key;
};

function MoneyRequestReportTransactionList({
    report,
    transactions,
    newTransactions,
    reportActions,
    hasComments,
    isLoadingInitialReportActions: isLoadingReportActions,
    scrollToNewTransaction,
}: MoneyRequestReportTransactionListProps) {
    useCopySelectionHelper();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate, localeCompare} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTransactionID, setSelectedTransactionID] = useState<string>('');

    const {totalDisplaySpend, nonReimbursableSpend, reimbursableSpend} = getMoneyRequestSpendBreakdown(report);
    const formattedOutOfPocketAmount = convertToDisplayString(reimbursableSpend, report?.currency);
    const formattedCompanySpendAmount = convertToDisplayString(nonReimbursableSpend, report?.currency);
    const shouldShowBreakdown = !!nonReimbursableSpend && !!reimbursableSpend;
    const transactionsWithoutPendingDelete = useMemo(() => transactions.filter((t) => !isTransactionPendingDelete(t)), [transactions]);

    const hasPendingAction = useMemo(() => {
        return transactions.some(getTransactionPendingAction);
    }, [transactions]);

    const {selectedTransactionIDs, setSelectedTransactions, clearSelectedTransactions} = useSearchContext();
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

    const [sortConfig, setSortConfig] = useState<SortedTransactions>({
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.ASC,
    });

    const {sortBy, sortOrder} = sortConfig;

    const sortedTransactions: TransactionWithOptionalHighlight[] = useMemo(() => {
        return [...transactions]
            .sort((a, b) => compareValues(a[getTransactionKey(a, sortBy)], b[getTransactionKey(b, sortBy)], sortOrder, sortBy, localeCompare))
            .map((transaction) => ({
                ...transaction,
                shouldBeHighlighted: newTransactions?.includes(transaction),
            }));
    }, [newTransactions, sortBy, sortOrder, transactions, localeCompare]);

    const columnsToShow = useMemo(() => {
        const columns = getColumnsToShow(transactions, true);
        return (Object.keys(columns) as SortableColumnName[]).filter((column) => columns[column]);
    }, [transactions]);

    const navigateToTransaction = useCallback(
        (activeTransactionID: string) => {
            const iouAction = getIOUActionForTransactionID(reportActions, activeTransactionID);
            const reportIDToNavigate = iouAction?.childReportID;
            if (!reportIDToNavigate) {
                return;
            }

            const backTo = Navigation.getActiveRoute();

            // Single transaction report will open in RHP, and we need to find every other report ID for the rest of transactions
            // to display prev/next arrows in RHP for navigation
            const sortedSiblingTransactionReportIDs = getThreadReportIDsForTransactions(reportActions, sortedTransactions);
            setActiveTransactionThreadIDs(sortedSiblingTransactionReportIDs).then(() => {
                Navigation.navigate(ROUTES.SEARCH_REPORT.getRoute({reportID: reportIDToNavigate, backTo}));
            });
        },
        [reportActions, sortedTransactions],
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

    const listHorizontalPadding = styles.ph5;

    if (isEmptyTransactions) {
        return (
            <>
                <SearchMoneyRequestReportEmptyState />
                <MoneyRequestReportTotalSpend
                    hasComments={hasComments}
                    isLoadingReportActions={!!isLoadingReportActions}
                    isEmptyTransactions={isEmptyTransactions}
                    totalDisplaySpend={totalDisplaySpend}
                    report={report}
                    hasPendingAction={hasPendingAction}
                />
            </>
        );
    }

    return (
        <>
            {!shouldUseNarrowLayout && (
                <View style={[styles.dFlex, styles.flexRow, styles.pl5, styles.pr8, styles.alignItemsCenter]}>
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
            )}
            <View style={[listHorizontalPadding, styles.gap2, styles.pb4]}>
                {sortedTransactions.map((transaction) => {
                    return (
                        <MoneyRequestReportTransactionItem
                            key={transaction.transactionID}
                            transaction={transaction}
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
                            // if we add few new transactions, then we need to scroll to the first one
                            scrollToNewTransaction={transaction.transactionID === newTransactions?.at(0)?.transactionID ? scrollToNewTransaction : undefined}
                        />
                    );
                })}
            </View>
            {shouldShowBreakdown && (
                <View style={[styles.dFlex, styles.alignItemsEnd, listHorizontalPadding, styles.gap2, styles.mb2]}>
                    {[
                        {text: 'cardTransactions.outOfPocket', value: formattedOutOfPocketAmount},
                        {text: 'cardTransactions.companySpend', value: formattedCompanySpendAmount},
                    ].map(({text, value}) => (
                        <View
                            key={text}
                            style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.pr3]}
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
                hasComments={hasComments}
                isLoadingReportActions={!!isLoadingReportActions}
                isEmptyTransactions={isEmptyTransactions}
                totalDisplaySpend={totalDisplaySpend}
                report={report}
                hasPendingAction={hasPendingAction}
            />
            <Modal
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED}
                onClose={() => setIsModalVisible(false)}
                shouldPreventScrollOnFocus
            >
                <MenuItem
                    title={translate('common.select')}
                    icon={Expensicons.CheckSquare}
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

MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';

export default memo(MoneyRequestReportTransactionList);
export type {TransactionWithOptionalHighlight};
