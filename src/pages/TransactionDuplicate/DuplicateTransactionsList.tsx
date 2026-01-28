import React, {useCallback} from 'react';
import type {FlatListProps, ListRenderItemInfo, ScrollViewProps} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import DuplicateTransactionItem from './DuplicateTransactionItem';

type DuplicateTransactionsListProps = {
    transactions: Array<OnyxEntry<Transaction>>;
    onPreviewPressed: (reportID: string) => void;
};

const keyExtractor: FlatListProps<OnyxEntry<Transaction>>['keyExtractor'] = (item, index) => `${item?.transactionID}+${index}`;

const maintainVisibleContentPosition: ScrollViewProps['maintainVisibleContentPosition'] = {
    minIndexForVisible: 1,
};

function DuplicateTransactionsList({transactions, onPreviewPressed}: DuplicateTransactionsListProps) {
    const styles = useThemeStyles();

    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<OnyxEntry<Transaction>>) => (
            <DuplicateTransactionItem
                transaction={item}
                index={index}
                allReports={allReports}
                policies={policies}
                onPreviewPressed={onPreviewPressed}
            />
        ),
        [allReports, onPreviewPressed, policies],
    );

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

export default DuplicateTransactionsList;
