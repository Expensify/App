import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type PaymentWaitingBannerProps = {
    payerName: string;
};

function PaymentWaitingBanner({payerName}: PaymentWaitingBannerProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter]}>
            <Icon
                src={Expensicons.Hourglass}
                fill={theme.icon}
            />

            <Text style={[styles.inlineSystemMessage, styles.flexShrink1]}>{translate('iou.awaitingPayment', {payerName})}</Text>
        </View>
    );
}

export default PaymentWaitingBanner;
