import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import DatePicker from '../../components/DatePicker';
import AddressForm from './AddressForm';

const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Callback fired when a field changes. Passes args as {[fieldName]: val} */
    onFieldChange: PropTypes.func.isRequired,

    /** Form values */
    values: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        street: PropTypes.string,

        /** Address city field */
        city: PropTypes.string,

        /** Address state field */
        state: PropTypes.string,

        /** Address zip code field */
        zipCode: PropTypes.string,

        /** Date of birth field */
        dob: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),

        /** Last 4 digits of SSN */
        ssnLast4: PropTypes.string,
    }),

    /** Any errors that can arise from form validation */
    errors: PropTypes.objectOf(PropTypes.bool),

    ...withLocalizePropTypes,
};

const defaultProps = {
    style: {},
    values: {
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        dob: '',
        ssnLast4: '',
    },
    errors: {},
};

const IdentityForm = (props) => {
    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (props.errors.dob ? props.translate('bankAccount.error.dob') : '')
        || (props.errors.dobAge ? props.translate('bankAccount.error.age') : '');

    return (
        <View style={props.style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <TextInput
                        label={`${props.translate('common.firstName')}`}
                        value={props.values.firstName}
                        onChangeText={value => props.onFieldChange({firstName: value})}
                        errorText={props.errors.firstName ? props.translate('bankAccount.error.firstName') : ''}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <TextInput
                        label={`${props.translate('common.lastName')}`}
                        value={props.values.lastName}
                        onChangeText={value => props.onFieldChange({lastName: value})}
                        errorText={props.errors.lastName ? props.translate('bankAccount.error.lastName') : ''}
                    />
                </View>
            </View>
            <DatePicker
                label={`${props.translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={props.translate('common.dateFormat')}
                value={props.values.dob}
                onChange={value => props.onFieldChange({dob: value})}
                errorText={dobErrorText}
            />
            <TextInput
                label={`${props.translate('common.ssnLast4')}`}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                value={props.values.ssnLast4}
                onChangeText={value => props.onFieldChange({ssnLast4: value})}
                errorText={props.errors.ssnLast4 ? props.translate('bankAccount.error.ssnLast4') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            <AddressForm
                streetTranslationKey="common.personalAddress"
                values={props.values}
                errors={props.errors}
                onFieldChange={props.onFieldChange}
            />
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default withLocalize(IdentityForm);
