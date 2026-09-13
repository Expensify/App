import {act, renderHook} from '@testing-library/react-native';

import useUpdateGpsTripOnReconnect from '@components/GPSTripStateChecker/useUpdateGpsTripOnReconnect';

import {setForceOffline} from '@libs/NetworkState';

import ONYXKEYS from '@src/ONYXKEYS';
import type GpsDraftDetails from '@src/types/onyx/GpsDraftDetails';
import type {GPSPoint} from '@src/types/onyx/GpsDraftDetails';
import type {Unit} from '@src/types/onyx/Policy';

import type {LocationGeocodedAddress} from 'expo-location';

import {reverseGeocodeAsync} from 'expo-location';
import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const point = (lat: number, long: number, address?: GPSPoint['address']): GPSPoint => ({lat, long, ...(address ? {address} : {})});

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

const makeDraft = (gpsPoints: GPSPoint[][]): GpsDraftDetails => ({
    gpsPoints,
    distanceInMeters: 100,
    isTracking: false,
    reportID: '1',
    unit: 'mi' as Unit,
});

/** Drives the offline to online transition that useNetwork turns into an onReconnect call */
const reconnect = async (gpsPoints: GPSPoint[][]): Promise<GpsDraftDetails | undefined> => {
    renderHook(() => useUpdateGpsTripOnReconnect({gpsPoints}));

    // Separate acts so the hook renders in between and sees the offline to online transition
    act(() => setForceOffline(true));
    act(() => setForceOffline(false));
    await act(async () => {
        await waitForBatchedUpdates();
    });

    return getOnyxValue(ONYXKEYS.GPS_DRAFT_DETAILS);
};

describe('useUpdateGpsTripOnReconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.mocked(reverseGeocodeAsync).mockClear();
        setForceOffline(false);
        await Onyx.clear();
    });

    afterAll(() => {
        setForceOffline(false);
    });

    it('fetches a human readable address for a point stored as coordinates', async () => {
        jest.mocked(reverseGeocodeAsync).mockResolvedValue([geocodedAddress('Mountain View')]);
        const gpsPoints = [[point(0, 0, {value: '0,0', type: 'coordinates'}), point(0, 1, {value: '0,1', type: 'coordinates'})]];
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, makeDraft(gpsPoints));

        const draft = await reconnect(gpsPoints);

        expect(draft?.gpsPoints.at(0)?.at(0)?.address).toEqual({value: 'Mountain View', type: 'address'});
    });

    it('fetches an address again for a point left with a blank one', async () => {
        jest.mocked(reverseGeocodeAsync).mockResolvedValue([geocodedAddress('Mountain View')]);
        const gpsPoints = [[point(0, 0, {value: '', type: 'address'}), point(0, 1, {value: '0,1', type: 'coordinates'})]];
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, makeDraft(gpsPoints));

        const draft = await reconnect(gpsPoints);

        expect(draft?.gpsPoints.at(0)?.at(0)?.address).toEqual({value: 'Mountain View', type: 'address'});
    });

    it('leaves a point that already has a human readable address alone', async () => {
        jest.mocked(reverseGeocodeAsync).mockResolvedValue([geocodedAddress('Somewhere else')]);
        const gpsPoints = [[point(0, 0, {value: 'Amphitheatre Pkwy', type: 'address'}), point(0, 1, {value: 'Shoreline Blvd', type: 'address'})]];
        await Onyx.set(ONYXKEYS.GPS_DRAFT_DETAILS, makeDraft(gpsPoints));

        const draft = await reconnect(gpsPoints);

        expect(reverseGeocodeAsync).not.toHaveBeenCalled();
        expect(draft?.gpsPoints.at(0)?.at(0)?.address).toEqual({value: 'Amphitheatre Pkwy', type: 'address'});
    });
});
