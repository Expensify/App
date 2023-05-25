import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import compose from '../../../../libs/compose';
import AddressSearch from '../../../../components/AddressSearch';
import CountryPicker from '../../../../components/CountryPicker';
import StatePicker from '../../../../components/StatePicker';

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

        const currentCountry = lodashGet(this.props.privatePersonalDetails, 'address.country') || '';
        const currentCountryISO = PersonalDetails.getCountryISO(currentCountry) || CONST.COUNTRY.US;
        const zipSampleFormat = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, [currentCountryISO, 'samples'], '');
        this.state = {
            isUsaForm: currentCountry === CONST.COUNTRY.US || currentCountry === CONST.USA_COUNTRY_NAME,
            zipFormat: this.props.translate('common.zipCodeExampleFormat', {zipSampleFormat}),
        };
    }

    /**
     * @param {String} newCountry - new country selected in form
     */
    onCountryUpdate(newCountry) {
        const zipSampleFormat = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, `${newCountry}.samples`, '');
        this.setState({
            isUsaForm: newCountry === CONST.COUNTRY.US,
            zipFormat: this.props.translate('common.zipCodeExampleFormat', {zipSampleFormat}),
        });
    }

    /**
     * Submit form to update user's first and last legal name
     * @param {Object} values - form input values
     */
    updateAddress(values) {
        PersonalDetails.updateAddress(values.addressLine1.trim(), values.addressLine2.trim(), values.city.trim(), values.state.trim(), values.zipPostCode.trim(), values.country);
    }

    /**
     * @param {Object} values - form input values
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        const requiredFields = ['addressLine1', 'city', 'country', 'state'];

        // Check "State" dropdown is a valid state if selected Country is USA.
        if (this.state.isUsaForm && !COMMON_CONST.STATES[values.state]) {
            errors.state = this.props.translate('common.error.fieldRequired');
        }

        // Add "Field required" errors if any required field is empty
        _.each(requiredFields, (fieldKey) => {
            if (ValidationUtils.isRequiredFulfilled(values[fieldKey])) {
                return;
            }
            errors[fieldKey] = this.props.translate('common.error.fieldRequired');
        });

        // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
        const countryRegexDetails = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, values.country, {});

        // The postal code system might not exist for a country, so no regex either for them.
        const countrySpecificZipRegex = lodashGet(countryRegexDetails, 'regex');
        const zipFormat = lodashGet(countryRegexDetails, 'samples');

        if (countrySpecificZipRegex) {
            if (!countrySpecificZipRegex.test(values.zipPostCode.trim())) {
                if (ValidationUtils.isRequiredFulfilled(values.zipPostCode.trim())) {
                    errors.zipPostCode = this.props.translate('privatePersonalDetails.error.incorrectZipFormat', {zipFormat});
                } else {
                    errors.zipPostCode = this.props.translate('common.error.fieldRequired');
                }
            }
        } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values.zipPostCode.trim())) {
            errors.zipPostCode = this.props.translate('privatePersonalDetails.error.incorrectZipFormat');
        }

        return errors;
    }

    render() {
        const address = lodashGet(this.props.privatePersonalDetails, 'address') || {};
        const [street1, street2] = (address.street || '').split('\n');

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('privatePersonalDetails.homeAddress')}
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
                            defaultValue={street1 || ''}
                            isLimitedToUSA={false}
                            renamedInputKeys={{
                                street: 'addressLine1',
                                street2: 'addressLine2',
                                city: 'city',
                                state: 'state',
                                zipCode: 'zipPostCode',
                                country: 'country',
                            }}
                            maxInputLength={CONST.FORM_CHARACTER_LIMIT}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="addressLine2"
                            label={this.props.translate('common.addressLine', {lineNumber: 2})}
                            defaultValue={street2 || ''}
                            maxLength={CONST.FORM_CHARACTER_LIMIT}
                        />
                    </View>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="city"
                            label={this.props.translate('common.city')}
                            defaultValue={address.city || ''}
                            maxLength={CONST.FORM_CHARACTER_LIMIT}
                        />
                    </View>
                    <View style={styles.mb4}>
                        {this.state.isUsaForm ? (
                            <StatePicker
                                inputID="state"
                                defaultValue={address.state || ''}
                            />
                        ) : (
                            <TextInput
                                inputID="state"
                                label={this.props.translate('common.stateOrProvince')}
                                defaultValue={address.state || ''}
                                maxLength={CONST.FORM_CHARACTER_LIMIT}
                            />
                        )}
                    </View>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="zipPostCode"
                            label={this.props.translate('common.zipPostCode')}
                            autoCapitalize="characters"
                            defaultValue={address.zip || ''}
                            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                            hint={this.state.zipFormat}
                        />
                    </View>
                    <View>
                        <CountryPicker
                            inputID="country"
                            onValueChange={this.onCountryUpdate}
                            defaultValue={PersonalDetails.getCountryISO(address.country)}
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
