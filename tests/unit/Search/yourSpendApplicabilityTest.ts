/**
 * Tests for Your Spend slot applicability helpers.
 *
 * `hasApprovalFlow` must gate on `isPaidGroupPolicy` first. Approval mode is
 * present on personal/free policies but is functionally inert there. A personal
 * policy with `approvalMode = BASIC` must NOT be treated as having an approval flow.
 */
import {arePaymentsEnabled, hasApprovalFlow} from '@libs/PolicyUtils';
import {getYourSpendApplicability} from '@pages/home/YourSpendSection/useYourSpendData';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';

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

    it('includes IDs of paid group policies (Team/Corporate) and excludes personal and submit policies', () => {
        const corporate = makePolicy({id: 'b_corp', type: CONST.POLICY.TYPE.CORPORATE});
        const personal = makePolicy({id: 'c_personal', type: CONST.POLICY.TYPE.PERSONAL});
        const submit = makePolicy({id: 'd_submit', type: CONST.POLICY.TYPE.SUBMIT});
        const team = makePolicy({id: 'a_team', type: CONST.POLICY.TYPE.TEAM});

        const result = getYourSpendApplicability(policiesCollection([corporate, personal, submit, team]));

        // Only paid group (Team/Corporate) policies are included; Personal and Submit are excluded.
        expect(result.paidGroupPolicyIDs).toEqual(['a_team', 'b_corp']);
        expect(result.isApprovalApplicable).toBe(true);
    });

    it('includes paid group policies regardless of approvalMode (BASIC, ADVANCED, OPTIONAL, unset)', () => {
        // The widget no longer requires an approval workflow — any paid group policy counts.
        // OPTIONAL-approval reports won't usually be OUTSTANDING in practice (auto-closed),
        // but if they are, they should still surface here.
        const optional = makePolicy({id: 'optional', type: CONST.POLICY.TYPE.TEAM, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        const unset = makePolicy({id: 'unset', type: CONST.POLICY.TYPE.CORPORATE, approvalMode: undefined});

        const result = getYourSpendApplicability(policiesCollection([optional, unset]));

        expect(result.paidGroupPolicyIDs).toEqual(['optional', 'unset']);
        expect(result.isApprovalApplicable).toBe(true);
    });

    it('returns paidGroupPolicyIDs sorted ascending regardless of input order', () => {
        const p1 = makePolicy({id: 'z_policy', type: CONST.POLICY.TYPE.CORPORATE});
        const p2 = makePolicy({id: 'a_policy', type: CONST.POLICY.TYPE.TEAM});
        const p3 = makePolicy({id: 'm_policy', type: CONST.POLICY.TYPE.CORPORATE});

        const result = getYourSpendApplicability(policiesCollection([p1, p2, p3]));

        expect(result.paidGroupPolicyIDs).toEqual(['a_policy', 'm_policy', 'z_policy']);
    });

    it('reports isPaymentApplicable independently of paidGroupPolicyIDs', () => {
        // A TEAM policy with REIMBURSEMENT_NO contributes to paidGroupPolicyIDs (it's a paid
        // group policy) but not to isPaymentApplicable (no payments enabled).
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
