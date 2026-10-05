/**
 * Resolves the legal name and address that back a personal bank account, picking from the wallet draft, saved wallet
 * details, then the private profile, and derives which owner-detail pages the bank-account and KYC flows can skip.
 */
import {getCurrentAddress, getStreetLines} from '@libs/PersonalDetailsUtils';
import {getInvalidAddressErrorTranslationPath, isValidZipCode} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import type {WalletAdditionalDetailsForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';
import type {PersonalInfoStepProps} from '@src/types/form/WalletAdditionalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

import type {OnyxEntry} from 'react-native-onyx';

import getSubstepValues from './getSubstepValues';

const BANK_ACCOUNT_PAGES = CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES;
const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;

type OwnerDetailPageName = typeof BANK_ACCOUNT_PAGES.LEGAL_NAME | typeof BANK_ACCOUNT_PAGES.ADDRESS;

type AddressSource = 'draft' | 'wallet' | 'profile' | 'none';

type WalletOwnerFieldValues = Partial<Pick<PersonalInfoStepProps, 'legalFirstName' | 'legalLastName' | 'addressStreet' | 'addressCity' | 'addressState' | 'addressZipCode'>>;

type BankAccountOwnerSources = {
    walletAdditionalDetailsDraft?: WalletOwnerFieldValues | null;
    walletAdditionalDetails?: Partial<WalletAdditionalDetailsRefactor> | null;
    privatePersonalDetails?: OnyxEntry<PrivatePersonalDetails>;
};

type BankAccountOwnerDetails = {
    legalFirstName: string;
    legalLastName: string;
    addressStreet: string;
    addressStreet2: string;
    addressCity: string;
    addressState: string;
    addressZipCode: string;
    /** Street plus street2, so confirmation can show the second line after a comma */
    displayStreet: string;
    /** Single-line street for the wallet address input. That input drops a newline, which would glue the two lines together. */
    formStreet: string;
    /** US when the address is complete enough to submit; otherwise empty */
    country: typeof CONST.COUNTRY.US | '';
    hasLegalName: boolean;
    hasAddress: boolean;
};

function filled(value?: string): string {
    return value?.trim() ?? '';
}

function pickFilled(draft?: string, wallet?: string, profile?: string): {value: string; source: AddressSource} {
    const draftValue = filled(draft);
    if (draftValue) {
        return {value: draftValue, source: 'draft'};
    }

    const walletValue = filled(wallet);
    if (walletValue) {
        return {value: walletValue, source: 'wallet'};
    }

    const profileValue = filled(profile);
    if (profileValue) {
        return {value: profileValue, source: 'profile'};
    }

    return {value: '', source: 'none'};
}

function isPhysicalStreet(street: string): boolean {
    return getInvalidAddressErrorTranslationPath(street) === undefined;
}

/**
 * Resolves the legal name and address to attach to a personal bank account.
 * Wallet draft wins, then saved wallet details, then the private profile.
 * This flow is US-only: a non-US profile address is not treated as complete unless the wallet form replaced every address field.
 */
function getBankAccountOwnerDetails({walletAdditionalDetailsDraft, walletAdditionalDetails, privatePersonalDetails}: BankAccountOwnerSources): BankAccountOwnerDetails {
    const legalFirstName = pickFilled(walletAdditionalDetailsDraft?.legalFirstName, walletAdditionalDetails?.legalFirstName, privatePersonalDetails?.legalFirstName).value;
    const legalLastName = pickFilled(walletAdditionalDetailsDraft?.legalLastName, walletAdditionalDetails?.legalLastName, privatePersonalDetails?.legalLastName).value;

    const profileAddress = getCurrentAddress(privatePersonalDetails);
    const [profileStreetLine1, profileStreetFromNewline] = getStreetLines(profileAddress?.street ?? '');
    const profileStreet2 = filled(profileStreetFromNewline) || filled(profileAddress?.street2) || filled(profileAddress?.addressLine2);
    const profileZip = profileAddress?.zip ?? profileAddress?.zipCode ?? profileAddress?.zipPostCode;

    const streetPick = pickFilled(walletAdditionalDetailsDraft?.addressStreet, walletAdditionalDetails?.addressStreet, profileStreetLine1);
    let addressStreet = streetPick.value;
    let addressStreet2 = '';
    if (streetPick.source === 'profile') {
        addressStreet2 = profileStreet2;
    } else if (streetPick.source !== 'none') {
        const [line1, line2] = getStreetLines(streetPick.value);
        addressStreet = filled(line1);
        addressStreet2 = filled(line2);
    }

    const cityPick = pickFilled(walletAdditionalDetailsDraft?.addressCity, walletAdditionalDetails?.addressCity, profileAddress?.city);
    const statePick = pickFilled(walletAdditionalDetailsDraft?.addressState, walletAdditionalDetails?.addressState, profileAddress?.state);
    const zipPick = pickFilled(walletAdditionalDetailsDraft?.addressZipCode, walletAdditionalDetails?.addressZipCode, profileZip);
    const addressSources = [streetPick.source, cityPick.source, statePick.source, zipPick.source];
    const allFieldsFromWalletForm = addressSources.every((source) => source === 'draft' || source === 'wallet');
    const profileCountry = filled(profileAddress?.country);
    const legacyOrUsProfileCountry = !profileCountry || profileCountry === CONST.COUNTRY.US;
    // A non-US profile stays incomplete until the wallet form supplies street, city, state, and ZIP.
    const usAddressIsAllowed = allFieldsFromWalletForm || legacyOrUsProfileCountry;
    const hasAddressFields = !!addressStreet && !!cityPick.value && !!statePick.value && !!zipPick.value;
    const hasPhysicalStreet = isPhysicalStreet(addressStreet) && (!addressStreet2 || isPhysicalStreet(addressStreet2));
    const hasAddress = hasAddressFields && hasPhysicalStreet && isValidZipCode(zipPick.value) && usAddressIsAllowed;
    const formStreet = addressStreet2 ? `${addressStreet} ${addressStreet2}` : addressStreet;

    return {
        legalFirstName,
        legalLastName,
        addressStreet,
        addressStreet2,
        addressCity: cityPick.value,
        addressState: statePick.value,
        addressZipCode: zipPick.value,
        displayStreet: addressStreet2 ? `${addressStreet}\n${addressStreet2}` : addressStreet,
        formStreet,
        country: hasAddress ? CONST.COUNTRY.US : '',
        hasLegalName: !!legalFirstName && !!legalLastName,
        hasAddress,
    };
}

/** Page names to skip in both the wallet bank-account step and later KYC personal info. */
function getSkippedBankAccountOwnerPages(details: BankAccountOwnerDetails): OwnerDetailPageName[] {
    const skippedPages: OwnerDetailPageName[] = [];
    if (details.hasLegalName) {
        skippedPages.push(BANK_ACCOUNT_PAGES.LEGAL_NAME);
    }
    if (details.hasAddress) {
        skippedPages.push(BANK_ACCOUNT_PAGES.ADDRESS);
    }
    return skippedPages;
}

/** Draft update so KYC reads the same name and address that were sent with the bank account. */
function getWalletOwnerDraftValues(details: BankAccountOwnerDetails): Partial<PersonalInfoStepProps> {
    return {
        ...(details.legalFirstName ? {legalFirstName: details.legalFirstName} : {}),
        ...(details.legalLastName ? {legalLastName: details.legalLastName} : {}),
        ...(details.formStreet ? {addressStreet: details.formStreet} : {}),
        ...(details.addressCity ? {addressCity: details.addressCity} : {}),
        ...(details.addressState ? {addressState: details.addressState} : {}),
        ...(details.addressZipCode ? {addressZipCode: details.addressZipCode} : {}),
    };
}

/**
 * Personal-info values with name and address filled from the owner-details resolver.
 * Date of birth, phone, and SSN stay on the wallet form.
 */
function getPersonalInfoStepValues(
    walletAdditionalDetailsDraft: OnyxEntry<WalletAdditionalDetailsForm>,
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>,
    privatePersonalDetails?: OnyxEntry<PrivatePersonalDetails>,
): PersonalInfoStepProps {
    const base = getSubstepValues(PERSONAL_INFO_STEP_KEYS, walletAdditionalDetailsDraft, walletAdditionalDetails);
    const owner = getBankAccountOwnerDetails({walletAdditionalDetailsDraft, walletAdditionalDetails, privatePersonalDetails});

    return {
        [PERSONAL_INFO_STEP_KEYS.FIRST_NAME]: owner.legalFirstName,
        [PERSONAL_INFO_STEP_KEYS.LAST_NAME]: owner.legalLastName,
        [PERSONAL_INFO_STEP_KEYS.STREET]: owner.formStreet,
        [PERSONAL_INFO_STEP_KEYS.CITY]: owner.addressCity,
        [PERSONAL_INFO_STEP_KEYS.STATE]: owner.addressState,
        [PERSONAL_INFO_STEP_KEYS.ZIP_CODE]: owner.addressZipCode,
        [PERSONAL_INFO_STEP_KEYS.DOB]: String(base[PERSONAL_INFO_STEP_KEYS.DOB] ?? ''),
        [PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER]: String(base[PERSONAL_INFO_STEP_KEYS.PHONE_NUMBER] ?? ''),
        [PERSONAL_INFO_STEP_KEYS.SSN_LAST_4]: String(base[PERSONAL_INFO_STEP_KEYS.SSN_LAST_4] ?? ''),
    };
}

export {getBankAccountOwnerDetails, getPersonalInfoStepValues, getSkippedBankAccountOwnerPages, getWalletOwnerDraftValues};
