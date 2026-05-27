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
    it('returns empty approvalPolicyIDs and isApprovalApplicable=false for no policies', () => {
        const result = getYourSpendApplicability(undefined);
        expect(result.approvalPolicyIDs).toEqual([]);
        expect(result.isApprovalApplicable).toBe(false);
    });

    it('returns empty approvalPolicyIDs and isApprovalApplicable=false for an empty collection', () => {
        const result = getYourSpendApplicability({});
        expect(result.approvalPolicyIDs).toEqual([]);
        expect(result.isApprovalApplicable).toBe(false);
    });

    it('includes only IDs of policies that pass hasApprovalFlow', () => {
        const corporateBasic = makePolicy({id: 'b_corp_basic', type: CONST.POLICY.TYPE.CORPORATE, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        const personalBasic = makePolicy({id: 'c_personal_basic', type: CONST.POLICY.TYPE.PERSONAL, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        const teamOptional = makePolicy({id: 'd_team_optional', type: CONST.POLICY.TYPE.TEAM, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL});
        const teamBasic = makePolicy({id: 'a_team_basic', type: CONST.POLICY.TYPE.TEAM, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});

        const result = getYourSpendApplicability(policiesCollection([corporateBasic, personalBasic, teamOptional, teamBasic]));

        expect(result.approvalPolicyIDs).toEqual(['a_team_basic', 'b_corp_basic']);
        expect(result.isApprovalApplicable).toBe(true);
    });

    it('returns approvalPolicyIDs sorted ascending regardless of input order', () => {
        const p1 = makePolicy({id: 'z_policy', type: CONST.POLICY.TYPE.CORPORATE, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        const p2 = makePolicy({id: 'a_policy', type: CONST.POLICY.TYPE.TEAM, approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC});
        const p3 = makePolicy({id: 'm_policy', type: CONST.POLICY.TYPE.CORPORATE, approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED});

        const result = getYourSpendApplicability(policiesCollection([p1, p2, p3]));

        expect(result.approvalPolicyIDs).toEqual(['a_policy', 'm_policy', 'z_policy']);
    });

    it('reports isPaymentApplicable independently of approvalPolicyIDs', () => {
        // A TEAM policy with payments enabled but OPTIONAL approval mode: contributes to payment
        // applicability, but not to approvalPolicyIDs.
        const teamOptional = makePolicy({
            id: 'team_optional',
            type: CONST.POLICY.TYPE.TEAM,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
        });

        const result = getYourSpendApplicability(policiesCollection([teamOptional]));

        expect(result.approvalPolicyIDs).toEqual([]);
        expect(result.isApprovalApplicable).toBe(false);
        expect(result.isPaymentApplicable).toBe(true);
    });
});
