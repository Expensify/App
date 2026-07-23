import {renderHook} from '@testing-library/react-native';

import useCommuterExclusionGuard from '@hooks/useCommuterExclusionGuard';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const mockShowConfirmModal = jest.fn();

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({HouseWithMap: 'HouseWithMap'}),
}));

describe('useCommuterExclusionGuard', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockShowConfirmModal.mockClear();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('blocks selecting a workspace with commuter exclusions for manual distance before the workspace changes', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_forced`, {
            id: 'policy_forced',
            name: 'Forced workspace',
            areDistanceRatesEnabled: true,
            commuterExclusions: {
                method: 'fixedDistance',
                fixedDistance: 1,
                fixedDistanceUnit: 'mi',
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useCommuterExclusionGuard({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_forced')).toBe(true);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('does not block selecting a workspace without commuter exclusions', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_open`, {
            id: 'policy_open',
            name: 'Open workspace',
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useCommuterExclusionGuard({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_open')).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('does not block selecting a workspace with commuter exclusions when distance rates are disabled', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_disabled_rates`, {
            id: 'policy_disabled_rates',
            name: 'Disabled rates workspace',
            areDistanceRatesEnabled: false,
            commuterExclusions: {
                method: 'fixedDistance',
                fixedDistance: 1,
                fixedDistanceUnit: 'mi',
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useCommuterExclusionGuard({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_disabled_rates')).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('does not block non-manual and non-odometer flows', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_forced`, {
            id: 'policy_forced',
            name: 'Forced workspace',
            areDistanceRatesEnabled: true,
            commuterExclusions: {
                method: 'fixedDistance',
                fixedDistance: 1,
                fixedDistanceUnit: 'mi',
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useCommuterExclusionGuard({}));

        expect(result.current('policy_forced')).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});
