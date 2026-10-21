/**
 * The workspace reimburser and payer, the reimbursement choice, and auto-pay availability.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';

import type {NullishDeep, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {canMemberWrite} from './permissions';
import {isGroupPolicy} from './policyType';

/**
 * Resolve the email of the workspace's Authorized Payer (reimburser), matching the canonical resolution used across the app.
 * Returns undefined when reimbursement is disabled or no payer can be resolved.
 */
function getReimburserEmail(policy: OnyxEntry<Policy>): string | undefined {
    if (!policy) {
        return undefined;
    }

    const reimbursementChoice = getReimbursementChoice(policy);
    const isAutoReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
    const isManualReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;

    // Reimbursement is disabled for this workspace.
    if (!isAutoReimbursement && !isManualReimbursement) {
        return undefined;
    }

    return policy.reimburser ?? policy.achAccount?.reimburser ?? (isManualReimbursement ? policy.owner : undefined);
}

/**
 * Payer fields to merge into the successData of an ownership transfer. The backend keeps the former payer when the
 * workspace has a bank account, so only reassign when there is none and the outgoing owner is the resolved payer.
 */
function getOwnerChangePayerSuccessData(policy: OnyxEntry<Policy>, newOwnerLogin: string): NullishDeep<Policy> {
    if (!policy || policy.achAccount?.bankAccountID || getReimburserEmail(policy) !== policy.owner) {
        return {};
    }

    return {
        ...(policy.reimburser ? {reimburser: newOwnerLogin} : {}),
        ...(policy.achAccount?.reimburser ? {achAccount: {reimburser: newOwnerLogin}} : {}),
    };
}

function isPolicyPayer(policy: OnyxEntry<Policy>, currentUserLogin: string | undefined): boolean {
    if (!policy) {
        return false;
    }

    const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
    const reimbursementChoice = getReimbursementChoice(policy);
    const isAutoReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
    const isManualReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;

    // Reimbursement is disabled for this workspace.
    if (!isAutoReimbursement && !isManualReimbursement) {
        return false;
    }

    const reimburserEmail = getReimburserEmail(policy);

    // No designated reimburser means any workspace admin can pay.
    if (!reimburserEmail) {
        return isAdmin;
    }

    const canPayOnPolicy = isAdmin || (!!currentUserLogin && canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS));

    return canPayOnPolicy && currentUserLogin === reimburserEmail;
}

/**
 * Whether an admin/payments admin who isn't the designated workspace payer can still pay reports on the policy.
 * Unlike `isPolicyPayer`/`isPayer`, this must not drive active prompting (badges, GBRs, next steps, pay to-dos), which stay payer-only.
 */
function canAdminPayReport(policy: OnyxInputOrEntry<Policy>, currentUserLogin: string): boolean {
    const reimbursementChoice = getReimbursementChoice(policy);
    const isReimbursementConfigured =
        reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES || reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;

    return isGroupPolicy(policy) && isReimbursementConfigured && canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);
}

/**
 * Resolves a workspace's reimbursement choice to one of the three values in `CONST.POLICY.REIMBURSEMENT_CHOICES`.
 * Comparing the raw field instead makes a workspace reporting a deprecated value look like it has reimbursement
 * disabled, which hides Pay on its approved reports.
 */
function getReimbursementChoice(policy: OnyxInputOrEntry<Policy>): ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES> | undefined {
    switch (policy?.reimbursementChoice) {
        case CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO:
            return CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        case CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL:
            return CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
        default:
            return policy?.reimbursementChoice;
    }
}

function arePaymentsEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return getReimbursementChoice(policy) !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
}

/** Whether the workspace has everything auto-pay approved reports needs: workflows, direct reimbursements, and a business bank account. */
function isAutoPayApprovedReportsAvailable(policy: OnyxInputOrEntry<Policy>): boolean {
    return !!policy?.areWorkflowsEnabled && getReimbursementChoice(policy) === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES && !!policy?.achAccount?.bankAccountID;
}

/**
 * Returns the accountID of the policy reimburser, if not available returns -1.
 */
function getReimburserAccountID(policy: OnyxEntry<Policy>): number {
    const reimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';
    return reimburserEmail ? (getAccountIDsByLogins([reimburserEmail]).at(0) ?? -1) : -1;
}

export {
    getReimburserEmail,
    getOwnerChangePayerSuccessData,
    isPolicyPayer,
    canAdminPayReport,
    getReimbursementChoice,
    arePaymentsEnabled,
    isAutoPayApprovedReportsAvailable,
    getReimburserAccountID,
};
