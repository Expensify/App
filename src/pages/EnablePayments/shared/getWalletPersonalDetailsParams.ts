import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';
import {parsePhoneNumber} from '@libs/PhoneNumber';

import CONST from '@src/CONST';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';

/**
 * Builds the wallet personal-details API params from the collected form values. Shared by the personal-info and
 * additional-details flows and by the magic-code confirmation screen so the phone-change check and the
 * code submission always build identical params. The phone number is normalized to significant digits to match how
 * the backend stores it.
 */
function getWalletPersonalDetailsParams(values: PersonalInfoStepProps): UpdatePersonalDetailsForWalletParams {
    return {
        phoneNumber: (values.phoneNumber && parsePhoneNumber(values.phoneNumber, {regionCode: CONST.COUNTRY.US}).number?.significant) ?? '',
        legalFirstName: values.legalFirstName ?? '',
        legalLastName: values.legalLastName ?? '',
        addressStreet: values.addressStreet ?? '',
        addressCity: values.addressCity ?? '',
        addressState: values.addressState ?? '',
        addressZip: values.addressZipCode ?? '',
        dob: values.dob ?? '',
        ssn: values.ssn ?? '',
    };
}

export default getWalletPersonalDetailsParams;
