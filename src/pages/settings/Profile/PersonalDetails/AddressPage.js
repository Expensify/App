import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as Localize from '../../../../libs/Localize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import TextInput from '../../../../components/TextInput';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';
import AddressForm from '../../../ReimbursementAccount/AddressForm';
import AddressSearch from '../../../../components/AddressSearch';
import CountryPicker from '../../../../components/CountryPicker';
import StatePicker from '../../../../components/StatePicker';
import { withOnyx } from 'react-native-onyx';

const propTypes = {
    /* Onyx Props */

    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            street: PropTypes.string,
            city: PropTypes.string,
            state: PropTypes.string,
            zip: PropTypes.string,
            country: PropTypes.string,
        }),
    }),
    
    ...withLocalizePropTypes,
};

const defaultProps = {
    privatePersonalDetails: {
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: '',
        },
    },
};

class AddressPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateAddress = this.updateAddress.bind(this);
        this.onCountryUpdate = this.onCountryUpdate.bind(this);

        this.state = {
            isUsaForm: false,
        };
    }

    /**
     * Submit form to update user's first and last legal name
     * @param {Object} values - form input values
     */
    updateAddress(values) {
        PersonalDetails.updateAddress(
            `${values.street1.trim()}\n${values.street2}`.trim(),
            values.city.trim(),
            values.state,
            values.zip,
            values.country,
        );
    }

    onCountryUpdate(newCountry) {
        if (newCountry === 'USA') {
            this.setState({isUsaForm: true});
        } else {
            this.setState({isUsaForm: false});
        }
    }

    /**
     * @param {Object} values - form input values
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        // Check for invalid characters in street and city fields
        const [legalFirstNameInvalidCharacter, legalLastNameInvalidCharacter] = ValidationUtils.findInvalidSymbols(
            [values.legalFirstName, values.legalLastName],
        );
        this.assignError(
            errors,
            'legalFirstName',
            !_.isEmpty(legalFirstNameInvalidCharacter),
            Localize.translateLocal(
                'personalDetails.error.hasInvalidCharacter',
                {invalidCharacter: legalFirstNameInvalidCharacter},
            ),
        );
        this.assignError(
            errors,
            'legalLastName',
            !_.isEmpty(legalLastNameInvalidCharacter),
            Localize.translateLocal(
                'personalDetails.error.hasInvalidCharacter',
                {invalidCharacter: legalLastNameInvalidCharacter},
            ),
        );
        if (!_.isEmpty(errors)) {
            return errors;
        }

        // Check the character limit for first and last name
        const characterLimitError = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT});
        const [hasLegalFirstNameError, hasLegalLastNameError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.FORM_CHARACTER_LIMIT,
            [values.legalFirstName, values.legalLastName],
        );
        this.assignError(errors, 'legalFirstName', hasLegalFirstNameError, characterLimitError);
        this.assignError(errors, 'legalLastName', hasLegalLastNameError, characterLimitError);

        return errors;
    }

    /**
     * @param {Object} errors
     * @param {String} errorKey
     * @param {Boolean} hasError
     * @param {String} errorCopy
     * @returns {Object} - An object containing the errors for each inputID
     */
    assignError(errors, errorKey, hasError, errorCopy) {
        const validateErrors = errors;
        if (hasError) {
            validateErrors[errorKey] = errorCopy;
        }
        return validateErrors;
    }

    /**
     * @param {String} street
     * @returns {Object}
     */
    parseAddressStreet(street) {
        return {
            addressLine1: street.split('\n')[0],
            addressLine2: street.split('\n').length > 1 ? street.split('\n')[1] : '',
        }
    }

    render() {
        const privateDetails = this.props.privatePersonalDetails || {};
        const {addressLine1, addressLine2} = this.parseAddressStreet(lodashGet(privateDetails, 'address.street') || '');

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('personalDetailsPages.homeAddress')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                    validate={this.validate}
                    onSubmit={this.updateAddress}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={styles.mb4}>
                        <AddressSearch
                            inputID="addressLine1"
                            label={this.props.translate('common.addressLine', {lineNumber: 1})}
                            defaultValue={addressLine1}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="addressLine2"
                            label={this.props.translate('common.addressLine', {lineNumber: 2})}
                            defaultValue={addressLine2}
                            maxLength={50}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="city"
                            label={this.props.translate('common.city')}
                            defaultValue={lodashGet(privateDetails, 'address.city', '')}
                            maxLength={50}
                        />
                    </View>
                    <View style={[styles.flexRow, styles.mb4]}>
                        <View style={[styles.flex1, styles.mr2]}>
                            {this.state.isUsaForm ? (
                                <StatePicker
                                    inputID="state"
                                    defaultValue={lodashGet(privateDetails, 'address.state', '')}
                                />
                            ) : (
                                <TextInput
                                    inputID="stateOrProvince"
                                    label={this.props.translate('common.stateOrProvince')}
                                    defaultValue={lodashGet(privateDetails, 'address.state', '')}
                                    maxLength={50}
                                />
                            )}
                        </View>
                        <View style={[styles.flex1]}>
                            <TextInput
                                inputID="zipCode"
                                label={this.props.translate('common.zipPostCode')}
                                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                                defaultValue={lodashGet(privateDetails, 'address.zip', '')}
                                // maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                            />
                        </View>
                    </View>
                    <View>
                        <CountryPicker
                            inputID="country"
                            onValueChange={this.onCountryUpdate}
                            defaultValue={lodashGet(privateDetails, 'address.country', '')}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

AddressPage.propTypes = propTypes;
AddressPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
    }),
)(AddressPage);
