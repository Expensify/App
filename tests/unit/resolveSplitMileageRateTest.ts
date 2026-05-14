import type {ValueOf} from 'type-fest';
import {resolveSplitMileageRate} from '@libs/actions/IOU/SplitExpenseItems';
import CONST from '@src/CONST';
import type {Policy, Transaction} from '@src/types/onyx';

const CUSTOM_UNIT_ID = 'distance-unit-1';
const ACTIVE_RATE_ID = 'rate-active';
const DELETED_RATE_ID = 'rate-deleted';
const PENDING_DELETE_RATE_ID = 'rate-pending-delete';
const ACTIVE_RATE_VALUE = 100;
const DELETED_RATE_VALUE = 75;
const ACTIVE_RATE_NAME = 'Default Rate';

type RateOverrides = {
    rate?: number;
    enabled?: boolean;
    pendingAction?: ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION> | null;
    name?: string;
    index?: number;
};

const buildRate = (customUnitRateID: string, overrides: RateOverrides = {}) => ({
    customUnitRateID,
    currency: CONST.CURRENCY.USD,
    rate: overrides.rate ?? ACTIVE_RATE_VALUE,
    enabled: overrides.enabled ?? true,
    name: overrides.name ?? ACTIVE_RATE_NAME,
    subRates: [],
    pendingAction: overrides.pendingAction ?? undefined,
    index: overrides.index,
});

const buildPolicyWithRates = (rates: Record<string, ReturnType<typeof buildRate>>): Policy =>
    ({
        id: 'policy-1',
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                enabled: true,
                attributes: {
                    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                },
                rates,
            },
        },
    }) as unknown as Policy;

const buildDistanceTransaction = (customUnitRateID: string | undefined): Transaction =>
    ({
        transactionID: 'tx-1',
        amount: -1000,
        currency: CONST.CURRENCY.USD,
        comment: {
            type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
            customUnit: {
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                customUnitID: CUSTOM_UNIT_ID,
                customUnitRateID,
                distanceUnit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
                quantity: 10,
            },
        },
    }) as unknown as Transaction;

describe('resolveSplitMileageRate', () => {
    describe('workspace context (isSelfDMSplit=false)', () => {
        it('returns the base mileage rate even when the rate is marked disabled — workspace flow never substitutes the fallback', () => {
            const policy = buildPolicyWithRates({
                [DELETED_RATE_ID]: buildRate(DELETED_RATE_ID, {rate: DELETED_RATE_VALUE, enabled: false, name: 'Deleted Rate', index: 0}),
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 1}),
            });
            const transaction = buildDistanceTransaction(DELETED_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: false});

            // base getRate returns the disabled rate (mileageRates includes disabled when a selected rate ID is provided)
            expect(result.rate).toBe(DELETED_RATE_VALUE);
        });

        it('returns the base mileage rate when isSelfDMSplit is omitted', () => {
            const policy = buildPolicyWithRates({
                [DELETED_RATE_ID]: buildRate(DELETED_RATE_ID, {rate: DELETED_RATE_VALUE, enabled: false, name: 'Deleted Rate', index: 0}),
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 1}),
            });
            const transaction = buildDistanceTransaction(DELETED_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy});

            expect(result.rate).toBe(DELETED_RATE_VALUE);
        });
    });

    describe('selfDM context (isSelfDMSplit=true)', () => {
        it('substitutes the workspace default rate when the original rate is marked `enabled: false`', () => {
            const policy = buildPolicyWithRates({
                [DELETED_RATE_ID]: buildRate(DELETED_RATE_ID, {rate: DELETED_RATE_VALUE, enabled: false, name: 'Deleted Rate', index: 0}),
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 1}),
            });
            const transaction = buildDistanceTransaction(DELETED_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: true});

            expect(result.rate).toBe(ACTIVE_RATE_VALUE);
            expect(result.customUnitRateID).toBe(ACTIVE_RATE_ID);
        });

        it('substitutes the workspace default rate when the original rate has `pendingAction: DELETE`', () => {
            const policy = buildPolicyWithRates({
                // ACTIVE first so getDefaultMileageRate (which sorts by index) returns it as the policy default.
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 0}),
                [PENDING_DELETE_RATE_ID]: buildRate(PENDING_DELETE_RATE_ID, {
                    rate: DELETED_RATE_VALUE,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    name: 'Pending Delete',
                    index: 1,
                }),
            });
            const transaction = buildDistanceTransaction(PENDING_DELETE_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: true});

            expect(result.rate).toBe(ACTIVE_RATE_VALUE);
            expect(result.customUnitRateID).toBe(ACTIVE_RATE_ID);
        });

        it('substitutes the workspace default rate when the original rate is no longer present in policy customUnits', () => {
            const policy = buildPolicyWithRates({
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 0}),
            });
            const transaction = buildDistanceTransaction('rate-that-was-removed');

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: true});

            expect(result.rate).toBe(ACTIVE_RATE_VALUE);
            expect(result.customUnitRateID).toBe(ACTIVE_RATE_ID);
        });

        it('returns the base mileage rate when the original rate is still active', () => {
            const policy = buildPolicyWithRates({
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 0}),
            });
            const transaction = buildDistanceTransaction(ACTIVE_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: true});

            expect(result.rate).toBe(ACTIVE_RATE_VALUE);
            expect(result.customUnitRateID).toBe(ACTIVE_RATE_ID);
        });

        it('returns the base mileage rate for P2P expenses without consulting the workspace fallback', () => {
            const policy = buildPolicyWithRates({
                [ACTIVE_RATE_ID]: buildRate(ACTIVE_RATE_ID, {rate: ACTIVE_RATE_VALUE, name: ACTIVE_RATE_NAME, index: 0}),
            });
            const transaction = buildDistanceTransaction(CONST.CUSTOM_UNITS.FAKE_P2P_ID);

            const result = resolveSplitMileageRate({transaction, policy, isSelfDMSplit: true});

            // The P2P branch is taken: result.rate comes from getRateForP2P, not the workspace's deleted-rate
            // fallback. We assert the rate is defined and not the workspace's fallback.
            expect(result.rate).toBeDefined();
            expect(result.customUnitRateID).not.toBe(ACTIVE_RATE_ID);
        });

        it('returns the base mileage rate when no policy is provided (cannot detect deletion without it)', () => {
            const transaction = buildDistanceTransaction(DELETED_RATE_ID);

            const result = resolveSplitMileageRate({transaction, policy: undefined, isSelfDMSplit: true});

            // Without a policy, the deleted-rate guard can't fire — fall through to baseMileageRate.
            // For an unreported transaction with no policy, base rate ends up undefined/0; the helper
            // returns whatever getRate returned (no fallback substitution).
            expect(result.customUnitRateID).toBeUndefined();
        });
    });
});
