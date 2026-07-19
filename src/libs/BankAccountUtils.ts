import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';
import type {ACHData} from '@src/types/onyx/ReimbursementAccount';

import type {OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

/** Responses of the additional KYB verification checks, hinting at which documents the user still needs to upload */
type KYBVerificationResponses = NonNullable<ACHData['verifications']>['externalApiResponses'];

function getDefaultCompanyWebsite(session: OnyxEntry<OnyxTypes.Session>, account: OnyxEntry<OnyxTypes.Account>, shouldShowPublicDomain = false): string {
    return account?.isFromPublicDomain && !shouldShowPublicDomain ? '' : `https://www.${Str.extractEmailDomain(session?.email ?? '')}`;
}

function getLastFourDigits(bankAccountNumber: string): string {
    return bankAccountNumber ? bankAccountNumber.slice(-4) : '';
}

/**
 * Renders a bank account as `${friendlyBankName} xx${last4}` for Search filter
 * pickers, chips, and autocomplete suggestions. Falls back to GENERIC_BANK when
 * the bank name is missing or not in CONST.BANK_NAMES_USER_FRIENDLY.
 */
function getBankAccountSearchLabel(bankAccount: OnyxEntry<OnyxTypes.BankAccount>): string {
    // BE returns bankName with the first letter uppercase (e.g. "Chase") but CONST.BANK_NAMES_USER_FRIENDLY keys are lowercase, so lowercase before the lookup.
    const bankName = bankAccount?.accountData?.additionalData?.bankName?.toLowerCase() as keyof typeof CONST.BANK_NAMES_USER_FRIENDLY | undefined;
    const accountNumber = bankAccount?.accountData?.accountNumber ?? '';
    const formattedBankName = (bankName ? CONST.BANK_NAMES_USER_FRIENDLY[bankName] : undefined) ?? CONST.BANK_NAMES_USER_FRIENDLY[CONST.BANK_NAMES.GENERIC_BANK];
    const maskedNumber = accountNumber ? `xx${getLastFourDigits(accountNumber)}` : '';
    return maskedNumber ? `${formattedBankName} ${maskedNumber}` : formattedBankName;
}

function isBankAccountPartiallySetup(state: string | undefined) {
    return state === CONST.BANK_ACCOUNT.STATE.SETUP || state === CONST.BANK_ACCOUNT.STATE.VERIFYING || state === CONST.BANK_ACCOUNT.STATE.PENDING;
}

/**
 * A BUSINESS account in a state that has actually been usable for paying expenses (anything other than SETUP / VERIFYING / PENDING).
 * Used by the search picker, the autocomplete suggestions, and the advanced-filter visibility gate so all three surfaces accept and count the same set of accounts.
 */
function isFilterableBankAccount(bankAccount: OnyxEntry<OnyxTypes.BankAccount>): boolean {
    return bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && !isBankAccountPartiallySetup(bankAccount?.accountData?.state);
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

const PERSONAL_INFO_STEP = {
    NAME: 1,
    ADDRESS: 2,
    PHONE: 3,
} as const;

type AdditionalData = AccountData['additionalData'];

function hasOwnerName(additionalData: AdditionalData): boolean {
    // OldDot stores firstName/lastName, NewDot stores legalFirstName/legalLastName — both are valid.
    return (!!additionalData?.firstName && !!additionalData?.lastName) || (!!additionalData?.legalFirstName && !!additionalData?.legalLastName);
}

function hasOwnerAddress(additionalData: AdditionalData): boolean {
    return !!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode;
}

function hasOwnerPhone(additionalData: AdditionalData): boolean {
    return !!additionalData?.companyPhone;
}

function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined): boolean {
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.PERSONAL) {
        return false;
    }

    if (accountData.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return false;
    }

    // Defaults to US when absent — legacy US accounts may omit country, matching BankAccount.getCountry().
    const country = accountData.additionalData?.country ?? CONST.COUNTRY.US;
    if (country !== CONST.COUNTRY.US) {
        return false;
    }

    const {additionalData} = accountData;

    return !hasOwnerName(additionalData) || !hasOwnerAddress(additionalData) || !hasOwnerPhone(additionalData);
}

function getCompletedStepsForBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>, bankAccountID: number): number[] {
    const bankAccount = bankAccountList?.[String(bankAccountID)];
    if (!bankAccount) {
        return [];
    }

    const {additionalData} = bankAccount.accountData ?? {};
    const completedSteps: number[] = [];

    if (hasOwnerName(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.NAME);
    }
    if (hasOwnerAddress(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.ADDRESS);
    }
    if (hasOwnerPhone(additionalData)) {
        completedSteps.push(PERSONAL_INFO_STEP.PHONE);
    }

    return completedSteps;
}

function hasPersonalBankAccountMissingInfo(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isPersonalBankAccountMissingInfo(bankAccount?.accountData));
}

/** Compares error keys and searches for overlap. Based on the result we decide whether to gather extra file
 * @param status - status of the check
 * @param qualifiers - errors returned after the check
 * @returns boolean - whether to gather additional address verification file
 */
function isUserAddressVerificationRequired(
    status: string | undefined,
    qualifiers:
        | Array<{
              key: string;
              message: string;
          }>
        | undefined,
): boolean {
    return (
        status !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS &&
        !!CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.ADDRESS.find((error) => qualifiers?.map((qualifier) => qualifier.key).includes(error))
    );
}

/** Compares error keys and searches for overlap. Based on the result we decide whether to gather extra file
 * @param status - status of the check
 * @param qualifiers - errors returned after the check
 * @returns boolean - whether to gather additional DOB verification file
 */
function isUserDOBVerificationRequired(
    status: string | undefined,
    qualifiers:
        | Array<{
              key: string;
              message: string;
          }>
        | undefined,
): boolean {
    return (
        status !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS && !!CONST.BANK_ACCOUNT.KYB_REQUESTOR_IDENTITY_ERROR.DOB.find((error) => qualifiers?.map((qualifier) => qualifier.key).includes(error))
    );
}

/** Builds the list of KYB document inputIDs the user must upload, based on which verification checks did not pass.
 * Returns an empty array when no documents are required (e.g. automated verification passed), in which case the
 * KYB documents step should be skipped entirely.
 * @param externalApiResponses - statuses of the external verification checks from the reimbursement account
 * @returns inputIDs of the documents that still need to be uploaded
 */
function getRequiredKYBDocuments(externalApiResponses: KYBVerificationResponses): string[] {
    const requiredDocuments: string[] = [];

    const companyTaxIDStatus = externalApiResponses?.companyTaxID?.status;
    if (companyTaxIDStatus !== undefined && companyTaxIDStatus !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.COMPANY_TAX_ID);
    }

    const lexisNexisStatus = externalApiResponses?.lexisNexisInstantIDResult?.status;
    if (lexisNexisStatus !== undefined && lexisNexisStatus !== CONST.BANK_ACCOUNT.KYB_STATUS.PASS) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.NAME_CHANGE_DOCUMENT, INPUT_IDS.KYB_DOCUMENTS.COMPANY_ADDRESS_VERIFICATION);
    }

    const requestorIdentityStatus = externalApiResponses?.requestorIdentityID?.status;
    const requestorIdentityQualifiers = externalApiResponses?.requestorIdentityID?.apiResult?.qualifiers?.qualifier;
    if (isUserAddressVerificationRequired(requestorIdentityStatus, requestorIdentityQualifiers)) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.USER_ADDRESS_VERIFICATION);
    }
    if (isUserDOBVerificationRequired(requestorIdentityStatus, requestorIdentityQualifiers)) {
        requiredDocuments.push(INPUT_IDS.KYB_DOCUMENTS.USER_DOB_VERIFICATION);
    }

    return requiredDocuments;
}

export {
    getBankAccountSearchLabel,
    isFilterableBankAccount,
    getDefaultCompanyWebsite,
    getRequiredKYBDocuments,
    getLastFourDigits,
    hasPartiallySetupBankAccount,
    hasPersonalBankAccountMissingInfo,
    isBankAccountPartiallySetup,
    isUserAddressVerificationRequired,
    isUserDOBVerificationRequired,
    doesPolicyHavePartiallySetupBankAccount,
    isPersonalBankAccountMissingInfo,
    getCompletedStepsForBankAccount,
    PERSONAL_INFO_STEP,
};
export type {KYBVerificationResponses};
