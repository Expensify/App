import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import PaymentCardChangeCurrencyForm from '@components/AddPaymentCard/PaymentCardChangeCurrencyForm';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import * as PaymentMethods from '@userActions/PaymentMethods';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function ChangeBillingCurrency() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [fundList] = useOnyx(ONYXKEYS.FUND_LIST);
    const defaultCard = useMemo(() => Object.values(fundList ?? {}).find((card) => card.accountData?.additionalData?.isBillingCard), [fundList]);

    const changeBillingCurrency = useCallback((currency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>, values?: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>) => {
        if (values?.securityCode) {
            PaymentMethods.updateBillingCurrency(currency ?? CONST.PAYMENT_CARD_CURRENCY.USD, values.securityCode);
        }
        Navigation.goBack();
    }, []);

    return (
        <ScreenWrapper testID={ChangeBillingCurrency.displayName}>
            <HeaderWithBackButton title={translate('billingCurrency.changeBillingCurrency')} />
            <View style={styles.containerWithSpaceBetween}>
                <PaymentCardChangeCurrencyForm
                    isSecurityCodeRequired
                    changeBillingCurrency={changeBillingCurrency}
                    initialCurrency={defaultCard?.accountData?.currency}
                />
            </View>
        </ScreenWrapper>
    );
}

ChangeBillingCurrency.displayName = 'ChangeBillingCurrency';

export default ChangeBillingCurrency;
