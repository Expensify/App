/* eslint-disable @typescript-eslint/naming-convention */
import * as GooglePlacesUtils from '@src/libs/GooglePlacesUtils';
import type {AddressComponent, AddressTerm, FieldsToExtract} from '@src/libs/GooglePlacesUtils';

const standardObjectToFind: FieldsToExtract = {
    sublocality: 'longText',
    administrative_area_level_1: 'shortText',
    postal_code: 'longText',
    'doesnt-exist': 'longText',
};

const objectWithCountryToFind: FieldsToExtract = {
    sublocality: 'longText',
    administrative_area_level_1: 'shortText',
    postal_code: 'longText',
    'doesnt-exist': 'longText',
    country: 'longText',
};

const addressComponents: AddressComponent[] = [
    {
        longText: 'Bushwick',
        shortText: 'Bushwick',
        types: ['neighborhood', 'political'],
    },
    {
        longText: 'Brooklyn',
        shortText: 'Brooklyn',
        types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
        longText: 'New York',
        shortText: 'NY',
        types: ['administrative_area_level_1', 'political'],
    },
    {
        longText: 'United States',
        shortText: 'US',
        types: ['country', 'political'],
    },
    {
        longText: '11206',
        shortText: '11206',
        types: ['postal_code'],
    },
];

const autoCompleteTerms: AddressTerm[] = [{value: 'Bangladesh Border Road'}, {value: 'Bangladesh'}];

describe('GooglePlacesUtilsTest', () => {
    describe('getAddressComponents', () => {
        it('should find address components by type', () => {
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {sublocality: 'longText'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {administrative_area_level_1: 'shortText'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {postal_code: 'longText'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {'doesnt-exist': 'longText'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, standardObjectToFind)).toStrictEqual({
                sublocality: 'Brooklyn',
                administrative_area_level_1: 'NY',
                postal_code: '11206',
                'doesnt-exist': '',
            });
        });
    });
    describe('getAddressComponentsWithCountry', () => {
        it('should find address components by type', () => {
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {sublocality: 'longText'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {administrative_area_level_1: 'shortText'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {postal_code: 'longText'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {'doesnt-exist': 'longText'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {country: 'longText'})).toStrictEqual({country: 'United States'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, objectWithCountryToFind)).toStrictEqual({
                sublocality: 'Brooklyn',
                administrative_area_level_1: 'NY',
                postal_code: '11206',
                'doesnt-exist': '',
                country: 'United States',
            });
        });
    });
    describe('getPlaceAutocompleteTerms', () => {
        it('should find auto complete terms', () => {
            expect(GooglePlacesUtils.getPlaceAutocompleteTerms(autoCompleteTerms)).toStrictEqual({
                country: 'Bangladesh',
                state: 'Bangladesh Border Road',
                city: '',
                street: '',
            });
        });
    });
});
