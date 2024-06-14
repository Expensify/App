import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ChangeBillingCurrencyForm';
import PaymentCardCurrencyModal from './PaymentCardCurrencyModal';

type PaymentCardFormProps = {
    initialCurrency?: ValueOf<typeof CONST.CURRENCY>;
    isSecurityCodeRequired?: boolean;
    changeBillingCurrency: (currency?: ValueOf<typeof CONST.CURRENCY>, values?: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>) => void;
};

const REQUIRED_FIELDS = [INPUT_IDS.SECURITY_CODE];

function PaymentCardChangeCurrencyForm({changeBillingCurrency, isSecurityCodeRequired, initialCurrency}: PaymentCardFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);
    const [currency, setCurrency] = useState<ValueOf<typeof CONST.CURRENCY>>(initialCurrency ?? CONST.CURRENCY.USD);

    const validate = (formValues: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(formValues, REQUIRED_FIELDS);

        if (formValues.securityCode && !ValidationUtils.isValidSecurityCode(formValues.securityCode)) {
            errors.securityCode = 'addPaymentCardPage.error.securityCode';
        }

        return errors;
    };

    const {sections} = useMemo(
        () => ({
            sections: [
                {
                    data: (Object.keys(CONST.CURRENCY) as Array<keyof typeof CONST.CURRENCY>).map((currencyItem) => ({
                        text: currencyItem,
                        value: currencyItem,
                        keyForList: currencyItem,
                        isSelected: currencyItem === currency,
                    })),
                },
            ],
        }),
        [currency],
    );

    const showCurrenciesModal = useCallback(() => {
        setIsCurrencyModalVisible(true);
    }, []);

    const changeCurrency = useCallback((newCurrency: keyof typeof CONST.CURRENCY) => {
        setCurrency(newCurrency);
        setIsCurrencyModalVisible(false);
    }, []);

    const selectCurrencyInARow = useCallback(
        (selectedCurrency: keyof typeof CONST.CURRENCY) => {
            setCurrency(selectedCurrency);
            changeBillingCurrency(selectedCurrency);
        },
        [changeBillingCurrency],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM}
            validate={validate}
            isSubmitButtonVisible={!!isSecurityCodeRequired}
            onSubmit={(formData) => changeBillingCurrency(currency, formData)}
            submitButtonText={translate('common.save')}
            scrollContextEnabled
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.mt3]}>
                {`${translate('billingCurrency.note')}`}{' '}
                <TextLink
                    style={[styles.link]}
                    href={CONST.PRICING}
                >{`${translate('billingCurrency.noteLink')}`}</TextLink>{' '}
                {`${translate('billingCurrency.notDetails')}`}
            </Text>
            {!!isSecurityCodeRequired && (
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
                        maxLength={4}
                        containerStyles={[styles.mt5]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                    />
                </>
            )}

            <PaymentCardCurrencyModal
                isVisible={isCurrencyModalVisible}
                currencies={Object.keys(CONST.CURRENCY) as Array<keyof typeof CONST.CURRENCY>}
                currentCurrency={currency}
                onCurrencyChange={changeCurrency}
                onClose={() => setIsCurrencyModalVisible(false)}
            />
            {!isSecurityCodeRequired && (
                <SelectionList
                    initiallyFocusedOptionKey={currency}
                    containerStyle={[styles.mt5, styles.mhn5]}
                    sections={sections}
                    onSelectRow={(option) => {
                        selectCurrencyInARow(option.value);
                    }}
                    showScrollIndicator
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                    ListItem={RadioListItem}
                />
            )}
        </FormProvider>
    );
}

PaymentCardChangeCurrencyForm.displayName = 'PaymentCardChangeCurrencyForm';

export default PaymentCardChangeCurrencyForm;
