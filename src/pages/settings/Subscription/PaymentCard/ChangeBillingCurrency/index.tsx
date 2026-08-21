import PaymentCardCurrencyHeader from '@components/AddPaymentCard/PaymentCardCurrencyHeader';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePreferredCurrency from '@hooks/usePreferredCurrency';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues, clearErrors} from '@libs/actions/FormActions';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getFieldRequiredErrors, isValidSecurityCode} from '@libs/ValidationUtils';

import * as PaymentMethods from '@userActions/PaymentMethods';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ChangeBillingCurrencyForm';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

type Currency = ValueOf<typeof CONST.PAYMENT_CARD_CURRENCY>;

const REQUIRED_FIELDS = [INPUT_IDS.SECURITY_CODE];

function ChangeBillingCurrency() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [formDraft] = useOnyx(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM_DRAFT);
    const [formData] = useOnyx(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM);

    const preferredCurrency = usePreferredCurrency();
    const currency = (formDraft?.[INPUT_IDS.CURRENCY] ?? preferredCurrency) as Currency;

    const formDataComplete = formData?.isLoading === false && !formData.errors;
    const prevIsLoading = usePrevious(formData?.isLoading);
    const prevFormDataComplete = usePrevious(formDataComplete);

    useEffect(() => {
        if (!formDataComplete || prevFormDataComplete || !prevIsLoading) {
            return;
        }
        Navigation.goBack();
    }, [formDataComplete, prevFormDataComplete, prevIsLoading]);

    useEffect(() => {
        // Clear any stale submission error (e.g. an incorrect security code from a previous attempt) so reopening the page starts clean,
        // and drop the currency draft when leaving the flow so reopening reflects the card's actual currency.
        clearErrors(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM);
        return () => {
            clearDraftValues(ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM);
        };
    }, []);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS, translate);
        if (values.securityCode && !isValidSecurityCode(values.securityCode)) {
            errors.securityCode = translate('addPaymentCardPage.error.securityCode');
        }
        return errors;
    };

    const onSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM>) => {
            if (!values?.securityCode) {
                Navigation.goBack();
                return;
            }
            PaymentMethods.updateBillingCurrency(currency, values.securityCode);
        },
        [currency],
    );

    return (
        <ScreenWrapper testID="ChangeBillingCurrency">
            <HeaderWithBackButton title={translate('billingCurrency.changeBillingCurrency')} />
            <View style={styles.containerWithSpaceBetween}>
                <FormProvider
                    formID={ONYXKEYS.FORMS.CHANGE_BILLING_CURRENCY_FORM}
                    validate={validate}
                    onSubmit={onSubmit}
                    submitButtonText={translate('common.save')}
                    scrollContextEnabled
                    style={[styles.mh5, styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                >
                    <PaymentCardCurrencyHeader />
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
                </FormProvider>
            </View>
        </ScreenWrapper>
    );
}

export default ChangeBillingCurrency;
