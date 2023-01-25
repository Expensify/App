import * as GooglePlacesUtils from '../../src/libs/GooglePlacesUtils';

describe('GooglePlacesUtilsTest', () => {
    describe('getAddressComponents', () => {
        it('should find address components by type', () => {
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
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {sublocality: 'long_name'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {administrative_area_level_1: 'short_name'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {postal_code: 'long_name'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {'doesnt-exist': 'long_name'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponents(addressComponents, {
                sublocality: 'long_name',
                administrative_area_level_1: 'short_name',
                postal_code: 'long_name',
                'doesnt-exist': 'long_name',
            })).toStrictEqual({
                sublocality: 'Brooklyn',
                administrative_area_level_1: 'NY',
                postal_code: '11206',
                'doesnt-exist': '',
            });
        });
    });
});
