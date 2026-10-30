/** Shared eligibility rules for Bills, Inbox, and report actions. */
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, Policy, Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

// eslint-disable-next-line no-restricted-imports -- Classic shows Bill only to admins of Collect or Control workspaces, so Submit workspaces are excluded on purpose.
import {arePaymentsEnabled, getActiveAdminWorkspaces, isPaidGroupPolicy} from './PolicyUtils';

type BillPayCounts = {
    /** Whether the user has any bill or received invoice, which shows Spend > Bills */
    hasBills: boolean;

    /** Number of bills waiting for the user to approve them */
    billsApprove: number;

    /** Number of bills and received invoices waiting for the user to pay them */
    billsPay: number;
};

/**
 * Matches the Classic rule that only admins of a group workspace can create a bill. Users must also belong to a private
 * email domain whose technical contact receives the bill, which getBillReceiverEmail checks.
 */
function isBillCreatorPolicyAdmin(policies: OnyxCollection<Policy>, email: string | undefined): boolean {
    return !!email && getActiveAdminWorkspaces(policies, email).some(isPaidGroupPolicy);
}

/** Returns the technical contact of the user's email domain, who receives the bills the user creates. */
function getBillReceiverEmail(domains: OnyxCollection<Domain>, email: string | undefined): string | undefined {
    if (!email) {
        return undefined;
    }
    const emailDomain = Str.extractEmailDomain(email).toLowerCase();
    const domain = Object.values(domains ?? {}).find((item) => !!item?.email && Str.extractEmailDomain(item.email).toLowerCase() === emailDomain);
    return domain?.technicalContactEmail ? domain.technicalContactEmail : undefined;
}

function isBillReport(report: OnyxEntry<Report>): boolean {
    return report?.type === CONST.REPORT.TYPE.BILL;
}

function isBillPayReport(report: OnyxEntry<Report>, accountID: number): boolean {
    if (!report || report.isHiddenForBillReceiver) {
        return false;
    }

    // Search results carry Auth's isBillPayReport flag. Other reports don't, so this falls back to Auth's rule that the
    // receiver of an invoice pays it through Bill Pay.
    return isBillReport(report) || (report.type === CONST.REPORT.TYPE.INVOICE && (report.isBillPayReport ?? report.managerID === accountID));
}

function canApproveBill(report: OnyxEntry<Report>, accountID: number): boolean {
    return isBillReport(report) && report?.managerID === accountID && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED;
}

function canPayBill(report: OnyxEntry<Report>, policy: OnyxEntry<Policy> | null, accountID: number, email: string): boolean {
    // Bills and invoices store the amount owed as a negative total, so a total of zero or more leaves nothing to pay
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

/** Counts the bills that Spend > Bills shows, from the same reports the Inbox uses. */
function getBillPayCounts(reports: OnyxCollection<Report>, policies: OnyxCollection<Policy>, accountID: number, email: string): BillPayCounts {
    const counts: BillPayCounts = {hasBills: false, billsApprove: 0, billsPay: 0};
    for (const report of Object.values(reports ?? {})) {
        if (!report || !isBillPayReport(report, accountID)) {
            continue;
        }
        counts.hasBills = true;
        if (canApproveBill(report, accountID)) {
            counts.billsApprove++;
        }
        if (canPayBill(report, policies?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`], accountID, email)) {
            counts.billsPay++;
        }
    }
    return counts;
}

export {isBillReport, isBillPayReport, canApproveBill, canPayBill, isBillCreatorPolicyAdmin, getBillReceiverEmail, getBillPayCounts};
export type {BillPayCounts};
