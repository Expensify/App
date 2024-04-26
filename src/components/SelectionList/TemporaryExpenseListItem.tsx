import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';

// NOTE: This is a completely temporary mock item so that something can be displayed in SearchWidget
// This should be removed and implement properly in: https://github.com/Expensify/App/issues/39877
function TransactionListItem({item}: {item: SearchTransaction}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.pt8]}>
            <Text>Item: {item.transactionID}</Text>
        </View>
    );
}

export default TransactionListItem;
