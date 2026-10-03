import AddressSearch from '@components/AddressSearch';
import CountrySelector from '@components/CountrySelector';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {activatePhysicalExpensifyCard} from '@libs/actions/Card';
import {buildSetPersonalDetailsAndShipExpensifyCardsParams} from '@libs/actions/PersonalDetails';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import {getStreetLines} from '@libs/PersonalDetailsUtils';
import {
    getCountryZipRegexDetails,
    getFieldRequiredErrors,
    isValidPastDate,
    isValidPhoneNumber,
    isValidZipCodeForCountry,
    meetsMaximumAgeRequirement,
    meetsMinimumAgeRequirement,
} from '@libs/ValidationUtils';

import {getSubPageValues} from '@pages/MissingPersonalDetails/utils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Card} from '@src/types/onyx';

import {subYears} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

type ActivatePhysicalCardPersonalDetailsProps = {
    /** The card being activated */
    card: Card;

    /** Last four digits the cardholder entered for the card */
    lastFourDigits: string;

    /** Goes back to entering the last four digits */
    onBackButtonPress: () => void;
};

const REQUIRED_FIELDS = [INPUT_IDS.DATE_OF_BIRTH, INPUT_IDS.PHONE_NUMBER, INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.CITY, INPUT_IDS.STATE, INPUT_IDS.COUNTRY, INPUT_IDS.ZIP_POST_CODE];

function ActivatePhysicalCardPersonalDetails({card, lastFourDigits, onBackButtonPress}: ActivatePhysicalCardPersonalDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const personalDetailsValues = getSubPageValues(privatePersonalDetails, undefined);
    const shippingAddress = card.nameValuePairs?.shippingAddress;

    // The address the admin shipped the card to is prefilled until the cardholder has a home address of their own
    const hasHomeAddress = !!personalDetailsValues[INPUT_IDS.ADDRESS_LINE_1];
    const [shippingStreet1, shippingStreet2] = getStreetLines(shippingAddress?.addressStreet);
    const street1 = hasHomeAddress ? personalDetailsValues[INPUT_IDS.ADDRESS_LINE_1] : shippingStreet1;
    const street2 = hasHomeAddress ? personalDetailsValues[INPUT_IDS.ADDRESS_LINE_2] : shippingStreet2;
    const city = hasHomeAddress ? personalDetailsValues[INPUT_IDS.CITY] : shippingAddress?.addressCity;
    const state = hasHomeAddress ? personalDetailsValues[INPUT_IDS.STATE] : shippingAddress?.addressState;
    const zip = hasHomeAddress ? personalDetailsValues[INPUT_IDS.ZIP_POST_CODE] : shippingAddress?.addressZip;
    const country = hasHomeAddress ? personalDetailsValues[INPUT_IDS.COUNTRY] : shippingAddress?.addressCountry;

    const cardError = getLatestErrorMessage(card);
    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
        const errors = getFieldRequiredErrors(values, REQUIRED_FIELDS, translate);
        if (values.dob) {
            if (!isValidPastDate(values.dob) || !meetsMaximumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.dob');
            } else if (!meetsMinimumAgeRequirement(values.dob)) {
                errors.dob = translate('bankAccount.error.age');
            }
        }
        if (values.phoneNumber && !isValidPhoneNumber(appendCountryCode(values.phoneNumber, countryCode))) {
            errors.phoneNumber = translate('common.error.phoneNumber');
        }
        for (const addressInputID of [INPUT_IDS.ADDRESS_LINE_1, INPUT_IDS.ADDRESS_LINE_2, INPUT_IDS.CITY] as const) {
            const addressPart = values[addressInputID] ?? '';
            if (addressPart.length > CONST.FORM_CHARACTER_LIMIT) {
                errors[addressInputID] = translate('common.error.characterLimitExceedCounter', addressPart.length, CONST.FORM_CHARACTER_LIMIT);
            }
        }
        if (values.zipPostCode && !isValidZipCodeForCountry(values.zipPostCode, values.country)) {
            errors.zipPostCode = translate('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(values.country)?.samples);
        }
        return errors;
    };

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>) => {
        const {legalFirstName, legalLastName, ...personalDetails} = buildSetPersonalDetailsAndShipExpensifyCardsParams(values, countryCode);
        activatePhysicalExpensifyCard(lastFourDigits, card.cardID, personalDetails);
    };

    return (
        <ScreenWrapper
            testID="ActivatePhysicalCardPersonalDetails"
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('privatePersonalDetails.personalDetails')}
                onBackButtonPress={onBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                submitButtonText={translate('activateCardPage.activatePhysicalCard')}
                validate={validate}
                onSubmit={submit}
                style={[styles.flexGrow1, styles.mh5]}
                isLoading={card.isLoading}
                shouldHideFixErrorsAlert
            >
                {({inputValues}) => (
                    <>
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.mb5]}>{translate('activateCardPage.fillInAllDetails')}</Text>
                        <Text style={[styles.textLabelSupporting, styles.mb3]}>{translate('privatePersonalDetails.basicDetails')}</Text>
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DATE_OF_BIRTH}
                            label={translate('common.dob')}
                            placeholder={translate('common.dateFormat')}
                            defaultValue={personalDetailsValues[INPUT_IDS.DATE_OF_BIRTH]}
                            minDate={minDate}
                            maxDate={maxDate}
                            autoComplete="birthdate-full"
                        />
                        <View style={styles.formSpaceVertical} />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PHONE_NUMBER}
                            label={translate('common.phoneNumber')}
                            aria-label={translate('common.phoneNumber')}
                            role={CONST.ROLE.PRESENTATION}
                            inputMode={CONST.INPUT_MODE.TEL}
                            defaultValue={personalDetailsValues[INPUT_IDS.PHONE_NUMBER]}
                            autoComplete="tel"
                        />
                        <Text style={[styles.textLabelSupporting, styles.mt6, styles.mb3]}>{translate('privatePersonalDetails.address')}</Text>
                        <InputWrapper
                            InputComponent={AddressSearch}
                            inputID={INPUT_IDS.ADDRESS_LINE_1}
                            label={translate('common.addressLine', 1)}
                            defaultValue={street1}
                            renamedInputKeys={{
                                street: INPUT_IDS.ADDRESS_LINE_1,
                                street2: INPUT_IDS.ADDRESS_LINE_2,
                                city: INPUT_IDS.CITY,
                                state: INPUT_IDS.STATE,
                                zipCode: INPUT_IDS.ZIP_POST_CODE,
                                country: INPUT_IDS.COUNTRY,
                            }}
                            autoComplete="address-line1"
                        />
                        <View style={styles.formSpaceVertical} />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.ADDRESS_LINE_2}
                            label={translate('common.addressLine', 2)}
                            aria-label={translate('common.addressLine', 2)}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={street2}
                            spellCheck={false}
                            autoComplete="address-line2"
                        />
                        <View style={styles.formSpaceVertical} />
                        <View style={styles.mhn5}>
                            <InputWrapper
                                InputComponent={CountrySelector}
                                inputID={INPUT_IDS.COUNTRY}
                                defaultValue={country}
                            />
                        </View>
                        <View style={styles.formSpaceVertical} />
                        {inputValues.country === CONST.COUNTRY.US ? (
                            <View style={styles.mhn5}>
                                <InputWrapper
                                    InputComponent={StateSelector}
                                    inputID={INPUT_IDS.STATE}
                                    defaultValue={state}
                                />
                            </View>
                        ) : (
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.STATE}
                                label={translate('common.stateOrProvince')}
                                aria-label={translate('common.stateOrProvince')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={state}
                                spellCheck={false}
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
                            spellCheck={false}
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
                            hint={translate('common.zipCodeExampleFormat', getCountryZipRegexDetails(inputValues.country)?.samples ?? '')}
                            autoComplete="postal-code"
                        />
                        {!!cardError && (
                            <FormHelpMessage
                                isError
                                message={cardError}
                                style={styles.mt3}
                            />
                        )}
                    </>
                )}
            </FormProvider>
        </ScreenWrapper>
    );
}

export default ActivatePhysicalCardPersonalDetails;
