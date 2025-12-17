import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isValidSecurityCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ChangeBillingCurrencyForm';
import PaymentCardCurrencyHeader from './PaymentCardCurrencyHeader';
import PaymentCardCurrencyModal from './PaymentCardCurrencyModal';

type PaymentCardFormProps = {
    initialCurrency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;
    isSecurityCodeRequired?: boolean;
    changeBillingCurrency: (currency?: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>, values?: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>) => void;
};

const REQUIRED_FIELDS = [INPUT_IDS.SECURITY_CODE];

function PaymentCardChangeCurrencyForm({changeBillingCurrency, isSecurityCodeRequired, initialCurrency}: PaymentCardFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isBetaEnabled} = usePermissions();

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [currency, setCurrency] = useState<ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>>(initialCurrency ?? CONST.PAYMENT_CARD_CURRENCY.USD);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS);

        if (values.securityCode && !isValidSecurityCode(values.securityCode)) {
            errors.securityCode = translate('addPaymentCardPage.error.securityCode');
        }

        return errors;
    };

    const availableCurrencies = useMemo(() => {
        const canUseEurBilling = isBetaEnabled(CONST.BETAS.EUR_BILLING);
        const allCurrencies = Object.keys(CONST.PAYMENT_CARD_CURRENCY) as Array<ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>>;
        // Filter out EUR if user doesn't have EUR billing beta
        return allCurrencies.filter((currencyItem) => {
            if (currencyItem === CONST.PAYMENT_CARD_CURRENCY.EUR && !canUseEurBilling) {
                return false;
            }
            return true;
        });
    }, [isBetaEnabled]);

    const currencyOptions = useMemo(
        () =>
            availableCurrencies.map((currencyItem) => ({
                text: currencyItem,
                value: currencyItem,
                keyForList: currencyItem,
                isSelected: currencyItem === currency,
            })),
        [availableCurrencies, currency],
    );

    const showCurrenciesModal = useCallback(() => {
        setIsCurrencyModalVisible(true);
    }, []);

    const changeCurrency = useCallback((selectedCurrency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => {
        setCurrency(selectedCurrency);
        setIsCurrencyModalVisible(false);
    }, []);

    const selectCurrency = useCallback(
        (selectedCurrency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => {
            setCurrency(selectedCurrency);
            changeBillingCurrency(selectedCurrency);
        },
        [changeBillingCurrency],
    );

    if (isSecurityCodeRequired) {
        return (
            <FormProvider
                formID={ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM}
                validate={validate}
                onSubmit={(values) => changeBillingCurrency(currency, values)}
                submitButtonText={translate('common.save')}
                scrollContextEnabled
                style={[styles.mh5, styles.flexGrow1]}
                shouldHideFixErrorsAlert
            >
                <PaymentCardCurrencyHeader />
                <>
                    <View style={[styles.mt5, styles.mhn5]}>
                        <MenuItemWithTopDescription
                            shouldShowRightIcon
                            title={currency}
                            descriptionTextStyle={styles.textNormal}
                            description={translate('common.currency')}
                            onPress={showCurrenciesModal}
                        />
                    </View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.SECURITY_CODE}
                        label={translate('addDebitCardPage.cvv')}
                        aria-label={translate('addDebitCardPage.cvv')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt5]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                    />
                </>
                <PaymentCardCurrencyModal
                    isVisible={isCurrencyModalVisible}
                    currencies={availableCurrencies}
                    currentCurrency={currency}
                    onCurrencyChange={changeCurrency}
                    onClose={() => setIsCurrencyModalVisible(false)}
                />
            </FormProvider>
        );
    }

    return (
        <View style={[styles.mh5, styles.flexGrow1]}>
            <SelectionList
                data={currencyOptions}
                ListItem={RadioListItem}
                onSelectRow={(option) => {
                    selectCurrency(option.value);
                }}
                style={{containerStyle: styles.mhn5}}
                initiallyFocusedItemKey={currency}
                customListHeader={<PaymentCardCurrencyHeader isSectionList />}
                shouldStopPropagation
            />
        </View>
    );
}

export default PaymentCardChangeCurrencyForm;
