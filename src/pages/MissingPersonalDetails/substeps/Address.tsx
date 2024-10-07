import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import CountryPicker from '@components/CountryPicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import StatePicker from '@components/StatePicker';
import type {State} from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import usePersonalDetailsStepFormSubmit from '@hooks/usePersonalDetailsStepFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as ValidationUtils from '@libs/ValidationUtils';
import type {CountryZipRegex, CustomSubStepProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

const STEP_FIELDS = [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.ADDRESS_LINE_2, INPUT_IDS.CITY, INPUT_IDS.STATE, INPUT_IDS.COUNTRY, INPUT_IDS.ZIP_POST_CODE];

function AddressStep({privatePersonalDetails, isEditing, onNext}: CustomSubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const address = useMemo(() => PersonalDetailsUtils.getCurrentAddress(privatePersonalDetails), [privatePersonalDetails]);

    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
    const [currentCountry, setCurrentCountry] = useState(address?.country);
    const [state, setState] = useState(address?.state);
    const [city, setCity] = useState(address?.city);
    const [zipcode, setZipcode] = useState(address?.zip);

    useEffect(() => {
        if (!address) {
            return;
        }
        setState(address.state);
        setCurrentCountry(address.country);
        setCity(address.city);
        setZipcode(address.zip);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [address?.state, address?.country, address?.city, address?.zip]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
            const addressRequiredFields = [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.CITY, INPUT_IDS.COUNTRY, INPUT_IDS.STATE] as const;
            addressRequiredFields.forEach((fieldKey) => {
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
            if (countrySpecificZipRegex) {
                if (!countrySpecificZipRegex.test(values[INPUT_IDS.ZIP_POST_CODE]?.trim().toUpperCase())) {
                    if (ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.ZIP_POST_CODE]?.trim())) {
                        errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat', {zipFormat: countryZipFormat});
                    } else {
                        errors[INPUT_IDS.ZIP_POST_CODE] = translate('common.error.fieldRequired');
                    }
                }
            } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values[INPUT_IDS.ZIP_POST_CODE]?.trim()?.toUpperCase() ?? '')) {
                errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat');
            }
            return errors;
        },
        [translate],
    );

    const handleAddressChange = useCallback((value: unknown, key: unknown) => {
        const addressPart = value as string;
        const addressPartKey = key as keyof Address;

        if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === INPUT_IDS.COUNTRY) {
            setCurrentCountry(addressPart as Country | '');
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.STATE) {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.CITY) {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    }, []);

    const handleSubmit = usePersonalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    const isUSAForm = currentCountry === CONST.COUNTRY.US;

    const zipSampleFormat = (currentCountry && (CONST.COUNTRY_ZIP_REGEX_DATA[currentCountry] as CountryZipRegex)?.samples) ?? '';

    const zipFormat = translate('common.zipCodeExampleFormat', {zipSampleFormat});

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterAddress')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={AddressSearch}
                        inputID={INPUT_IDS.ADDRESS_LINE_1}
                        label={translate('common.addressLine', {lineNumber: 1})}
                        onValueChange={(data: unknown, key: unknown) => {
                            handleAddressChange(data, key);
                        }}
                        defaultValue={street1}
                        containerStyles={styles.mt3}
                        renamedInputKeys={{
                            street: INPUT_IDS.ADDRESS_LINE_1,
                            street2: INPUT_IDS.ADDRESS_LINE_2,
                            city: INPUT_IDS.CITY,
                            state: INPUT_IDS.STATE,
                            zipCode: INPUT_IDS.ZIP_POST_CODE,
                            country: INPUT_IDS.COUNTRY as Country,
                        }}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ADDRESS_LINE_2}
                    label={translate('common.addressLine', {lineNumber: 2})}
                    aria-label={translate('common.addressLine', {lineNumber: 2})}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={street2}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    spellCheck={false}
                    containerStyles={styles.mt6}
                    shouldSaveDraft={!isEditing}
                />
                <View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={CountryPicker}
                        inputID={INPUT_IDS.COUNTRY}
                        value={currentCountry}
                        onValueChange={handleAddressChange}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                {isUSAForm ? (
                    <View style={[styles.mt3, styles.mhn5]}>
                        <InputWrapper
                            InputComponent={StatePicker}
                            inputID={INPUT_IDS.STATE}
                            value={state as State}
                            onValueChange={handleAddressChange}
                            shouldSaveDraft={!isEditing}
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
                        maxLength={CONST.FORM_CHARACTER_LIMIT}
                        spellCheck={false}
                        onValueChange={handleAddressChange}
                        containerStyles={styles.mt3}
                        shouldSaveDraft={!isEditing}
                    />
                )}
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CITY}
                    label={translate('common.city')}
                    aria-label={translate('common.city')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={city}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    spellCheck={false}
                    onValueChange={handleAddressChange}
                    containerStyles={isUSAForm ? styles.mt3 : styles.mt6}
                    shouldSaveDraft={!isEditing}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ZIP_POST_CODE}
                    label={translate('common.zipPostCode')}
                    aria-label={translate('common.zipPostCode')}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="characters"
                    defaultValue={zipcode}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={zipFormat}
                    onValueChange={handleAddressChange}
                    containerStyles={styles.mt6}
                    shouldSaveDraft={!isEditing}
                />
            </View>
        </FormProvider>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
