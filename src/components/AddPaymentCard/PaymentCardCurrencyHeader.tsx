import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

function PaymentCardCurrencyHeader({isSectionList}: {isSectionList?: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={[isSectionList && styles.mh5]}>
            <Text style={[styles.mt3, isSectionList && styles.mb5]}>
                {`${translate('billingCurrency.note')}`}{' '}
                <TextLink
                    style={styles.link}
                    href={CONST.PRICING}
                >{`${translate('billingCurrency.noteLink')}`}</TextLink>{' '}
                {`${translate('billingCurrency.noteDetails')}`}
            </Text>
        </View>
    );
}

PaymentCardCurrencyHeader.displayName = 'PaymentCardCurrencyHeader';

export default PaymentCardCurrencyHeader;
