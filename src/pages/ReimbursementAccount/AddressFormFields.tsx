import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import React from 'react';
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

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange?: <T>(value: T) => void;

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
    onFieldChange,
    streetTranslationKey,
    containerStyles,
    shouldDisplayCountrySelector = false,
    shouldDisplayStateSelector = true,
    stateSelectorLabel,
    stateSelectorModalHeaderTitle,
    stateSelectorSearchInputTitle,
}: AddressFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
                    onInputChange={onFieldChange}
                    errorText={errors?.street ? translate('bankAccount.error.addressStreet') : ''}
                    renamedInputKeys={inputKeys}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    isLimitedToUSA={!shouldDisplayCountrySelector}
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
                onChangeText={(value) => onFieldChange?.({city: value})}
                errorText={errors?.city ? translate('bankAccount.error.addressCity') : ''}
                containerStyles={styles.mt6}
            />
            {shouldDisplayStateSelector && (
                <View style={[styles.mt3, styles.mhn5]}>
                    <InputWrapper
                        InputComponent={PushRowWithModal}
                        optionsList={shouldDisplayCountrySelector && defaultValues?.country === CONST.COUNTRY.US ? STATES_LIST_OPTIONS : PROVINCES_LIST_OPTIONS}
                        selectedOption={defaultValues?.state ?? ''}
                        onOptionChange={(value) => {
                            onFieldChange?.({state: value});
                        }}
                        shouldSaveDraft={shouldSaveDraft}
                        description={stateSelectorLabel ?? translate('common.state')}
                        modalHeaderTitle={stateSelectorModalHeaderTitle ?? translate('common.state')}
                        searchInputTitle={stateSelectorSearchInputTitle ?? translate('common.state')}
                        value={values?.state}
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
                onChangeText={(value) => onFieldChange?.({zipCode: value})}
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
                        selectedOption={defaultValues?.country ?? ''}
                        onOptionChange={(value) => onFieldChange?.({[inputKeys?.country ?? 'country']: value})}
                        description={translate('common.country')}
                        modalHeaderTitle={translate('countryStep.selectCountry')}
                        searchInputTitle={translate('countryStep.findCountry')}
                        value={values?.country}
                        defaultValue={defaultValues?.country}
                    />
                </View>
            )}
        </View>
    );
}

AddressFormFields.displayName = 'AddressFormFields';

export default AddressFormFields;
