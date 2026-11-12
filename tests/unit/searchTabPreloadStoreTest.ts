import {clearIdlePreloadedSearchTabRouteKey, isIdlePreloadedSearchTabRoute, setIdlePreloadedSearchTabRouteKey} from '@libs/Navigation/helpers/searchTabPreloadStore';

const SEARCH_TAB_ROUTE_KEY = 'search-1';

describe('isIdlePreloadedSearchTabRoute', () => {
    beforeEach(() => {
        clearIdlePreloadedSearchTabRouteKey();
    });

    it.each([
        ['counts the idle preload mark until the tab is opened', SEARCH_TAB_ROUTE_KEY, [SEARCH_TAB_ROUTE_KEY], true],
        ['ignores a mark from a submit pre-mount or a restored history entry', undefined, [SEARCH_TAB_ROUTE_KEY], false],
        ['ignores the saved key once opening the tab dropped the mark', SEARCH_TAB_ROUTE_KEY, [], false],
        ['ignores a saved key for another route', 'search-2', [SEARCH_TAB_ROUTE_KEY], false],
    ])('%s', (_description, idlePreloadedRouteKey, preloadedRouteKeys, expected) => {
        // Given the key the idle preload saved, if any, and the tab's preloaded keys
        if (idlePreloadedRouteKey) {
            setIdlePreloadedSearchTabRouteKey(idlePreloadedRouteKey);
        }

        // When the Spend navigator checks for the idle preload
        const isIdlePreloaded = isIdlePreloadedSearchTabRoute({routes: [], preloadedRouteKeys}, SEARCH_TAB_ROUTE_KEY);

        // Then only the idle preload's mark counts, so other marks neither hold the page's request nor cause a first-open refresh
        expect(isIdlePreloaded).toBe(expected);
    });
});
