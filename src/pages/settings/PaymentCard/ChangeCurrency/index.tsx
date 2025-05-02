import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import PaymentCardChangeCurrencyForm from '@components/AddPaymentCard/PaymentCardChangeCurrencyForm';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as PaymentMethods from '@userActions/PaymentMethods';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function ChangeCurrency() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [debitCardForm] = useOnyx(ONYXKEYS.FORMS.ADD_PAYMENT_CARD_FORM);

    const changeCurrency = useCallback((currency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => {
        if (currency) {
            PaymentMethods.setPaymentMethodCurrency(currency);
        }

        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper testID={ChangeCurrency.displayName}>
            <HeaderWithBackButton title={translate('billingCurrency.changePaymentCurrency')} />
            <View style={styles.containerWithSpaceBetween}>
                <PaymentCardChangeCurrencyForm
                    changeBillingCurrency={changeCurrency}
                    initialCurrency={debitCardForm?.currency}
                />
            </View>
        </ScreenWrapper>
    );
}

ChangeCurrency.displayName = 'ChangeCurrency';

export default ChangeCurrency;
