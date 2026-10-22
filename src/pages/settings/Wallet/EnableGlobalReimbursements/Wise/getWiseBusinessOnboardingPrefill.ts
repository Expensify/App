import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import isCountryCode from '@components/DynamicForm/utils/isCountryCode';

import {getCountryCode, resolveStateCode} from '@libs/CountryUtils';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {BankAccount, PrivatePersonalDetails} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {CONST as COMMON_CONST} from 'expensify-common';

/** The state picker lists US states by code, so a US state that is not one is left out */
function getStateCode(countryCode: string | undefined, state: string | undefined): string | undefined {
    if (countryCode !== CONST.COUNTRY.US) {
        return state;
    }
    const stateCode = resolveStateCode(state ?? '');
    return stateCode in COMMON_CONST.STATES ? stateCode : undefined;
}

/** Answers the onboarding form starts with: the representative from the user's private details, and the business name from the bank account */
function getWiseBusinessOnboardingPrefill(bankAccount: OnyxEntry<BankAccount>, privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>): DynamicFormValues {
    const address = getCurrentAddress(privatePersonalDetails);
    const [street1, street2] = getStreetLines(address?.street);
    const addressKeys = getAddressInputKeys('address');

    // Older addresses can hold names, such as "United States" and "California", where the pickers take codes. A part that does not resolve is left for the user to pick.
    const country = getCountryCode(address?.country || undefined);
    const countryCode = country && isCountryCode(country) ? country : undefined;
    const state = getStateCode(countryCode, address?.state);

    return {
        firstName: privatePersonalDetails?.legalFirstName,
        lastName: privatePersonalDetails?.legalLastName,
        phoneNumber: privatePersonalDetails?.phoneNumber,
        dateOfBirth: privatePersonalDetails?.dob,
        [addressKeys.street]: [street1, address?.street2 ?? street2].filter(Boolean).join(', '),
        [addressKeys.city]: address?.city,
        [addressKeys.state]: state,
        [addressKeys.zipCode]: address?.zip,
        [addressKeys.country]: countryCode,
        companyName: bankAccount?.accountData?.addressName,
    };
}

/**
 * The prefill answers the draft does not hold yet. A key the draft already has is the user's, even when they cleared it.
 * The business name is the exception: it is a read-only row, so it follows the bank account.
 */
function getMissingPrefill(prefill: DynamicFormValues, draft: DynamicFormValues): DynamicFormValues {
    const missing: DynamicFormValues = {};
    for (const [key, value] of Object.entries(prefill)) {
        if (key === 'companyName') {
            const companyName = value ?? '';
            if ((draft[key] ?? '') !== companyName) {
                missing[key] = companyName;
            }
            continue;
        }
        if (value && draft[key] === undefined) {
            missing[key] = value;
        }
    }
    return missing;
}

export default getWiseBusinessOnboardingPrefill;
export {getMissingPrefill};
