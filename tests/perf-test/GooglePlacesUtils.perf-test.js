import {measureFunction} from 'reassure';
import * as GooglePlacesUtils from '../../src/libs/GooglePlacesUtils';

jest.setTimeout(60000);

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
    {
        long_name: 'United Kingdom',
        short_name: 'UK',
        types: ['country', 'political'],
    },
];

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
    s21ublocality: 'long_name',
    a21dministrative_area_level_1: 'short_name',
    p21ostal_code: 'long_name',
    '21doesnt-exist': 'long_name',
    s22ublocality: 'long_name',
    a22dministrative_area_level_1: 'short_name',
    p22ostal_code: 'long_name',
    '22doesnt-exist': 'long_name',
    s23ublocality: 'long_name',
    a23dministrative_area_level_1: 'short_name',
    p23ostal_code: 'long_name',
    '23doesnt-exist': 'long_name',
    s24ublocality: 'long_name',
    a24dministrative_area_level_1: 'short_name',
    p24ostal_code: 'long_name',
    '24doesnt-exist': 'long_name',
    s25ublocality: 'long_name',
    a25dministrative_area_level_1: 'short_name',
    p25ostal_code: 'long_name',
    '25doesnt-exist': 'long_name',
};

/**
 * This function will be executed 20 times and the average time will be used on the comparison.
 * It will fail based on the CI configuration around Reassure:
 * @see /.github/workflows/reassurePerformanceTests.yml
 *
 * Max deviation on the duration is set to 20% at the time of writing.
 *
 * More on the measureFunction API:
 * @see https://callstack.github.io/reassure/docs/api#measurefunction-function
 */
test('getAddressComponents on a big dataset', async () => {
    await measureFunction(
        () => {
            GooglePlacesUtils.getAddressComponents(addressComponents, bigObjectToFind);
        },
        {runs: 20},
    );
});
