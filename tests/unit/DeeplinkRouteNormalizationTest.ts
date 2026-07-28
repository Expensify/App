import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getMatchingNewRoute from '@libs/Navigation/helpers/getMatchingNewRoute';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import {getRouteFromLink} from '@libs/ReportUtils';

import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getMatchingNewRoute', () => jest.fn());

/**
 * Regression test for https://github.com/Expensify/App/issues/89737 (originally https://github.com/Expensify/App/issues/90880).
 *
 * When a user visits the root URL (new.expensify.com), refreshes, and signs in — or when OldDot
 * hands NewDot a cold-start URL on HybridApp — React Navigation generates a `/Home` route
 * (capitalized) because PublicScreens uses SCREENS.HOME ('Home') at the root level without a
 * path mapping. The authenticated config maps SCREENS.HOME to lowercase 'home', so the
 * case-sensitive mismatch falls through to NOT_FOUND.
 *
 * `getAdaptedStateFromPath` normalizes `/Home` to `/` so every caller (cold-start state
 * derivation, last-visited-path restoration, deeplink handling, etc.) treats it as the root.
 * These tests verify both that contract and the helpers it relies on.
 */
describe('Deeplink route normalization', () => {
    describe('getRouteFromLink with root URLs', () => {
        it('Should return empty string for null URL', () => {
            expect(getRouteFromLink(null)).toBe('');
        });

        it('Should return empty string for root URL with trailing slash', () => {
            expect(getRouteFromLink('https://new.expensify.com/')).toBe('');
        });
    });

    describe('Home route normalization guard', () => {
        it('Should detect Home route that needs normalization to empty string', () => {
            const route = 'Home';
            // normalizePath adds leading slash, producing /Home
            expect(normalizePath(route)).toBe('/Home');
            // The guard matches against /${SCREENS.HOME}
            expect(normalizePath(route)).toBe(`/${SCREENS.HOME}`);
        });

        it('Should not trigger for other valid routes', () => {
            const validRoutes = ['r/123456789', 'settings/profile', 'search'];
            for (const route of validRoutes) {
                expect(normalizePath(route)).not.toBe(`/${SCREENS.HOME}`);
            }
        });

        it('Should not trigger for empty route (already correct)', () => {
            expect(normalizePath('')).not.toBe(`/${SCREENS.HOME}`);
        });
    });

    describe('getAdaptedStateFromPath /Home normalization', () => {
        const mockGetStateFromPath = getStateFromPath as jest.Mock;
        const mockGetMatchingNewRoute = getMatchingNewRoute as jest.Mock;

        beforeEach(() => {
            jest.clearAllMocks();
            // Pass through unchanged so we can isolate the /Home check.
            mockGetMatchingNewRoute.mockReturnValue(null);
            // Return a minimal state with a full-screen route so getAdaptedState early-returns.
            mockGetStateFromPath.mockReturnValue({routes: [{name: SCREENS.HOME}], index: 0});
        });

        it('Should rewrite `/Home` to `/` before delegating to the inner getStateFromPath', () => {
            getAdaptedStateFromPath('/Home' as Route, undefined, false);
            expect(mockGetStateFromPath).toHaveBeenCalledWith('/');
        });

        it('Should rewrite bare `Home` (no leading slash) to `/`', () => {
            getAdaptedStateFromPath('Home' as Route, undefined, false);
            expect(mockGetStateFromPath).toHaveBeenCalledWith('/');
        });

        it('Should NOT rewrite the lowercase `/home` route', () => {
            getAdaptedStateFromPath('/home' as Route, undefined, false);
            expect(mockGetStateFromPath).toHaveBeenCalledWith('/home');
        });

        it('Should NOT rewrite other paths that merely contain `Home`', () => {
            getAdaptedStateFromPath('/Home/extra' as Route, undefined, false);
            expect(mockGetStateFromPath).toHaveBeenCalledWith('/Home/extra');
        });

        it('Should leave unrelated paths untouched', () => {
            getAdaptedStateFromPath('/r/123456789' as Route, undefined, false);
            expect(mockGetStateFromPath).toHaveBeenCalledWith('/r/123456789');
        });
    });
});
