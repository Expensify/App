import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useDistanceRateOriginalPolicy from '@hooks/useDistanceRateOriginalPolicy';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import createRandomPolicy from '../utils/collections/policies';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useDistanceRateOriginalPolicy', () => {
    const customUnitRateID = 'rate_id';
    const policyID = 'workspace-policy';

    const policy: Policy = {
        ...createRandomPolicy(1),
        id: policyID,
        customUnits: {
            unitId: {
                attributes: {unit: 'mi'},
                customUnitID: 'unitId',
                defaultCategory: 'Car',
                enabled: true,
                name: 'Distance',
                rates: {
                    [customUnitRateID]: {
                        currency: 'USD',
                        customUnitRateID,
                        enabled: true,
                        name: '2025 mileage',
                        rate: 65.5,
                    },
                },
            },
        },
    };

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy);
        await waitForBatchedUpdates();
    });

    it('returns the policy that owns the distance rate', async () => {
        const {result} = renderHook(() => useDistanceRateOriginalPolicy(customUnitRateID));

        await waitFor(() => {
            expect(result.current?.id).toBe(policyID);
        });
    });

    it('returns undefined when lookup is disabled', async () => {
        const {result} = renderHook(() => useDistanceRateOriginalPolicy(customUnitRateID, false));

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
    });

    it('returns undefined when customUnitRateID is undefined', async () => {
        const {result} = renderHook(() => useDistanceRateOriginalPolicy(undefined));

        await waitFor(() => {
            expect(result.current).toBeUndefined();
        });
    });
});
