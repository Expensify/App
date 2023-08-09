import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {useState, useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import AddressSearch from '../../../../components/AddressSearch';
import CountryPicker from '../../../../components/CountryPicker';
import StatePicker from '../../../../components/StatePicker';
import Navigation from '../../../../libs/Navigation/Navigation';
import ROUTES from '../../../../ROUTES';
import useLocalize from '../../../../hooks/useLocalize';
import usePrivatePersonalDetails from '../../../../hooks/usePrivatePersonalDetails';
import FullscreenLoadingIndicator from '../../../../components/FullscreenLoadingIndicator';

const propTypes = {
    /* Onyx Props */

    // The user's country based on IP address
    country: PropTypes.string,

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
};

const defaultProps = {
    country: '',
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

/**
 * Submit form to update user's first and last legal name
 * @param {Object} values - form input values
 */
function updateAddress(values) {
    PersonalDetails.updateAddress(values.addressLine1.trim(), values.addressLine2.trim(), values.city.trim(), values.state.trim(), values.zipPostCode.trim().toUpperCase(), values.country);
}

function AddressPage({privatePersonalDetails, country}) {
    usePrivatePersonalDetails();
    const {translate} = useLocalize();
    const [currentCountry, setCurrentCountry] = useState(PersonalDetails.getCountryISO(lodashGet(privatePersonalDetails, 'address.country')) || country || CONST.COUNTRY.US);
    const isUSAForm = currentCountry === CONST.COUNTRY.US;
    const zipSampleFormat = lodashGet(CONST.COUNTRY_ZIP_REGEX_DATA, [currentCountry, 'samples'], '');
    const zipFormat = translate('common.zipCodeExampleFormat', {zipSampleFormat});

    const address = lodashGet(privatePersonalDetails, 'address') || {};
    const [street1, street2] = (address.street || '').split('\n');
    const [state, setState] = useState(address.state);
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

    const handleAddressChange = (value, key) => {
        if (key !== 'country' && key !== 'state') {
            return;
        }
        if (key === 'country') {
            setCurrentCountry(value);
            setState('');
            return;
        }
        setState(value);
    };

    if (lodashGet(privatePersonalDetails, 'isLoading', true)) {
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
                style={[styles.flexGrow1, styles.mh5]}
                formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                validate={validate}
                onSubmit={updateAddress}
                submitButtonText={translate('common.save')}
                enabledWhenOffline
            >
                <View>
                    <AddressSearch
                        inputID="addressLine1"
                        label={translate('common.addressLine', {lineNumber: 1})}
                        defaultValue={street1 || ''}
                        isLimitedToUSA={false}
                        onValueChange={handleAddressChange}
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
                <View style={styles.formSpaceVertical} />
                <TextInput
                    inputID="addressLine2"
                    label={translate('common.addressLine', {lineNumber: 2})}
                    accessibilityLabel={translate('common.addressLine')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={street2 || ''}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    spellCheck={false}
                />
                <View style={styles.formSpaceVertical} />
                <View style={styles.mhn5}>
                    <CountryPicker
                        inputID="country"
                        defaultValue={currentCountry}
                        onValueChange={handleAddressChange}
                    />
                </View>
                <View style={styles.formSpaceVertical} />
                {isUSAForm ? (
                    <View style={styles.mhn5}>
                        <StatePicker
                            inputID="state"
                            defaultValue={state}
                            onValueChange={handleAddressChange}
                        />
                    </View>
                ) : (
                    <TextInput
                        inputID="state"
                        label={translate('common.stateOrProvince')}
                        accessibilityLabel={translate('common.stateOrProvince')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        value={state || ''}
                        maxLength={CONST.FORM_CHARACTER_LIMIT}
                        spellCheck={false}
                        onValueChange={handleAddressChange}
                    />
                )}
                <View style={styles.formSpaceVertical} />
                <TextInput
                    inputID="city"
                    label={translate('common.city')}
                    accessibilityLabel={translate('common.city')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    defaultValue={address.city || ''}
                    maxLength={CONST.FORM_CHARACTER_LIMIT}
                    spellCheck={false}
                />
                <View style={styles.formSpaceVertical} />
                <TextInput
                    inputID="zipPostCode"
                    label={translate('common.zipPostCode')}
                    accessibilityLabel={translate('common.zipPostCode')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    autoCapitalize="characters"
                    defaultValue={address.zip || ''}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.ZIP_CODE}
                    hint={zipFormat}
                />
            </Form>
        </ScreenWrapper>
    );
}

AddressPage.propTypes = propTypes;
AddressPage.defaultProps = defaultProps;

export default withOnyx({
    country: {
        key: ONYXKEYS.COUNTRY,
    },
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(AddressPage);
