import {resetGPSDraftDetails} from '@libs/actions/GPSDraftDetails';

import ONYXKEYS from '@src/ONYXKEYS';
import '@src/setup/backgroundLocationTrackingTask/index.native';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

import type {LocationGeocodedAddress, LocationObject} from 'expo-location';

import {reverseGeocodeAsync} from 'expo-location';
import {defineTask} from 'expo-task-manager';
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
