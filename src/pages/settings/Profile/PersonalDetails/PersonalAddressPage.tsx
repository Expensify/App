import React, {useMemo} from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {normalizeCountryCode} from '@libs/CountryUtils';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import AddressPage from '@pages/AddressPage';
import type {FormOnyxValues} from '@src/components/Form/types';
import type {Country} from '@src/CONST';
import {updateAddress as updateAddressPersonalDetails} from '@src/libs/actions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>, addresses: Address[]) {
    updateAddressPersonalDetails(
        addresses,
        values.addressLine1?.trim() ?? '',
        values.addressLine2?.trim() ?? '',
        values.city.trim(),
        values.state.trim(),
        values?.zipPostCode?.trim().toUpperCase() ?? '',
        values.country,
    );
}

function PersonalAddressPage() {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [defaultCountry, defaultCountryStatus] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});
    const isLoading = isLoadingOnyxValue(defaultCountryStatus);
    const address = useMemo(() => normalizeCountryCode(getCurrentAddress(privatePersonalDetails)) as Address, [privatePersonalDetails]);
    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }
    return (
        <AddressPage
            defaultCountry={defaultCountry as Country}
            address={address}
            isLoadingApp={isLoadingApp}
            updateAddress={(values) => updateAddress(values, privatePersonalDetails?.addresses ?? [])}
            title={translate('privatePersonalDetails.address')}
        />
    );
}

export default PersonalAddressPage;
