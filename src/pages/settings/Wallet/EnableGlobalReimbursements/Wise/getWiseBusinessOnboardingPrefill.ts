import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import isCountryCode from '@components/DynamicForm/utils/isCountryCode';
import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import {getCountryCode, resolveStateCode} from '@libs/CountryUtils';
import {toSavedFile} from '@libs/getWiseOnboardingPageParams';
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {ACHDataReimbursementAccount} from '@src/types/onyx/ReimbursementAccount';

import type {OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';

import {CONST as COMMON_CONST} from 'expensify-common';

import US from './forms/US';

/** The bank account's company details the business page shows, under the same keys, and the onboarding pages already saved to Wise */
const WISE_BUSINESS_ACCOUNT_KEYS = ['bankAccountID', 'companyName', 'incorporationType', 'wise'] as const satisfies ReadonlyArray<keyof ACHDataReimbursementAccount>;

type WiseBusinessAccountData = Pick<ACHDataReimbursementAccount, TupleToUnion<typeof WISE_BUSINESS_ACCOUNT_KEYS>>;

/** Incorporation types with one matching Wise company type. The others are left for the admin to pick. */
const COMPANY_TYPE_BY_INCORPORATION_TYPE: Partial<Record<string, ValueOf<typeof CONST.WISE.COMPANY_TYPE>>> = {
    [CONST.INCORPORATION_TYPES.LLC]: CONST.WISE.COMPANY_TYPE.LIMITED_LIABILITY_COMPANY,
    [CONST.INCORPORATION_TYPES.CORPORATION]: CONST.WISE.COMPANY_TYPE.FOR_PROFIT_CORPORATION,
    [CONST.INCORPORATION_TYPES.SOLE_PROPRIETORSHIP]: CONST.WISE.COMPANY_TYPE.SOLE_PROPRIETORSHIP,
};

const READONLY_KEYS = new Set(
    getAllFields(getPages(US))
        .filter((field) => field.readonly)
        .map((field) => field.key),
);

/** The state picker lists US states by code, so a US state that is not one is left out */
function getStateCode(countryCode: string | undefined, state: string | undefined): string | undefined {
    if (countryCode !== CONST.COUNTRY.US) {
        return state;
    }
    const stateCode = resolveStateCode(state ?? '');
    return stateCode in COMMON_CONST.STATES ? stateCode : undefined;
}

/** The answers of every saved page, with each saved file as a draft entry the next save can tell apart from a new one. A key a later save dropped comes back as null and is left out. */
function getSavedAnswers(wise: WiseBusinessAccountData['wise']): DynamicFormValues {
    const answers: DynamicFormValues = {};
    for (const pageAnswers of Object.values(wise?.pages ?? {})) {
        for (const [key, answer] of Object.entries(pageAnswers ?? {})) {
            if (answer !== null && answer !== undefined) {
                answers[key] = answer;
            }
        }
    }
    for (const pageDocuments of Object.values(wise?.documents ?? {})) {
        for (const [fieldKey, fileKeys] of Object.entries(pageDocuments ?? {})) {
            if (fileKeys?.length) {
                answers[fieldKey] = fileKeys.map(toSavedFile);
            }
        }
    }
    return answers;
}

/**
 * Answers the onboarding form starts with: the representative from the user's private details, and the business from the bank account's details,
 * overridden by the pages the user already saved to Wise.
 * The reimbursement account holds one bank account at a time, so the details of another account are not used.
 */
function getWiseBusinessOnboardingPrefill(
    bankAccountID: number,
    businessAccountData: OnyxEntry<WiseBusinessAccountData>,
    privatePersonalDetails: OnyxEntry<PrivatePersonalDetails>,
): DynamicFormValues {
    const address = getCurrentAddress(privatePersonalDetails);
    const [street1, street2] = getStreetLines(address?.street);
    const addressKeys = getAddressInputKeys('address');

    // Older addresses can hold names, such as "United States" and "California", where the pickers take codes. A part that does not resolve is left for the user to pick.
    const country = getCountryCode(address?.country || undefined);
    const countryCode = country && isCountryCode(country) ? country : undefined;
    const state = getStateCode(countryCode, address?.state);

    const business = businessAccountData?.bankAccountID === bankAccountID ? businessAccountData : undefined;

    return {
        firstName: privatePersonalDetails?.legalFirstName,
        lastName: privatePersonalDetails?.legalLastName,
        phoneNumber: privatePersonalDetails?.phoneNumber,
        dateOfBirth: privatePersonalDetails?.dob,
        // The SSN and ID document show only while this is false, so it starts off instead of unanswered
        hasNoSSN: false,
        [addressKeys.street]: [street1, address?.street2 ?? street2].filter(Boolean).join(', '),
        [addressKeys.city]: address?.city,
        [addressKeys.state]: state,
        [addressKeys.zipCode]: address?.zip,
        [addressKeys.country]: countryCode,
        companyName: business?.companyName,
        companyType: COMPANY_TYPE_BY_INCORPORATION_TYPE[business?.incorporationType ?? ''],
        // What the user already saved to Wise wins over the details above
        ...getSavedAnswers(business?.wise),
    };
}

/**
 * The prefill answers the draft does not hold yet. A key the draft already has is the user's, even when they cleared it.
 * Read-only rows are the exception: the user cannot change them, so they follow the bank account.
 */
function getMissingPrefill(prefill: DynamicFormValues, draft: DynamicFormValues): DynamicFormValues {
    const missing: DynamicFormValues = {};
    for (const [key, value] of Object.entries(prefill)) {
        if (READONLY_KEYS.has(key)) {
            const readonlyValue = value ?? '';
            if ((draft[key] ?? '') !== readonlyValue) {
                missing[key] = readonlyValue;
            }
            continue;
        }
        if ((value || value === false) && draft[key] === undefined) {
            missing[key] = value;
        }
    }
    return missing;
}

export default getWiseBusinessOnboardingPrefill;
export {getMissingPrefill, WISE_BUSINESS_ACCOUNT_KEYS};
export type {WiseBusinessAccountData};
