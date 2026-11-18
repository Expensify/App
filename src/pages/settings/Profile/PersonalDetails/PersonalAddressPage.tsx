import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useFlowDiscardChangesConfirmation from '@hooks/useFlowDiscardChangesConfirmation';
import useFormChanges from '@hooks/useFormChanges';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getCountryCode, normalizeCountryCode} from '@libs/CountryUtils';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import AddressPage from '@pages/AddressPage';

import type {FormOnyxValues} from '@src/components/Form/types';
import {updateAddress as updateAddressPersonalDetails} from '@src/libs/actions/PersonalDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Address} from '@src/types/onyx/PrivatePersonalDetails';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React from 'react';

const SCREEN_NAMES = [SCREENS.SETTINGS.PROFILE.ADDRESS];

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
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [defaultCountry, defaultCountryStatus] = useOnyx(ONYXKEYS.COUNTRY);
    const isLoading = isLoadingOnyxValue(defaultCountryStatus);
    const address = normalizeCountryCode(getCurrentAddress(privatePersonalDetails));
    const [street1, street2] = getStreetLines(address?.street);
    const {recordChange, getHasUnsavedChanges} = useFormChanges({
        addressLine1: street1 ?? '',
        addressLine2: address?.street2 || street2 || '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        zipPostCode: address?.zip ?? '',
        country: address?.country ?? getCountryCode(defaultCountry) ?? '',
    });
    const {suppressDiscardPrompt} = useFlowDiscardChangesConfirmation({screenNames: SCREEN_NAMES, getHasUnsavedChanges});

    if (isLoading) {
        return <FullScreenLoadingIndicator />;
    }
    return (
        <AddressPage
            defaultCountry={getCountryCode(defaultCountry)}
            address={address}
            isLoadingApp={isLoadingApp}
            onValueChange={recordChange}
            updateAddress={(values) => {
                suppressDiscardPrompt();
                try {
                    updateAddress(values, privatePersonalDetails?.addresses ?? []);
                } catch (error) {
                    suppressDiscardPrompt(false);
                    throw error;
                }
            }}
            title={translate('privatePersonalDetails.address')}
        />
    );
}

export default PersonalAddressPage;
