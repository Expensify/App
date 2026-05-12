import React from 'react';
import Button from '@components/Button';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useTransactionViolations from '@hooks/useTransactionViolations';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {TransactionViolation} from '@src/types/onyx';

type DebugTransactionViolationsProps = {
    /** The transactionID we are getting the transaction violations for */
    transactionID: string;
};

function DebugTransactionViolations({transactionID}: DebugTransactionViolationsProps) {
    const transactionViolations = useTransactionViolations(transactionID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const renderItem = (item: TransactionViolation, index: number) => (
        <PressableWithFeedback
            accessibilityLabel={translate('common.details')}
            onPress={() => Navigation.navigate(ROUTES.DEBUG_TRANSACTION_VIOLATION.getRoute(transactionID, String(index)))}
            style={({pressed}) => [styles.flexRow, styles.justifyContentBetween, pressed && styles.hoveredComponentBG, styles.p4]}
            hoverStyle={styles.hoveredComponentBG}
            key={index}
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
            {/* This list was previously rendered as a FlatList, but it turned out that it caused the component to flash in some cases,
            so it was replaced by this solution. */}
            {transactionViolations?.map((item, index) => renderItem(item, index))}
        </ScrollView>
    );
}

export default DebugTransactionViolations;
