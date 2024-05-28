import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useGeographicalStateFromRoute from '@hooks/useGeographicalStateFromRoute';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetails from '@userActions/PersonalDetails';
import type {FormOnyxValues} from '@src/components/Form/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressPageOnyxProps = {
    /** User's private personal details */
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
};

type AddressPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.ADDRESS> & AddressPageOnyxProps;

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) {
    PersonalDetails.updateAddress(
        values.addressLine1?.trim() ?? '',
        values.addressLine2?.trim() ?? '',
        values.city.trim(),
        values.state.trim(),
        values?.zipPostCode?.trim().toUpperCase() ?? '',
        values.country,
    );
}

function AddressPage({privatePersonalDetails, route, isLoadingApp = true}: AddressPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const address = useMemo(() => privatePersonalDetails?.address, [privatePersonalDetails]);
    const countryFromUrlTemp = route?.params?.country;

    // Check if country is valid
    const countryFromUrl = CONST.ALL_COUNTRIES[countryFromUrlTemp as keyof typeof CONST.ALL_COUNTRIES] ? countryFromUrlTemp : '';
    const stateFromUrl = useGeographicalStateFromRoute();
    const [currentCountry, setCurrentCountry] = useState(address?.country);
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

    const handleAddressChange = useCallback((value: unknown, key: unknown) => {
        const addressPart = value as string;
        const addressPartKey = key as keyof Address;

        if (addressPartKey !== 'country' && addressPartKey !== 'state' && addressPartKey !== 'city' && addressPartKey !== 'zipPostCode') {
            return;
        }
        if (addressPartKey === 'country') {
            setCurrentCountry(addressPart as Country | '');
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === 'state') {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === 'city') {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    }, []);

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        handleAddressChange(countryFromUrl, 'country');
    }, [countryFromUrl, handleAddressChange]);

    useEffect(() => {
        if (!stateFromUrl) {
            return;
        }
        handleAddressChange(stateFromUrl, 'state');
    }, [handleAddressChange, stateFromUrl]);

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
            {isLoadingApp ? (
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
    isLoadingApp: {
        key: ONYXKEYS.IS_LOADING_APP,
    },
})(AddressPage);
