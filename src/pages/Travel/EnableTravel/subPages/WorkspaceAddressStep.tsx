import AddressForm from '@components/AddressForm';
import type {FormOnyxValues} from '@components/Form/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getCountryCode} from '@libs/CountryUtils';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import {updateAddress} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/HomeAddressForm';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useState} from 'react';

/** Coerces an unknown form field value to a string. */
function toStringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function WorkspaceAddressStep({policy, policyID, onNext, resetToPage}: EnableTravelSubPageProps) {
    const {translate} = useLocalize();
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const address = policy?.address;

    const [currentCountry, setCurrentCountry] = useState<string>(address?.country ?? '');
    const [state, setState] = useState<string>(address?.state ?? '');
    const [city, setCity] = useState<string>(address?.city ?? '');
    const [zipcode, setZipcode] = useState<string>(address?.zipCode ?? '');

    const handleAddressChange = useCallback(
        (value: unknown, key: unknown) => {
            const addressPartKey = String(key);

            if (addressPartKey !== INPUT_IDS.COUNTRY && addressPartKey !== INPUT_IDS.STATE && addressPartKey !== INPUT_IDS.CITY && addressPartKey !== INPUT_IDS.ZIP_POST_CODE) {
                return;
            }

            const addressPart = toStringValue(value);

            if (addressPartKey === INPUT_IDS.COUNTRY && addressPart !== currentCountry) {
                setCurrentCountry(addressPart);
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
        },
        [currentCountry],
    );

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.HOME_ADDRESS_FORM>) => {
        // The verify step normally precedes this one, but subPage is URL-controlled, so like the old standalone
        // address page, enforce account validation on submit. The draft values survive the detour, and the verify
        // step auto-advances forward through the list once the account is validated.
        if (!isUserValidated) {
            resetToPage?.(CONST.TRAVEL.ENABLE_FLOW.PAGE_NAME.VERIFY_ACCOUNT);
            return;
        }
        updateAddress(policyID, {
            addressStreet: values.addressLine1?.trim() ?? '',
            addressStreet2: values.addressLine2?.trim() ?? '',
            city: values.city.trim(),
            state: values.state.trim(),
            zipCode: values?.zipPostCode?.trim().toUpperCase() ?? '',
            country: values.country,
        });
        onNext();
    };

    return (
        <AddressForm
            formID={ONYXKEYS.FORMS.HOME_ADDRESS_FORM}
            onSubmit={handleSubmit}
            submitButtonText={translate('common.save')}
            city={city}
            country={getCountryCode(currentCountry)}
            onAddressChanged={handleAddressChange}
            state={state}
            street1={address?.addressStreet}
            street2={address?.addressStreet2}
            zip={zipcode}
        />
    );
}

export default WorkspaceAddressStep;
