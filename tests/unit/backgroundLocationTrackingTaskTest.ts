import {resetGPSDraftDetails} from '@libs/actions/GPSDraftDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import '@src/setup/backgroundLocationTrackingTask/index.native';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

import type {LocationGeocodedAddress, LocationObject} from 'expo-location';

import {reverseGeocodeAsync} from 'expo-location';
import {defineTask} from 'expo-task-manager';
import {Platform} from 'react-native';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// The task registers itself with defineTask when its module loads
const [, runTask] = jest.mocked(defineTask).mock.calls.at(0) ?? [];

const trackingDraft: GpsDraftDetails = {
    gpsPoints: [[]],
    distanceInMeters: 0,
    isTracking: true,
    reportID: '1',
    unit: 'mi' as Unit,
    accountID: 1,
};

const location = (latitude: number, longitude: number): LocationObject => ({
    coords: {latitude, longitude, altitude: null, accuracy: null, altitudeAccuracy: null, heading: null, speed: null},
    timestamp: 0,
});

const geocodedAddress = (city: string): LocationGeocodedAddress => ({
    city,
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
});

/** Delivers locations to the task the way expo-location does while tracking */
const receiveLocations = async (locations: LocationObject[]): Promise<void> => {
    await runTask?.({data: {locations}, error: null, executionInfo: {eventId: '1', taskName: 'location'}});
};

/** Holds the start address lookup open. Await `entered` before discarding the trip, so the discard lands during the lookup */
const holdAddressLookup = (): {entered: Promise<void>; release: (addresses: LocationGeocodedAddress[]) => void} => {
    let release: ((addresses: LocationGeocodedAddress[]) => void) | undefined;
    let markEntered: (() => void) | undefined;
    const entered = new Promise<void>((resolve) => {
        markEntered = resolve;
    });
    jest.mocked(reverseGeocodeAsync).mockImplementationOnce(
        () =>
            new Promise<LocationGeocodedAddress[]>((resolve) => {
                release = resolve;
                markEntered?.();
            }),
    );
    return {entered, release: (addresses) => release?.(addresses)};
};

describe('backgroundLocationTrackingTask', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(reverseGeocodeAsync).mockReset().mockResolvedValue([]);
        await Onyx.clear();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('ignores temporary iOS location errors and keeps recording the same trip', async () => {
        // Given an active trip on iOS, where locationUnknown is temporary and Core Location keeps trying
        jest.replaceProperty(Platform, 'OS', 'ios');
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const fetchDraft = jest.spyOn(Onyx, 'connectWithoutView');
        jest.mocked(reverseGeocodeAsync).mockResolvedValue([geocodedAddress('Mountain View')]);
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, trackingDraft);

        // When the task receives locationUnknown without usable location data
        await runTask?.({data: undefined, error: {code: 0, message: 'Location unknown'}, executionInfo: {eventId: '1', taskName: 'location'}});

        // Then it neither logs an error nor reads the draft, and a later location still extends this trip
        expect(consoleError).not.toHaveBeenCalled();
        expect(fetchDraft).not.toHaveBeenCalled();
        expect(await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS)).toEqual(trackingDraft);
        await receiveLocations([location(0, 0)]);
        await waitForBatchedUpdates();
        expect((await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS))?.gpsPoints).toEqual([[{lat: 0, long: 0, address: {value: 'Mountain View', type: 'address'}}]]);
    });

    it.each([
        {platform: 'ios', code: 1},
        {platform: 'ios', code: 2},
        {platform: 'ios', code: 'E_LOCATION_FAILED'},
        {platform: 'android', code: 0},
    ] as const)('still logs task errors with code $code on $platform', async ({platform, code}) => {
        // Given an error that is not the temporary iOS locationUnknown condition
        jest.replaceProperty(Platform, 'OS', platform);
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
        const fetchDraft = jest.spyOn(Onyx, 'connectWithoutView');
        const error = {code, message: 'Location failed'};

        // When the task receives the error without usable location data
        await runTask?.({data: undefined, error, executionInfo: {eventId: '1', taskName: 'location'}});

        // Then genuine failures remain visible and no location data is processed
        expect(consoleError).toHaveBeenCalledWith('[GPS distance request] Long-running task error: ', {error, data: undefined});
        expect(fetchDraft).not.toHaveBeenCalled();
    });

    it('records the first location and gives it the start address', async () => {
        jest.mocked(reverseGeocodeAsync).mockResolvedValue([geocodedAddress('Mountain View')]);
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, trackingDraft);

        await receiveLocations([location(0, 0)]);
        await waitForBatchedUpdates();

        expect((await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS))?.gpsPoints).toEqual([[{lat: 0, long: 0, address: {value: 'Mountain View', type: 'address'}}]]);
    });

    it('brings nothing back when the trip is discarded while its start address is looked up', async () => {
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, trackingDraft);
        const addressLookup = holdAddressLookup();

        await receiveLocations([location(0, 0)]);
        await addressLookup.entered;
        resetGPSDraftDetails();
        await waitForBatchedUpdates();
        addressLookup.release([geocodedAddress('Mountain View')]);
        await waitForBatchedUpdates();

        expect(await getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS)).toBeUndefined();
    });
});
