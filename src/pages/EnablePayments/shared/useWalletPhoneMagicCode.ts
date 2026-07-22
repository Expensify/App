import useOnyx from '@hooks/useOnyx';

import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';

import {updatePersonalDetails} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

/**
 * Shared magic-code handling for the wallet KYC personal-details flows. Changing an existing phone number is protected
 * by a magic code because it is used for card 3DS verification, so both flows send the user to a dedicated
 * confirmation screen to enter the code before the change is submitted.
 */
function useWalletPhoneMagicCode() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);

    // Submits the personal details, first routing to the magic-code screen when an existing phone number is changed.
    const submitPersonalDetails = (personalDetails: UpdatePersonalDetailsForWalletParams) => {
        // The stored phone number keeps its country code, so normalize it the same way as the submitted one before
        // comparing, otherwise an unchanged phone would look like a change and wrongly prompt for a magic code.
        const storedPhoneNumber = privatePersonalDetails?.phoneNumber;
        const normalizedStoredPhoneNumber = (storedPhoneNumber && parsePhoneNumber(storedPhoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '';
        const hasPhoneNumberChanged = !!normalizedStoredPhoneNumber && personalDetails.phoneNumber !== normalizedStoredPhoneNumber;
        if (hasPhoneNumberChanged) {
            Navigation.navigate(ROUTES.SETTINGS_ENABLE_PAYMENTS_CONFIRM_MAGIC_CODE.getRoute());
            return;
        }

        // Attempt to set the personal details
        updatePersonalDetails(personalDetails);
    };

    return {submitPersonalDetails};
}

export default useWalletPhoneMagicCode;
