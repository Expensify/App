import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import React, {useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import InputWrapper from '@components/Form/InputWrapper';
import PushRowWithModal from '@components/PushRowWithModal';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressErrors = Record<keyof Address, boolean>;

type AddressFormProps = {
    /** Translate key for Street name */
    streetTranslationKey: TranslationPaths;

    /** Default values */
    defaultValues?: Address;

    /** Form values */
    values?: Address;

    /** Any errors that can arise from form validation */
    errors?: AddressErrors;

    /** The map for inputID of the inputs */
    inputKeys: Address;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** Additional styles to apply to container */
    containerStyles?: StyleProp<ViewStyle>;

    /** Indicates if country selector should be displayed */
    shouldDisplayCountrySelector?: boolean;

    /** Indicates if state selector should be displayed */
    shouldDisplayStateSelector?: boolean;

    /** Label for the state selector */
    stateSelectorLabel?: string;

    /** The title of the state selector modal */
    stateSelectorModalHeaderTitle?: string;

    /** The title of the state selector search input */
    stateSelectorSearchInputTitle?: string;

    /** Callback to be called when the country is changed */
    onCountryChange?: (country: unknown) => void;
};

const PROVINCES_LIST_OPTIONS = (Object.keys(COMMON_CONST.PROVINCES) as Array<keyof typeof COMMON_CONST.PROVINCES>).reduce((acc, key) => {
    acc[COMMON_CONST.PROVINCES[key].provinceISO] = COMMON_CONST.PROVINCES[key].provinceName;
    return acc;
}, {} as Record<string, string>);

const STATES_LIST_OPTIONS = (Object.keys(COMMON_CONST.STATES) as Array<keyof typeof COMMON_CONST.STATES>).reduce((acc, key) => {
    acc[COMMON_CONST.STATES[key].stateISO] = COMMON_CONST.STATES[key].stateName;
    return acc;
}, {} as Record<string, string>);

function AddressFormFields({
    shouldSaveDraft = false,
    defaultValues,
    values,
    errors,
    inputKeys,
    streetTranslationKey,
    containerStyles,
    shouldDisplayCountrySelector = false,
    shouldDisplayStateSelector = true,
    stateSelectorLabel,
    stateSelectorModalHeaderTitle,
    stateSelectorSearchInputTitle,
    onCountryChange,
}: AddressFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [countryInEditMode, setCountryInEditMode] = useState<string>(defaultValues?.country ?? CONST.COUNTRY.US);
    // When draft values are not being saved we need to relay on local state to determine the currently selected country
    const currentlySelectedCountry = shouldSaveDraft ? defaultValues?.country : countryInEditMode;

    const handleCountryChange = (country: unknown) => {
        if (typeof country === 'string' && country !== '') {
            setCountryInEditMode(country);
        }
        onCountryChange?.(country);
    };

    return (
        <View style={containerStyles}>
            <View>
                <InputWrapper
                    InputComponent={AddressSearch}
                    inputID={inputKeys?.street}
                    shouldSaveDraft={shouldSaveDraft}
                    label={translate(streetTranslationKey)}
                    containerStyles={styles.mt6}
                    value={values?.street}
                    defaultValue={defaultValues?.street}
                    errorText={errors?.street ? translate('bankAccount.error.addressStreet') : ''}
                    renamedInputKeys={inputKeys}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    isLimitedToUSA={!shouldDisplayCountrySelector}
                    onCountryChange={handleCountryChange}
                />
            </View>
            <InputWrapper
                InputComponent={TextInput}
                inputID={inputKeys.city ?? 'cityInput'}
                shouldSaveDraft={shouldSaveDraft}
                label={translate('common.city')}
                accessibilityLabel={translate('common.city')}
                role={CONST.ROLE.PRESENTATION}
                value={values?.city}
                defaultValue={defaultValues?.city}
                errorText={errors?.city ? translate('bankAccount.error.addressCity') : ''}
                containerStyles={styles.mt6}
            />

            {shouldDisplayStateSelector && (
                <View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={PushRowWithModal}
                        optionsList={shouldDisplayCountrySelector && currentlySelectedCountry === CONST.COUNTRY.CA ? PROVINCES_LIST_OPTIONS : STATES_LIST_OPTIONS}
                        shouldSaveDraft={shouldSaveDraft}
                        description={stateSelectorLabel ?? translate('common.state')}
                        modalHeaderTitle={stateSelectorModalHeaderTitle ?? translate('common.state')}
                        searchInputTitle={stateSelectorSearchInputTitle ?? translate('common.state')}
                        value={values?.state}
                        defaultValue={defaultValues?.state}
                        inputID={inputKeys.state ?? 'stateInput'}
                        errorText={errors?.state ? translate('bankAccount.error.addressState') : ''}
                    />
                </View>
            )}
            <InputWrapper
                InputComponent={TextInput}
                inputID={inputKeys.zipCode ?? 'zipCodeInput'}
                shouldSaveDraft={shouldSaveDraft}
                label={translate('common.zip')}
                accessibilityLabel={translate('common.zip')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                value={values?.zipCode}
                defaultValue={defaultValues?.zipCode}
                errorText={errors?.zipCode ? translate('bankAccount.error.zipCode') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
                containerStyles={styles.mt3}
            />
            {shouldDisplayCountrySelector && (
                <View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={PushRowWithModal}
                        inputID={inputKeys?.country ?? 'country'}
                        shouldSaveDraft={shouldSaveDraft}
                        optionsList={CONST.ALL_COUNTRIES}
                        description={translate('common.country')}
                        modalHeaderTitle={translate('countryStep.selectCountry')}
                        searchInputTitle={translate('countryStep.findCountry')}
                        value={values?.country}
                        onValueChange={handleCountryChange}
                        stateInputIDToReset={inputKeys.state ?? 'stateInput'}
                    />
                </View>
            )}
        </View>
    );
}

AddressFormFields.displayName = 'AddressFormFields';

export default AddressFormFields;
