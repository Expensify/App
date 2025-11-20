import {describe, expect, it, jest} from '@jest/globals';
import {isRouteActive} from '@libs/Navigation/helpers/isRouteActive';

jest.mock('@src/CONST', () => ({
    REGEX: {
        ROUTES: {
            REDUNDANT_SLASHES: /(\/{2,})|(\/$)/g,
        },
    },
}));

describe('Navigation', () => {
    it('Should correctly identify active routes', () => {
        const currentRoute = 'settings/profile?backTo=settings';

        expect(isRouteActive(currentRoute, 'settings/profile')).toBe(true);
        expect(isRouteActive(currentRoute, 'settings/profile/')).toBe(true);
        expect(isRouteActive(currentRoute, 'settings/profile?param=1')).toBe(true);
        expect(isRouteActive(currentRoute, 'settings/profile/display-name')).toBe(false);
        expect(isRouteActive(currentRoute, 'settings/preferences/')).toBe(false);
        expect(isRouteActive(currentRoute, 'report')).toBe(false);
        expect(isRouteActive(currentRoute, 'report/1234')).toBe(false);
        expect(isRouteActive(currentRoute, 'report/1234?param=1')).toBe(false);
    });
});
