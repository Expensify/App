import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import AddressSearch from '@components/AddressSearch';
import InputWrapper from '@components/Form/InputWrapper';
import StatePicker from '@components/StatePicker';
import TextInput from '@components/TextInput';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Translate key for Street name */
    streetTranslationKey: PropTypes.string.isRequired,

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange: PropTypes.func,

    /** Default values */
    defaultValues: PropTypes.shape({
        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,
    }),

    /** Form values */
    values: PropTypes.shape({
        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,
    }),

    /** Any errors that can arise from form validation */
    errors: PropTypes.shape({
        street: PropTypes.bool,
        city: PropTypes.bool,
        state: PropTypes.bool,
        zipCode: PropTypes.bool,
    }),

    /** The map for inputID of the inputs */
    inputKeys: PropTypes.shape({
        street: PropTypes.string,
        city: PropTypes.string,
        state: PropTypes.string,
        zipCode: PropTypes.string,
    }),

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft: PropTypes.bool,

    /** Returns translated string for given locale and phrase */
    translate: PropTypes.func.isRequired,
};

const defaultProps = {
    values: {
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
    },
    defaultValues: {
        street: undefined,
        city: undefined,
        state: undefined,
        zipCode: undefined,
    },
    errors: {},
    inputKeys: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
    },
    shouldSaveDraft: false,
    onFieldChange: () => {},
};

function AddressForm(props) {
    const styles = useThemeStyles();
    return (
        <>
            <View>
                <InputWrapper
                    InputComponent={AddressSearch}
                    inputID={props.inputKeys.street}
                    shouldSaveDraft={props.shouldSaveDraft}
                    label={props.translate(props.streetTranslationKey)}
                    containerStyles={[styles.mt6]}
                    value={props.values.street}
                    defaultValue={props.defaultValues.street}
                    onInputChange={props.onFieldChange}
                    errorText={props.errors.street ? 'bankAccount.error.addressStreet' : ''}
                    renamedInputKeys={props.inputKeys}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                    isLimitedToUSA
                />
            </View>
            <InputWrapper
                InputComponent={TextInput}
                inputID={props.inputKeys.city}
                shouldSaveDraft={props.shouldSaveDraft}
                label={props.translate('common.city')}
                accessibilityLabel={props.translate('common.city')}
                role={CONST.ROLE.PRESENTATION}
                value={props.values.city}
                defaultValue={props.defaultValues.city}
                onChangeText={(value) => props.onFieldChange({city: value})}
                errorText={props.errors.city ? 'bankAccount.error.addressCity' : ''}
                containerStyles={[styles.mt6]}
            />

            <View style={[styles.mt3, styles.mhn5]}>
                <InputWrapper
                    InputComponent={StatePicker}
                    inputID={props.inputKeys.state}
                    shouldSaveDraft={props.shouldSaveDraft}
                    value={props.values.state}
                    defaultValue={props.defaultValues.state || ''}
                    onInputChange={(value) => props.onFieldChange({state: value})}
                    errorText={props.errors.state ? 'bankAccount.error.addressState' : ''}
                />
            </View>
            <InputWrapper
                InputComponent={TextInput}
                inputID={props.inputKeys.zipCode}
                shouldSaveDraft={props.shouldSaveDraft}
                label={props.translate('common.zip')}
                accessibilityLabel={props.translate('common.zip')}
                role={CONST.ROLE.PRESENTATION}
                inputMode={CONST.INPUT_MODE.NUMERIC}
                value={props.values.zipCode}
                defaultValue={props.defaultValues.zipCode}
                onChangeText={(value) => props.onFieldChange({zipCode: value})}
                errorText={props.errors.zipCode ? 'bankAccount.error.zipCode' : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={['common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}]}
                containerStyles={[styles.mt3]}
            />
        </>
    );
}

AddressForm.propTypes = propTypes;
AddressForm.defaultProps = defaultProps;
AddressForm.displayName = 'AddressForm';
export default AddressForm;
