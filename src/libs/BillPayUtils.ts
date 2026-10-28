/** Shared eligibility rules for Bills, Home, Inbox, and report actions. */
import CONST from '@src/CONST';
import type {Domain, Policy, Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

// eslint-disable-next-line no-restricted-imports -- Classic shows Bill only to admins of Collect or Control workspaces, so Submit workspaces are excluded on purpose.
import {arePaymentsEnabled, getActiveAdminWorkspaces, isPaidGroupPolicy} from './PolicyUtils';

/**
 * Matches the Classic rules for showing Bill. The user must be an admin of a group workspace and belong to their private email
 * domain, and the domain must have a technical contact to receive the bill.
 */
function canCreateBill(policies: OnyxCollection<Policy>, domains: OnyxCollection<Domain>, email: string | undefined, isFromPublicDomain: boolean | undefined): boolean {
    if (!email || isFromPublicDomain || !getActiveAdminWorkspaces(policies, email).some(isPaidGroupPolicy)) {
        return false;
    }
    const emailDomain = Str.extractEmailDomain(email).toLowerCase();
    return Object.values(domains ?? {}).some((domain) => !!domain?.hasTechnicalContact && !!domain.email && Str.extractEmailDomain(domain.email).toLowerCase() === emailDomain);
}

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function isBillPayReport(report: OnyxEntry<Report>, accountID: number): boolean {
    if (!report || report.isHiddenForBillReceiver) {
        return false;
    }
    return isBillReport(report) || (report.type === CONST.REPORT.TYPE.INVOICE && (report.isBillPayReport ?? report.managerID === accountID));
}

function canApproveBill(report: OnyxEntry<Report>, accountID: number): boolean {
    return isBillReport(report) && report?.managerID === accountID && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function canPayBill(report: OnyxEntry<Report>, policy: OnyxEntry<Policy> | null, accountID: number, email: string): boolean {
    if (
        !isBillPayReport(report, accountID) ||
        !report ||
        report.isWaitingOnBankAccount ||
        (report.total ?? 0) >= 0 ||
        !!policy?.archivedDate ||
        policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
    ) {
        return false;
    }
    if (report.type === CONST.REPORT.TYPE.INVOICE) {
        return report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
    }
    if (!arePaymentsEnabled(policy)) {
        return false;
    }
    const isFinallyApproved =
        report.stateNum === CONST.REPORT.STATE_NUM.APPROVED && (report.statusNum === CONST.REPORT.STATUS_NUM.APPROVED || report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED);

    // Canceling a payment on a workspace with approvals turned off leaves the bill Submitted and Closed, and it can be paid again.
    const isCanceledWithoutApproval =
        report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.CLOSED && policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    if (!isFinallyApproved && !isCanceledWithoutApproval) {
        return false;
    }
    const reimburser = policy?.reimburser ?? policy?.achAccount?.reimburser;
    return reimburser ? reimburser === email : policy?.role === CONST.POLICY.ROLE.ADMIN;
}

export {isBillReport, isBillPayReport, canApproveBill, canPayBill, canCreateBill};
