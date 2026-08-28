import {getSplitReimbursable} from '@libs/actions/IOU/SplitExpenseItems';

import type {Policy, Transaction} from '@src/types/onyx';

import createMock from '../utils/createMock';

const buildPolicy = (
    overrides: {
        reimbursableLocked?: boolean;
        defaultReimbursable?: boolean;
    } = {},
): Policy =>
    createMock<Policy>({
        id: 'policy-1',
        defaultReimbursable: overrides.defaultReimbursable,
        disabledFields: {
            reimbursable: overrides.reimbursableLocked,
        },
    });

const buildTransaction = (overrides: {managedCard?: boolean} = {}): Transaction =>
    createMock<Transaction>({
        transactionID: 'tx-1',
        managedCard: overrides.managedCard,
    });

describe('getSplitReimbursable', () => {
    describe('policy locks the reimbursable field ("Always …" cash-expense modes)', () => {
        it('returns the policy default (true) even when the parent expense is stored as non-reimbursable', () => {
            const policy = buildPolicy({
                reimbursableLocked: true,
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, false, buildTransaction())).toBe(true);
        });

        it('returns the policy default (false) even when a pre-rule parent expense still carries reimbursable: true', () => {
            const policy = buildPolicy({
                reimbursableLocked: true,
                defaultReimbursable: false,
            });

            expect(getSplitReimbursable(policy, true, buildTransaction())).toBe(false);
        });

        it('returns the policy default when the parent value is undefined', () => {
            const policy = buildPolicy({
                reimbursableLocked: true,
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, undefined, buildTransaction())).toBe(true);
        });

        it('returns undefined when the field is locked but the policy has no defaultReimbursable', () => {
            const policy = buildPolicy({reimbursableLocked: true});

            expect(getSplitReimbursable(policy, true, buildTransaction())).toBeUndefined();
        });
    });

    describe('policy does not lock the reimbursable field ("default" cash-expense modes)', () => {
        it('inherits the parent value (true) instead of the policy default', () => {
            const policy = buildPolicy({
                reimbursableLocked: false,
                defaultReimbursable: false,
            });

            expect(getSplitReimbursable(policy, true, buildTransaction())).toBe(true);
        });

        it('inherits the parent value (false) instead of the policy default', () => {
            const policy = buildPolicy({
                reimbursableLocked: false,
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, false, buildTransaction())).toBe(false);
        });

        it('inherits the parent value when disabledFields is absent entirely', () => {
            const policy = createMock<Policy>({
                id: 'policy-1',
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, false, buildTransaction())).toBe(false);
        });

        it('inherits the parent value when there is no policy at all (selfDM / P2P split)', () => {
            expect(getSplitReimbursable(undefined, true, buildTransaction())).toBe(true);
            expect(getSplitReimbursable(undefined, false, buildTransaction())).toBe(false);
            expect(getSplitReimbursable(undefined, undefined, buildTransaction())).toBeUndefined();
        });
    });

    describe('managed-card transactions', () => {
        it('stays false under a locked "Always reimbursable" policy — the split editor hides the toggle, so the user could not correct it', () => {
            const policy = buildPolicy({
                reimbursableLocked: true,
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, true, buildTransaction({managedCard: true}))).toBe(false);
        });

        it('stays false when the field is unlocked and the parent expense is reimbursable', () => {
            const policy = buildPolicy({
                reimbursableLocked: false,
                defaultReimbursable: true,
            });

            expect(getSplitReimbursable(policy, true, buildTransaction({managedCard: true}))).toBe(false);
        });

        it('stays false with no policy', () => {
            expect(getSplitReimbursable(undefined, true, buildTransaction({managedCard: true}))).toBe(false);
        });
    });

    describe('missing transaction', () => {
        it('falls through to the policy default when the field is locked', () => {
            const policy = buildPolicy({
                reimbursableLocked: true,
                defaultReimbursable: false,
            });

            expect(getSplitReimbursable(policy, true, undefined)).toBe(false);
        });

        it('falls through to the parent value when the field is not locked', () => {
            expect(getSplitReimbursable(undefined, true, undefined)).toBe(true);
        });
    });
});
