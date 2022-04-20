import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../../components/TextInput';
import AddressSearch from '../../components/AddressSearch';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import StatePicker from '../../components/StatePicker';
import Text from '../../components/Text';

const propTypes = {

    /** Translate key for Street name */
    streetTranslationKey: PropTypes.string.isRequired,

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange: PropTypes.func.isRequired,

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
    errors: {},
};

const AddressForm = props => (
    <>
        <AddressSearch
            label={props.translate(props.streetTranslationKey)}
            containerStyles={[styles.mt4]}
            value={props.values.street}
            onInputChange={props.onFieldChange}
            errorText={props.errors.street ? props.translate('bankAccount.error.addressStreet') : ''}
        />
        <Text style={[styles.mutedTextLabel, styles.mt1]}>{props.translate('common.noPO')}</Text>
        <View style={[styles.flexRow, styles.mt4]}>
            <View style={[styles.flex2, styles.mr2]}>
                <TextInput
                    label={props.translate('common.city')}
                    value={props.values.city}
                    onChangeText={value => props.onFieldChange({city: value})}
                    errorText={props.errors.city ? props.translate('bankAccount.error.addressCity') : ''}
                />
            </View>
            <View style={[styles.flex1]}>
                <StatePicker
                    value={props.values.state}
                    onChange={value => props.onFieldChange({state: value})}
                    errorText={props.errors.state ? props.translate('bankAccount.error.addressState') : ''}
                    hasError={Boolean(props.errors.state)}
                />
            </View>
        </View>
        <TextInput
            label={props.translate('common.zip')}
            containerStyles={[styles.mt4]}
            keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
            value={props.values.zipCode}
            onChangeText={value => props.onFieldChange({zipCode: value})}
            errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
        />
    </>
);

AddressForm.propTypes = propTypes;
AddressForm.defaultProps = defaultProps;
AddressForm.displayName = 'AddressForm';
export default withLocalize(AddressForm);
