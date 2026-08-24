import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import GPSTripStateChecker from '@components/GPSTripStateChecker/index.native';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {SplashScreenStateContextProvider} from '@src/SplashScreenStateContext';
import type {GpsDraftDetails} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../../utils/getOnyxValue';
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

const CURRENT_ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;

const trip: GpsDraftDetails = {
    gpsPoints: [[{lat: 1, long: 2}]],
    distanceInMeters: 100,
    isTracking: true,
    reportID: '1',
    unit: CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES,
};

function renderChecker() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, SplashScreenStateContextProvider]}>
            <GPSTripStateChecker />
        </ComposeProviders>,
    );
}

describe('GPSTripStateChecker', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
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
});
