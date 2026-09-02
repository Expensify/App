import {act, renderHook, waitFor} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';

import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';

import type {ValueOf} from 'type-fest';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

type MockConfirmModalOptions = {
    imageHeight?: number;
    imageStyles?: unknown;
    imageWidth?: number;
    promptStyles?: unknown;
    titleContainerStyles?: unknown;
};

type MockConfirmModalResult = {action: ValueOf<typeof ModalActions>};

const mockShowConfirmModal = jest.fn<Promise<MockConfirmModalResult>, [MockConfirmModalOptions]>();
const mockRootState: ReturnType<typeof navigationRef.getRootState> = {
    key: 'root',
    index: 0,
    routeNames: [],
    routes: [],
    type: 'stack',
    stale: false,
};

jest.mock('@hooks/useConfirmModal', () => () => ({
    showConfirmModal: mockShowConfirmModal,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: jest.fn(),
    },
}));

jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget');

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
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CLOSE});
        jest.mocked(Navigation.navigate).mockClear();
        jest.mocked(swapBackgroundTabForRHPTarget).mockClear();
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue(mockRootState);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(() => {
        jest.restoreAllMocks();
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
        expect(mockShowConfirmModal).toHaveBeenCalledWith(
            expect.objectContaining({
                imageHeight: 140,
                imageStyles: expect.arrayContaining([expect.objectContaining({marginTop: 20}), expect.objectContaining({marginHorizontal: 20})]),
                imageWidth: 160,
                promptStyles: expect.arrayContaining([expect.objectContaining({marginBottom: 16})]),
                titleContainerStyles: expect.objectContaining({marginBottom: 8}),
            }),
        );
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

    it('opens private personal details on top of the profile page when the home address prompt is confirmed', async () => {
        mockShowConfirmModal.mockResolvedValue({action: ModalActions.CONFIRM});
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

        await act(async () => {
            expect(result.current()).toBe(true);
            await Promise.resolve();
        });
        await waitFor(() => expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1)));
        expect(swapBackgroundTabForRHPTarget).toHaveBeenCalledWith(mockRootState, ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1));
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
