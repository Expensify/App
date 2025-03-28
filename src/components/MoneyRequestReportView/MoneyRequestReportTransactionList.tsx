import isEmpty from 'lodash/isEmpty';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import type {SortOrder} from '@components/Search/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {compareValues} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';
import SearchMoneyRequestReportEmptyState from './SearchMoneyRequestReportEmptyState';

type MoneyRequestReportTransactionListProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
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
    transactions: OnyxTypes.Transaction[];
    sortBy: SortableColumnName;
    sortOrder: SortOrder;
};

const isSortableColumnName = (key: unknown): key is SortableColumnName => !!sortableColumnNames.find((val) => val === key);

const getTransactionKey = (transaction: OnyxTypes.Transaction, key: SortableColumnName) => {
    const dateKey = transaction.modifiedCreated ? 'modifiedCreated' : 'created';
    return key === CONST.SEARCH.TABLE_COLUMNS.DATE ? dateKey : key;
};

const areTransactionValuesEqual = (transactions: OnyxTypes.Transaction[], key: SortableColumnName) => {
    const firstValidTransaction = transactions.find((transaction) => transaction !== undefined);
    if (!firstValidTransaction) {
        return true;
    }

    const keyOfFirstValidTransaction = getTransactionKey(firstValidTransaction, key);
    return transactions.every((transaction) => transaction[getTransactionKey(transaction, key)] === firstValidTransaction[keyOfFirstValidTransaction]);
};

function MoneyRequestReportTransactionList({transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    const [sortedData, setSortedData] = useState<SortedTransactions>({
        transactions,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    });

    const {sortBy, sortOrder} = sortedData;

    useEffect(() => {
        if (areTransactionValuesEqual(transactions, sortBy)) {
            return;
        }

        setSortedData((prevState) => ({
            ...prevState,
            transactions: [...transactions].sort((a, b) => compareValues(a[getTransactionKey(a, sortBy)], b[getTransactionKey(b, sortBy)], sortOrder, sortBy)),
        }));
    }, [sortBy, sortOrder, transactions]);

    return !isEmpty(transactions) ? (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSortPress={(selectedSortBy, selectedSortOrder) => {
                        if (!isSortableColumnName(selectedSortBy)) {
                            return;
                        }

                        setSortedData((prevState) => ({...prevState, sortBy: selectedSortBy, sortOrder: selectedSortOrder}));
                    }}
                />
            )}
            <View style={[styles.pv2, styles.ph5]}>
                {sortedData.transactions.map((transaction) => {
                    return (
                        <View style={[styles.mb2]}>
                            <TransactionItemRow
                                transactionItem={transaction}
                                isSelected={false}
                                shouldShowTooltip
                                shouldUseNarrowLayout={displayNarrowVersion}
                                shouldShowChatBubbleComponent
                            />
                        </View>
                    );
                })}
            </View>
        </>
    ) : (
        <SearchMoneyRequestReportEmptyState />
    );
}

MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';

export default MoneyRequestReportTransactionList;
