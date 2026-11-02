import {act, render} from '@testing-library/react-native';

import GPSMapView from '@components/MapView/GPSMapView';

import type * as UseLocationServicesRemountKeyAndroid from '@hooks/useLocationServicesRemountKey/index.android';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';

import {hasServicesEnabledAsync} from 'expo-location';
import React from 'react';

const mockContentMount = jest.fn();

jest.mock('@components/MapView/GPSMapViewContent', () => {
    const {useEffect} = jest.requireActual<typeof React>('react');
    function GPSMapViewContentStub() {
        useEffect(() => {
            mockContentMount();
        }, []);
        return null;
    }
    return GPSMapViewContentStub;
});
jest.mock('@components/MapView/PendingMapView', () => () => null);
jest.mock('@components/MapView/useAccessToken', () => jest.fn(() => true));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
// Jest resolves the platform-agnostic stub, which never remounts; the Android implementation is what these tests cover
jest.mock('@hooks/useLocationServicesRemountKey', () => jest.requireActual<typeof UseLocationServicesRemountKeyAndroid>('@hooks/useLocationServicesRemountKey/index.android'));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    // The screen counts as focused for the whole test, so the effect simply runs on every render like the real hook does
    useFocusEffect: (callback: () => void | (() => void)) => {
        jest.requireActual<typeof React>('react').useEffect(callback);
    },
}));

// What the OS currently reports for Location services; the hook may read it any number of times per tick
let areLocationServicesEnabled = true;

// Resolves the pending expo-location promises so state updates from them are applied
const flushPromises = () =>
    act(async () => {
        await Promise.resolve();
    });

// Fires one polling tick (interval plus debounce) and resolves what it triggered
const advanceOnePollingTick = () =>
    act(async () => {
        jest.advanceTimersByTime(CONST.TIMING.LOCATION_UPDATE_INTERVAL + CONST.TIMING.USE_DEBOUNCED_STATE_DELAY);
    });

function renderGPSMapView() {
    return render(
        <GPSMapView
            accessToken="token"
            style={[]}
            styleURL={CONST.MAPBOX.STYLE_URL}
            waypoints={[]}
            directionCoordinates={[]}
            isTrackingGPS={false}
        />,
    );
}

describe('GPSMapView', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockContentMount.mockClear();
        jest.mocked(hasServicesEnabledAsync).mockImplementation(() => Promise.resolve(areLocationServicesEnabled));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([
        ['services stay on', [true, true], 1],
        ['services come back on', [false, true], 2],
        ['services go off and come back on', [true, false, true], 2],
        ['services stay off', [false, false], 1],
    ])('mounts the map %s: %j -> %i mount(s)', async (_description, servicesEnabledSequence, expectedMounts) => {
        // Given Location services in the first state when the map screen opens
        const [initialState, ...laterStates] = servicesEnabledSequence;
        areLocationServicesEnabled = initialState;
        renderGPSMapView();
        await flushPromises();

        // When Location services move through the remaining states, one polling tick apart
        for (const state of laterStates) {
            areLocationServicesEnabled = state;
            await advanceOnePollingTick();
        }

        // Then the map is recreated only after an off -> on transition, because the Mapbox SDK's location provider
        // does not recover from Location services being off when the map was created
        expect(mockContentMount).toHaveBeenCalledTimes(expectedMounts);
    });
});
