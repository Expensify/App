import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection, OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useSplitEffectivePolicy, {getSplitEffectivePolicy} from '@hooks/useSplitEffectivePolicy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyEmployeeList from '../utils/collections/policyEmployeeList';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CUSTOM_UNIT_ID = 'unit-1';
const RATE_ID = 'rate-1';

function policyWithEmployees(index: number): Policy {
    return {...createRandomPolicy(index), pendingAction: undefined, employeeList: {employee: createRandomPolicyEmployeeList()}};
}

function policyWithoutEmployees(index: number): Policy {
    return {...createRandomPolicy(index), pendingAction: undefined, employeeList: {}};
}

function policyWithDistanceUnit(index: number): Policy {
    return {
        ...createRandomPolicy(index),
        pendingAction: undefined,
        employeeList: {},
        customUnits: {
            [CUSTOM_UNIT_ID]: {
                customUnitID: CUSTOM_UNIT_ID,
                name: CONST.CUSTOM_UNITS.NAME_DISTANCE,
                attributes: {unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES},
                rates: {
                    [RATE_ID]: {customUnitRateID: RATE_ID, rate: 100, name: 'Default Rate', enabled: true, currency: CONST.CURRENCY.USD},
                },
            },
        },
    };
}

function distanceTransaction(customUnit?: {customUnitID?: string; customUnitRateID?: string}): Transaction {
    return {transactionID: 't', comment: customUnit ? {customUnit} : {}} as Transaction;
}

describe('getSplitEffectivePolicy', () => {
    const customUnitPolicy = policyWithDistanceUnit(10);
    const allPolicies: OnyxCollection<Policy> = {
        [`${ONYXKEYS.COLLECTION.POLICY}${customUnitPolicy.id}`]: customUnitPolicy,
    };
    const fallbackPolicy = policyWithEmployees(99);

    it('returns the report policy when it has an employee list', () => {
        const policy = policyWithEmployees(1);
        const result = getSplitEffectivePolicy({policy, transaction: distanceTransaction(), allPolicies, fallbackPolicy});
        expect(result?.id).toBe(policy.id);
    });

    it('falls back to the search snapshot policy when the report policy has no employee list', () => {
        const policy = policyWithoutEmployees(1);
        const searchSnapshotPolicy = policyWithEmployees(2);
        const result = getSplitEffectivePolicy({policy, searchSnapshotPolicy, transaction: distanceTransaction(), allPolicies, fallbackPolicy});
        expect(result?.id).toBe(searchSnapshotPolicy.id);
    });

    it('resolves the policy by customUnitID when there is no current policy', () => {
        const transaction = distanceTransaction({customUnitID: CUSTOM_UNIT_ID});
        const result = getSplitEffectivePolicy({policy: undefined, transaction, allPolicies, fallbackPolicy});
        expect(result?.id).toBe(customUnitPolicy.id);
    });

    it('resolves the policy by customUnitRateID when the customUnitID does not match', () => {
        const transaction = distanceTransaction({customUnitRateID: RATE_ID});
        const result = getSplitEffectivePolicy({policy: undefined, transaction, allPolicies, fallbackPolicy});
        expect(result?.id).toBe(customUnitPolicy.id);
    });

    it('skips the customUnit lookups for the P2P rate and uses the fallback', () => {
        const transaction = distanceTransaction({customUnitID: CUSTOM_UNIT_ID, customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID});
        const result = getSplitEffectivePolicy({policy: undefined, transaction, allPolicies, fallbackPolicy});
        expect(result?.id).toBe(fallbackPolicy.id);
    });

    it('returns the fallback policy when nothing else resolves', () => {
        const result = getSplitEffectivePolicy({policy: undefined, transaction: distanceTransaction(), allPolicies: {}, fallbackPolicy});
        expect(result?.id).toBe(fallbackPolicy.id);
    });

    it('prefers the draft transaction customUnit over the transaction customUnit', () => {
        const transaction = distanceTransaction({customUnitID: 'no-match'});
        const draftTransaction = distanceTransaction({customUnitID: CUSTOM_UNIT_ID});
        const result = getSplitEffectivePolicy({policy: undefined, transaction, draftTransaction, allPolicies, fallbackPolicy});
        expect(result?.id).toBe(customUnitPolicy.id);
    });
});

describe('useSplitEffectivePolicy', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('returns the report policy when it has an employee list', async () => {
        const reportPolicy = policyWithEmployees(1);
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.POLICY}${reportPolicy.id}`]: reportPolicy,
        } as unknown as OnyxMultiSetInput);
        await waitForBatchedUpdatesWithAct();

        const report = {reportID: 'r1', policyID: reportPolicy.id} as Report;
        const {result} = renderHook(() => useSplitEffectivePolicy(report, undefined, distanceTransaction()), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current?.id).toBe(reportPolicy.id);
    });

    it('resolves the policy by customUnitID when the report policy has no employee list', async () => {
        const reportPolicy = policyWithoutEmployees(1);
        const customUnitPolicy = policyWithDistanceUnit(10);
        await Onyx.multiSet({
            [`${ONYXKEYS.COLLECTION.POLICY}${reportPolicy.id}`]: reportPolicy,
            [`${ONYXKEYS.COLLECTION.POLICY}${customUnitPolicy.id}`]: customUnitPolicy,
        } as unknown as OnyxMultiSetInput);
        await waitForBatchedUpdatesWithAct();

        const report = {reportID: 'r1', policyID: reportPolicy.id} as Report;
        const {result} = renderHook(() => useSplitEffectivePolicy(report, undefined, distanceTransaction({customUnitID: CUSTOM_UNIT_ID})), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current?.id).toBe(customUnitPolicy.id);
    });

    it('returns undefined when no policy resolves and there is no moving-expenses workspace', async () => {
        const report = {reportID: 'r1', policyID: '999'} as Report;
        const {result} = renderHook(() => useSplitEffectivePolicy(report, undefined, distanceTransaction()), {wrapper: OnyxListItemProvider});
        await waitForBatchedUpdatesWithAct();

        expect(result.current).toBeUndefined();
    });
});
