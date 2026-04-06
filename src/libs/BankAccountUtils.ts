import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';
import type PrivatePersonalDetails from '@src/types/onyx/PrivatePersonalDetails';
import {getCurrentAddress} from './PersonalDetailsUtils';

function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, account: OnyxEntry<OnyxTypes.Account>, shouldShowPublicDomain = false): string {
    return account?.isFromPublicDomain && !shouldShowPublicDomain ? '' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

function isBankAccountPartiallySetup(state: string | undefined) {
    return state === CONST.BANK_ACCOUNT.STATE.SETUP || state === CONST.BANK_ACCOUNT.STATE.VERIFYING || state === CONST.BANK_ACCOUNT.STATE.PENDING;
}

function doesPolicyHavePartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, policyID: string) {
    if (!bankAccountList) {
        return false;
    }

    const bankAccounts = Object.values(bankAccountList);
    const matchingBankAccount = bankAccounts.find((bankAccount) => bankAccount.accountData?.policyIDs?.includes(policyID));

    return isBankAccountPartiallySetup(matchingBankAccount?.accountData?.state);
}

function hasPartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isBankAccountPartiallySetup(bankAccount?.accountData?.state));
}

/**
 * Step numbers for the personal bank account update flow.
 */
const PERSONAL_INFO_STEP = {
    NAME: 1,
    ADDRESS: 2,
    PHONE: 3,
} as const;

type AdditionalData = AccountData['additionalData'];

function hasOwnerName(additionalData: AdditionalData): boolean {
    return !!additionalData?.firstName && !!additionalData?.lastName;
}

function hasOwnerAddress(additionalData: AdditionalData): boolean {
    return !!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode;
}

function hasOwnerPhone(additionalData: AdditionalData): boolean {
    return !!additionalData?.companyPhone;
}

/**
 * Check if a US personal bank account in OPEN state is missing required personal information.
 * Checks both additionalData on the bank account and privatePersonalDetails (user profile),
 * because some fields (e.g. name) are only stored in the user's profile, not on additionalData.
 */
function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined, privatePersonalDetails?: OnyxEntry<PrivatePersonalDetails>): boolean {
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.PERSONAL) {
        return false;
    }

    if (accountData.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return false;
    }

    // additionalData.country is optional — legacy US accounts may omit it.
    // Mirror BankAccount.getCountry() which defaults to US when absent.
    const country = accountData.additionalData?.country ?? CONST.COUNTRY.US;
    if (country !== CONST.COUNTRY.US) {
        return false;
    }

    const {additionalData} = accountData;
    const currentAddress = getCurrentAddress(privatePersonalDetails);
    const nameOnAccount = hasOwnerName(additionalData);
    const nameOnProfile = !!privatePersonalDetails?.legalFirstName && !!privatePersonalDetails?.legalLastName;
    const addressOnAccount = hasOwnerAddress(additionalData);
    const addressOnProfile =
        !!(currentAddress?.street || currentAddress?.addressLine1) && !!currentAddress?.city && !!currentAddress?.state && !!(currentAddress?.zip || currentAddress?.zipPostCode);
    const phoneOnAccount = hasOwnerPhone(additionalData);
    const phoneOnProfile = !!privatePersonalDetails?.phoneNumber;

    const namePresent = nameOnAccount || nameOnProfile;
    const addressPresent = addressOnAccount || addressOnProfile;
    const phonePresent = phoneOnAccount || phoneOnProfile;
    const isMissing = !namePresent || !addressPresent || !phonePresent;

    // eslint-disable-next-line no-console
    console.log(
        `[DEBUG-86803] isPersonalBankAccountMissingInfo bankAccountID=${accountData.bankAccountID} result=${isMissing}`,
        JSON.stringify({
            type: accountData.type,
            state: accountData.state,
            country,
            name: {onAccount: nameOnAccount, onProfile: nameOnProfile, present: namePresent},
            address: {onAccount: addressOnAccount, onProfile: addressOnProfile, present: addressPresent},
            phone: {onAccount: phoneOnAccount, onProfile: phoneOnProfile, present: phonePresent},
            additionalData: {
                firstName: additionalData?.firstName,
                lastName: additionalData?.lastName,
                addressStreet: additionalData?.addressStreet,
                addressCity: additionalData?.addressCity,
                addressState: additionalData?.addressState,
                addressZipCode: additionalData?.addressZipCode,
                companyPhone: additionalData?.companyPhone,
            },
            profile: {
                legalFirstName: privatePersonalDetails?.legalFirstName,
                legalLastName: privatePersonalDetails?.legalLastName,
                phoneNumber: privatePersonalDetails?.phoneNumber,
                addressLine1: currentAddress?.addressLine1,
                city: currentAddress?.city,
                state: currentAddress?.state,
                zipPostCode: currentAddress?.zipPostCode,
            },
            privatePersonalDetailsIsNull: privatePersonalDetails === null,
            privatePersonalDetailsIsUndefined: privatePersonalDetails === undefined,
        }),
    );

    return isMissing;
}

/**
 * Returns step numbers that already have data and can be skipped in the update flow.
 * Checks both additionalData and privatePersonalDetails, matching isPersonalBankAccountMissingInfo logic.
 */
function getCompletedStepsForBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, bankAccountID: number, privatePersonalDetails?: OnyxEntry<PrivatePersonalDetails>): number[] {
    const bankAccount = bankAccountList?.[String(bankAccountID)];
    if (!bankAccount) {
        return [];
    }

    const {additionalData} = bankAccount.accountData ?? {};
    const currentAddress = getCurrentAddress(privatePersonalDetails);
    const completedSteps: number[] = [];

    if (hasOwnerName(additionalData) || (!!privatePersonalDetails?.legalFirstName && !!privatePersonalDetails?.legalLastName)) {
        completedSteps.push(PERSONAL_INFO_STEP.NAME);
    }
    if (
        hasOwnerAddress(additionalData) ||
        (!!(currentAddress?.street || currentAddress?.addressLine1) && !!currentAddress?.city && !!currentAddress?.state && !!(currentAddress?.zip || currentAddress?.zipPostCode))
    ) {
        completedSteps.push(PERSONAL_INFO_STEP.ADDRESS);
    }
    if (hasOwnerPhone(additionalData) || !!privatePersonalDetails?.phoneNumber) {
        completedSteps.push(PERSONAL_INFO_STEP.PHONE);
    }

    return completedSteps;
}

function hasPersonalBankAccountMissingInfo(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, privatePersonalDetails?: OnyxEntry<PrivatePersonalDetails>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isPersonalBankAccountMissingInfo(bankAccount?.accountData, privatePersonalDetails));
}

export {
    getDefaultCompanyWebsite,
    getLastFourDigits,
    hasPartiallySetupBankAccount,
    hasPersonalBankAccountMissingInfo,
    isBankAccountPartiallySetup,
    doesPolicyHavePartiallySetupBankAccount,
    isPersonalBankAccountMissingInfo,
    getCompletedStepsForBankAccount,
    PERSONAL_INFO_STEP,
};
