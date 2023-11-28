import * as GooglePlacesUtils from '../../src/libs/GooglePlacesUtils';

const standardObjectToFind = {
    sublocality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'long_name',
    'doesnt-exist': 'long_name',
};

const objectWithCountryToFind = {
    sublocality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'long_name',
    'doesnt-exist': 'long_name',
    country: 'long_name',
};

const addressComponents = [
    {
        long_name: 'Bushwick',
        short_name: 'Bushwick',
        types: ['neighborhood', 'political'],
    },
    {
        long_name: 'Brooklyn',
        short_name: 'Brooklyn',
        types: ['sublocality_level_1', 'sublocality', 'political'],
    },
    {
        long_name: 'New York',
        short_name: 'NY',
        types: ['administrative_area_level_1', 'political'],
    },
    {
        long_name: 'United States',
        short_name: 'US',
        types: ['country', 'political'],
    },
    {
        long_name: '11206',
        short_name: '11206',
        types: ['postal_code'],
    },
];

const autoCompleteTerms = [
    {offset: 0, value: 'Bangladesh Border Road'},
    {offset: 24, value: 'Bangladesh'},
];

describe('GooglePlacesUtilsTest', () => {
    describe('getAddressComponents', () => {
        it('should find address components by type', () => {
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {sublocality: 'long_name'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {administrative_area_level_1: 'short_name'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {postal_code: 'long_name'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {'doesnt-exist': 'long_name'})).toStrictEqual({'doesnt-exist': ''});
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
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {sublocality: 'long_name'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {administrative_area_level_1: 'short_name'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {postal_code: 'long_name'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {'doesnt-exist': 'long_name'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {country: 'long_name'})).toStrictEqual({country: 'United States'});
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
