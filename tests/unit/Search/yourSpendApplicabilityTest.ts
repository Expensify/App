/**
 * Tests for Your Spend slot applicability helpers.
 *
 * `hasApprovalFlow` must gate on `isPaidGroupPolicy` first. Approval mode is
 * present on personal/free policies but is functionally inert there. A personal
 * policy with `approvalMode = BASIC` must NOT be treated as having an approval flow.
 */
import {arePaymentsEnabled, hasApprovalFlow} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
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
