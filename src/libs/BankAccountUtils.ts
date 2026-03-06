import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';

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
 * Check if a US personal bank account in OPEN state is missing required personal information.
 */
function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined): boolean {
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
    const hasName = !!additionalData?.firstName && !!additionalData?.lastName;
    const hasAddress = !!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode;
    const hasPhone = !!additionalData?.companyPhone;

    return !hasName || !hasAddress || !hasPhone;
}

/**
 * Returns step numbers (1=name, 2=address, 3=phone) that already have data on the bank account
 * and can be skipped in the update flow.
 */
function getCompletedStepsForBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): number[] {
    const missingAccount = Object.values(bankAccountList ?? {}).find((bankAccount) => isPersonalBankAccountMissingInfo(bankAccount?.accountData));
    if (!missingAccount) {
        return [];
    }

    const {additionalData} = missingAccount.accountData ?? {};
    const completedSteps: number[] = [];

    if (!!additionalData?.firstName && !!additionalData?.lastName) {
        completedSteps.push(1);
    }
    if (!!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode) {
        completedSteps.push(2);
    }
    if (!!additionalData?.companyPhone) {
        completedSteps.push(3);
    }

    return completedSteps;
}

export {
    getDefaultCompanyWebsite,
    getLastFourDigits,
    hasPartiallySetupBankAccount,
    isBankAccountPartiallySetup,
    doesPolicyHavePartiallySetupBankAccount,
    isPersonalBankAccountMissingInfo,
    getCompletedStepsForBankAccount,
};
