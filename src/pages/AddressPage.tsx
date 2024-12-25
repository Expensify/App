import React, {useCallback, useEffect, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {BackToParams} from '@libs/Navigation/types';
import type {FormOnyxValues} from '@src/components/Form/types';
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';
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
} & BackToParams;

function AddressPage({title, address, updateAddress, isLoadingApp = true, backTo}: AddressPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // Check if country is valid
    const {street} = address ?? {};
    const [street1, street2] = street ? street.split('\n') : [undefined, undefined];
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

        if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === INPUT_IDS.COUNTRY) {
            setCurrentCountry(addressPart as Country | '');
            setState('');
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.STATE) {
            setState(addressPart);
            setCity('');
            setZipcode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.CITY) {
            setCity(addressPart);
            setZipcode('');
            return;
        }
        setZipcode(addressPart);
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AddressPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={title}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack(backTo)}
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
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

AddressPage.displayName = 'AddressPage';

export default AddressPage;
