import React from 'react';
import {View, Text, FlatList} from 'react-native';
import type {ListRenderItem} from 'react-native';

type Transaction = {
    transactionID: string;
    amount: number;
    merchant: string;
};

type Report = {
    reportID: string;
    total: number;
};

type Props = {
    transactions?: Transaction[];
    report?: Report;
};

/**
 * This component demonstrates a PERF-4 violation that should trigger
 * a Claude reviewer comment with backticks in the suggestion.
 * 
 * The violation: removed useMemo from transactionIDs mapping
 */
function TestRealisticBacktickError({transactions, report}: Props) {
    // PERF-4 VIOLATION: This should be wrapped in useMemo
    // The .map() creates a new array on every render, causing unnecessary re-renders
    // The Claude reviewer should suggest wrapping this in useMemo with backticks in code snippet
    const transactionIDs = transactions?.map((t) => t.transactionID) ?? [];

    const renderTransaction: ListRenderItem<Transaction> = ({item}) => (
        <View style={{padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc'}}>
            <Text>ID: {item.transactionID}</Text>
            <Text>Merchant: {item.merchant}</Text>
            <Text>Amount: ${item.amount}</Text>
        </View>
    );

    return (
        <View style={{flex: 1}}>
            <Text style={{fontSize: 18, fontWeight: 'bold', padding: 10}}>
                Report: {report?.reportID}
            </Text>
            <Text style={{padding: 10}}>
                Total Transactions: {transactionIDs.length}
            </Text>
            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item) => item.transactionID}
            />
        </View>
    );
}

export default TestRealisticBacktickError;

