import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../../components/TextInput';
import AddressSearch from '../../components/AddressSearch';
import styles from '../../styles/styles';
import CONST from '../../CONST';
import StatePicker from '../../components/StatePicker';

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
    return (
        <>
            <View>
                <AddressSearch
                    inputID={props.inputKeys.street}
                    shouldSaveDraft={props.shouldSaveDraft}
                    label={props.translate(props.streetTranslationKey)}
                    containerStyles={[styles.mt4]}
                    value={props.values.street}
                    defaultValue={props.defaultValues.street}
                    onInputChange={props.onFieldChange}
                    errorText={props.errors.street ? props.translate('bankAccount.error.addressStreet') : ''}
                    hint={props.translate('common.noPO')}
                    renamedInputKeys={props.inputKeys}
                    maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                />
            </View>
            <TextInput
                inputID={props.inputKeys.city}
                shouldSaveDraft={props.shouldSaveDraft}
                label={props.translate('common.city')}
                accessibilityLabel={props.translate('common.city')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                value={props.values.city}
                defaultValue={props.defaultValues.city}
                onChangeText={(value) => props.onFieldChange({city: value})}
                errorText={props.errors.city ? props.translate('bankAccount.error.addressCity') : ''}
                containerStyles={[styles.mt4]}
            />

            <View style={[styles.mt4, styles.mhn5]}>
                <StatePicker
                    inputID={props.inputKeys.state}
                    shouldSaveDraft={props.shouldSaveDraft}
                    value={props.values.state}
                    defaultValue={props.defaultValues.state || ''}
                    onInputChange={(value) => props.onFieldChange({state: value})}
                    errorText={props.errors.state ? props.translate('bankAccount.error.addressState') : ''}
                />
            </View>
            <TextInput
                inputID={props.inputKeys.zipCode}
                shouldSaveDraft={props.shouldSaveDraft}
                label={props.translate('common.zip')}
                accessibilityLabel={props.translate('common.zip')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                value={props.values.zipCode}
                defaultValue={props.defaultValues.zipCode}
                onChangeText={(value) => props.onFieldChange({zipCode: value})}
                errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                hint={props.translate('common.zipCodeExampleFormat', {zipSampleFormat: CONST.COUNTRY_ZIP_REGEX_DATA.US.samples})}
            />
        </>
    );
}

AddressForm.propTypes = propTypes;
AddressForm.defaultProps = defaultProps;
AddressForm.displayName = 'AddressForm';
export default AddressForm;
