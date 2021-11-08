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
import Text from '../../components/Text';


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


const IdentityForm = ({
    translate, values, onFieldChange, style, errors,
}) => {
    const {
        firstName, lastName, street, city, state, zipCode, dob, ssnLast4, manualAddress,
    } = values;

    // dob field has multiple validations/errors, we are handling it temporarily like this.
    const dobErrorText = (errors.dob ? translate('bankAccount.error.dob') : '')
        || (errors.dobAge ? translate('bankAccount.error.age') : '');

    const getFormattedAddressValue = () => {
        let addressString = '';
        if (street) {
            addressString += `${street}, `;
        }
        if (city) {
            addressString += `${city}, `;
        }
        if (state) {
            addressString += `${state}, `;
        }
        if (zipCode) {
            addressString += `${zipCode}`;
        }
        return addressString;
    };

    return (
        <View style={style}>
            <View style={[styles.flexRow]}>
                <View style={[styles.flex2, styles.mr2]}>
                    <ExpensiTextInput
                        label={`${translate('common.firstName')}`}
                        value={firstName}
                        onChangeText={value => onFieldChange('firstName', value)}
                        errorText={errors.firstName ? translate('bankAccount.error.firstName') : ''}
                        translateX={-10}
                    />
                </View>
                <View style={[styles.flex2]}>
                    <ExpensiTextInput
                        label={`${translate('common.lastName')}`}
                        value={lastName}
                        onChangeText={value => onFieldChange('lastName', value)}
                        errorText={errors.lastName ? translate('bankAccount.error.lastName') : ''}
                        translateX={-10}
                    />
                </View>
            </View>
            <DatePicker
                label={`${translate('common.dob')}`}
                containerStyles={[styles.mt4]}
                placeholder={translate('common.dateFormat')}
                value={dob}
                onChange={value => onFieldChange('dob', value)}
                errorText={dobErrorText}
            />
            <ExpensiTextInput
                label={`${translate('common.ssnLast4')}`}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                value={ssnLast4}
                onChangeText={value => onFieldChange('ssnLast4', value)}
                errorText={errors.ssnLast4 ? translate('bankAccount.error.ssnLast4') : ''}
                maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
            />
            {!manualAddress && (
                <div>
                    <AddressSearch
                        label={translate('common.personalAddress')}
                        containerStyles={[styles.mt4]}
                        value={getFormattedAddressValue()}
                        onChangeText={(fieldName, value) => onFieldChange(fieldName, value)}
                        errorText={errors.street ? translate('bankAccount.error.addressStreet') : ''}
                    />
                    <TextLink
                        style={[styles.textMicro]}
                        onPress={() => onFieldChange('manualAddress', true)}
                    >
                        Can&apos;t find your address? Enter it manually
                    </TextLink>
                </div>
            )}
            {manualAddress && (
                <div>
                    <ExpensiTextInput
                        label={translate('common.personalAddress')}
                        containerStyles={[styles.mt4]}
                        value={street}
                        onChangeText={value => onFieldChange('addressStreet', value)}
                        errorText={errors.street ? translate('bankAccount.error.address') : ''}
                    />
                    <Text style={[styles.mutedTextLabel, styles.mt1]}>{translate('common.noPO')}</Text>
                    <View style={[styles.flexRow, styles.mt4]}>
                        <View style={[styles.flex2, styles.mr2]}>
                            <ExpensiTextInput
                                label={translate('common.city')}
                                value={city}
                                onChangeText={value => onFieldChange('addressCity', value)}
                                errorText={errors.city ? translate('bankAccount.error.addressCity') : ''}
                                translateX={-14}
                            />
                        </View>
                        <View style={[styles.flex1]}>
                            <StatePicker
                                value={state}
                                onChange={value => onFieldChange('addressState', value)}
                                errorText={errors.state ? translate('bankAccount.error.addressState') : ''}
                                hasError={Boolean(errors.state)}
                            />
                        </View>
                    </View>
                    <ExpensiTextInput
                        label={translate('common.zip')}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMERIC}
                        value={zipCode}
                        onChangeText={value => onFieldChange('addressZipCode', value)}
                        errorText={errors.zipCode ? translate('bankAccount.error.zipCode') : ''}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    />
                </div>
            )}
        </View>
    );
};

IdentityForm.propTypes = propTypes;
IdentityForm.defaultProps = defaultProps;
IdentityForm.displayName = 'IdentityForm';
export default withLocalize(IdentityForm);
