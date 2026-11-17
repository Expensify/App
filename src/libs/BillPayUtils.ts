/** Shared eligibility rules for Bills, Inbox, and report actions. */
import ONYXKEYS from '@src/ONYXKEYS';
import type {Domain, Policy, Report} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {isBillPayReport, isBillReport} from './BillUtils';
// eslint-disable-next-line no-restricted-imports -- Classic shows Bill only to admins of Collect or Control workspaces, so Submit workspaces are excluded on purpose.
import {getActiveAdminWorkspaces, isPaidGroupPolicy} from './PolicyUtils';
import {canApproveBill, canPayBill} from './ReportUtils';

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
