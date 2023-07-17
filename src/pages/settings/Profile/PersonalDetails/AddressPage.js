import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import compose from '../../../../libs/compose';
import AddressSearch from '../../../../components/AddressSearch';
import CountryPicker from '../../../../components/CountryPicker';
import StatePicker from '../../../../components/StatePicker';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import withPrivatePersonalDetails, {withPrivatePersonalDetailsDefaultProps, withPrivatePersonalDetailsPropTypes} from '../../../../components/withPrivatePersonalDetails';
import FullscreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';

const propTypes = {
    /* Onyx Props */
    ...withPrivatePersonalDetailsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    ...withPrivatePersonalDetailsDefaultProps,
};

/**
 * Submit form to update user's first and last legal name
 * @param {Object} values - form input values
 */
function updateAddress(values) {
    PersonalDetails.updateAddress(values.addressLine1.trim(), values.addressLine2.trim(), values.city.trim(), values.state.trim(), values.zipPostCode.trim().toUpperCase(), values.country);
}

function AddressPage({translate, privatePersonalDetails}) {
    const [countryISO, setCountryISO] = useState(PersonalDetails.getCountryISO(lodashGet(privatePersonalDetails, 'address.country')) || CONST.COUNTRY.US);
    const isUSAForm = countryISO === CONST.COUNTRY.US;

    const zipSampleFormat = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, [countryISO, 'samples'], '');
    const zipFormat = translate('common.zipCodeExampleFormat', {zipSampleFormat});

    const [addressStreet1, setAddressStreet1] = useState('');
    const [addressStreet2, setAddressStreet2] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [addressState, setAddressState] = useState('');
    const [addressZip, setAddressZip] = useState('');
    const [addressCountry, setAddressCountry] = useState('');

    useEffect(() => {
        const { address } = privatePersonalDetails;
        if (!address) {
            return;
        }
        const [street1, street2] = (address.street || '\n').split('\n');
        setAddressStreet1(street1);
        setAddressStreet2(street2);
        setAddressCity(address.city);
        setAddressState(address.state);
        setAddressZip(address.zip);
        setAddressCountry(address.country);
    }, [privatePersonalDetails, privatePersonalDetails.address])

    /**
     * @param {Function} translate - translate function
     * @param {Boolean} isUSAForm - selected country ISO code is US
     * @param {Object} values - form input values
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback((values) => {
        const errors = {};

        const requiredFields = ['addressLine1', 'city', 'country', 'state'];

        // Check "State" dropdown is a valid state if selected Country is USA
        if (values.country === CONST.COUNTRY.US && !COMMON_CONST.STATES[values.state]) {
            errors.state = 'common.error.fieldRequired';
        }

        // Add "Field required" errors if any required field is empty
        _.each(requiredFields, (fieldKey) => {
            if (ValidationUtils.isRequiredFulfilled(values[fieldKey])) {
                return;
            }
            errors[fieldKey] = 'common.error.fieldRequired';
        });

        // If no country is selected, default value is an empty string and there's no related regex data so we default to an empty object
        const countryRegexDetails = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, values.country, {});

        // The postal code system might not exist for a country, so no regex either for them.
        const countrySpecificZipRegex = lodashGet(countryRegexDetails, 'regex');
        const countryZipFormat = lodashGet(countryRegexDetails, 'samples');

        if (countrySpecificZipRegex) {
            if (!countrySpecificZipRegex.test(values.zipPostCode.trim().toUpperCase())) {
                if (ValidationUtils.isRequiredFulfilled(values.zipPostCode.trim())) {
                    errors.zipPostCode = ['privatePersonalDetails.error.incorrectZipFormat', {zipFormat: countryZipFormat}];
                } else {
                    errors.zipPostCode = 'common.error.fieldRequired';
                }
            }
        } else if (!CONST.GENERIC_ZIP_CODE_REGEX.test(values.zipPostCode.trim().toUpperCase())) {
            errors.zipPostCode = 'privatePersonalDetails.error.incorrectZipFormat';
        }

        return errors;
    }, []);

    if (privatePersonalDetails.isLoading) {
        return <FullscreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('privatePersonalDetails.homeAddress')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                validate={validate}
                onSubmit={updateAddress}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View style={styles.mb4}>
                    <AddressSearch
                        inputID="addressLine1"
                        label={translate('common.addressLine', {lineNumber: 1})}
                        value={addressStreet1}
                        onValueChange={setAddressStreet1}
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
                        label={translate('common.addressLine', {lineNumber: 2})}
                        accessibilityLabel={translate('common.addressLine')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={addressStreet2}
                        onValueChange={setAddressStreet2}
                        maxLength={CONST.FORM_CHARACTER_LIMIT}
                    />
                </View>
                <View style={styles.mb4}>
                    <TextInput
                        inputID="city"
                        label={translate('common.city')}
                        accessibilityLabel={translate('common.city')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={addressCity}
                        onValueChange={setAddressCity}
                        maxLength={CONST.FORM_CHARACTER_LIMIT}
                    />
                </View>
                <View style={styles.mb4}>
                    {isUSAForm ? (
                        <StatePicker
                            inputID="state"
                            value={addressState}
                            onValueChange={setAddressState}
                        />
                    ) : (
                        <TextInput
                            inputID="state"
                            label={translate('common.stateOrProvince')}
                            accessibilityLabel={translate('common.stateOrProvince')}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            value={addressState}
                            onValueChange={setAddressState}
                            maxLength={CONST.FORM_CHARACTER_LIMIT}
                        />
                    )}
                </View>
                <View style={styles.mb4}>
                    <TextInput
                        inputID="zipPostCode"
                        label={translate('common.zipPostCode')}
                        accessibilityLabel={translate('common.zipPostCode')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        autoCapitalize="characters"
                        value={addressZip}
                        onValueChange={setAddressZip}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                        hint={zipFormat}
                    />
                </View>
                <View>
                    <CountryPicker
                        inputID="country"
                        onValueChange={setCountryISO}
                        value={PersonalDetails.getCountryISO(addressCountry)}
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

AddressPage.propTypes = propTypes;
AddressPage.defaultProps = defaultProps;

export default compose(withLocalize, withPrivatePersonalDetails)(AddressPage);
