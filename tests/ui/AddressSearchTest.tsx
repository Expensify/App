import {act, render} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';

import type {ComponentProps} from 'react';
import type {GooglePlaceData, GooglePlaceDetail} from 'react-native-google-places-autocomplete';

import React from 'react';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';

import createMock from '../utils/createMock';

jest.mock('react-native-google-places-autocomplete', () => ({GooglePlacesAutocomplete: jest.fn(() => null)}));
jest.mock('@hooks/useDebouncedAccessibilityAnnouncement', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: true})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key, preferredLocale: 'en'})));
jest.mock('@hooks/useTheme', () => jest.fn(() => ({border: '', buttonPressedBG: ''})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));

const place = createMock<GooglePlaceData>({description: '12 Main St, New York, NY, US', terms: []});
const formattedAddressKey = 'formatted_address';
const addressComponentsKey = 'address_components';
const longNameKey = 'long_name';
const shortNameKey = 'short_name';
const details = createMock<GooglePlaceDetail>({
    name: 'Office',
    [formattedAddressKey]: '12 Main St, New York, NY, US',
    geometry: {location: {lat: 40.1, lng: -73.9}},
    [addressComponentsKey]: [
        {types: ['street_number'], [longNameKey]: '12', [shortNameKey]: '12'},
        {types: ['route'], [longNameKey]: 'Main St', [shortNameKey]: 'Main St'},
        {types: ['subpremise'], [longNameKey]: 'Apt 4', [shortNameKey]: 'Apt 4'},
        {types: ['locality'], [longNameKey]: 'New York', [shortNameKey]: 'New York'},
        {types: ['administrative_area_level_1'], [longNameKey]: 'New York', [shortNameKey]: 'NY'},
        {types: ['postal_code'], [longNameKey]: '10001', [shortNameKey]: '10001'},
        {types: ['country'], [longNameKey]: 'United States', [shortNameKey]: 'US'},
    ],
});

describe('AddressSearch', () => {
    const places = jest.mocked(GooglePlacesAutocomplete);

    beforeEach(() => places.mockClear());

    it.each<{
        renamedInputKeys: Record<string, string>;
        expectedStreet: string;
        expectedStreet2?: string;
    }>([
        {renamedInputKeys: {street: 'addressStreet', country: 'addressCountry', state: 'addressState'}, expectedStreet: '12 Main St, Apt 4', expectedStreet2: 'Apt 4'},
        {renamedInputKeys: {street: 'addressStreet', street2: '', country: 'addressCountry', state: 'addressState'}, expectedStreet: '12 Main St', expectedStreet2: undefined},
    ])('preserves the producer mapping with street2 mapping $expectedStreet2', ({renamedInputKeys, expectedStreet, expectedStreet2}) => {
        const onInputChange = jest.fn<void, Parameters<NonNullable<ComponentProps<typeof AddressSearch>['onInputChange']>>>();
        const onCountryChange = jest.fn();

        // Given real Google place details and a field rename dictionary.
        render(
            <AddressSearch
                label="Address"
                inputID="addressStreet"
                renamedInputKeys={renamedInputKeys}
                onInputChange={onInputChange}
                onCountryChange={onCountryChange}
            />,
        );

        // When the autocomplete delivers the selected place to AddressSearch.
        act(() => places.mock.lastCall?.[0].onPress?.(place, details));
        const calls = onInputChange.mock.calls;

        // Then the country is written before the state and string-key mapping preserves all other values.
        expect(calls.find(([, key]) => key === 'addressStreet')?.at(0)).toBe(expectedStreet);
        expect(calls.find(([, key]) => key === 'street2')?.at(0)).toBe(expectedStreet2);
        expect(calls.findIndex(([, key]) => key === 'addressCountry')).toBeLessThan(calls.findIndex(([, key]) => key === 'addressState'));
        expect(calls).toContainEqual(['Office', 'name']);
        expect(calls).toContainEqual([40.1, 'lat']);
        expect(calls).toContainEqual([-73.9, 'lng']);
        expect(calls).toContainEqual(['12 Main St, New York, NY, US', 'address']);
        expect(onCountryChange).toHaveBeenCalledWith('US');
    });
});
