import {useRoute} from '@react-navigation/native';
import {subYears} from 'date-fns';
import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import CountrySelector from '@components/CountrySelector';
import DatePicker from '@components/DatePicker';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {State} from '@components/StateSelector';
import StateSelector from '@components/StateSelector';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearDraftValues} from '@libs/actions/FormActions';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {appendCountryCode} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';
import {doesContainReservedWord, getAgeRequirementError, isRequiredFulfilled, isValidDisplayName, isValidPhoneNumber} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

function PrivatePersonalDetailsPage() {
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.PRIVATE_PERSONAL_DETAILS>>();
    const fieldToFocus = route.params?.fieldToFocus;
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const legalFirstName = privatePersonalDetails?.legalFirstName ?? '';
    const legalLastName = privatePersonalDetails?.legalLastName ?? '';
    const phoneNumber = privatePersonalDetails?.phoneNumber ?? '';
    const dob = privatePersonalDetails?.dob ?? '';
    const address = normalizeCountryCode(getCurrentAddress(privatePersonalDetails)) as Address | undefined;
    const [street1, street2Fallback] = getStreetLines(address?.street);
    const initialStreet1 = street1 ?? '';
    const initialStreet2 = address?.street2 ?? street2Fallback ?? '';
    const city = address?.city ?? '';
    const state = address?.state ?? '';
    const zip = address?.zip ?? '';
    const country = address?.country ?? '';

    const [selectedCountry, setSelectedCountry] = useState<Country | ''>(country);
    const [selectedState, setSelectedState] = useState(() => {
        // If the stored state value is a full name (e.g. "California"), resolve it to a 2-letter code
        // so the StateSelector dropdown can display it correctly.
        if (state && !(state in COMMON_CONST.STATES)) {
            const match = Object.entries(COMMON_CONST.STATES).find(([, v]) => v.stateName.toLowerCase() === state.toLowerCase());
            return match ? match[0] : state;
        }
        return state;
    });

    useEffect(
        () => () => {
            clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        },
        [],
    );

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};

        const firstNameValue = values[INPUT_IDS.LEGAL_FIRST_NAME] ?? '';
        if (!firstNameValue.trim()) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.fieldRequired');
        } else if (!isValidDisplayName(firstNameValue)) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon');
        } else if (firstNameValue.length > CONST.LEGAL_NAME.MAX_LENGTH) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('common.error.characterLimitExceedCounter', firstNameValue.length, CONST.LEGAL_NAME.MAX_LENGTH);
        } else if (doesContainReservedWord(firstNameValue, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            errors[INPUT_IDS.LEGAL_FIRST_NAME] = translate('personalDetails.error.containsReservedWord');
        }

        const lastNameValue = values[INPUT_IDS.LEGAL_LAST_NAME] ?? '';
        if (!lastNameValue.trim()) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.fieldRequired');
        } else if (!isValidDisplayName(lastNameValue)) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon');
        } else if (lastNameValue.length > CONST.LEGAL_NAME.MAX_LENGTH) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('common.error.characterLimitExceedCounter', lastNameValue.length, CONST.LEGAL_NAME.MAX_LENGTH);
        } else if (doesContainReservedWord(lastNameValue, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            errors[INPUT_IDS.LEGAL_LAST_NAME] = translate('personalDetails.error.containsReservedWord');
        }

        const dobValue = values[INPUT_IDS.DATE_OF_BIRTH] ?? '';
        if (!dobValue) {
            errors[INPUT_IDS.DATE_OF_BIRTH] = translate('common.error.fieldRequired');
        } else {
            const dateError = getAgeRequirementError(translate, dobValue, CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT, CONST.DATE_BIRTH.MAX_AGE);
            if (dateError) {
                errors[INPUT_IDS.DATE_OF_BIRTH] = dateError;
            }
        }

        const phoneValue = values[INPUT_IDS.PHONE_NUMBER] ?? '';
        if (!isRequiredFulfilled(phoneValue)) {
            errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
        } else {
            const phoneWithCountryCode = appendCountryCode(phoneValue, countryCode);
            if (!isValidPhoneNumber(phoneWithCountryCode)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.phoneNumber');
            }
        }

        const streetValue = values[INPUT_IDS.ADDRESS_LINE_1] ?? '';
        if (!streetValue.trim()) {
            errors[INPUT_IDS.ADDRESS_LINE_1] = translate('common.error.fieldRequired');
        }

        const cityValue = values[INPUT_IDS.CITY] ?? '';
        if (!cityValue.trim()) {
            errors[INPUT_IDS.CITY] = translate('common.error.fieldRequired');
        }

        const stateValue = values[INPUT_IDS.STATE] || selectedState || '';
        const effectiveCountry = (values[INPUT_IDS.COUNTRY] || selectedCountry) ?? '';
        if (!stateValue.trim()) {
            errors[INPUT_IDS.STATE] = translate('common.error.fieldRequired');
        }

        const zipValue = values[INPUT_IDS.ZIP_POST_CODE] ?? '';
        const countryRegexDetails = effectiveCountry ? (CONST.COUNTRY_ZIP_REGEX_DATA?.[effectiveCountry] as {regex?: RegExp; samples?: string}) : undefined;
        const countrySpecificZipRegex = countryRegexDetails?.regex;
        if (countrySpecificZipRegex) {
            if (!countrySpecificZipRegex.test(zipValue.trim().toUpperCase())) {
                if (isRequiredFulfilled(zipValue.trim())) {
                    errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat', countryRegexDetails?.samples ?? '');
                } else {
                    errors[INPUT_IDS.ZIP_POST_CODE] = translate('common.error.fieldRequired');
                }
            }
        } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(zipValue.trim().toUpperCase())) {
            errors[INPUT_IDS.ZIP_POST_CODE] = translate('privatePersonalDetails.error.incorrectZipFormat');
        }

        if (!effectiveCountry) {
            errors[INPUT_IDS.COUNTRY] = translate('common.error.fieldRequired');
        }

        return errors;
    };

    const hasChanges = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): boolean => {
        if ((values[INPUT_IDS.LEGAL_FIRST_NAME] ?? '') !== legalFirstName) {
            return true;
        }
        if ((values[INPUT_IDS.LEGAL_LAST_NAME] ?? '') !== legalLastName) {
            return true;
        }
        if ((values[INPUT_IDS.DATE_OF_BIRTH] ?? '') !== dob) {
            return true;
        }
        if ((values[INPUT_IDS.PHONE_NUMBER] ?? '') !== phoneNumber) {
            return true;
        }
        if ((values[INPUT_IDS.ADDRESS_LINE_1] ?? '') !== initialStreet1) {
            return true;
        }
        if ((values[INPUT_IDS.ADDRESS_LINE_2] ?? '') !== initialStreet2) {
            return true;
        }
        if ((values[INPUT_IDS.CITY] ?? '') !== city) {
            return true;
        }
        if ((values[INPUT_IDS.STATE] ?? '') !== state) {
            return true;
        }
        if ((values[INPUT_IDS.ZIP_POST_CODE] ?? '') !== zip) {
            return true;
        }
        if ((values[INPUT_IDS.COUNTRY] ?? '') !== country) {
            return true;
        }
        return false;
    };

    const onSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>) => {
        if (!hasChanges(values)) {
            Navigation.goBack();
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE);
    };

    const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'PrivatePersonalDetailsPage', isLoadingApp};

    if (isLoadingApp) {
        return (
            <FullScreenLoadingIndicator
                reasonAttributes={reasonAttributes}
                shouldUseGoBackButton
            />
        );
    }

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="PrivatePersonalDetailsPage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('privatePersonalDetails.personalDetails')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                    validate={validate}
                    onSubmit={onSubmit}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('privatePersonalDetails.basicDetails')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LEGAL_FIRST_NAME}
                            label={translate('privatePersonalDetails.legalFirstName')}
                            aria-label={translate('privatePersonalDetails.legalFirstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalFirstName}
                            shouldSaveDraft
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="given-name"
                            autoFocus={fieldToFocus === INPUT_IDS.LEGAL_FIRST_NAME}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LEGAL_LAST_NAME}
                            label={translate('privatePersonalDetails.legalLastName')}
                            aria-label={translate('privatePersonalDetails.legalLastName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={legalLastName}
                            shouldSaveDraft
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="family-name"
                            autoFocus={fieldToFocus === INPUT_IDS.LEGAL_LAST_NAME}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={DatePicker}
                            inputID={INPUT_IDS.DATE_OF_BIRTH}
                            label={translate('common.date')}
                            defaultValue={dob}
                            shouldSaveDraft
                            minDate={subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE)}
                            maxDate={subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT)}
                            autoComplete="birthdate-full"
                            autoFocus={fieldToFocus === INPUT_IDS.DATE_OF_BIRTH}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PHONE_NUMBER}
                            label={translate('common.phoneNumber')}
                            aria-label={translate('common.phoneNumber')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={phoneNumber}
                            shouldSaveDraft
                            spellCheck={false}
                            inputMode={CONST.INPUT_MODE.TEL}
                            autoComplete="tel"
                            autoFocus={fieldToFocus === INPUT_IDS.PHONE_NUMBER}
                        />
                    </View>
                    <Text style={[styles.textStrong, styles.mb2]}>{translate('privatePersonalDetails.address')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.ADDRESS_LINE_1}
                            label={translate('common.addressLine', 1)}
                            aria-label={translate('common.addressLine', 1)}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={initialStreet1}
                            shouldSaveDraft
                            spellCheck={false}
                            autoComplete="address-line1"
                            autoFocus={fieldToFocus === INPUT_IDS.ADDRESS_LINE_1}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.ADDRESS_LINE_2}
                            label={translate('common.addressLine', 2)}
                            aria-label={translate('common.addressLine', 2)}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={initialStreet2}
                            shouldSaveDraft
                            spellCheck={false}
                            autoComplete="address-line2"
                        />
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.CITY}
                            label={translate('common.city')}
                            aria-label={translate('common.city')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={city}
                            shouldSaveDraft
                            spellCheck={false}
                            autoComplete="street-address"
                        />
                    </View>
                    {selectedCountry === CONST.COUNTRY.US ? (
                        <View style={[styles.mhn5, styles.mb4]}>
                            <InputWrapper
                                InputComponent={StateSelector}
                                inputID={INPUT_IDS.STATE}
                                value={selectedState as State}
                                onValueChange={(value: unknown) => setSelectedState((value ?? '') as string)}
                                shouldSaveDraft
                            />
                        </View>
                    ) : (
                        <View style={styles.mb4}>
                            <InputWrapper
                                InputComponent={TextInput}
                                inputID={INPUT_IDS.STATE}
                                label={translate('common.stateOrProvince')}
                                aria-label={translate('common.stateOrProvince')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={state}
                                shouldSaveDraft
                                spellCheck={false}
                            />
                        </View>
                    )}
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.ZIP_POST_CODE}
                            label={translate('common.zipPostCode')}
                            aria-label={translate('common.zipPostCode')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={zip}
                            shouldSaveDraft
                            spellCheck={false}
                            autoComplete="postal-code"
                        />
                    </View>
                    <View style={styles.mhn5}>
                        <InputWrapper
                            InputComponent={CountrySelector}
                            inputID={INPUT_IDS.COUNTRY}
                            value={selectedCountry}
                            onValueChange={(value: unknown) => {
                                const newCountry = (value ?? '') as Country | '';
                                setSelectedCountry(newCountry);
                                if (newCountry === CONST.COUNTRY.US && selectedState && !(selectedState in COMMON_CONST.STATES)) {
                                    const match = Object.entries(COMMON_CONST.STATES).find(([, v]) => v.stateName.toLowerCase() === selectedState.toLowerCase());
                                    if (match) {
                                        setSelectedState(match[0]);
                                    }
                                }
                            }}
                            shouldSaveDraft
                        />
                    </View>
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

PrivatePersonalDetailsPage.displayName = 'PrivatePersonalDetailsPage';

export default PrivatePersonalDetailsPage;
