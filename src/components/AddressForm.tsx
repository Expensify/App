import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import AddressSearch from './AddressSearch';
import CountrySelector from './CountrySelector';
import FormProvider from './Form/FormProvider';
import InputWrapper from './Form/InputWrapper';
import type {FormOnyxValues} from './Form/types';
import type {State} from './StateSelector';
import StateSelector from './StateSelector';
import TextInput from './TextInput';

type CountryZipRegex = {
    regex?: RegExp;
    samples?: string;
};

type AddressFormProps = {
    /** Address city field */
    city?: string;

    /** Address country field */
    country?: Country | '';

    /** Address state field */
    state?: string;

    /** Address street line 1 field */
    street1?: string;

    /** Address street line 2 field */
    street2?: string;

    /** Address zip code field */
    zip?: string;

    /** Callback which is executed when the user changes address, city or state */
    onAddressChanged?: (value: unknown, key: unknown) => void;

    /** Callback which is executed when the user submits his address changes */
    onSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM | typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => void;

    /** Whether or not should the form data should be saved as draft */
    shouldSaveDraft?: boolean;

    /** Text displayed on the bottom submit button */
    submitButtonText?: string;

    /** A unique Onyx key identifying the form */
    formID: typeof ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM | typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM;
};

function AddressForm({
    city = '',
    country = '',
    formID,
    onAddressChanged = () => {},
    onSubmit,
    shouldSaveDraft = false,
    state = '',
    street1 = '',
    street2 = '',
    submitButtonText = '',
    zip = '',
}: AddressFormProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const zipSampleFormat = (country && (CONST.COUNTRY_ZIP_REGEX_DATA[country] as CountryZipRegex)?.samples) ?? '';

    const zipFormat = translate('common.zipCodeExampleFormat', {zipSampleFormat});

    const isUSAForm = country === CONST.COUNTRY.US;

    /**
     * @param translate - translate function
     * @param isUSAForm - selected country ISO code is US
     * @param values - form input values
     * @returns - An object containing the errors for each inputID
     */

    const validator = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM | typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>): Errors => {
            const errors: Errors & {
                zipPostCode?: string | string[];
            } = {};
            const requiredFields = ['addressLine1', 'city', 'country', 'state'] as const;

            // Check "State" dropdown is a valid state if selected Country is USA
            if (values.country === CONST.COUNTRY.US && !values.state) {
                errors.state = translate('common.error.fieldRequired');
            }

            // Add "Field required" errors if any required field is empty
            requiredFields.forEach((fieldKey) => {
                const fieldValue = values[fieldKey] ?? '';
                if (ValidationUtils.isRequiredFulfilled(fieldValue)) {
                    return;
                }

                errors[fieldKey] = translate('common.error.fieldRequired');
            });

            // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
            const countryRegexDetails = (values.country ? CONST.COUNTRY_ZIP_REGEX_DATA?.[values.country] : {}) as CountryZipRegex;

            // The postal code system might not exist for a country, so no regex either for them.
            const countrySpecificZipRegex = countryRegexDetails?.regex;
            const countryZipFormat = countryRegexDetails?.samples ?? '';

            ErrorUtils.addErrorMessage(errors, 'firstName', translate('bankAccount.error.firstName'));

            if (countrySpecificZipRegex) {
                if (!countrySpecificZipRegex.test(values.zipPostCode?.trim().toUpperCase())) {
                    if (ValidationUtils.isRequiredFulfilled(values.zipPostCode?.trim())) {
                        errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat', countryZipFormat);
                    } else {
                        errors.zipPostCode = translate('common.error.fieldRequired');
                    }
                }
            } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values?.zipPostCode?.trim()?.toUpperCase() ?? '')) {
                errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat');
            }

            return errors;
        },
        [translate],
    );

    return (
        <FormProvider
            style={[styles.flexGrow1, styles.mh5]}
            formID={formID}
            validate={validator}
            onSubmit={onSubmit}
            submitButtonText={submitButtonText}
            enabledWhenOffline
        >
            <View>
                <InputWrapper
                    InputComponent={AddressSearch}
                    inputID={INPUT_IDS.ADDRESS_LINE_1}
                    label={translate('common.addressLine', {lineNumber: 1})}
                    onValueChange={(data: unknown, key: unknown) => {
                        onAddressChanged(data, key);
                    }}
                    defaultValue={street1}
                    renamedInputKeys={{
                        street: INPUT_IDS.ADDRESS_LINE_1,
                        street2: INPUT_IDS.ADDRESS_LINE_2,
                        city: INPUT_IDS.CITY,
                        state: INPUT_IDS.STATE,
                        zipCode: INPUT_IDS.ZIP_POST_CODE,
                        country: INPUT_IDS.COUNTRY as Country,
                    }}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    shouldSaveDraft={shouldSaveDraft}
                />
            </View>
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ADDRESS_LINE_2}
                label={translate('common.addressLine', {lineNumber: 2})}
                aria-label={translate('common.addressLine', {lineNumber: 2})}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={street2}
                maxLength={CONST.FORM_CHARACTER_LIMIT}
                spellCheck={false}
                shouldSaveDraft={shouldSaveDraft}
            />
            <View style={styles.formSpaceVertical} />
            <View style={styles.mhn5}>
                <InputWrapper
                    InputComponent={CountrySelector}
                    inputID={INPUT_IDS.COUNTRY}
                    value={country}
                    onValueChange={onAddressChanged}
                    shouldSaveDraft={shouldSaveDraft}
                />
            </View>
            <View style={styles.formSpaceVertical} />
            {isUSAForm ? (
                <View style={styles.mhn5}>
                    <InputWrapper
                        InputComponent={StateSelector}
                        inputID={INPUT_IDS.STATE}
                        value={state as State}
                        onValueChange={onAddressChanged}
                        shouldSaveDraft={shouldSaveDraft}
                    />
                </View>
            ) : (
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.STATE}
                    label={translate('common.stateOrProvince')}
                    aria-label={translate('common.stateOrProvince')}
                    role={CONST.ROLE.PRESENTATION}
                    value={state}
                    maxLength={CONST.STATE_CHARACTER_LIMIT}
                    spellCheck={false}
                    onValueChange={onAddressChanged}
                    shouldSaveDraft={shouldSaveDraft}
                />
            )}
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.CITY}
                label={translate('common.city')}
                aria-label={translate('common.city')}
                role={CONST.ROLE.PRESENTATION}
                defaultValue={city}
                maxLength={CONST.FORM_CHARACTER_LIMIT}
                spellCheck={false}
                onValueChange={onAddressChanged}
                shouldSaveDraft={shouldSaveDraft}
            />
            <View style={styles.formSpaceVertical} />
            <InputWrapper
                InputComponent={TextInput}
                inputID={INPUT_IDS.ZIP_POST_CODE}
                label={translate('common.zipPostCode')}
                aria-label={translate('common.zipPostCode')}
                role={CONST.ROLE.PRESENTATION}
                autoCapitalize="characters"
                defaultValue={zip}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={zipFormat}
                onValueChange={onAddressChanged}
                shouldSaveDraft={shouldSaveDraft}
            />
        </FormProvider>
    );
}

AddressForm.displayName = 'AddressForm';

export default AddressForm;
