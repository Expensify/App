import {renderHook} from '@testing-library/react-native';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

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
    useMemoizedLazyIllustrations: () => ({House: 'House', HouseWithMap: 'HouseWithMap'}),
}));

describe('useBlockDistanceRequest', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockShowConfirmModal.mockClear();
        mockShowConfirmModal.mockResolvedValue({action: 'cancel'});
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
            useBlockDistanceRequest({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_forced')).toBe(true);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('blocks selecting a workspace that requires GPS or map entry without commuter exclusions', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_requires_map_or_gps`, {
            id: 'policy_requires_map_or_gps',
            name: 'Map or GPS required workspace',
            areDistanceRatesEnabled: true,
            requireMapOrGPS: true,
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useBlockDistanceRequest({
                isOdometerDistanceRequest: true,
            }),
        );

        expect(result.current('policy_requires_map_or_gps')).toBe(true);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('does not block selecting a workspace without commuter exclusions', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_open`, {
            id: 'policy_open',
            name: 'Open workspace',
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useBlockDistanceRequest({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_open')).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('does not fall back to the current workspace when selecting a policy-less participant', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_forced`, {
            id: 'policy_forced',
            name: 'Forced workspace',
            commuterExclusions: {
                method: 'fixedDistance',
                fixedDistance: 1,
                fixedDistanceUnit: 'mi',
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useBlockDistanceRequest({
                policyID: 'policy_forced',
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current(undefined)).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('blocks selecting a workspace with commuter exclusions even when distance rates are disabled', async () => {
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
            useBlockDistanceRequest({
                isManualDistanceRequest: true,
            }),
        );

        expect(result.current('policy_disabled_rates')).toBe(true);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
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

        const {result} = renderHook(() => useBlockDistanceRequest({}));

        expect(result.current('policy_forced')).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('blocks a distance request when home and office exclusions require a missing home address', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_home_and_office`, {
            id: 'policy_home_and_office',
            name: 'Home and office workspace',
            commuterExclusions: {
                method: 'homeAndOffice',
            },
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useBlockDistanceRequest({
                policyID: 'policy_home_and_office',
                isDistanceRequest: true,
            }),
        );

        expect(result.current()).toBe(true);
        expect(mockShowConfirmModal).toHaveBeenCalledWith(expect.objectContaining({title: 'iou.homeAddressRequired.title'}));
    });

    it('allows a distance request when the current home address is present', async () => {
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}policy_home_and_office`, {
            id: 'policy_home_and_office',
            name: 'Home and office workspace',
            commuterExclusions: {
                method: 'homeAndOffice',
            },
        });
        await Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {
            addresses: [{street: '123 Main Street', current: true}],
        });
        await waitForBatchedUpdates();

        const {result} = renderHook(() =>
            useBlockDistanceRequest({
                policyID: 'policy_home_and_office',
                isDistanceRequest: true,
            }),
        );

        expect(result.current()).toBe(false);
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });
});
