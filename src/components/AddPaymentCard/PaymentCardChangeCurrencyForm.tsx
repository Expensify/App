import React, {useCallback, useState} from 'react';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Hoverable from '@components/Hoverable';
import * as Expensicons from '@components/Icon/Expensicons';
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

    const showCurrenciesModal = useCallback(() => {
        setIsCurrencyModalVisible(true);
    }, []);

    const changeCurrency = useCallback((newCurrency: keyof typeof CONST.CURRENCY) => {
        setCurrency(newCurrency);
        setIsCurrencyModalVisible(false);
    }, []);

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM}
            validate={validate}
            onSubmit={(formData) => changeBillingCurrency(currency, formData)}
            submitButtonText={translate('common.save')}
            scrollContextEnabled
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Hoverable>
                {(isHovered) => (
                    <TextInput
                        label={translate('common.currency')}
                        aria-label={translate('common.currency')}
                        role={CONST.ROLE.COMBOBOX}
                        icon={Expensicons.ArrowRight}
                        onPress={showCurrenciesModal}
                        value={currency}
                        containerStyles={[styles.mt5]}
                        inputStyle={isHovered && styles.cursorPointer}
                        hideFocusedState
                        caretHidden
                    />
                )}
            </Hoverable>
            <Text style={[styles.mt5, styles.mutedTextLabel]}>
                {`${translate('billingCurrency.note')}`}{' '}
                <TextLink
                    style={[styles.mutedTextLabel, styles.link]}
                    href={CONST.PRICING}
                >{`${translate('billingCurrency.noteLink')}`}</TextLink>{' '}
                {`${translate('billingCurrency.notDetails')}`}
            </Text>

            {!!isSecurityCodeRequired && (
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
            )}

            <PaymentCardCurrencyModal
                isVisible={isCurrencyModalVisible}
                currencies={Object.keys(CONST.CURRENCY) as Array<keyof typeof CONST.CURRENCY>}
                currentCurrency={currency}
                onCurrencyChange={changeCurrency}
                onClose={() => setIsCurrencyModalVisible(false)}
            />
        </FormProvider>
    );
}

PaymentCardChangeCurrencyForm.displayName = 'PaymentCardChangeCurrencyForm';

export default PaymentCardChangeCurrencyForm;
