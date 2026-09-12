import {
    calculateTrimmedEndPoint,
    getEffectiveDistance,
    getEffectiveEndPoint,
    getGPSRoutes,
    getGPSWaypoints,
    getStringifiedGPSCoordinates,
    getTrimmedGpsTrip,
    gpsPointsToMapboxCoordinates,
    stopGpsTrip,
} from '@libs/GPSDraftDetailsUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {GPSPoint, TrimmedGPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';
import geodesicDistance from '@src/utils/geodesicDistance';

import type {LocationGeocodedAddress} from 'expo-location';

import {reverseGeocodeAsync} from 'expo-location';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const point = (lat: number, long: number, address?: GPSPoint['address']): GPSPoint => ({lat, long, ...(address ? {address} : {})});

const makeDraft = (overrides: Partial<GpsDraftDetails> = {}): GpsDraftDetails => ({
    gpsPoints: [[point(0, 0), point(0, 1)]],
    distanceInMeters: 100,
    isTracking: false,
    reportID: '1',
    unit: 'mi' as Unit,
    ...overrides,
});

describe('GPSDraftDetailsUtils', () => {
    describe('getEffectiveDistance', () => {
        it('returns 0 when draft is undefined', () => {
            expect(getEffectiveDistance(undefined)).toBe(0);
        });

        it('returns distanceInMeters when modifiedDistance is not set', () => {
            expect(getEffectiveDistance(makeDraft({distanceInMeters: 250}))).toBe(250);
        });

        it('prefers modifiedDistance over distanceInMeters', () => {
            expect(getEffectiveDistance(makeDraft({distanceInMeters: 250, modifiedDistance: 100}))).toBe(100);
        });

        it('returns modifiedDistance of 0 (does not fall through the nullish coalescing)', () => {
            expect(getEffectiveDistance(makeDraft({distanceInMeters: 250, modifiedDistance: 0}))).toBe(0);
        });
    });

    describe('getEffectiveEndPoint', () => {
        it('returns undefined when draft is undefined', () => {
            expect(getEffectiveEndPoint(undefined)).toBeUndefined();
        });

        it('returns the last point of the last segment when no trimmedEndPoint is set', () => {
            const draft = makeDraft({
                gpsPoints: [
                    [point(0, 0), point(0, 1)],
                    [point(1, 0), point(1, 5)],
                ],
            });
            expect(getEffectiveEndPoint(draft)).toEqual(point(1, 5));
        });

        it('prefers the trimmedEndPoint over the recorded last point', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 9, long: 9, segmentIndex: 0, precedingPointIndex: 0};
            expect(getEffectiveEndPoint(makeDraft({trimmedEndPoint}))).toEqual(trimmedEndPoint);
        });

        it('returns undefined when there are no recorded points', () => {
            expect(getEffectiveEndPoint(makeDraft({gpsPoints: [[]]}))).toBeUndefined();
        });
    });

    describe('calculateTrimmedEndPoint', () => {
        it('returns null when the target distance exceeds the trip length', () => {
            const gpsPoints = [[point(0, 0), point(0, 1)]];
            const total = geodesicDistance(point(0, 0), point(0, 1));
            expect(calculateTrimmedEndPoint(gpsPoints, total + 1000)).toBeNull();
        });

        it('returns null for empty gpsPoints', () => {
            expect(calculateTrimmedEndPoint([[]], 10)).toBeNull();
        });

        it('interpolates the midpoint when the target is half of a single segment leg', () => {
            const start = point(0, 0);
            const end = point(0, 1);
            const half = geodesicDistance(start, end) / 2;

            const result = calculateTrimmedEndPoint([[start, end]], half);

            expect(result?.segmentIndex).toBe(0);
            expect(result?.precedingPointIndex).toBe(0);
            // Longitude interpolation is linear, so halfway is 0.5.
            expect(result?.long).toBeCloseTo(0.5, 6);
            expect(result?.lat).toBeCloseTo(0, 6);
        });

        it('returns the starting point when target distance is 0', () => {
            const start = point(2, 3);
            const result = calculateTrimmedEndPoint([[start, point(2, 4)]], 0);
            expect(result).toEqual({lat: 2, long: 3, segmentIndex: 0, precedingPointIndex: 0});
        });

        it('locates the endpoint in a later segment when earlier segments are exhausted', () => {
            const seg0 = [point(0, 0), point(0, 1)];
            const seg1 = [point(0, 1), point(0, 2)];
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const leg0 = geodesicDistance(seg0.at(0)!, seg0.at(1)!);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const legHalf = geodesicDistance(seg1.at(0)!, seg1.at(1)!) / 2;

            const result = calculateTrimmedEndPoint([seg0, seg1], leg0 + legHalf);

            expect(result?.segmentIndex).toBe(1);
            expect(result?.precedingPointIndex).toBe(0);
            expect(result?.long).toBeCloseTo(1.5, 6);
        });
    });

    describe('getTrimmedGpsTrip', () => {
        it('returns the original points when there is no trimmedEndPoint', () => {
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]]});
            expect(getTrimmedGpsTrip(draft)).toEqual([[point(0, 0), point(0, 1)]]);
        });

        it('reads trimmedEndPoint from the draft when no override is passed', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 0, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]], trimmedEndPoint});

            expect(getTrimmedGpsTrip(draft)).toEqual([[point(0, 0), trimmedEndPoint]]);
        });

        it('lets the trimmedEndPoint argument override the draft value', () => {
            const draftTrim: TrimmedGPSPoint = {lat: 0, long: 0.9, segmentIndex: 0, precedingPointIndex: 0};
            const overrideTrim: TrimmedGPSPoint = {lat: 0, long: 0.2, segmentIndex: 0, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]], trimmedEndPoint: draftTrim});

            expect(getTrimmedGpsTrip(draft, overrideTrim)).toEqual([[point(0, 0), overrideTrim]]);
        });

        it('drops segments after the trimmed segment and truncates within it', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 1, long: 0.5, segmentIndex: 1, precedingPointIndex: 0};
            const gpsPoints = [
                [point(0, 0), point(0, 1)],
                [point(1, 0), point(1, 1), point(1, 2)],
                [point(2, 0), point(2, 1)],
            ];

            expect(getTrimmedGpsTrip(gpsPoints, trimmedEndPoint)).toEqual([
                [point(0, 0), point(0, 1)],
                [point(1, 0), trimmedEndPoint],
            ]);
        });

        it('returns [[]] when the trimmed segment index is out of range', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 5, precedingPointIndex: 0};
            expect(getTrimmedGpsTrip([[point(0, 0), point(0, 1)]], trimmedEndPoint)).toEqual([[]]);
        });

        it('works with the array overload when no trimmedEndPoint is passed', () => {
            const gpsPoints = [[point(0, 0), point(0, 1)]];
            expect(getTrimmedGpsTrip(gpsPoints, undefined)).toEqual(gpsPoints);
        });
    });

    describe('gpsPointsToMapboxCoordinates', () => {
        it('returns an empty list for empty input', () => {
            expect(gpsPointsToMapboxCoordinates([])).toEqual([]);
        });

        it('maps {lat, long} to [long, lat] preserving segment structure', () => {
            const input = [[point(10, 20), point(30, 40)], [point(50, 60)]];
            expect(gpsPointsToMapboxCoordinates(input)).toEqual([
                [
                    [20, 10],
                    [40, 30],
                ],
                [[60, 50]],
            ]);
        });
    });

    describe('getStringifiedGPSCoordinates', () => {
        it('returns undefined when draft is undefined', () => {
            expect(getStringifiedGPSCoordinates(undefined)).toBeUndefined();
        });

        it('stringifies all recorded points as {lng, lat} when no trimmedEndPoint is set', () => {
            const draft = makeDraft({gpsPoints: [[point(1, 2), point(3, 4)]]});
            expect(getStringifiedGPSCoordinates(draft)).toBe(
                JSON.stringify([
                    [
                        {lng: 2, lat: 1},
                        {lng: 4, lat: 3},
                    ],
                ]),
            );
        });

        it('inserts the interpolated trimmedEndPoint after its preceding point', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 0, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]], trimmedEndPoint});

            expect(getStringifiedGPSCoordinates(draft)).toBe(
                JSON.stringify([
                    [
                        {lng: 0, lat: 0},
                        {lng: 0.5, lat: 0},
                        {lng: 1, lat: 0},
                    ],
                ]),
            );
        });

        it('falls back to the original coordinates when the trimmed segment is out of range', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 9, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]], trimmedEndPoint});

            expect(getStringifiedGPSCoordinates(draft)).toBe(
                JSON.stringify([
                    [
                        {lng: 0, lat: 0},
                        {lng: 1, lat: 0},
                    ],
                ]),
            );
        });
    });

    describe('getGPSWaypoints', () => {
        it('returns an empty collection for an empty trip', () => {
            expect(getGPSWaypoints(makeDraft({gpsPoints: [[]]}))).toEqual({});
        });

        it('creates a first and last waypoint for a two-point segment', () => {
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]]});
            const result = getGPSWaypoints(draft);

            expect(Object.keys(result)).toEqual(['waypoint0', 'waypoint1']);
            expect(result.waypoint0).toEqual({keyForList: 'gps0', lat: 0, lng: 0, address: '0,0'});
            expect(result.waypoint1).toEqual({keyForList: 'gps1', lat: 0, lng: 1, address: '0,1'});
        });

        it('creates a single waypoint for a one-point segment', () => {
            const draft = makeDraft({gpsPoints: [[point(5, 6)]]});
            const result = getGPSWaypoints(draft);

            expect(Object.keys(result)).toEqual(['waypoint0']);
            expect(result.waypoint0).toEqual({keyForList: 'gps0', lat: 5, lng: 6, address: '5,6'});
        });

        it('uses the point address value when present instead of coordinates', () => {
            const draft = makeDraft({gpsPoints: [[point(0, 0, {value: 'Home', type: 'address'}), point(0, 1)]]});
            const result = getGPSWaypoints(draft);

            expect(result.waypoint0.address).toBe('Home');
            expect(result.waypoint1.address).toBe('0,1');
        });

        it('respects the trimmedEndPoint argument to truncate the trip', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 0, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]]});
            const result = getGPSWaypoints(draft, trimmedEndPoint);

            expect(Object.keys(result)).toEqual(['waypoint0', 'waypoint1']);
            expect(result.waypoint1).toEqual({keyForList: 'gps1', lat: 0, lng: 0.5, address: '0,0.5'});
        });
    });

    describe('getGPSRoutes', () => {
        it('builds a single route with coordinates as [long, lat]', () => {
            const draft = makeDraft({gpsPoints: [[point(1, 2), point(3, 4)]], distanceInMeters: 123.456});
            const {route0} = getGPSRoutes(draft);

            expect(route0.distance).toBe(123.46);
            expect(route0.geometry.type).toBe('LineString');
            expect(route0.geometry.coordinates).toEqual([
                [
                    [2, 1],
                    [4, 3],
                ],
            ]);
        });

        it('uses modifiedDistance for the route distance when set', () => {
            const draft = makeDraft({distanceInMeters: 999, modifiedDistance: 50});
            expect(getGPSRoutes(draft).route0.distance).toBe(50);
        });

        it('applies the trimmedEndPoint to the route geometry', () => {
            const trimmedEndPoint: TrimmedGPSPoint = {lat: 0, long: 0.5, segmentIndex: 0, precedingPointIndex: 0};
            const draft = makeDraft({gpsPoints: [[point(0, 0), point(0, 1)]], trimmedEndPoint, modifiedDistance: 40});

            expect(getGPSRoutes(draft).route0.geometry.coordinates).toEqual([
                [
                    [0, 0],
                    [0.5, 0],
                ],
            ]);
        });
    });

    describe('stopGpsTrip', () => {
        const startedAddress = {value: 'Amphitheatre Pkwy', type: 'address'} as const;

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            jest.mocked(reverseGeocodeAsync).mockClear();
            await Onyx.clear();
        });

        /** Seeds a trip that is being recorded and returns the points the screen would hand to stopGpsTrip */
        const trackTrip = async (gpsPoints: GPSPoint[][]): Promise<GPSPoint[][]> => {
            await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, makeDraft({gpsPoints, isTracking: true, distanceInMeters: 0}));
            return gpsPoints;
        };

        const getStoppedDraft = async (): Promise<GpsDraftDetails | undefined> => {
            await waitForBatchedUpdates();
            return getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS);
        };

        it('stops tracking the trip', async () => {
            const gpsPoints = await trackTrip([[point(0, 0, startedAddress)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.isTracking).toBe(false);
        });

        it('keeps the recorded point when the trip is a single segment holding one point', async () => {
            const gpsPoints = await trackTrip([[point(0, 0, startedAddress)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, startedAddress)]]);
        });

        it('leaves that point its start address instead of overwriting it with coordinates', async () => {
            const gpsPoints = await trackTrip([[point(0, 0, startedAddress)]]);

            await stopGpsTrip(false, gpsPoints, true);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, startedAddress)]]);
        });

        it('gives that point an address when the start lookup never landed', async () => {
            const gpsPoints = await trackTrip([[point(0, 0)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, {value: '0,0', type: 'coordinates'})]]);
        });

        it('writes coordinates for that point when the caller skips the address lookup', async () => {
            const gpsPoints = await trackTrip([[point(0, 0)]]);

            await stopGpsTrip(false, gpsPoints, true);

            expect(reverseGeocodeAsync).not.toHaveBeenCalled();
            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, {value: '0,0', type: 'coordinates'})]]);
        });

        it('writes coordinates for that point while offline, without looking the address up', async () => {
            const gpsPoints = await trackTrip([[point(0, 0)]]);

            await stopGpsTrip(true, gpsPoints);

            expect(reverseGeocodeAsync).not.toHaveBeenCalled();
            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, {value: '0,0', type: 'coordinates'})]]);
        });

        it('replaces a blank address on that point instead of treating it as resolved', async () => {
            const gpsPoints = await trackTrip([[point(0, 0, {value: '', type: 'address'})]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, {value: '0,0', type: 'coordinates'})]]);
        });

        it('falls back to coordinates when the geocoder returns no usable address fields', async () => {
            const emptyGeocodedAddress: LocationGeocodedAddress = {
                city: null,
                district: null,
                streetNumber: null,
                street: null,
                region: null,
                subregion: null,
                country: null,
                postalCode: null,
                name: null,
                isoCountryCode: null,
                timezone: null,
                formattedAddress: null,
            };
            jest.mocked(reverseGeocodeAsync).mockResolvedValueOnce([emptyGeocodedAddress]);
            const gpsPoints = await trackTrip([[point(0, 0), point(0, 1)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0), point(0, 1, {value: '0,1', type: 'coordinates'})]]);
        });

        it('leaves a single segment that is still empty untouched', async () => {
            const gpsPoints = await trackTrip([[]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[]]);
        });

        it('drops a resumed segment that holds a single point', async () => {
            const gpsPoints = await trackTrip([[point(0, 0), point(0, 1)], [point(1, 0)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0), point(0, 1)]]);
        });

        it('leaves a one point trip intact when a resumed segment is dropped', async () => {
            const gpsPoints = await trackTrip([[point(0, 0, startedAddress)], [point(1, 0)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0, startedAddress)]]);
        });

        it('drops a resumed segment that is empty', async () => {
            const gpsPoints = await trackTrip([[point(0, 0), point(0, 1)], []]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0), point(0, 1)]]);
        });

        it('records the end address when the last segment holds more than one point', async () => {
            const gpsPoints = await trackTrip([[point(0, 0), point(0, 1)]]);

            await stopGpsTrip(false, gpsPoints);

            expect((await getStoppedDraft())?.gpsPoints).toEqual([[point(0, 0), point(0, 1, {value: '0,1', type: 'coordinates'})]]);
        });
    });
});
