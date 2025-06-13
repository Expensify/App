import React from 'react';
import type {FlatListProps, ScrollViewProps} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';
import TransactionItem from './TransactionItem';

type TransactionsListProps = {
    transactions: Array<OnyxEntry<Transaction>>;
};

const keyExtractor: FlatListProps<OnyxEntry<Transaction>>['keyExtractor'] = (item, index) => `${item?.transactionID}+${index}`;

const renderItem: FlatListProps<OnyxEntry<Transaction>>['renderItem'] = ({item, index}) => (
    <TransactionItem
        transaction={item}
        index={index}
    />
);

const maintainVisibleContentPosition: ScrollViewProps['maintainVisibleContentPosition'] = {
    minIndexForVisible: 1,
};

function TransactionsList({transactions}: TransactionsListProps) {
    const styles = useThemeStyles();

    return (
        <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            maintainVisibleContentPosition={maintainVisibleContentPosition}
            contentContainerStyle={styles.pt5}
        />
    );
}

TransactionsList.displayName = 'TransactionsList';
export default TransactionsList;
