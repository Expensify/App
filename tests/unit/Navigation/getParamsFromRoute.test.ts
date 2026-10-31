import getParamsFromRoute from '@libs/Navigation/helpers/getParamsFromRoute';

jest.mock('@libs/Navigation/linkingConfig/config', () => ({
    normalizedConfigs: {
        workspace: {pattern: 'workspace/:policyID/:reportID?backTo=:backTo'},
        empty: {pattern: ''},
    },
}));

jest.mock('@src/ROUTES', () => ({
    SHARED_ROUTE_PARAMS: {workspace: ['backTo', 'sharedOnly', 'policyID']},
}));

describe('getParamsFromRoute', () => {
    it('returns path parameters in their original order without shared values by default', () => {
        // Given a route with path and query parameters that also appear in the shared list
        // When shared parameters are omitted
        // Then the path order and duplicates remain as they were before combining the lists
        expect(getParamsFromRoute('workspace')).toEqual(['policyID', 'reportID', 'backTo', 'backTo']);
        expect(getParamsFromRoute('workspace', false)).toEqual(['policyID', 'reportID', 'backTo', 'backTo']);
    });

    it('appends only new shared parameters in order', () => {
        // Given shared parameters that repeat two path parameters
        // When shared parameters are requested
        // Then the combined result contains each name once and keeps its first position
        expect(getParamsFromRoute('workspace', true)).toEqual(['policyID', 'reportID', 'backTo', 'sharedOnly']);
    });

    it('returns an empty list for absent, prototype-like, and empty-pattern names', () => {
        // Given names without an own configured route pattern
        // When the helper resolves each name with shared parameters enabled
        // Then no inherited dictionary property becomes a route
        for (const name of ['missing', 'toString', 'constructor', '__proto__', 'empty']) {
            expect(getParamsFromRoute(name, true)).toEqual([]);
        }
    });
});
