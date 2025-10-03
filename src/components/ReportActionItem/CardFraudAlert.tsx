import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {OriginalMessageCardFraudAlert} from '@src/types/onyx/OriginalMessage';
import ActionableItemButtons from './ActionableItemButtons';

type CardFraudAlertProps = {
    /** The card fraud alert original message */
    originalMessage: OriginalMessageCardFraudAlert;

    /** Callback when user confirms it was them */
    onConfirm: () => void;

    /** Callback when user reports fraud */
    onReportFraud: () => void;
};

function CardFraudAlert({originalMessage, onConfirm, onReportFraud}: CardFraudAlertProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {cardID, maskedCardNumber, triggerAmount, triggerMerchant, resolution} = originalMessage;
    const formattedAmount = CurrencyUtils.convertToDisplayString(triggerAmount, 'USD');
    const cardLastFour = maskedCardNumber.slice(-4);

    if (resolution) {
        const resolutionMessage = resolution === 'recognized'
            ? 'cleared the earlier suspicious activity. The card is reactivated. You\'re all set to keep on expensin\'!'
            : 'the card has been deactivated.';

        return (
            <View style={[styles.pv3, styles.ph4]}>
                <Text style={styles.textLabelSupporting}>
                    {resolutionMessage}
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.pv3, styles.ph4]}>
            <Text style={[styles.textStrong, styles.mb2]}>
                I identified suspicious activity for your Expensify Card ending in {cardLastFour}. Do you recognize these charges?
            </Text>

            <View style={[styles.mt2, styles.mb2]}>
                <Text style={styles.textLabelSupporting}>
                    {formattedAmount} at {triggerMerchant}
                </Text>
            </View>

            <ActionableItemButtons
                items={[
                    {
                        key: 'confirm',
                        text: 'Yes',
                        onPress: onConfirm,
                        isPrimary: true,
                    },
                    {
                        key: 'reportFraud',
                        text: 'No',
                        onPress: onReportFraud,
                    },
                ]}
                layout="horizontal"
            />
        </View>
    );
}

CardFraudAlert.displayName = 'CardFraudAlert';

export default CardFraudAlert;

