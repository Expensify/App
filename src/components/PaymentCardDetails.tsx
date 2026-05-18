import type {ReactNode} from 'react';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import type Fund from '@src/types/onyx/Fund';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Icon from './Icon';
import Text from './Text';

type PaymentCardDetailsProps = {
    /** The billing card data */
    card?: Fund;

    /** Optional right side content (e.g. action menu) */
    rightComponent?: ReactNode;

    /** Optional wrapper styles */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function PaymentCardDetails({card, rightComponent, wrapperStyle}: PaymentCardDetailsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['CreditCard']);

    const cardMonth = DateUtils.getMonthNames()[(card?.accountData?.cardMonth ?? 1) - 1];

    if (!card?.accountData || isEmptyObject(card?.accountData)) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.flex1, styles.gap3, wrapperStyle]}>
            <Icon
                src={icons.CreditCard}
                additionalStyles={styles.subscriptionAddedCardIcon}
                fill={theme.icon}
                medium
            />
            <View style={styles.flex1}>
                <Text style={styles.textStrong}>{getPaymentMethodDescription(card.accountType, card.accountData, translate)}</Text>
                <Text style={styles.mutedNormalTextLabel}>
                    {translate('subscription.cardSection.cardInfo', card.accountData.addressName ?? '', `${cardMonth} ${card.accountData.cardYear ?? ''}`, card.accountData.currency ?? '')}
                </Text>
            </View>
            {rightComponent}
        </View>
    );
}

export default PaymentCardDetails;
