import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../../components/TextInput';
import AddressSearch from '../../components/AddressSearch';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import StatePicker from '../../components/StatePicker';

const propTypes = {

    /** Translate key for Street name */
    streetTranslationKey: PropTypes.string.isRequired,

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange: PropTypes.func.isRequired,

    /** Form values */
    values: PropTypes.shape({
        /** Address street field */
        addressStreet: PropTypes.string,

        /** Address city field */
        addressCity: PropTypes.string,

        /** Address state field */
        addressState: PropTypes.string,

        /** Address zip code field */
        addressZipCode: PropTypes.string,
    }),

    /** Form input keys */
    values: PropTypes.shape({
        /** Address street field */
        addressStreet: PropTypes.string,

        /** Address city field */
        addressCity: PropTypes.string,

        /** Address state field */
        addressState: PropTypes.string,

        /** Address zip code field */
        addressZipCode: PropTypes.string,
    }),

    /** Any errors that can arise from form validation */
    errors: PropTypes.objectOf(PropTypes.bool),

    ...withLocalizePropTypes,
};

const defaultProps = {
    values: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
    },
    inputKeys: {
        addressStreet: 'addressStreet',
        addressCity: 'addressCity',
        addressState: 'addressState',
        addressZipCode: 'addressZipCode',
    },
    errors: {},
};

const AddressForm = props => (
    <>
        <AddressSearch
            label={props.translate(props.streetTranslationKey)}
            containerStyles={[styles.mt4]}
            value={props.values.addressStreet}
            onInputChange={(value, key) => props.onFieldChange(value, key)}
            errorText={props.errors.street ? props.translate('bankAccount.error.addressStreet') : ''}
            hint={props.translate('common.noPO')}
            streetInputKey={props.inputKeys.addressStreet}
        />
        <View style={[styles.flexRow, styles.mt4]}>
            <View style={[styles.flex2, styles.mr2]}>
                <TextInput
                    label={props.translate('common.city')}
                    value={props.values.addressCity}
                    onChangeText={value => props.onFieldChange(value, props.addressCity)}
                    errorText={props.errors.city ? props.translate('bankAccount.error.addressCity') : ''}
                />
            </View>
            <View style={[styles.flex1]}>
                <StatePicker
                    value={props.values.addressState}
                    onInputChange={value => props.onFieldChange(value, props.addressState)}
                    errorText={props.errors.state ? props.translate('bankAccount.error.addressState') : ''}
                />
            </View>
        </View>
        <TextInput
            label={props.translate('common.zip')}
            containerStyles={[styles.mt4]}
            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
            value={props.values.addressZipCode}
            onChangeText={value => props.onFieldChange(value, props.addressZipCode)}
            errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
        />
    </>
);

AddressForm.propTypes = propTypes;
AddressForm.defaultProps = defaultProps;
AddressForm.displayName = 'AddressForm';
export default withLocalize(AddressForm);
