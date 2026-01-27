import {Str} from 'expensify-common';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type AccountData from '@src/types/onyx/AccountData';
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

function hasPartiallySetupBankAccount(bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>): boolean {
    return Object.values(bankAccountList ?? {}).some((bankAccount) => isBankAccountPartiallySetup(bankAccount?.accountData?.state));
}

/**
 * Check if a US personal bank account in OPEN state is missing required personal information
 * (legal name, address, or phone number) from PrivatePersonalDetails.
 *
 * This is used to show "Action required" badge for existing accounts that need updates
 * to enable global reimbursement payments.
 */
function isPersonalBankAccountMissingInfo(accountData: AccountData | undefined, privatePersonalDetails: OnyxEntry<OnyxTypes.PrivatePersonalDetails>): boolean {
    // Only applies to personal bank accounts
    if (accountData?.type !== CONST.BANK_ACCOUNT.TYPE.PERSONAL) {
        return false;
    }

    // Only applies to fully setup accounts (OPEN state)
    // Partially setup accounts already show "Action required" via isAccountInSetupState
    if (accountData?.state !== CONST.BANK_ACCOUNT.STATE.OPEN) {
        return false;
    }

    // Only applies to US accounts
    if (accountData?.additionalData?.country !== CONST.COUNTRY.US) {
        return false;
    }

    // Check if personal details are missing
    const currentAddress = getCurrentAddress(privatePersonalDetails);
    const hasLegalName = !!privatePersonalDetails?.legalFirstName && !!privatePersonalDetails?.legalLastName;
    const hasAddress = !!currentAddress?.street && !!currentAddress?.city && !!currentAddress?.state && !!currentAddress?.zip;
    const hasPhoneNumber = !!privatePersonalDetails?.phoneNumber;

    return !hasLegalName || !hasAddress || !hasPhoneNumber;
}

export {getDefaultCompanyWebsite, getLastFourDigits, hasPartiallySetupBankAccount, isBankAccountPartiallySetup, isPersonalBankAccountMissingInfo};
