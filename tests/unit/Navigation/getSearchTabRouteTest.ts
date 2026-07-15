import getSearchTabRoute from '@components/Navigation/NavigationTabBar/getSearchTabRoute';

import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {NavigationState} from '@react-navigation/native';

const mockGetLastRoute = jest.fn();

jest.mock('@components/Navigation/NavigationTabBar/getLastRoute', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockGetLastRoute(...args),
}));

const rootState = {} as NavigationState;

describe('getSearchTabRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('restores the last navigation route with its additional parameters', () => {
        const q = buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE});
        const queryJSON = buildSearchQueryJSON(q);
        mockGetLastRoute.mockReturnValue({params: {q, rawQuery: q, name: 'Expenses'}});

        expect(queryJSON).not.toBeUndefined();
        if (!queryJSON) {
            return;
        }

        expect(getSearchTabRoute(rootState, undefined)).toBe(
            ROUTES.SEARCH_ROOT.getRoute({
                query: buildSearchQueryString(queryJSON),
                rawQuery: q,
                name: 'Expenses',
            }),
        );
    });

    it('falls back to the last Onyx query when there is no navigation route', () => {
        const queryJSON = buildSearchQueryJSON(buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE}));
        mockGetLastRoute.mockReturnValue(undefined);

        expect(queryJSON).not.toBeUndefined();
        if (!queryJSON) {
            return;
        }

        expect(getSearchTabRoute(rootState, {queryJSON})).toBe(ROUTES.SEARCH_ROOT.getRoute({query: buildSearchQueryString(queryJSON)}));
    });

    it('falls back to the default expense query', () => {
        mockGetLastRoute.mockReturnValue(undefined);

        expect(getSearchTabRoute(rootState, undefined)).toBe(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE})}));
    });
});
