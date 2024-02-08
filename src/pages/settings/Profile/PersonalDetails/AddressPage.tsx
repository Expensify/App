import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetails from '@userActions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
};

type AddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS> & AddressPageOnyxProps;

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: Address) {
    PersonalDetails.updateAddress(
        values.addressLine1?.trim() ?? '',
        values.addressLine2?.trim() ?? '',
        values.city.trim(),
        values.state.trim(),
        values?.zipPostCode?.trim().toUpperCase() ?? '',
        values.country,
    );
}

function AddressPage({privatePersonalDetails, route}: AddressPageProps) {
    const styles = useThemeStyles();
    usePrivatePersonalDetails();
    const {translate} = useLocalize();
    const address = useMemo(() => privatePersonalDetails?.address, [privatePersonalDetails]);
    const countryFromUrl = route.params?.country;
    const [currentCountry, setCurrentCountry] = useState(address?.country);
    const isLoadingPersonalDetails = privatePersonalDetails?.isLoading ?? true;
    const [street1, street2] = (address?.street ?? '').split('\n');
    const [state, setState] = useState(address?.state);
    const [city, setCity] = useState(address?.city);
    const [zipcode, setZipcode] = useState(address?.zip);

    useEffect(() => {
        if (!address) {
            return;
        }
        setState(address.state);
        setCurrentCountry(address.country);
        setCity(address.city);
        setZipcode(address.zip);
    }, [address]);

    const handleAddressChange = useCallback((value: string, key: keyof Address) => {
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
                onBackButtonPress={() => Navigation.goBack()}
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

AddressPage.displayName = 'AddressPage';

export default withOnyx<AddressPageProps, AddressPageOnyxProps>({
    privatePersonalDetails: {
        key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    },
})(AddressPage);
