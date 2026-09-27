import type {BankAccount, BankAccountList, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {getKnownAccountIDByLogin} from './PersonalDetailsUtils';

/**
 * The policy fields that identify the workspace bank account and who pays from it. Components that only attribute a
 * payment subscribe to this shape (see `policyPaymentAttributionSelector`) instead of the whole policy.
 */
type PolicyPaymentAttribution = Pick<Policy, 'achAccount' | 'reimburser'>;

/**
 * The workspace's connected bank account as it appears in the current user's own `bankAccountList`, or undefined when
 * the account is not shared with them.
 */
function getAccessiblePolicyBankAccount(policy: OnyxEntry<PolicyPaymentAttribution>, bankAccountList: OnyxEntry<BankAccountList>): BankAccount | undefined {
    const policyBankAccountID = policy?.achAccount?.bankAccountID;

    if (!policyBankAccountID) {
        return undefined;
    }

    return bankAccountList?.[policyBankAccountID];
}

/**
 * Whether the user can actually pay from the workspace's connected bank account. This gates every place that would
 * otherwise default a payment to `policy.achAccount`. Paying with, or displaying, an account the user has no access to
 * is always wrong. See `getAccessiblePolicyBankAccount` for why `bankAccountList` is the authority.
 */
function canAccessPolicyBankAccount(policy: OnyxEntry<PolicyPaymentAttribution>, bankAccountList: OnyxEntry<BankAccountList>): boolean {
    return !!getAccessiblePolicyBankAccount(policy, bankAccountList);
}

/**
 * Whether a payment made by `payerAccountID` can be assumed to have been funded by the workspace's connected bank
 * account.
 */
function wasPaidWithPolicyBankAccount(policy: OnyxEntry<PolicyPaymentAttribution>, payerAccountID: number | undefined): boolean {
    const reimburserEmail = policy?.reimburser ?? policy?.achAccount?.reimburser;

    if (!reimburserEmail) {
        return true;
    }

    const reimburserAccountID = getKnownAccountIDByLogin(reimburserEmail);

    if (reimburserAccountID === undefined) {
        return true;
    }

    return !!payerAccountID && reimburserAccountID === payerAccountID;
}

export {canAccessPolicyBankAccount, getAccessiblePolicyBankAccount, wasPaidWithPolicyBankAccount};

export type {PolicyPaymentAttribution};
