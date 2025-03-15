import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import TransactionItemRow from '@components/TransactionItemRow';
import useThemeStyles from '@hooks/useThemeStyles';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';

type MoneyRequestReportTransactionListProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;

    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
};

/**
 * TODO
 * This component is under construction and not yet displayed to any users.
 */
function MoneyRequestReportTransactionList({report, transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();

    return (
        <>
            <MoneyRequestReportTableHeader
                shouldShowSorting
                sortBy="date"
                sortOrder="desc"
                onSortPress={() => {}}
            />
            <View style={[styles.pv2, styles.ph5]}>
                {transactions.map((transaction) => {
                    return (
                        <View style={[styles.mb2]}>
                            <TransactionItemRow
                                transactionItem={transaction}
                                isSelected={false}
                                shouldShowTooltip
                                shouldUseNarrowLayout={false}
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
