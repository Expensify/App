import * as GooglePlacesUtils from '../../src/libs/GooglePlacesUtils';

describe('GooglePlacesUtilsTest', () => {
    describe('getAddressComponent', () => {
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
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'sublocality', 'long_name')).toStrictEqual('Brooklyn');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name')).toStrictEqual('NY');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'postal_code', 'long_name')).toStrictEqual('11206');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'doesn-exist', 'long_name')).toStrictEqual(undefined);
        });
    });
});
