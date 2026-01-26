import React, {useCallback, useState} from 'react';
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
import usePersonalDetailsFormSubmit from '@hooks/usePersonalDetailsFormSubmit';
import useThemeStyles from '@hooks/useThemeStyles';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import type {CountryZipRegex, CustomSubPageProps} from '@pages/MissingPersonalDetails/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

const STEP_FIELDS = [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.ADDRESS_LINE_2, INPUT_IDS.CITY, INPUT_IDS.STATE, INPUT_IDS.ZIP_POST_CODE, INPUT_IDS.COUNTRY];

function AddressStep({isEditing, onNext, personalDetailsValues}: CustomSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentCountry, setCurrentCountry] = useState(personalDetailsValues[INPUT_IDS.COUNTRY]);
    const [state, setState] = useState(personalDetailsValues[INPUT_IDS.STATE]);
    const [city, setCity] = useState(personalDetailsValues[INPUT_IDS.CITY]);
    const [zipcode, setZipcode] = useState(personalDetailsValues[INPUT_IDS.ZIP_POST_CODE]);

    const handleSubmit = usePersonalDetailsFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: true,
    });

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            const addressRequiredFields = [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.CITY, INPUT_IDS.COUNTRY, INPUT_IDS.STATE] as const;
            for (const fieldKey of addressRequiredFields) {
                const fieldValue = values[fieldKey] ?? '';
                if (isRequiredFulfilled(fieldValue)) {
                    continue;
                }
                errors[fieldKey] = translate('common.error.fieldRequired');
            }

            if (values.addressLine2.length > CONST.FORM_CHARACTER_LIMIT) {
                errors.addressLine2 = translate('common.error.characterLimitExceedCounter', values.addressLine2.length, CONST.FORM_CHARACTER_LIMIT);
            }

            if (values.city.length > CONST.FORM_CHARACTER_LIMIT) {
                errors.city = translate('common.error.characterLimitExceedCounter', values.city.length, CONST.FORM_CHARACTER_LIMIT);
            }

            if (values.country !== CONST.COUNTRY.US && values.state.length > CONST.STATE_CHARACTER_LIMIT) {
                errors.state = translate('common.error.characterLimitExceedCounter', values.state.length, CONST.STATE_CHARACTER_LIMIT);
            }

            // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
            const countryRegexDetails = (values.country ? CONST.COUNTRY_ZIP_REGEX_DATA?.[values.country] : {}) as CountryZipRegex;

            // The postal code system might not exist for a country, so no regex either for them.
            const countrySpecificZipRegex = countryRegexDetails?.regex;
            const countryZipFormat = countryRegexDetails?.samples ?? '';
            if (countrySpecificZipRegex) {
                if (!countrySpecificZipRegex.test(values[INPUT_IDS.ZIP_POST_CODE]?.trim().toUpperCase())) {
                    if (isRequiredFulfilled(values[INPUT_IDS.ZIP_POST_CODE]?.trim())) {
                        errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat', countryZipFormat);
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

    const isUSAForm = currentCountry === CONST.COUNTRY.US;

    const zipSampleFormat = (currentCountry && (CONST.COUNTRY_ZIP_REGEX_DATA[currentCountry] as CountryZipRegex)?.samples) ?? '';

    const zipFormat = translate('common.zipCodeExampleFormat', {zipSampleFormat});

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.flexGrow1, styles.mt3]}
            submitButtonStyles={[styles.ph5, styles.mb0]}
            enabledWhenOffline
        >
            <View style={styles.ph5}>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('privatePersonalDetails.enterAddress')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={AddressSearch}
                        inputID={INPUT_IDS.ADDRESS_LINE_1}
                        label={translate('common.addressLine', 1)}
                        onValueChange={(data: unknown, key: unknown) => {
                            handleAddressChange(data, key);
                        }}
                        defaultValue={personalDetailsValues[INPUT_IDS.ADDRESS_LINE_1]}
                        renamedInputKeys={{
                            street: INPUT_IDS.ADDRESS_LINE_1,
                            street2: INPUT_IDS.ADDRESS_LINE_2,
                            city: INPUT_IDS.CITY,
                            state: INPUT_IDS.STATE,
                            zipCode: INPUT_IDS.ZIP_POST_CODE,
                            country: INPUT_IDS.COUNTRY as Country,
                        }}
                        maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    />
                </View>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ADDRESS_LINE_2}
                    label={translate('common.addressLine', 2)}
                    aria-label={translate('common.addressLine', 2)}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={personalDetailsValues[INPUT_IDS.ADDRESS_LINE_2]}
                    spellCheck={false}
                    containerStyles={styles.mt5}
                />
                <View style={[styles.mt2, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={CountryPicker}
                        inputID={INPUT_IDS.COUNTRY}
                        value={currentCountry}
                        onValueChange={handleAddressChange}
                    />
                </View>
                {isUSAForm ? (
                    <View style={[styles.mt2, styles.mhn5]}>
                        <InputWrapper
                            InputComponent={StatePicker}
                            inputID={INPUT_IDS.STATE}
                            value={state as State}
                            onValueChange={handleAddressChange}
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
                        spellCheck={false}
                        onValueChange={handleAddressChange}
                        containerStyles={styles.mt2}
                    />
                )}
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.CITY}
                    label={translate('common.city')}
                    aria-label={translate('common.city')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={city}
                    spellCheck={false}
                    onValueChange={handleAddressChange}
                    containerStyles={isUSAForm ? styles.mt2 : styles.mt5}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={INPUT_IDS.ZIP_POST_CODE}
                    label={translate('common.zipPostCode')}
                    aria-label={translate('common.zipPostCode')}
                    role={CONST.ROLE.PRESENTATION}
                    autoCapitalize="characters"
                    defaultValue={zipcode}
                    hint={zipFormat}
                    onValueChange={handleAddressChange}
                    containerStyles={styles.mt5}
                />
            </View>
        </FormProvider>
    );
}

export default AddressStep;
