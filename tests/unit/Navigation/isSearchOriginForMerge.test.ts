import isSearchOriginForMerge from '@libs/Navigation/helpers/isSearchOriginForMerge';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

describe('isSearchOriginForMerge', () => {
    const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);

    beforeEach(() => {
        mockIsSearchTopmostFullScreenRoute.mockReset();
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
    });

    it('returns true for SEARCH_REPORT routes with a search root backTo', () => {
        expect(isSearchOriginForMerge(SCREENS.RIGHT_MODAL.SEARCH_REPORT, '/search?q=type:expense')).toBe(true);
    });

    it('returns true for SEARCH_REPORT routes with a search report backTo', () => {
        expect(isSearchOriginForMerge(SCREENS.RIGHT_MODAL.SEARCH_REPORT, '/search/r/123')).toBe(true);
    });

    it('returns false for SEARCH_REPORT routes with inbox or home backTo routes', () => {
        expect(isSearchOriginForMerge(SCREENS.RIGHT_MODAL.SEARCH_REPORT, '/e/123')).toBe(false);
        expect(isSearchOriginForMerge(SCREENS.RIGHT_MODAL.SEARCH_REPORT, '/r/123')).toBe(false);
    });

    it('falls back to the topmost fullscreen search route when backTo is missing', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        expect(isSearchOriginForMerge(SCREENS.RIGHT_MODAL.SEARCH_REPORT)).toBe(true);
    });

    it('returns false for non-search routes', () => {
        mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);

        expect(isSearchOriginForMerge(SCREENS.REPORT, '/search?q=type:expense')).toBe(false);
    });
});
