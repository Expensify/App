import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AddressForm from '@components/AddressForm';
import useLocalize from '@hooks/useLocalize';
import * as FormActions from '@libs/actions/FormActions';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/GetPhysicalCardForm';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import BaseGetPhysicalCard from './BaseGetPhysicalCard';
import type {RenderContentProps} from './BaseGetPhysicalCard';

type GetPhysicalCardAddressProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.CARD_GET_PHYSICAL.ADDRESS>;

function GetPhysicalCardAddress({
    route: {
        params: {country: countryFromUrl, domain},
    },
}: GetPhysicalCardAddressProps) {
    const {translate} = useLocalize();

    const [draftValues] = useOnyx(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM_DRAFT);

    const {addressLine1, addressLine2} = draftValues ?? {};
    const [country, setCountry] = useState(draftValues?.country);
    const [state, setState] = useState(draftValues?.state);
    const [city, setCity] = useState(draftValues?.city);
    const [zipPostCode, setZipPostCode] = useState(draftValues?.zipPostCode);

    useEffect(() => {
        if (!draftValues) {
            return;
        }
        setState(draftValues.state);
        setCountry(draftValues.country);
        setCity(draftValues.city);
        setZipPostCode(draftValues.zipPostCode);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [draftValues?.state, draftValues?.country, draftValues?.city, draftValues?.zipPostCode]);

    useEffect(() => {
        if (!countryFromUrl) {
            return;
        }
        FormActions.setDraftValues(ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM, {country: countryFromUrl});
    }, [countryFromUrl]);

    const handleAddressChange = useCallback((value: unknown, key: unknown) => {
        const addressPart = value as string;
        const addressPartKey = key as keyof Address;

        if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
            return;
        }
        if (addressPartKey === INPUT_IDS.COUNTRY) {
            setCountry(addressPart as Country | '');
            setState('');
            setCity('');
            setZipPostCode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.STATE) {
            setState(addressPart);
            setCity('');
            setZipPostCode('');
            return;
        }
        if (addressPartKey === INPUT_IDS.CITY) {
            setCity(addressPart);
            setZipPostCode('');
            return;
        }
        setZipPostCode(addressPart);
    }, []);

    const renderContent = useCallback(
        ({onSubmit, submitButtonText}: RenderContentProps) => (
            <AddressForm
                formID={ONYXKEYS.FORMS.GET_PHYSICAL_CARD_FORM}
                onSubmit={onSubmit}
                onAddressChanged={handleAddressChange}
                submitButtonText={submitButtonText}
                city={city}
                country={country}
                shouldSaveDraft
                state={state}
                street1={addressLine1}
                street2={addressLine2}
                zip={zipPostCode}
            />
        ),
        [addressLine1, addressLine2, city, country, handleAddressChange, state, zipPostCode],
    );

    return (
        <BaseGetPhysicalCard
            currentRoute={ROUTES.SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS.getRoute(domain)}
            domain={domain}
            headline={translate('getPhysicalCard.addressMessage')}
            renderContent={renderContent}
            submitButtonText={translate('getPhysicalCard.next')}
            title={translate('getPhysicalCard.header')}
        />
    );
}

GetPhysicalCardAddress.displayName = 'GetPhysicalCardAddress';

export default GetPhysicalCardAddress;
