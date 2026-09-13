import {initGpsDraft} from '@libs/actions/GPSDraftDetails';
import {getGpsPoints} from '@libs/GPSPointUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const makeDraft = (gpsPoints: GPSPoint[][]): GpsDraftDetails => ({
    gpsPoints,
    distanceInMeters: 0,
    isTracking: false,
    reportID: '1',
    unit: 'mi' as Unit,
});

describe('getGpsPoints', () => {
    it('returns a single empty segment when there is no draft', () => {
        expect(getGpsPoints(undefined)).toEqual([[]]);
    });

    it('normalizes a trip that lost its last segment', () => {
        expect(getGpsPoints(makeDraft([]))).toEqual([[]]);
    });

    it('returns the recorded trip untouched', () => {
        const gpsPoints = [[{lat: 0, long: 0}]];

        expect(getGpsPoints(makeDraft(gpsPoints))).toBe(gpsPoints);
    });
});

describe('initGpsDraft', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
    });

    it('clears the trim left by a previous trip', async () => {
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, {
            gpsPoints: [
                [
                    {lat: 0, long: 0},
                    {lat: 0, long: 1},
                ],
            ],
            distanceInMeters: 200,
            isTracking: false,
            reportID: '1',
            unit: 'mi' as Unit,
            modifiedDistance: 120,
            trimmedEndPoint: {lat: 0, long: 0.5, segmentIndex: 0, precedingPointIndex: 0},
        });

        initGpsDraft('2', 'mi' as Unit, 42);
        await waitForBatchedUpdates();
        const draft = await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS);

        expect(draft?.modifiedDistance).toBeUndefined();
        expect(draft?.trimmedEndPoint).toBeUndefined();
        expect(draft?.gpsPoints).toEqual([[]]);
        expect(draft?.isTracking).toBe(true);
    });
});
