import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';
import DuplicateTransactionItem from './DuplicateTransactionItem';

type DuplicateTransactionsListProps = {
    transactions: Array<OnyxEntry<Transaction>>;
    selectedTransactionID?: string;
    onSelectTransaction: (transactionID: string) => void;
    onPreviewPressed: (reportID: string) => void;
};

function DuplicateTransactionsList({transactions, selectedTransactionID, onSelectTransaction, onPreviewPressed}: DuplicateTransactionsListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <View style={[styles.expenseWidgetRadius, styles.overflowHidden, {backgroundColor: theme.cardBG}]}>
            {transactions.map((transaction, index) => (
                <DuplicateTransactionItem
                    key={transaction?.transactionID ?? transaction?.created ?? 'duplicate-transaction'}
                    transaction={transaction}
                    isLastItem={index === transactions.length - 1}
                    isSelected={transaction?.transactionID === selectedTransactionID}
                    onSelectTransaction={onSelectTransaction}
                    onPreviewPressed={onPreviewPressed}
                />
            ))}
        </View>
    );
}

export default DuplicateTransactionsList;
