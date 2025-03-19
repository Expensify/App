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
import MoneyRequestReportTableHeader, {columnConfig} from './MoneyRequestReportTableHeader';

type MoneyRequestReportTransactionListProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
};

const columnConfigNames = columnConfig.map(({columnName}) => columnName);
const unwantedColumnConfigNames = [CONST.SEARCH.TABLE_COLUMNS.RECEIPT, CONST.SEARCH.TABLE_COLUMNS.TYPE, CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS];

type SortableColumnConfigName = Exclude<TupleToUnion<typeof columnConfigNames>, TupleToUnion<typeof unwantedColumnConfigNames>>;

const isSortableColumnConfigName = (key: SortableColumnName): key is SortableColumnConfigName => {
    const isInColumnConfig = !!columnConfigNames.find((val) => val === key);
    const isInUnwanted = unwantedColumnConfigNames.find((val) => val === key);
    return isInColumnConfig && !isInUnwanted;
};

function MoneyRequestReportTransactionList({transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [sortingProperties, setSortingProperties] = useState<{
        sortBy: SortableColumnConfigName;
        sortOrder: SortOrder;
    }>({
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    });
    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    const sortedTransactions = useMemo(() => {
        return transactions.toSorted((valueA: OnyxTypes.Transaction, valueB: OnyxTypes.Transaction) => {
            const key = sortingProperties.sortBy === CONST.SEARCH.TABLE_COLUMNS.DATE ? 'created' : sortingProperties.sortBy;
            return compareValues(valueA[key], valueB[key], sortingProperties.sortOrder, key);
        });
    }, [sortingProperties, transactions]);

    return (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy={sortingProperties.sortBy}
                    sortOrder={sortingProperties.sortOrder}
                    onSortPress={(sortBy, sortOrder) => {
                        if (!isSortableColumnConfigName(sortBy)) {
                            return;
                        }

                        setSortingProperties({sortBy, sortOrder});
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
