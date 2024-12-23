import React from 'react';
import type {ListRenderItemInfo} from 'react-native';
import Button from '@components/Button';
import FlatList from '@components/FlatList';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as TransactionUtils from '@libs/TransactionUtils';
import ROUTES from '@src/ROUTES';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationsProps = {
    /** The transactionID we are gettings the transaction violations for */
    transactionID: string;
};

function DebugTransactionViolations({transactionID}: DebugTransactionViolationsProps) {
    const transactionViolations = TransactionUtils.getTransactionViolations(transactionID);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const renderItem = ({item, index}: ListRenderItemInfo<TransactionViolation>) => (
        <PressableWithFeedback
            accessibilityLabel={translate('common.details')}
            onPress={() => Navigation.navigate(ROUTES.DEBUG_TRANSACTION_VIOLATION.getRoute(transactionID, String(index)))}
            style={({pressed}) => [styles.flexRow, styles.justifyContentBetween, pressed && styles.hoveredComponentBG, styles.p4]}
            hoverStyle={styles.hoveredComponentBG}
        >
            <Text>{item.type}</Text>
            <Text>{item.name}</Text>
        </PressableWithFeedback>
    );

    return (
        <ScrollView style={styles.mv5}>
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
                scrollEnabled={false}
            />
        </ScrollView>
    );
}

DebugTransactionViolations.displayName = 'DebugTransactionViolations';

export default DebugTransactionViolations;
