import {renderHook} from '@testing-library/react-native';

import useGeographicalStateAndCountryFromRoute from '@hooks/useGeographicalStateAndCountryFromRoute';

let mockRouteParams: unknown;

jest.mock('@react-navigation/native', () => ({
    useRoute: () => ({params: mockRouteParams}),
}));

function getGeographicalValues(stateParamName?: string, countryParamName?: string) {
    return renderHook(() => useGeographicalStateAndCountryFromRoute(stateParamName, countryParamName)).result.current;
}

describe('useGeographicalStateAndCountryFromRoute', () => {
    beforeEach(() => {
        mockRouteParams = undefined;
    });

    it('returns valid state and country values', () => {
        mockRouteParams = {state: 'MO', country: 'US'};

        expect(getGeographicalValues()).toEqual({state: 'MO', country: 'US'});
    });

    it('supports custom parameter names', () => {
        mockRouteParams = {province: 'MO', nation: 'US'};

        expect(getGeographicalValues('province', 'nation')).toEqual({state: 'MO', country: 'US'});
    });

    it('accepts inherited valid state and country values', () => {
        mockRouteParams = Object.setPrototypeOf({}, {state: 'MO', country: 'US'});

        expect(getGeographicalValues()).toEqual({state: 'MO', country: 'US'});
    });

    it('accepts inherited valid values with custom parameter names', () => {
        mockRouteParams = Object.setPrototypeOf({}, {province: 'MO', nation: 'US'});

        expect(getGeographicalValues('province', 'nation')).toEqual({state: 'MO', country: 'US'});
    });

    it.each([
        ['absent values', {}],
        ['empty values', {state: '', country: ''}],
        ['unknown values', {state: 'ASDF', country: 'XX'}],
        ['non-string values', {state: 1, country: true}],
        ['prototype keys', {state: 'constructor', country: 'toString'}],
        ['a state hash suffix', {state: 'MO-hash-a12341', country: 'US-hash-a12341'}],
    ])('returns undefined values for %s', (_description, params) => {
        mockRouteParams = params;

        expect(getGeographicalValues()).toEqual({state: undefined, country: undefined});
    });

    it.each([
        ['missing params', undefined],
        ['an array', ['MO', 'US']],
    ])('returns own undefined properties for %s', (_description, params) => {
        mockRouteParams = params;

        expect(getGeographicalValues()).toStrictEqual({state: undefined, country: undefined});
    });

    it('rejects inherited values that are not supported strings', () => {
        mockRouteParams = Object.setPrototypeOf({}, {state: 1, country: 'toString'});

        expect(getGeographicalValues()).toEqual({state: undefined, country: undefined});
    });

    it('accepts a readonly route params object', () => {
        mockRouteParams = Object.freeze({state: 'MO', country: 'US'});

        expect(getGeographicalValues()).toEqual({state: 'MO', country: 'US'});
    });
});
