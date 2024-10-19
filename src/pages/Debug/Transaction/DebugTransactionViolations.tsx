import React from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationsProps = {
    transactionID: string;
};

function DebugTransactionViolations({transactionID}: DebugTransactionViolationsProps) {
    const [transactionViolations] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const renderItem = ({item}: ListRenderItemInfo<TransactionViolation>) => (
        <View>
            <Text>{item.type}</Text>
            <Text>{item.name}</Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.mt5}
            contentContainerStyle={[styles.pb5, styles.ph5, styles.gap5]}
        >
            <Button
                success
                large
                text={translate('common.create')}
                onPress={() => Navigation.navigate(ROUTES.DEBUG_TRANSACTION_VIOLATION_CREATE.getRoute(transactionID))}
                style={[styles.pb5, styles.ph3]}
            />
            <FlatList
                data={transactionViolations}
                renderItem={renderItem}
            />
        </ScrollView>
    );
}

DebugTransactionViolations.displayName = 'DebugTransactionViolations';

export default DebugTransactionViolations;
