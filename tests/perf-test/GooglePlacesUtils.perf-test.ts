/* eslint-disable @typescript-eslint/naming-convention */
import {measureFunction} from 'reassure';
import * as GooglePlacesUtils from '@src/libs/GooglePlacesUtils';

const addressComponents: GooglePlacesUtils.AddressComponent[] = [
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
    {
        longText: 'United Kingdom',
        shortText: 'UK',
        types: ['country', 'political'],
    },
];

const bigObjectToFind: GooglePlacesUtils.FieldsToExtract = {
    sublocality: 'longText',
    administrative_area_level_1: 'shortText',
    postal_code: 'longText',
    'doesnt-exist': 'longText',
    s1ublocality: 'longText',
    a1dministrative_area_level_1: 'shortText',
    p1ostal_code: 'longText',
    '1doesnt-exist': 'longText',
    s2ublocality: 'longText',
    a2dministrative_area_level_1: 'shortText',
    p2ostal_code: 'longText',
    '2doesnt-exist': 'longText',
    s3ublocality: 'longText',
    a3dministrative_area_level_1: 'shortText',
    p3ostal_code: 'longText',
    '3doesnt-exist': 'longText',
    s4ublocality: 'longText',
    a4dministrative_area_level_1: 'shortText',
    p4ostal_code: 'longText',
    '4doesnt-exist': 'longText',
    s5ublocality: 'longText',
    a5dministrative_area_level_1: 'shortText',
    p5ostal_code: 'longText',
    '5doesnt-exist': 'longText',
    s6ublocality: 'longText',
    a6dministrative_area_level_1: 'shortText',
    p6ostal_code: 'longText',
    '6doesnt-exist': 'longText',
    s7ublocality: 'longText',
    a7dministrative_area_level_1: 'shortText',
    p7ostal_code: 'longText',
    '7doesnt-exist': 'longText',
    s8ublocality: 'longText',
    a8dministrative_area_level_1: 'shortText',
    p8ostal_code: 'longText',
    '8doesnt-exist': 'longText',
    s9ublocality: 'longText',
    a9dministrative_area_level_1: 'shortText',
    p9ostal_code: 'longText',
    '9doesnt-exist': 'longText',
    s10ublocality: 'longText',
    a10dministrative_area_level_1: 'shortText',
    p10ostal_code: 'longText',
    '10doesnt-exist': 'longText',
    s11ublocality: 'longText',
    a11dministrative_area_level_1: 'shortText',
    p11ostal_code: 'longText',
    '11doesnt-exist': 'longText',
    s12ublocality: 'longText',
    a12dministrative_area_level_1: 'shortText',
    p12ostal_code: 'longText',
    '12doesnt-exist': 'longText',
    s13ublocality: 'longText',
    a13dministrative_area_level_1: 'shortText',
    p13ostal_code: 'longText',
    '13doesnt-exist': 'longText',
    s14ublocality: 'longText',
    a14dministrative_area_level_1: 'shortText',
    p14ostal_code: 'longText',
    '14doesnt-exist': 'longText',
    s15ublocality: 'longText',
    a15dministrative_area_level_1: 'shortText',
    p15ostal_code: 'longText',
    '15doesnt-exist': 'longText',
    s16ublocality: 'longText',
    a16dministrative_area_level_1: 'shortText',
    p16ostal_code: 'longText',
    '16doesnt-exist': 'longText',
    s17ublocality: 'longText',
    a17dministrative_area_level_1: 'shortText',
    p17ostal_code: 'longText',
    '17doesnt-exist': 'longText',
    s18ublocality: 'longText',
    a18dministrative_area_level_1: 'shortText',
    p18ostal_code: 'longText',
    '18doesnt-exist': 'longText',
    s19ublocality: 'longText',
    a19dministrative_area_level_1: 'shortText',
    p19ostal_code: 'longText',
    '19doesnt-exist': 'longText',
    s20ublocality: 'longText',
    a20dministrative_area_level_1: 'shortText',
    p20ostal_code: 'longText',
    '20doesnt-exist': 'longText',
    s21ublocality: 'longText',
    a21dministrative_area_level_1: 'shortText',
    p21ostal_code: 'longText',
    '21doesnt-exist': 'longText',
    s22ublocality: 'longText',
    a22dministrative_area_level_1: 'shortText',
    p22ostal_code: 'longText',
    '22doesnt-exist': 'longText',
    s23ublocality: 'longText',
    a23dministrative_area_level_1: 'shortText',
    p23ostal_code: 'longText',
    '23doesnt-exist': 'longText',
    s24ublocality: 'longText',
    a24dministrative_area_level_1: 'shortText',
    p24ostal_code: 'longText',
    '24doesnt-exist': 'longText',
    s25ublocality: 'longText',
    a25dministrative_area_level_1: 'shortText',
    p25ostal_code: 'longText',
    '25doesnt-exist': 'longText',
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
test('[GooglePlacesUtils] getAddressComponents on a big dataset', async () => {
    await measureFunction(
        () => {
            GooglePlacesUtils.getAddressComponents(addressComponents, bigObjectToFind);
        },
        {runs: 20},
    );
});
