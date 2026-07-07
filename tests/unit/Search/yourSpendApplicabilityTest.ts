/**
 * Tests for Your Spend slot applicability helpers.
 *
 * `hasApprovalFlow` must gate on `isPaidGroupPolicy` first. Approval mode is
 * present on personal/free policies but is functionally inert there. A personal
 * policy with `approvalMode = BASIC` must NOT be treated as having an approval flow.
 */
import {arePaymentsEnabled, hasApprovalFlow} from '@libs/PolicyUtils';

import {getOutstandingReportsSignature, getYourSpendApplicability} from '@pages/home/YourSpendSection/useYourSpendData';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';

function makePolicy(overrides: Partial<Policy> = {}): Policy {
    return {
        id: 'test_policy_id',
        name: 'Test Policy',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: 'admin',
        owner: 'test@example.com',
        ownerAccountID: 1,
        isPolicyExpenseChatEnabled: true,
        outputCurrency: CONST.CURRENCY.USD,
        ...overrides,
    } as Policy;
}

function policiesCollection(policies: Policy[]): Record<string, Policy> {
    return Object.fromEntries(policies.map((p, idx) => [`${ONYXKEYS.COLLECTION.POLICY}${p.id ?? idx}`, p]));
}

function makeReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: 'r1',
        policyID: 'policy_1',
        ownerAccountID: 12345,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        ...overrides,
    } as Report;
}

function reportsCollection(reports: Report[]): Record<string, Report> {
    return Object.fromEntries(reports.map((r) => [`${ONYXKEYS.COLLECTION.REPORT}${r.reportID}`, r]));
}

describe('hasApprovalFlow', () => {
    // Personal-policy fixture that locks in the isPaidGroupPolicy gate
    it('returns false for a personal policy even when approvalMode is BASIC', () => {
        const personalPolicy = makePolicy({
            type: CONST.POLICY.TYPE.PERSONAL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });
        expect(hasApprovalFlow(personalPolicy)).toBe(false);
    });

    it('returns false for a TEAM policy with approvalMode OPTIONAL (Submit & Close)', () => {
        const policy = makePolicy({
            type: CONST.POLICY.TYPE.TEAM,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
        });
        expect(hasApprovalFlow(policy)).toBe(false);
    });

    it('returns false for a CORPORATE policy with no approvalMode set', () => {
        const policy = makePolicy({
            type: CONST.POLICY.TYPE.CORPORATE,
            approvalMode: undefined,
        });
        expect(hasApprovalFlow(policy)).toBe(false);
    });

    it('returns false for an undefined policy', () => {
        expect(hasApprovalFlow(undefined)).toBe(false);
    });

    it('returns true for a TEAM (paid group) policy with approvalMode BASIC', () => {
        const policy = makePolicy({
            type: CONST.POLICY.TYPE.TEAM,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });
        expect(hasApprovalFlow(policy)).toBe(true);
    });

    it('returns true for a CORPORATE (paid group) policy with approvalMode ADVANCED', () => {
        const policy = makePolicy({
            type: CONST.POLICY.TYPE.CORPORATE,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        });
        expect(hasApprovalFlow(policy)).toBe(true);
    });
});

describe('arePaymentsEnabled (payment row applicability)', () => {
    it('returns false when reimbursementChoice is REIMBURSEMENT_NO', () => {
        const policy = makePolicy({
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        });
        expect(arePaymentsEnabled(policy)).toBe(false);
    });

    it('returns true for direct reimbursement (REIMBURSEMENT_YES)', () => {
        const policy = makePolicy({
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        });
        expect(arePaymentsEnabled(policy)).toBe(true);
    });

    it('returns true for manual reimbursement (REIMBURSEMENT_MANUAL)', () => {
        const policy = makePolicy({
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });
        expect(arePaymentsEnabled(policy)).toBe(true);
    });
});

describe('getYourSpendApplicability', () => {
    it('returns empty paidGroupPolicyIDs and isApprovalApplicable=false for no policies', () => {
        const result = getYourSpendApplicability(undefined);
        expect(result.paidGroupPolicyIDs).toEqual([]);
        expect(result.isApprovalApplicable).toBe(false);
    });

    it('returns empty paidGroupPolicyIDs and isApprovalApplicable=false for an empty collection', () => {
        const result = getYourSpendApplicability({});
        expect(result.paidGroupPolicyIDs).toEqual([]);
        expect(result.isApprovalApplicable).toBe(false);
    });

    it('includes Team and Corporate policies and excludes personal and submit', () => {
        const team = makePolicy({id: 'team', type: CONST.POLICY.TYPE.TEAM});
        const corporate = makePolicy({id: 'corporate', type: CONST.POLICY.TYPE.CORPORATE});
        const personal = makePolicy({id: 'personal', type: CONST.POLICY.TYPE.PERSONAL});
        const submit = makePolicy({id: 'submit', type: CONST.POLICY.TYPE.SUBMIT});

        const result = getYourSpendApplicability(policiesCollection([team, corporate, personal, submit]));

        expect(result.paidGroupPolicyIDs).toEqual(expect.arrayContaining(['team', 'corporate']));
        expect(result.paidGroupPolicyIDs).toHaveLength(2);
        expect(result.isApprovalApplicable).toBe(true);
    });

    it('includes paid group policies regardless of approvalMode', () => {
        const optional = makePolicy({id: 'optional', type: CONST.POLICY.TYPE.TEAM, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        const unset = makePolicy({id: 'unset', type: CONST.POLICY.TYPE.CORPORATE, approvalMode: undefined});

        const result = getYourSpendApplicability(policiesCollection([optional, unset]));

        expect(result.paidGroupPolicyIDs).toEqual(expect.arrayContaining(['optional', 'unset']));
        expect(result.isApprovalApplicable).toBe(true);
    });

    it('reports isPaymentApplicable independently of paidGroupPolicyIDs', () => {
        // Paid group policy without payments enabled: contributes to the ID list but not to isPaymentApplicable.
        const teamNoPayments = makePolicy({
            id: 'team_no_payments',
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        });

        const result = getYourSpendApplicability(policiesCollection([teamNoPayments]));

        expect(result.paidGroupPolicyIDs).toEqual(['team_no_payments']);
        expect(result.isApprovalApplicable).toBe(true);
        expect(result.isPaymentApplicable).toBe(false);
    });
});

describe('getOutstandingReportsSignature', () => {
    const ACCOUNT_ID = 12345;
    const PAID_GROUP_POLICY_IDS = ['policy_1', 'policy_2'];

    it('returns an empty string when reports is undefined', () => {
        expect(getOutstandingReportsSignature(undefined, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('');
    });

    it('returns an empty string when paidGroupPolicyIDs is empty', () => {
        expect(getOutstandingReportsSignature(reportsCollection([makeReport()]), [], ACCOUNT_ID)).toBe('');
    });

    it('includes only SUBMITTED/SUBMITTED reports owned by the account on a listed policy', () => {
        const reports = reportsCollection([makeReport({reportID: 'r1', policyID: 'policy_1'}), makeReport({reportID: 'r2', policyID: 'policy_2'})]);

        expect(getOutstandingReportsSignature(reports, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('r1,r2');
    });

    it('excludes reports on a policy not in the list', () => {
        const reports = reportsCollection([makeReport({reportID: 'r1', policyID: 'policy_1'}), makeReport({reportID: 'r2', policyID: 'policy_other'})]);

        expect(getOutstandingReportsSignature(reports, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('r1');
    });

    it('excludes reports owned by a different account', () => {
        const reports = reportsCollection([makeReport({reportID: 'r1'}), makeReport({reportID: 'r2', ownerAccountID: 99999})]);

        expect(getOutstandingReportsSignature(reports, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('r1');
    });

    it('excludes non-OUTSTANDING reports', () => {
        const reports = reportsCollection([
            makeReport({reportID: 'r1'}),
            makeReport({reportID: 'r2', stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED}),
        ]);

        expect(getOutstandingReportsSignature(reports, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('r1');
    });

    it('returns report IDs sorted ascending regardless of input order', () => {
        const reports = reportsCollection([makeReport({reportID: 'r3'}), makeReport({reportID: 'r1'}), makeReport({reportID: 'r2'})]);

        expect(getOutstandingReportsSignature(reports, PAID_GROUP_POLICY_IDS, ACCOUNT_ID)).toBe('r1,r2,r3');
    });
});
