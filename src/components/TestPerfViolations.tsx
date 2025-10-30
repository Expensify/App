import React, {memo, useCallback, useEffect, useMemo} from 'react';
import {FlatList, View, Text} from 'react-native';
import type {ListRenderItem} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

type Transaction = {
    transactionID: string;
    amount: number;
    rawData?: string;
    isValid?: boolean;
    shouldHighlight?: boolean;
};

type TransactionItemProps = {
    item: Transaction;
    isSelected: boolean;
};

// PERF-5 violation: Using deep equality check
const TransactionItem = memo(
    ({item, isSelected}: TransactionItemProps) => {
        return (
            <View>
                <Text>{item.transactionID}</Text>
                <Text>{item.amount}</Text>
            </View>
        );
    },
    (prevProps, nextProps) => {
        // BAD: Deep equality check instead of specific property comparison
        const deepEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);
        return deepEqual(prevProps.item, nextProps.item) && prevProps.isSelected === nextProps.isSelected;
    },
);

TransactionItem.displayName = 'TransactionItem';

function TestPerfViolations() {
    const [transactions, setTransactions] = React.useState<Transaction[]>([
        {transactionID: '1', amount: 100, rawData: 'data1', isValid: true},
        {transactionID: '2', amount: 200, rawData: 'data2', isValid: false},
        {transactionID: '3', amount: 300, isValid: true},
    ]);

    const [selectedId, setSelectedId] = React.useState<string>('');

    // PERF-3 violation: Using useOnyx instead of OnyxListItemProvider hook
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    // PERF-6 violation: Passing entire object as dependency instead of specific properties
    const transactionData = {amount: 100, currency: 'USD', category: 'Food'};
    const formattedAmount = useMemo(() => {
        return `${transactionData.currency} ${transactionData.amount}`;
    }, [transactionData]); // BAD: Should use [transactionData.currency, transactionData.amount]

    // PERF-2 violation: Not using early returns in array iteration
    const validateTransactions = useCallback(() => {
        const areAllTransactionsValid = transactions.every((transaction) => {
            // BAD: Expensive operation (regex) without early return for simple checks
            const validation = transaction.transactionID.match(/^[0-9]+$/);
            return transaction.rawData && transaction.amount > 0 && validation;
        });
        return areAllTransactionsValid;
    }, [transactions]);

    // PERF-1 violation: Spread operator in renderItem creating new object
    const renderItem: ListRenderItem<Transaction> = ({item}) => {
        const isSelected = selectedId === item.transactionID;

        // BAD: Creating new object with spread in renderItem
        return (
            <TransactionItem
                item={{
                    shouldHighlight: isSelected,
                    ...item,
                }}
                isSelected={isSelected}
            />
        );
    };

    // PERF-4 violation: Not memoizing object passed as prop
    const onItemPress = (id: string) => {
        setSelectedId(id);
    };

    // BAD: Creating new object on every render
    const itemConfig = {
        onPress: onItemPress,
        showDetails: true,
        animationEnabled: true,
    };

    return (
        <View>
            <Text>Test Component with Performance Violations</Text>
            <Text>{formattedAmount}</Text>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={(item) => item.transactionID}
            />
        </View>
    );
}

export default TestPerfViolations;

