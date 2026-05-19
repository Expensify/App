import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors, isValidSecurityCode} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ChangeBillingCurrencyForm';
import PaymentCardCurrencyHeader from './PaymentCardCurrencyHeader';

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

    // Only the subscription billing flow (security-code branch) pushes to the currency selector screen,
    // so only it needs to round-trip the selection through the form draft. The inline picker flow
    // pops back on selection and must not read or clear the shared draft.
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT);
    const draftCurrency = isSecurityCodeRequired ? formDraft?.[INPUT_IDS.CURRENCY] : undefined;
    const currency = draftCurrency ?? initialCurrency ?? CONST.PAYMENT_CARD_CURRENCY.USD;

    useEffect(() => {
        if (!isSecurityCodeRequired) {
            return undefined;
        }
        return () => {
            clearDraftValues(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM);
        };
    }, [isSecurityCodeRequired]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS, translate);

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

    const selectCurrency = useCallback(
        (selectedCurrency: ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>) => {
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
                            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.PAYMENT_CARD_CURRENCY_SELECTOR.path))}
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
                        autoComplete="cc-csc"
                    />
                </>
            </FormProvider>
        );
    }

    return (
        <View style={[styles.mh5, styles.flexGrow1]}>
            <SelectionList
                data={currencyOptions}
                ListItem={SingleSelectListItem}
                onSelectRow={(option) => {
                    selectCurrency(option.value);
                }}
                style={{containerStyle: styles.mhn5}}
                initiallyFocusedItemKey={currency}
                customListHeader={<PaymentCardCurrencyHeader isSectionList />}
            />
        </View>
    );
}

export default PaymentCardChangeCurrencyForm;
