import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

describe('ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute', () => {
    it('builds a route without the applyDirectly param by default', () => {
        expect(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY)).toBe('search/filters/category');
    });

    it('omits the applyDirectly param when direct apply is disabled', () => {
        expect(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, false)).toBe('search/filters/category');
    });

    it('appends the applyDirectly param when direct apply is enabled', () => {
        expect(ROUTES.SEARCH_ADVANCED_FILTERS_CONTENT.getRoute(CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, true)).toBe('search/filters/category?applyDirectly=true');
    });
});
