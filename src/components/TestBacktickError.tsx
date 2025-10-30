import React, {useMemo} from 'react';
import {FlatList, View, Text} from 'react-native';
import type {ListRenderItem} from 'react-native';

type Transaction = {
    transactionID: string;
    amount: number;
    category: string;
    date: string;
    shouldBeHighlighted?: boolean;
};

type Props = {
    transactions: Transaction[];
    newTransactions: string[];
    sortBy: 'date' | 'amount';
    sortOrder: 'asc' | 'desc';
};

function TestBacktickError({transactions, newTransactions, sortBy, sortOrder}: Props) {
    // PERF-4 violation: Removed useMemo - creates new array/objects on every render
    // This will trigger a comment with code snippet containing backticks
    const sortedTransactions = [...transactions]
        .sort((a, b) => {
            const aValue = sortBy === 'date' ? a.date : a.amount;
            const bValue = sortBy === 'date' ? b.date : b.amount;
            return sortOrder === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
        })
        .map((transaction) => ({
            ...transaction,
            shouldBeHighlighted: newTransactions.includes(transaction.transactionID),
        }));

    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        return (
            <View style={{padding: 10, backgroundColor: item.shouldBeHighlighted ? '#ffeb3b' : '#fff'}}>
                <Text>ID: {item.transactionID}</Text>
                <Text>Amount: {item.amount}</Text>
                <Text>Category: {item.category}</Text>
                <Text>Date: {item.date}</Text>
            </View>
        );
    };

    return (
        <View>
            <Text>Sorted Transactions</Text>
            <FlatList
                data={sortedTransactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.transactionID}
            />
        </View>
    );
}

export default TestBacktickError;

