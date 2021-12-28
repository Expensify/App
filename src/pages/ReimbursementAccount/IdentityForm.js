import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import AddressSearch from '../../components/AddressSearch';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import CONST from '../../CONST';
import DatePicker from '../../components/DatePicker';
import TextLink from '../../components/TextLink';
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

        /** Whether the address pieces should be entered manually */
        manualAddress: PropTypes.bool,
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
        manualAddress: false,
    },
    errors: {},
};


const IdentityForm = (props) => {
    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (props.errors.dob ? props.translate('bankAccount.error.dob') : '')
        || (props.errors.dobAge ? props.translate('bankAccount.error.age') : '');

    const getFormattedAddressValue = () => {
        let addressString = '';
        if (props.values.street) {
            addressString += `${props.values.street}, `;
        }
        if (props.values.city) {
            addressString += `${props.values.city}, `;
        }
        if (props.values.state) {
            addressString += `${props.values.state}, `;
        }
        if (props.values.zipCode) {
            addressString += `${props.values.zipCode}`;
        }
        return addressString;
    };

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
            {props.values.manualAddress ? (
                <>
                    <ExpensiTextInput
                        label={props.translate('common.personalAddress')}
                        containerStyles={[styles.mt4]}
                        value={props.values.street}
                        onChangeText={value => props.onFieldChange('addressStreet', value)}
                        errorText={props.errors.street ? props.translate('bankAccount.error.address') : ''}
                    />
                    <ExpensifyText style={[styles.mutedTextLabel, styles.mt1]}>{props.translate('common.noPO')}</ExpensifyText>
                    <View style={[styles.flexRow, styles.mt4]}>
                        <View style={[styles.flex2, styles.mr2]}>
                            <ExpensiTextInput
                                label={props.translate('common.city')}
                                value={props.values.city}
                                onChangeText={value => props.onFieldChange('addressCity', value)}
                                errorText={props.errors.city ? props.translate('bankAccount.error.addressCity') : ''}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <StatePicker
                                value={props.values.state}
                                onChange={value => props.onFieldChange('addressState', value)}
                                errorText={props.errors.state ? props.translate('bankAccount.error.addressState') : ''}
                                hasError={Boolean(props.errors.state)}
                            />
                        </View>
                    </View>
                    <ExpensiTextInput
                        label={props.translate('common.zip')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        value={props.values.zipCode}
                        onChangeText={value => props.onFieldChange('addressZipCode', value)}
                        errorText={props.errors.zipCode ? props.translate('bankAccount.error.zipCode') : ''}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    />
                </>
            ) : (
                <>
                    <AddressSearch
                        label={props.translate('common.personalAddress')}
                        containerStyles={[styles.mt4]}
                        value={getFormattedAddressValue()}
                        onChangeText={(fieldName, value) => props.onFieldChange(fieldName, value)}
                        errorText={props.errors.street ? props.translate('bankAccount.error.addressStreet') : ''}
                    />
                    <ExpensifyText
                        style={[styles.textMicroSupporting, styles.pt2]}
                    >
                        {props.translate('common.cantFindAddress')}
                        <TextLink
                            style={[styles.textMicro]}
                            onPress={() => props.onFieldChange('manualAddress', true)}
                        >
                            {props.translate('common.enterManually')}
                        </TextLink>
                    </ExpensifyText>
                </>
            )}
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default withLocalize(IdentityForm);
