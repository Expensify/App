import getMatchingNewRoute from '@navigation/helpers/getMatchingNewRoute';

describe('getBestMatchingPath', () => {
    it('returns mapped base path when input matches the exact pattern', () => {
        expect(getMatchingNewRoute('/settings/workspaces/')).toBe('/workspaces/');
    });

    it('returns mapped base path when input matches the exact pattern', () => {
        expect(getMatchingNewRoute('/settings/workspaces')).toBe('/workspaces');
    });

    it('returns mapped path when input matches the pattern and have more content', () => {
        expect(getMatchingNewRoute('/settings/workspaces/anything/more')).toBe('/workspaces/anything/more');
    });

    it('returns undefined when input does not match any pattern - similar prefix but different ending', () => {
        expect(getMatchingNewRoute('/settings/anything/')).toBe(undefined);
    });

    it('returns undefined when input is unrelated to any pattern', () => {
        expect(getMatchingNewRoute('/anything/workspaces/')).toBe(undefined);
        expect(getMatchingNewRoute('/anything/anything/')).toBe(undefined);
        expect(getMatchingNewRoute('/anything/anything/anything')).toBe(undefined);
    });
});
