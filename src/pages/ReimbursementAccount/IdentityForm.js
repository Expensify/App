import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import AddressSearch from '../../components/AddressSearch';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import DatePicker from '../../components/DatePicker';
import StatePicker from '../../components/StatePicker';
import ExpensifyText from '../../components/ExpensifyText';


const propTypes = {
    /** Style for wrapping View */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Callback fired when a field changes. Passes args as fieldName, val */
    onFieldChange: PropTypes.func.isRequired,

    /** Form values */
    values: PropTypes.shape({
        /** First name field */
        firstName: PropTypes.string,

        /** Last name field */
        lastName: PropTypes.string,

        /** Address street field */
        addressStreet: PropTypes.string,

        /** Address city field */
        addressCity: PropTypes.string,

        /** Address state field */
        addressState: PropTypes.string,

        /** Address zip code field */
        addressZipCode: PropTypes.string,

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
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZipCode: '',
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
                    <ExpensiTextInput
                        label={`${props.translate('common.firstName')}`}
                        value={props.values.firstName}
                        onChangeText={value => props.onFieldChange('firstName', value)}
                        errorText={props.errors.firstName ? props.translate('bankAccount.error.firstName') : ''}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <ExpensiTextInput
                        label={`${props.translate('common.lastName')}`}
                        value={props.values.lastName}
                        onChangeText={value => props.onFieldChange('lastName', value)}
                        errorText={props.errors.lastName ? props.translate('bankAccount.error.lastName') : ''}
                    />
                </View>
            </View>
            <DatePicker
                label={`${props.translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={props.translate('common.dateFormat')}
                value={props.values.dob}
                onChange={value => props.onFieldChange('dob', value)}
                errorText={dobErrorText}
            />
            <ExpensiTextInput
                label={`${props.translate('common.ssnLast4')}`}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                value={props.values.ssnLast4}
                onChangeText={value => props.onFieldChange('ssnLast4', value)}
                errorText={props.errors.ssnLast4 ? props.translate('bankAccount.error.ssnLast4') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            <AddressSearch
                label={props.translate('common.personalAddress')}
                containerStyles={[styles.mt4]}
                value={props.values.addressStreet}
                onChange={props.onFieldChange}
                errorText={props.errors.addressStreet ? props.translate('bankAccount.error.addressStreet') : ''}
            />
            <ExpensifyText style={[styles.mutedTextLabel, styles.mt1]}>{props.translate('common.noPO')}</ExpensifyText>
            <View style={[styles.flexRow, styles.mt4]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <ExpensiTextInput
                        label={props.translate('common.city')}
                        value={props.values.addressCity}
                        onChangeText={value => props.onFieldChange('addressCity', value)}
                        errorText={props.errors.addressCity ? props.translate('bankAccount.error.addressCity') : ''}
                    />
                </View>
                <View style={[styles.flex1]}>
                    <StatePicker
                        value={props.values.addressState}
                        onChange={value => props.onFieldChange('addressState', value)}
                        errorText={props.errors.addressState ? props.translate('bankAccount.error.addressState') : ''}
                        hasError={Boolean(props.errors.addressState)}
                    />
                </View>
            </View>
            <ExpensiTextInput
                label={props.translate('common.zip')}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                value={props.values.addressZipCode}
                onChangeText={value => props.onFieldChange('addressZipCode', value)}
                errorText={props.errors.addressZipCode ? props.translate('bankAccount.error.zipCode') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
            />
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default withLocalize(IdentityForm);
