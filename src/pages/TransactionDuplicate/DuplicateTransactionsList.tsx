import React from 'react';
import type {FlatListProps, ScrollViewProps} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import useThemeStyles from '@hooks/useThemeStyles';
import type {Transaction} from '@src/types/onyx';
import DuplicateTransactionItem from './DuplicateTransactionItem';

type TransactionsListProps = {
    transactions: Array<OnyxEntry<Transaction>>;
};

const keyExtractor: FlatListProps<OnyxEntry<Transaction>>['keyExtractor'] = (item, index) => `${item?.transactionID}+${index}`;

const renderItem: FlatListProps<OnyxEntry<Transaction>>['renderItem'] = ({item, index}) => (
    <DuplicateTransactionItem
        transaction={item}
        index={index}
    />
);

const maintainVisibleContentPosition: ScrollViewProps['maintainVisibleContentPosition'] = {
    minIndexForVisible: 1,
};

function DuplicateTransactionsList({transactions}: TransactionsListProps) {
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

DuplicateTransactionsList.displayName = 'TransactionsList';
export default DuplicateTransactionsList;
