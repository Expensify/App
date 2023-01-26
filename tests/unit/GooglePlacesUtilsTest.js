import * as GooglePlacesUtils from '../../src/libs/GooglePlacesUtils';

const bigObjectToFind = {
    sublocality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'long_name',
    'doesnt-exist': 'long_name',
    s1ublocality: 'long_name',
    a1dministrative_area_level_1: 'short_name',
    p1ostal_code: 'long_name',
    '1doesnt-exist': 'long_name',
    s2ublocality: 'long_name',
    a2dministrative_area_level_1: 'short_name',
    p2ostal_code: 'long_name',
    '2doesnt-exist': 'long_name',
    s3ublocality: 'long_name',
    a3dministrative_area_level_1: 'short_name',
    p3ostal_code: 'long_name',
    '3doesnt-exist': 'long_name',
    s4ublocality: 'long_name',
    a4dministrative_area_level_1: 'short_name',
    p4ostal_code: 'long_name',
    '4doesnt-exist': 'long_name',
    s5ublocality: 'long_name',
    a5dministrative_area_level_1: 'short_name',
    p5ostal_code: 'long_name',
    '5doesnt-exist': 'long_name',
    s6ublocality: 'long_name',
    a6dministrative_area_level_1: 'short_name',
    p6ostal_code: 'long_name',
    '6doesnt-exist': 'long_name',
    s7ublocality: 'long_name',
    a7dministrative_area_level_1: 'short_name',
    p7ostal_code: 'long_name',
    '7doesnt-exist': 'long_name',
    s8ublocality: 'long_name',
    a8dministrative_area_level_1: 'short_name',
    p8ostal_code: 'long_name',
    '8doesnt-exist': 'long_name',
    s9ublocality: 'long_name',
    a9dministrative_area_level_1: 'short_name',
    p9ostal_code: 'long_name',
    '9doesnt-exist': 'long_name',
    s10ublocality: 'long_name',
    a10dministrative_area_level_1: 'short_name',
    p10ostal_code: 'long_name',
    '10doesnt-exist': 'long_name',
    s11ublocality: 'long_name',
    a11dministrative_area_level_1: 'short_name',
    p11ostal_code: 'long_name',
    '11doesnt-exist': 'long_name',
    s12ublocality: 'long_name',
    a12dministrative_area_level_1: 'short_name',
    p12ostal_code: 'long_name',
    '12doesnt-exist': 'long_name',
    s13ublocality: 'long_name',
    a13dministrative_area_level_1: 'short_name',
    p13ostal_code: 'long_name',
    '13doesnt-exist': 'long_name',
    s14ublocality: 'long_name',
    a14dministrative_area_level_1: 'short_name',
    p14ostal_code: 'long_name',
    '14doesnt-exist': 'long_name',
    s15ublocality: 'long_name',
    a15dministrative_area_level_1: 'short_name',
    p15ostal_code: 'long_name',
    '15doesnt-exist': 'long_name',
    s16ublocality: 'long_name',
    a16dministrative_area_level_1: 'short_name',
    p16ostal_code: 'long_name',
    '16doesnt-exist': 'long_name',
    s17ublocality: 'long_name',
    a17dministrative_area_level_1: 'short_name',
    p17ostal_code: 'long_name',
    '17doesnt-exist': 'long_name',
    s18ublocality: 'long_name',
    a18dministrative_area_level_1: 'short_name',
    p18ostal_code: 'long_name',
    '18doesnt-exist': 'long_name',
    s19ublocality: 'long_name',
    a19dministrative_area_level_1: 'short_name',
    p19ostal_code: 'long_name',
    '19doesnt-exist': 'long_name',
    s20ublocality: 'long_name',
    a20dministrative_area_level_1: 'short_name',
    p20ostal_code: 'long_name',
    '20doesnt-exist': 'long_name',
};

const bigObjectMatch = {
    sublocality: 'Brooklyn',
    administrative_area_level_1: 'NY',
    postal_code: '11206',
    'doesnt-exist': '',
    s1ublocality: '',
    a1dministrative_area_level_1: '',
    p1ostal_code: '',
    '1doesnt-exist': '',
    s2ublocality: '',
    a2dministrative_area_level_1: '',
    p2ostal_code: '',
    '2doesnt-exist': '',
    s3ublocality: '',
    a3dministrative_area_level_1: '',
    p3ostal_code: '',
    '3doesnt-exist': '',
    s4ublocality: '',
    a4dministrative_area_level_1: '',
    p4ostal_code: '',
    '4doesnt-exist': '',
    s5ublocality: '',
    a5dministrative_area_level_1: '',
    p5ostal_code: '',
    '5doesnt-exist': '',
    s6ublocality: '',
    a6dministrative_area_level_1: '',
    p6ostal_code: '',
    '6doesnt-exist': '',
    s7ublocality: '',
    a7dministrative_area_level_1: '',
    p7ostal_code: '',
    '7doesnt-exist': '',
    s8ublocality: '',
    a8dministrative_area_level_1: '',
    p8ostal_code: '',
    '8doesnt-exist': '',
    s9ublocality: '',
    a9dministrative_area_level_1: '',
    p9ostal_code: '',
    '9doesnt-exist': '',
    s10ublocality: '',
    a10dministrative_area_level_1: '',
    p10ostal_code: '',
    '10doesnt-exist': '',
    s11ublocality: '',
    a11dministrative_area_level_1: '',
    p11ostal_code: '',
    '11doesnt-exist': '',
    s12ublocality: '',
    a12dministrative_area_level_1: '',
    p12ostal_code: '',
    '12doesnt-exist': '',
    s13ublocality: '',
    a13dministrative_area_level_1: '',
    p13ostal_code: '',
    '13doesnt-exist': '',
    s14ublocality: '',
    a14dministrative_area_level_1: '',
    p14ostal_code: '',
    '14doesnt-exist': '',
    s15ublocality: '',
    a15dministrative_area_level_1: '',
    p15ostal_code: '',
    '15doesnt-exist': '',
    s16ublocality: '',
    a16dministrative_area_level_1: '',
    p16ostal_code: '',
    '16doesnt-exist': '',
    s17ublocality: '',
    a17dministrative_area_level_1: '',
    p17ostal_code: '',
    '17doesnt-exist': '',
    s18ublocality: '',
    a18dministrative_area_level_1: '',
    p18ostal_code: '',
    '18doesnt-exist': '',
    s19ublocality: '',
    a19dministrative_area_level_1: '',
    p19ostal_code: '',
    '19doesnt-exist': '',
    s20ublocality: '',
    a20dministrative_area_level_1: '',
    p20ostal_code: '',
    '20doesnt-exist': '',
};

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
            const startTime = performance.now();
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'sublocality', 'long_name')).toStrictEqual('Brooklyn');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name')).toStrictEqual('NY');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'postal_code', 'long_name')).toStrictEqual('11206');
            expect(GooglePlacesUtils.getAddressComponent(addressComponents, 'doesn-exist', 'long_name')).toStrictEqual(undefined);
            const endTime = performance.now();
            console.log(`Call to getAddressComponent took ${endTime - startTime}ms`);
        });
    });
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
            console.log('addressComponents Big Object');
            const startTime = performance.now();
            for (let i = 100; i > 0; i--) {
                GooglePlacesUtils.getAddressComponents(addressComponents, bigObjectToFind);
            }
            const endTime = performance.now();
            console.log(`Call to looping 100 times took ${endTime - startTime}ms`);
        });
    });
    describe('getAddressComponentsNested', () => {
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
            expect(GooglePlacesUtils.getAddressComponentsNested(addressComponents, {sublocality: 'long_name'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponentsNested(addressComponents, {administrative_area_level_1: 'short_name'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponentsNested(addressComponents, {postal_code: 'long_name'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponentsNested(addressComponents, {'doesnt-exist': 'long_name'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponentsNested(addressComponents, {
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
            console.log('addressComponentsNested Big Object');
            const startTime = performance.now();
            for (let i = 100; i > 0; i--) {
                GooglePlacesUtils.getAddressComponentsNested(addressComponents, bigObjectToFind);
            }
            const endTime = performance.now();
            console.log(`Call to looping 100 times took ${endTime - startTime}ms`);
        });
    });
    describe('getAddressComponentsUnderscore', () => {
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
            expect(GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, {sublocality: 'long_name'})).toStrictEqual({sublocality: 'Brooklyn'});
            expect(GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, {administrative_area_level_1: 'short_name'})).toStrictEqual({administrative_area_level_1: 'NY'});
            expect(GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, {postal_code: 'long_name'})).toStrictEqual({postal_code: '11206'});
            expect(GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, {'doesnt-exist': 'long_name'})).toStrictEqual({'doesnt-exist': ''});
            expect(GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, {
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
            console.log('addressComponentsUnderscore Big Object');
            const startTime = performance.now();
            for (let i = 100; i > 0; i--) {
                GooglePlacesUtils.getAddressComponentsUnderscore(addressComponents, bigObjectToFind);
            }
            const endTime = performance.now();
            console.log(`Call to looping 100 times took ${endTime - startTime}ms`);
        });
    });
});
