import {act, renderHook} from '@testing-library/react-native';

import useLocationServicesRemountKey from '@hooks/useLocationServicesRemountKey/index.android';

import CONST from '@src/CONST';

import type * as ReactNavigation from '@react-navigation/native';
import type React from 'react';

import {hasServicesEnabledAsync} from 'expo-location';

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

describe('useLocationServicesRemountKey (Android)', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.mocked(hasServicesEnabledAsync).mockImplementation(() => Promise.resolve(areLocationServicesEnabled));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each([
        ['stay on', [true, true], 0],
        ['come back on', [false, true], 1],
        ['go off and come back on', [true, false, true], 1],
        ['stay off', [false, false], 0],
        ['come back on twice', [false, true, false, true], 2],
    ])('when Location services %s (%j) the key changes %i time(s)', async (_description, servicesEnabledSequence, expectedKey) => {
        // Given Location services in the first state when the hook mounts
        const [initialState, ...laterStates] = servicesEnabledSequence;
        areLocationServicesEnabled = initialState;
        const {result} = renderHook(() => useLocationServicesRemountKey());
        await flushPromises();

        // When Location services move through the remaining states, one polling tick apart
        for (const state of laterStates) {
            areLocationServicesEnabled = state;
            await advanceOnePollingTick();
        }

        // Then the key changes once per off -> on transition and never for services being on from the start,
        // so the consumer recreates its map only when the Mapbox location provider had no chance to start
        expect(result.current).toBe(expectedKey);
    });
});
