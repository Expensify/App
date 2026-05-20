import normalizePath from '@libs/Navigation/helpers/normalizePath';
import {getRouteFromLink} from '@libs/ReportUtils';
import SCREENS from '@src/SCREENS';

/**
 * Regression test for https://github.com/Expensify/App/issues/90880
 *
 * When a user visits the root URL (new.expensify.com), refreshes, and signs in,
 * React Navigation generates a /Home route (capitalized) because PublicScreens uses
 * SCREENS.HOME ('Home') at the root level without a path mapping. This route doesn't
 * exist in the authenticated navigation tree, causing a "not found" page.
 *
 * The fix in openReportFromDeepLink normalizes /Home to an empty route (same as /).
 * These tests document the behavior that makes the guard necessary.
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
        // This test documents the exact condition checked in openReportFromDeepLink:
        // if (normalizePath(route) === `/${SCREENS.HOME}`) { route = ''; }
        it('Should detect Home route that needs normalization to empty string', () => {
            const route = 'Home';
            // normalizePath adds leading slash, producing /Home
            expect(normalizePath(route)).toBe('/Home');
            // The guard matches against /${SCREENS.HOME}
            expect(normalizePath(route)).toBe(`/${SCREENS.HOME}`);
            // This confirms the guard would trigger and reset route to ''
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
});
