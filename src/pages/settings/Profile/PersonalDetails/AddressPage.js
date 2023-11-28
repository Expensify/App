import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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

    /** Route from navigation */
    route: PropTypes.shape({
        /** Params from the route */
        params: PropTypes.shape({
            /** Currently selected country */
            country: PropTypes.string,
        }),
    }).isRequired,
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

/**
 * Submit form to update user's first and last legal name
 * @param {Object} values - form input values
 */
function updateAddress(values) {
    PersonalDetails.updateAddress(values.addressLine1.trim(), values.addressLine2.trim(), values.city.trim(), values.state.trim(), values.zipPostCode.trim().toUpperCase(), values.country);
}

function AddressPage({privatePersonalDetails, route}) {
    const styles = useThemeStyles();
    usePrivatePersonalDetails();
    const {translate} = useLocalize();
    const address = useMemo(() => lodashGet(privatePersonalDetails, 'address') || {}, [privatePersonalDetails]);
    const countryFromUrl = lodashGet(route, 'params.country');
    const [currentCountry, setCurrentCountry] = useState(address.country);
    const isLoadingPersonalDetails = lodashGet(privatePersonalDetails, 'isLoading', true);
    const [street1, street2] = (address.street || '').split('\n');
    const [state, setState] = useState(address.state);
    const [city, setCity] = useState(address.city);
    const [zipcode, setZipcode] = useState(address.zip);

    useEffect(() => {
        if (!address) {
            return;
        }
        setState(address.state);
        setCurrentCountry(address.country);
        setCity(address.city);
        setZipcode(address.zip);
    }, [address]);

    const handleAddressChange = useCallback((value, key) => {
        if (key !== 'country' && key !== 'state' && key !== 'city' && key !== 'zipPostCode') {
            return;
        }
        if (key === 'country') {
            setCurrentCountry(value);
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (key === 'state') {
            setState(value);
            setCity('');
            setZipcode('');
            return;
        }
        if (key === 'city') {
            setCity(value);
            setZipcode('');
            return;
        }
        setZipcode(value);
    }, []);

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        handleAddressChange(countryFromUrl, 'country');
    }, [countryFromUrl, handleAddressChange]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AddressPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('privatePersonalDetails.address')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS)}
            />
            {isLoadingPersonalDetails ? (
                <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <AddressForm
                    formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
                    onSubmit={updateAddress}
                    submitButtonText={translate('common.save')}
                    city={city}
                    country={currentCountry}
                    onAddressChanged={handleAddressChange}
                    state={state}
                    street1={street1}
                    street2={street2}
                    zip={zipcode}
                />
            )}
        </ScreenWrapper>
    );
}

AddressPage.propTypes = propTypes;
AddressPage.defaultProps = defaultProps;
AddressPage.displayName = 'AddressPage';

export default withOnyx({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(AddressPage);
