import {act, render} from '@testing-library/react-native';

import AddressSearch from '@components/AddressSearch';

import type {GooglePlaceData, GooglePlaceDetail} from 'react-native-google-places-autocomplete';
import type {PartialDeep} from 'type-fest';

import React from 'react';

type PickPlace = (data: PartialDeep<GooglePlaceData>, details: PartialDeep<GooglePlaceDetail, {recurseIntoArrays: true}>) => void;

let pickPlace: PickPlace | undefined;

jest.mock('react-native-google-places-autocomplete', () => ({
    GooglePlacesAutocomplete: ({onPress}: {onPress: PickPlace}) => {
        pickPlace = onPress;
        return null;
    },
}));

/* eslint-disable @typescript-eslint/naming-convention -- mirrors the Google Places API response shape */
const SYDNEY_DATA: PartialDeep<GooglePlaceData> = {description: '1 George St, Sydney NSW, Australia', terms: []};
const SYDNEY_DETAILS: PartialDeep<GooglePlaceDetail, {recurseIntoArrays: true}> = {
    name: '1 George St',
    formatted_address: '1 George St, Sydney NSW 2000, Australia',
    geometry: {location: {lat: -33.86, lng: 151.2}},
    address_components: [
        {long_name: '1', short_name: '1', types: ['street_number']},
        {long_name: 'George Street', short_name: 'George St', types: ['route']},
        {long_name: 'Sydney', short_name: 'Sydney', types: ['locality']},
        {long_name: 'New South Wales', short_name: 'NSW', types: ['administrative_area_level_1']},
        {long_name: 'Australia', short_name: 'AU', types: ['country']},
        {long_name: '2000', short_name: '2000', types: ['postal_code']},
    ],
};
/* eslint-enable @typescript-eslint/naming-convention */

describe('AddressSearch', () => {
    it.each([
        {shouldKeepStateCode: true, expected: 'NSW'},
        {shouldKeepStateCode: false, expected: 'New South Wales'},
    ])('writes $expected as an Australian state when shouldKeepStateCode is $shouldKeepStateCode', ({shouldKeepStateCode, expected}) => {
        // Given an address search whose caller shows the state either in a picker listing codes or as text
        const onInputChange = jest.fn();
        render(
            <AddressSearch
                inputID="street"
                label="Address"
                onInputChange={onInputChange}
                renamedInputKeys={{street: 'street', state: 'state'}}
                shouldKeepStateCode={shouldKeepStateCode}
            />,
        );

        // When the user picks an address in Sydney
        act(() => pickPlace?.(SYDNEY_DATA, SYDNEY_DETAILS));

        // Then the state is written once, as the code a picker lists or the full name a text input shows
        expect(onInputChange.mock.calls.filter(([, key]) => key === 'state')).toEqual([[expected, 'state']]);
    });
});
