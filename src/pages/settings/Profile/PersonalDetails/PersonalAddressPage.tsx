import React, {useMemo} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import AddressPage from '@pages/AddressPage';
import type {FormOnyxValues} from '@src/components/Form/types';
import type {Country} from '@src/CONST';
import {updateAddress as updateAddressPersonalDetails} from '@src/libs/actions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Submit form to update user's first and last legal name
 * @param values - form input values
 */
function updateAddress(values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) {
    updateAddressPersonalDetails(
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
    const [defaultCountry] = useOnyx(ONYXKEYS.COUNTRY, {canBeMissing: true});
    const address = useMemo(() => getCurrentAddress(privatePersonalDetails), [privatePersonalDetails]);

    return (
        <AddressPage
            defaultCountry={defaultCountry as Country}
            address={address}
            isLoadingApp={isLoadingApp}
            updateAddress={updateAddress}
            title={translate('privatePersonalDetails.address')}
        />
    );
}

PersonalAddressPage.displayName = 'PersonalAddressPage';

export default PersonalAddressPage;
