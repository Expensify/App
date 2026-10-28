import {removeLastSegment} from '@libs/actions/GPSDraftDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const point = (lat: number, long: number): GPSPoint => ({lat, long});

const stoppedTrip = (gpsPoints: GPSPoint[][]): GpsDraftDetails => ({
    gpsPoints,
    distanceInMeters: 0,
    isTracking: false,
    reportID: '1',
    unit: 'mi' as Unit,
});

const getStoredPoints = async (): Promise<GPSPoint[][] | undefined> => {
    await waitForBatchedUpdates();
    return (await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS))?.gpsPoints;
};

describe('GPSDraftDetails actions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    describe('removeLastSegment', () => {
        it('drops the last segment of a resumed trip', async () => {
            const gpsPoints = [[point(0, 0), point(0, 1)], [point(1, 0)]];
            await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, stoppedTrip(gpsPoints));

            removeLastSegment(gpsPoints);

            expect(await getStoredPoints()).toEqual([[point(0, 0), point(0, 1)]]);
        });

        it('keeps the only segment of a trip', async () => {
            const gpsPoints = [[point(0, 0)]];
            await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, stoppedTrip(gpsPoints));

            removeLastSegment(gpsPoints);

            expect(await getStoredPoints()).toEqual([[point(0, 0)]]);
        });
    });
});
