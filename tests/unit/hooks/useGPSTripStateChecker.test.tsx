import {act, renderHook} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import useGPSTripStateChecker from '@hooks/useGPSTripStateChecker/index.native';

import type * as GPSDraftDetailsUtils from '@libs/GPSDraftDetailsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {GpsDraftDetails} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import React from 'react';
import Onyx from 'react-native-onyx';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import getOnyxValue from '../../utils/getOnyxValue';
import {getShowConfirmModalOption, mockCloseModalByID, MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {navigate: jest.fn()},
}));

jest.mock('@pages/iou/request/step/IOURequestStepDistanceGPS/GPSNotifications', () => ({
    startGpsTripNotification: jest.fn(),
    stopGpsTripNotification: jest.fn(),
    updateGpsTripNotificationDistance: jest.fn(),
    updateGpsTripNotificationUnit: jest.fn(),
    updateGpsTripNotificationLanguage: jest.fn(),
    checkAndCleanGpsNotification: jest.fn(() => Promise.resolve()),
    shouldUpdateGpsNotificationUnit: jest.fn(() => false),
}));

// The hook returns nothing and pushes its prompt onto the global modal stack, so what it pushed -- and when it
// took that entry back down -- is the only observable behaviour there is to assert on.
jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

// Stubbed so "did answering the prompt stop the trip, and with which points" is a direct assertion. The real one
// talks to expo-location and fetches an address for the last point.
const mockStopGpsTrip = jest.fn<Promise<void>, Parameters<typeof GPSDraftDetailsUtils.stopGpsTrip>>(() => Promise.resolve());
jest.mock('@libs/GPSDraftDetailsUtils', () => ({
    ...jest.requireActual<typeof GPSDraftDetailsUtils>('@libs/GPSDraftDetailsUtils'),
    stopGpsTrip: (...args: Parameters<typeof GPSDraftDetailsUtils.stopGpsTrip>) => mockStopGpsTrip(...args),
}));

// Driven per test so the splash screen can be raised and lowered, which is one of the conditions that used to hide
// the prompt for free while it was rendered inline.
let mockSplashScreenState: ValueOf<typeof CONST.BOOT_SPLASH_STATE> = 'visible';
jest.mock('@src/SplashScreenStateContext', () => ({
    useSplashScreenState: () => ({splashScreenState: mockSplashScreenState}),
}));

const CURRENT_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;

// Has to match the id the hook pushes its prompt under, because closing that exact entry is a behaviour under test.
const CONTINUE_TRIP_MODAL_ID = 'gpsContinueTrip';

const FIRST_POINT = {lat: 1, long: 2};
const LATER_POINT = {lat: 3, long: 4};

const trip: GpsDraftDetails = {
    gpsPoints: [[FIRST_POINT]],
    distanceInMeters: 100,
    isTracking: true,
    reportID: '1',
    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
};

function Wrapper({children}: {children: React.ReactNode}) {
    return <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>{children}</ComposeProviders>;
}

function renderChecker() {
    return renderHook(() => useGPSTripStateChecker(), {wrapper: Wrapper});
}

describe('useGPSTripStateChecker', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        resetMockConfirmModal();
        mockStopGpsTrip.mockClear();
        mockSplashScreenState = CONST.BOOT_SPLASH_STATE.VISIBLE;
        await Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();
    });

    it('keeps a trip that records no accountID, because it predates the trip owner being stored', async () => {
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, trip);
        await waitForBatchedUpdatesWithAct();

        renderChecker();
        await waitForBatchedUpdatesWithAct();

        expect((await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS))?.isTracking).toBe(true);
    });

    it('keeps a trip started by the signed in user', async () => {
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {...trip, accountID: CURRENT_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();

        renderChecker();
        await waitForBatchedUpdatesWithAct();

        expect((await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS))?.isTracking).toBe(true);
    });

    it('discards a trip started by a different user', async () => {
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {...trip, accountID: OTHER_ACCOUNT_ID});
        await waitForBatchedUpdatesWithAct();

        renderChecker();
        await waitForBatchedUpdatesWithAct();

        expect(await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS)).toBeUndefined();
    });

    it('does not prompt while the splash screen is still up', async () => {
        // Given a tracking trip restored on app restart, with the splash screen still covering the app
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, trip);
        await waitForBatchedUpdatesWithAct();

        // When the checker mounts
        renderChecker();
        await waitForBatchedUpdatesWithAct();

        // Then nothing is pushed, because a prompt behind the splash screen is one the user cannot answer
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('prompts to continue a tracking trip, and opts hardware back out of the destructive cancel', async () => {
        // Given a tracking trip restored on app restart, with the splash screen already down
        mockSplashScreenState = CONST.BOOT_SPLASH_STATE.HIDDEN;
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, trip);
        await waitForBatchedUpdatesWithAct();

        // When the checker mounts
        renderChecker();
        await waitForBatchedUpdatesWithAct();

        // Then exactly one prompt is pushed, under the id the auto-hide below closes
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('id')).toBe(CONTINUE_TRIP_MODAL_ID);

        // Then hardware back is opted out, because cancelling here stops the trip rather than dismissing the prompt
        expect(getShowConfirmModalOption('shouldHandleNavigationBack')).toBe(false);
    });

    it('stops the trip with every point recorded up to the moment the user answered, not just the ones it had when prompted', async () => {
        // Given a prompt that has been open long enough for the trip to record another point
        mockSplashScreenState = CONST.BOOT_SPLASH_STATE.HIDDEN;
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, trip);
        await waitForBatchedUpdatesWithAct();

        renderChecker();
        await waitForBatchedUpdatesWithAct();

        await act(async () => {
            await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {gpsPoints: [[FIRST_POINT, LATER_POINT]]});
        });
        await waitForBatchedUpdatesWithAct();

        // When the user picks "view trip", which stops it
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
        });
        await waitForBatchedUpdatesWithAct();

        // Then the trip is submitted with the points as they stand now; reading the show-time value would truncate it
        expect(mockStopGpsTrip).toHaveBeenCalledWith(false, [[FIRST_POINT, LATER_POINT]]);
    });

    it('takes the prompt down by id, and does not stop the trip, when tracking stops while it is open', async () => {
        // Given an open continue-trip prompt
        mockSplashScreenState = CONST.BOOT_SPLASH_STATE.HIDDEN;
        await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, trip);
        await waitForBatchedUpdatesWithAct();

        renderChecker();
        await waitForBatchedUpdatesWithAct();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

        // When tracking stops without the user having answered
        await act(async () => {
            await Onyx.merge(ONYXKEYS.GPS_DRAFT_DETAILS, {isTracking: false});
        });
        await waitForBatchedUpdatesWithAct();

        // Then that one entry is closed by id, rather than popping whatever modal happens to sit on top
        expect(mockCloseModalByID).toHaveBeenCalledWith(CONTINUE_TRIP_MODAL_ID);

        // Then the trip is left alone, because the user never chose to stop it
        expect(mockStopGpsTrip).not.toHaveBeenCalled();

        // Then the prompt is not pushed again once it is gone
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });
});
