import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {FlatListProps, ListRenderItemInfo, ScrollViewProps} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FlatList from '@components/FlatList/FlatList';
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

const keyExtractor: FlatListProps<OnyxEntry<Transaction>>['keyExtractor'] = (item, index) => `${item?.transactionID}+${index}`;

const maintainVisibleContentPosition: ScrollViewProps['maintainVisibleContentPosition'] = {
    minIndexForVisible: 1,
};

function DuplicateTransactionsList({transactions, selectedTransactionID, onSelectTransaction, onPreviewPressed}: DuplicateTransactionsListProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<OnyxEntry<Transaction>>) => (
            <DuplicateTransactionItem
                transaction={item}
                isLastItem={index === transactions.length - 1}
                isSelected={item?.transactionID === selectedTransactionID}
                onSelectTransaction={onSelectTransaction}
                onPreviewPressed={onPreviewPressed}
            />
        ),
        [onPreviewPressed, onSelectTransaction, selectedTransactionID, transactions.length],
    );

    return (
        <View style={[styles.mh5, styles.mt5, styles.expenseWidgetRadius, styles.overflowHidden, {backgroundColor: theme.cardBG}]}>
            <FlatList
                data={transactions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                maintainVisibleContentPosition={maintainVisibleContentPosition}
            />
        </View>
    );
}

export default DuplicateTransactionsList;
