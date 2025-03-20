import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import type {SortOrder} from '@components/Search/types';
import type {SortableColumnName} from '@components/SelectionList/types';
import TransactionItemRow from '@components/TransactionItemRow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {compareValues} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';

type MoneyRequestReportTransactionListProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
};

const moneyRequestReportSortableColumnNames = [
    CONST.SEARCH.TABLE_COLUMNS.DATE,
    CONST.SEARCH.TABLE_COLUMNS.MERCHANT,
    CONST.SEARCH.TABLE_COLUMNS.CATEGORY,
    CONST.SEARCH.TABLE_COLUMNS.TAG,
    CONST.SEARCH.TABLE_COLUMNS.TOTAL_AMOUNT,
];

type MoneyRequestReportSortableColumnName = TupleToUnion<typeof moneyRequestReportSortableColumnNames>;

const initialSortingProperties: {
    sortBy: MoneyRequestReportSortableColumnName;
    sortOrder: SortOrder;
} = {
    sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
};

const isMoneyRequestReportSortableColumnName = (key: SortableColumnName): key is MoneyRequestReportSortableColumnName => !!moneyRequestReportSortableColumnNames.find((val) => val === key);
const areTransactionValuesEqual = (transactions: OnyxTypes.Transaction[], key: keyof OnyxTypes.Transaction) => {
    const firstValidTransaction = transactions.find((transaction) => transaction !== undefined);
    return !firstValidTransaction || transactions.every((transaction: OnyxTypes.Transaction) => transaction[key] === firstValidTransaction[key]);
};
const getTransactionKey = (key: MoneyRequestReportSortableColumnName) => (key === CONST.SEARCH.TABLE_COLUMNS.DATE ? 'created' : key);

function MoneyRequestReportTransactionList({transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    // We don't want to sort the array again if all column values are the same,
    // but we still want to show the user that the table is sorted by selected column
    // so there are 2 state properties
    const [sortingProperties, setSortingProperties] = useState({
        visualIndicator: initialSortingProperties,
        operationalProperties: initialSortingProperties,
    });
    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    const sortedTransactions = useMemo(() => {
        const {sortBy, sortOrder} = sortingProperties.operationalProperties;
        return transactions.toSorted((valueA: OnyxTypes.Transaction, valueB: OnyxTypes.Transaction) => {
            const key = getTransactionKey(sortBy);
            return compareValues(valueA[key], valueB[key], sortOrder, key);
        });
    }, [sortingProperties.operationalProperties, transactions]);

    return (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy={sortingProperties.visualIndicator.sortBy}
                    sortOrder={sortingProperties.visualIndicator.sortOrder}
                    onSortPress={(sortBy, sortOrder) => {
                        if (!isMoneyRequestReportSortableColumnName(sortBy)) {
                            return;
                        }

                        const newSortingProperties = {sortBy, sortOrder};
                        const shouldUpdateOperationalProperties = !areTransactionValuesEqual(transactions, getTransactionKey(sortBy));

                        setSortingProperties(({operationalProperties}) => ({
                            visualIndicator: newSortingProperties,
                            operationalProperties: shouldUpdateOperationalProperties ? newSortingProperties : operationalProperties,
                        }));
                    }}
                />
            )}
            <View style={[styles.pv2, styles.ph5]}>
                {sortedTransactions.map((transaction) => {
                    return (
                        <View style={[styles.mb2]}>
                            <TransactionItemRow
                                transactionItem={transaction}
                                isSelected={false}
                                shouldShowTooltip
                                shouldUseNarrowLayout={displayNarrowVersion}
                            />
                        </View>
                    );
                })}
            </View>
        </>
    );
}

MoneyRequestReportTransactionList.displayName = 'MoneyRequestReportTransactionList';

export default MoneyRequestReportTransactionList;
