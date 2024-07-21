import React, {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {FormOnyxValues} from '@src/components/Form/types';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

type AddressPageProps = {
    /** User's private personal details */
    address?: Address;
    /** Whether app is loading */
    isLoadingApp: OnyxEntry<boolean>;
    /** Function to call when address form is submitted */
    updateAddress: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => void;
    /** Title of address page */
    title: string;
};

function AddressPage({title, address, updateAddress, isLoadingApp = true}: AddressPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Check if country is valid
    const {street, street2} = address ?? {};
    const [currentCountry, setCurrentCountry] = useState(address?.country);
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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [address?.state, address?.country, address?.city, address?.zip]);

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

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={AddressPage.displayName}
        >
            <HeaderWithBackButton
                title={title}
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
                    street1={street}
                    street2={street2}
                    zip={zipcode}
                />
            )}
        </ScreenWrapper>
    );
}

AddressPage.displayName = 'AddressPage';

export default AddressPage;
