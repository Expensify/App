import {getAddressComponent, isAddressValidForVBA} from '../../src/libs/GooglePlacesUtils';

describe('GooglePlacesUtilsTest', () => {
    describe('isAddressValidForVBA', () => {
        it('should reject Google Places result with missing street number', () => {
            // This result appears when searching for "25220 Quail Ridge Road, Escondido, CA, 97027"
            const googlePlacesRouteResult = {
                address_components: [
                    {
                        long_name: 'Quail Ridge Road',
                        short_name: 'Quail Ridge Rd',
                        types: ['route'],
                    },
                    {
                        long_name: 'Escondido',
                        short_name: 'Escondido',
                        types: ['locality', 'political'],
                    },
                    {
                        long_name: 'San Diego County',
                        short_name: 'San Diego County',
                        types: ['administrative_area_level_2', 'political'],
                    },
                    {
                        long_name: 'California',
                        short_name: 'CA',
                        types: ['administrative_area_level_1', 'political'],
                    },
                    {
                        long_name: 'United States',
                        short_name: 'US',
                        types: ['country', 'political'],
                    },
                    {
                        long_name: '92027',
                        short_name: '92027',
                        types: ['postal_code'],
                    },
                ],
                formatted_address: 'Quail Ridge Rd, Escondido, CA 92027, USA',
                place_id: 'EihRdWFpbCBSaWRnZSBSZCwgRXNjb25kaWRvLCBDQSA5MjAyNywgVVNBIi4qLAoUChIJIQBiT7Pz24ARmaXMgCMhqAUSFAoSCXtDwoFe89uAEd_FlncPyNEB',
                types: ['route'],
            };
            const isValid = isAddressValidForVBA(googlePlacesRouteResult.address_components);
            expect(isValid).toStrictEqual(false);
        });

        it('should accept Google Places result with missing locality if sublocality is available', () => {
            // This result appears when searching for "64 Noll Street, Brooklyn, NY, USA"
            const brooklynAddressResult = {
                address_components: [
                    {
                        long_name: '64',
                        short_name: '64',
                        types: ['street_number'],
                    },
                    {
                        long_name: 'Noll Street',
                        short_name: 'Noll St',
                        types: ['route'],
                    },
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
                        long_name: 'Kings County',
                        short_name: 'Kings County',
                        types: ['administrative_area_level_2', 'political'],
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
                        long_name: '4604',
                        short_name: '4604',
                        types: ['postal_code_suffix'],
                    },
                ],
                formatted_address: '64 Noll St, Brooklyn, NY 11206, USA',
                // eslint-disable-next-line max-len
                place_id: 'EiM2NCBOb2xsIFN0LCBCcm9va2x5biwgTlkgMTEyMDYsIFVTQSJQEk4KNAoyCReOha8HXMKJETjOQzBxX7M3Gh4LEO7B7qEBGhQKEgmJzguI-VvCiRFYR8sAAcN5KAwQQCoUChIJH0FG4AZcwokRvrvwkhWA_6A',
                types: ['street_address'],
            };
            const isValid = isAddressValidForVBA(brooklynAddressResult.address_components);
            expect(isValid).toStrictEqual(true);
        });
    });
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
            expect(getAddressComponent(addressComponents, 'sublocality', 'long_name')).toStrictEqual('Brooklyn');
            expect(getAddressComponent(addressComponents, 'administrative_area_level_1', 'short_name')).toStrictEqual('NY');
            expect(getAddressComponent(addressComponents, 'postal_code', 'long_name')).toStrictEqual('11206');
            expect(getAddressComponent(addressComponents, 'doesn-exist', 'long_name')).toStrictEqual(undefined);
        });
    });
});
