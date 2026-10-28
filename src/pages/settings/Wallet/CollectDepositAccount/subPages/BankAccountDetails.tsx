import AddressSearch from '@components/AddressSearch';
import CurrencyPicker from '@components/CurrencyPicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FormFields from '@components/Form/Layout/FormFields';
import FormHeader from '@components/Form/Layout/FormHeader';
import FormMenuRows from '@components/Form/Layout/FormMenuRows';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import {useCurrencyListState} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useStepFormSubmit from '@hooks/useStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLocalCurrencies} from '@libs/BankAccountFields';
import {getValidationErrors} from '@libs/CollectDepositAccountUtils';
import getTextInputAutocorrectProps from '@libs/getTextInputAutocorrectProps';

import type CustomSubPageProps from '@pages/settings/Wallet/CollectDepositAccount/types';

import {setDraftValues} from '@userActions/FormActions';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/CollectDepositAccountForm';

import React from 'react';
import {View} from 'react-native';

function isSupportedCountry(countryISO: string): countryISO is Country {
    return countryISO in CONST.ALL_COUNTRIES;
}

// Empty keys tell AddressSearch to skip a value, so country, name and coordinates never land in the form.
const ADDRESS_SEARCH_INPUT_KEYS = {
    street: INPUT_IDS.ADDRESS_STREET,
    city: INPUT_IDS.ADDRESS_CITY,
    state: INPUT_IDS.ADDRESS_STATE,
    zipCode: INPUT_IDS.ADDRESS_ZIP_CODE,
    country: '',
    name: '',
    address: '',
    lat: '',
    lng: '',
};

function BankAccountDetails({isEditing, onNext, formValues, fieldsMap, fieldsType}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const bankCountry = formValues[INPUT_IDS.BANK_COUNTRY] ?? '';
    const limitSearchesToCountry = isSupportedCountry(bankCountry) ? bankCountry : '';

    const localCurrencies = getLocalCurrencies(bankCountry);
    const isLocal = fieldsType === CONST.BANK_ACCOUNT.FIELDS_TYPE.LOCAL;

    // Locally the country decides the options, so the choice only matters when it holds more than one. A wire has no
    // default to fall back on - countries with no mapping would otherwise submit an empty currency, which the API rejects.
    const hasCurrencyChoice = isLocal ? localCurrencies.length > 1 : true;

    // The picker only offers an exclude list, so locally everything the country has no mapping for is excluded.
    const {currencyList} = useCurrencyListState();
    const excludedCurrencies = isLocal && hasCurrencyChoice ? Object.keys(currencyList).filter((currencyCode) => !localCurrencies.includes(currencyCode)) : [];

    // Editing holds the new values back until submit, so the draft is written here rather than on every keystroke.
    const handleSubmit = useStepFormSubmit<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM>({
        formId: ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM,
        fieldIds: Object.keys(fieldsMap),
        onNext,
        shouldSaveDraft: true,
    });

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM> =>
        getValidationErrors(values, fieldsMap, translate);

    // Takes no arguments and returns the same object every time, so it is resolved once rather than per field.
    const autocorrectProps = getTextInputAutocorrectProps();

    const currencyHeaderContent = (
        <View style={styles.ph5}>
            <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('addPersonalBankAccount.currencyHeader')}</Text>
        </View>
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={styles.ph5}
            enabledWhenOffline
        >
            <FormHeader
                title={translate('addPersonalBankAccount.accountDetailsStepHeader')}
                style={styles.ph5}
            />
            <FormFields style={styles.ph5}>
                {!!hasCurrencyChoice && (
                    <FormMenuRows style={styles.mhn5}>
                        <CurrencyPicker
                            label={translate('common.currency')}
                            value={formValues[INPUT_IDS.BANK_CURRENCY]}
                            onInputChange={(value: string) => {
                                setDraftValues(ONYXKEYS.FORMS.COLLECT_DEPOSIT_ACCOUNT_FORM, {[INPUT_IDS.BANK_CURRENCY]: value});
                            }}
                            headerContent={currencyHeaderContent}
                            excludeCurrencies={excludedCurrencies}
                        />
                    </FormMenuRows>
                )}
                {Object.entries(fieldsMap).map(([fieldName, field]) => {
                    // The API only accepts a two letter code for US states, so offer the list rather than free text.
                    const isUSState = fieldName === INPUT_IDS.ADDRESS_STATE && bankCountry === CONST.COUNTRY.US;
                    // Only the holder's own street searches, so picking a result cannot overwrite the bank's address.
                    const isSearchableAddress = fieldName === INPUT_IDS.ADDRESS_STREET;

                    if (isUSState) {
                        return (
                            <FormMenuRows
                                key={fieldName}
                                style={styles.mhn5}
                            >
                                <InputWrapper
                                    InputComponent={StatePicker}
                                    inputID={fieldName}
                                    shouldSaveDraft={!isEditing}
                                />
                            </FormMenuRows>
                        );
                    }

                    if (isSearchableAddress) {
                        return (
                            <InputWrapper
                                key={fieldName}
                                InputComponent={AddressSearch}
                                inputID={fieldName}
                                defaultValue={formValues[fieldName]}
                                label={field.label}
                                shouldSaveDraft={!isEditing}
                                renamedInputKeys={ADDRESS_SEARCH_INPUT_KEYS}
                                limitSearchesToCountry={limitSearchesToCountry}
                                maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                                forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                                autoComplete="street-address"
                            />
                        );
                    }

                    return (
                        <InputWrapper
                            key={fieldName}
                            InputComponent={TextInput}
                            inputID={fieldName}
                            defaultValue={formValues[fieldName]}
                            label={field.label}
                            placeholder={field.placeholder}
                            shouldSaveDraft={!isEditing}
                            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
                            {...autocorrectProps}
                        />
                    );
                })}
            </FormFields>
        </FormProvider>
    );
}

BankAccountDetails.displayName = 'BankAccountDetails';

export default BankAccountDetails;
