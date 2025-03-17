import React from 'react';
import {View} from 'react-native';
import TransactionItemRow from '@components/TransactionItemRow';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type * as OnyxTypes from '@src/types/onyx';
import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';

type MoneyRequestReportTransactionListProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];
};

function MoneyRequestReportTransactionList({transactions}: MoneyRequestReportTransactionListProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const displayNarrowVersion = isMediumScreenWidth || shouldUseNarrowLayout;

    return (
        <>
            {!displayNarrowVersion && (
                <MoneyRequestReportTableHeader
                    shouldShowSorting
                    sortBy="date"
                    sortOrder="desc"
                    onSortPress={() => {}}
                />
            )}
            <View style={[styles.pv2, styles.ph5]}>
                {transactions.map((transaction) => {
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
