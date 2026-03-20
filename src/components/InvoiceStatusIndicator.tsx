import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Invoice} from '@src/types/onyx';

type InvoiceStatusIndicatorProps = {
    /** The invoice object containing payment status */
    invoice: Invoice;

    /** Additional styling for the container */
    containerStyle?: any;
};

function InvoiceStatusIndicator({invoice, containerStyle}: InvoiceStatusIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const getStatusDisplay = () => {
        if (!invoice.isPaid) {
            return {
                text: 'Unpaid',
                iconSrc: Expensicons.Hourglass,
                iconColor: theme.icon,
                textColor: theme.text,
            };
        }

        const paidThroughExpensify = invoice.paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY;

        if (paidThroughExpensify) {
            return {
                text: 'Paid via Expensify',
                iconSrc: Expensicons.Checkmark,
                iconColor: theme.success,
                textColor: theme.success,
            };
        }

        return {
            text: 'Paid externally',
            iconSrc: Expensicons.Bank,
            iconColor: theme.warning,
            textColor: theme.warning,
        };
    };

    const statusDisplay = getStatusDisplay();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, containerStyle]}>
            <Icon
                src={statusDisplay.iconSrc}
                fill={statusDisplay.iconColor}
                width={16}
                height={16}
            />
            <Text
                style={[
                    styles.textMicroSupporting,
                    {color: statusDisplay.textColor},
                ]}
            >
                {statusDisplay.text}
            </Text>
        </View>
    );
}

InvoiceStatusIndicator.displayName = 'InvoiceStatusIndicator';

export default InvoiceStatusIndicator;
