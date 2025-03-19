import React, {useState} from 'react';
import {View} from 'react-native';
import TransactionItemRow from '@components/TransactionItemRow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {compareFactory, isMoneyRequestReportSortableColumn} from '@libs/sortMoneyRequestViewTable';
import type {SortingProperties} from '@libs/sortMoneyRequestViewTable';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';

type MoneyRequestReportTransactionListProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
};

function MoneyRequestReportTransactionList({transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const [sortingProperties, setSortingProperties] = useState<SortingProperties>({
        sortBy: 'date',
        sortOrder: 'desc',
    });
    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    return (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy={sortingProperties.sortBy}
                    sortOrder={sortingProperties.sortOrder}
                    onSortPress={(sortBy, sortOrder) => {
                        if (!isMoneyRequestReportSortableColumn(sortBy)) {
                            return;
                        }
                        setSortingProperties({sortBy, sortOrder});
                    }}
                />
            )}
            <View style={[styles.pv2, styles.ph5]}>
                {transactions.toSorted(compareFactory(sortingProperties)).map((transaction) => {
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
