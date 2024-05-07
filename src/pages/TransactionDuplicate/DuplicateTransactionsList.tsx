import React from 'react';
import type {FlatListProps} from 'react-native';
import FlatList from '@components/FlatList';
import ScrollView from '@components/ScrollView';
import variables from '@styles/variables';
import DuplicateTransactionItem from './DuplicateTransactionItem';

type DuplicateTransactionsListProps = {
    transactionIDs: string[];
};

const keyExtractor: FlatListProps<string>['keyExtractor'] = (item, index) => `${item}+${index}`;

const getItemLayout = (data: ArrayLike<string> | null | undefined, index: number): {length: number; offset: number; index: number} => ({
    index,
    length: variables.listItemHeightNormal,
    offset: variables.listItemHeightNormal * index,
});

function DuplicateTransactionsList({transactionIDs}: DuplicateTransactionsListProps) {
    return (
        // <FlatList
        //     data={transactionIDs}
        //     renderItem={({item, index}) => (
        //         <DuplicateTransactionItem
        //             transactionID={item}
        //             index={index}
        //         />
        //     )}
        //     keyExtractor={keyExtractor}
        //     getItemLayout={getItemLayout}
        // />
        <ScrollView>
            {transactionIDs.map((transactionID, index) => (
                <DuplicateTransactionItem
                    transactionID={transactionID}
                    index={index}
                />
            ))}
        </ScrollView>
    );
}

export default DuplicateTransactionsList;
