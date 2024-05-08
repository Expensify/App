import React from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import InputWrapper from '@components/Form/InputWrapper';
import type {State} from '@components/StateSelector';
import StateSelector from '@components/StateSelector';
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
};

function AddressFormFields({shouldSaveDraft = false, defaultValues, values, errors, inputKeys, onFieldChange, streetTranslationKey}: AddressFormProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    return (
        <>
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
                    errorText={errors?.street ? 'bankAccount.error.addressStreet' : ''}
                    renamedInputKeys={inputKeys}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    isLimitedToUSA
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
                errorText={errors?.city ? 'bankAccount.error.addressCity' : ''}
                containerStyles={styles.mt6}
            />

            <View style={[styles.mt3, styles.mhn5]}>
                <InputWrapper
                    InputComponent={StateSelector}
                    inputID={inputKeys.state ?? 'stateInput'}
                    shouldSaveDraft={shouldSaveDraft}
                    value={values?.state as State}
                    defaultValue={defaultValues?.state}
                    onInputChange={(value) => onFieldChange?.({state: value})}
                    errorText={errors?.state ? 'bankAccount.error.addressState' : ''}
                />
            </View>
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
                errorText={errors?.zipCode ? 'bankAccount.error.zipCode' : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={['common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}]}
                containerStyles={styles.mt3}
            />
        </>
    );
}

AddressFormFields.displayName = 'AddressFormFields';

export default AddressFormFields;
