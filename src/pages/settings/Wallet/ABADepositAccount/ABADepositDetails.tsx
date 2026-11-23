import AddressSearch from '@components/AddressSearch';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import InteractiveStepWrapper from '@components/InteractiveStepWrapper';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {normalizeBSB} from '@libs/BankAccountUtils';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';

import {clearCreateDepositABAAccount, createDepositABAAccount} from '@userActions/BankAccounts';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ABADepositAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ABADepositAccountForm';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

const isSuccessSelector = (form: OnyxEntry<ABADepositAccountForm>) => !!form?.isSuccess;

const REQUIRED_FIELDS = [INPUT_IDS.BSB_NUMBER, INPUT_IDS.ACCOUNT_NUMBER, INPUT_IDS.FIRST_NAME, INPUT_IDS.LAST_NAME, INPUT_IDS.BILLING_ADDRESS, INPUT_IDS.CITY];

const ADDRESS_SEARCH_INPUT_KEYS = {
    street: INPUT_IDS.BILLING_ADDRESS,
    city: INPUT_IDS.CITY,
    state: '',
    zipCode: '',
    country: '',
    name: '',
    address: '',
    lat: '',
    lng: '',
};

type ABADepositDetailsProps = {
    onBackButtonPress: () => void;

    onSuccess: () => void;
};

function TermsAndPrivacyLabel() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // CheckboxWithLabel indents and wraps plain text labels but not custom ones, so this does the same to line up with them
    return (
        <View style={[styles.ml1, styles.flexShrink1]}>
            <RenderHTML html={translate('common.acceptTermsAndPrivacy')} />
        </View>
    );
}

/**
 * Collects the details of an ABA deposit bank account.
 */
function ABADepositDetails({onBackButtonPress, onSuccess}: ABADepositDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const [isSuccess] = useOnyx(ONYXKEYS.FORMS.ABA_DEPOSIT_ACCOUNT_FORM, {selector: isSuccessSelector});

    // Clear any result left from an earlier attempt
    useEffect(() => {
        clearCreateDepositABAAccount();
    }, []);

    useEffect(() => {
        if (!isSuccess) {
            return;
        }
        onSuccess();
        clearCreateDepositABAAccount();
    }, [isSuccess, onSuccess]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ABA_DEPOSIT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ABA_DEPOSIT_ACCOUNT_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS, translate);
        const bsbNumber = values[INPUT_IDS.BSB_NUMBER]?.trim();
        const accountNumber = values[INPUT_IDS.ACCOUNT_NUMBER]?.trim();

        if (bsbNumber && !CONST.BANK_ACCOUNT.REGEX.AU_BSB_NUMBER.test(bsbNumber)) {
            errors[INPUT_IDS.BSB_NUMBER] = translate('abaWithdrawalDetailsStep.error.bsbNumber');
        }
        if (accountNumber && !CONST.BANK_ACCOUNT.REGEX.AU_ACCOUNT_NUMBER.test(accountNumber)) {
            errors[INPUT_IDS.ACCOUNT_NUMBER] = translate('bankAccount.error.accountNumber');
        }
        if (!values[INPUT_IDS.ACCEPT_TERMS]) {
            errors[INPUT_IDS.ACCEPT_TERMS] = translate('common.error.acceptTerms');
        }

        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ABA_DEPOSIT_ACCOUNT_FORM>) => {
        createDepositABAAccount({
            bsbNumber: normalizeBSB(values[INPUT_IDS.BSB_NUMBER]),
            accountNumber: values[INPUT_IDS.ACCOUNT_NUMBER].trim(),
            firstName: values[INPUT_IDS.FIRST_NAME].trim(),
            lastName: values[INPUT_IDS.LAST_NAME].trim(),
            billingAddress: values[INPUT_IDS.BILLING_ADDRESS].trim(),
            city: values[INPUT_IDS.CITY].trim(),
        });
    };

    return (
        <InteractiveStepWrapper
            wrapperID="ABADepositDetails"
            handleBackButtonPress={onBackButtonPress}
            headerTitle={translate('bankAccount.addBankAccount')}
        >
            <FormProvider
                formID={ONYXKEYS.FORMS.ABA_DEPOSIT_ACCOUNT_FORM}
                validate={validate}
                onSubmit={submit}
                submitButtonText={translate('common.next')}
                style={styles.flexGrow1}
                submitButtonStyles={styles.mh5}
                enabledWhenOffline={false}
                shouldHideFixErrorsAlert
            >
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('addPersonalBankAccount.accountDetailsStepHeader')}</Text>
                <MenuItemField
                    name={translate('common.currency')}
                    value={CONST.CURRENCY.AUD}
                />
                <View style={styles.ph5}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.BSB_NUMBER}
                        label={translate('abaWithdrawalDetailsStep.bsbNumber')}
                        aria-label={translate('abaWithdrawalDetailsStep.bsbNumber')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt3}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.ACCOUNT_NUMBER}
                        label={translate('bankAccount.accountNumber')}
                        aria-label={translate('bankAccount.accountNumber')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.FIRST_NAME}
                        label={translate('common.firstName')}
                        aria-label={translate('common.firstName')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.LAST_NAME}
                        label={translate('common.lastName')}
                        aria-label={translate('common.lastName')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={AddressSearch}
                        inputID={INPUT_IDS.BILLING_ADDRESS}
                        label={translate('addDebitCardPage.billingAddress')}
                        containerStyles={styles.mt6}
                        renamedInputKeys={ADDRESS_SEARCH_INPUT_KEYS}
                        limitSearchesToCountry={CONST.COUNTRY.AU}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                        autoComplete="street-address"
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.CITY}
                        label={translate('common.city')}
                        aria-label={translate('common.city')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={styles.mt6}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        InputComponent={CheckboxWithLabel}
                        inputID={INPUT_IDS.ACCEPT_TERMS}
                        LabelComponent={TermsAndPrivacyLabel}
                        aria-label={`${translate('common.iAcceptThe')} ${translate('common.addCardTermsOfService')} ${translate('common.and')} ${translate('common.privacyPolicy')}`}
                        defaultValue={false}
                        style={styles.mt6}
                    />
                </View>
            </FormProvider>
        </InteractiveStepWrapper>
    );
}

export default ABADepositDetails;
