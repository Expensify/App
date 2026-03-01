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

function hasPartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isBankAccountPartiallySetup(bankAccount?.accountData?.state));
}

/**
 * Check if a US personal bank account in OPEN state is missing required personal information
 * from the bank account's additionalData. Used to show "Action required" badge for accounts
 * that need updates to enable global reimbursement payments.
 */
function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined): boolean {
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.PERSONAL) {
        return false;
    }

    if (accountData.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return false;
    }

    if (accountData.additionalData?.country !== CONST.COUNTRY.US) {
        return false;
    }

    const {additionalData} = accountData;
    const hasName = !!additionalData?.firstName && !!additionalData?.lastName;
    const hasAddress = !!additionalData?.addressStreet && !!additionalData?.addressCity && !!additionalData?.addressState && !!additionalData?.addressZipCode;
    const hasPhone = !!additionalData?.companyPhone;

    return !hasName || !hasAddress || !hasPhone;
}

export {getDefaultCompanyWebsite, getLastFourDigits, hasPartiallySetupBankAccount, isBankAccountPartiallySetup, isPersonalBankAccountMissingInfo};
