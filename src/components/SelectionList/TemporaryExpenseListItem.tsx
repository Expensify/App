import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';

// NOTE: This is a completely temporary mock item so that something can be displayed in SearchWidget
// This should be removed and implement properly in: https://github.com/Expensify/App/issues/39877
function ExpenseListItem({item}: {item: SearchTransaction}) {
    return (
        <View>
            <Text>Item: {item.transactionID}</Text>
        </View>
    );
}

export default ExpenseListItem;
