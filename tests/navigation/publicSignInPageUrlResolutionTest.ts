import type {NavigationState, PartialState} from '@react-navigation/routers';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * URL ↔ state resolution for the logged-out sign-in page.
 *
 * PublicScreens registers the SignInPage under NAVIGATORS.TAB_NAVIGATOR (mirroring the authenticated
 * top-level navigator) instead of SCREENS.HOME. TAB_NAVIGATOR has no path of its own, so the
 * logged-out URL resolves to the root "/" instead of "/Home". The authenticated Home tab is the HOME
 * route *nested inside* TAB_NAVIGATOR and still resolves to "/home".
 *
 * Before the fix, SignInPage was registered as the top-level SCREENS.HOME with no root-level path
 * mapping, so React Navigation derived "/Home" from the screen name and the logged-out address bar
 * showed "/Home".
 *
 * The companion render test (PublicSignInPageRootUrlTest) pins that PublicScreens actually registers
 * the SignInPage under TAB_NAVIGATOR; this file pins that the shared linking config maps that name to
 * "/" (and back).
 */
describe('Public sign-in page URL resolution', () => {
    describe('through the real linking config (getAdaptedStateFromPath → getPathFromState)', () => {
        it('maps "/" to a TAB_NAVIGATOR root and back to "/" (the SignInPage host the public navigator renders)', () => {
            const state = getAdaptedStateFromPath('/', undefined);

            // The top-level route the linking config produces for "/" must be the same name PublicScreens
            // registers the SignInPage under, otherwise the logged-out navigator can't render it.
            expect(state?.routes.at(-1)?.name).toBe(NAVIGATORS.TAB_NAVIGATOR);
            expect(getPathFromState(state)).toBe('/');
        });

        it('redirects the legacy "/Home" URL (cached last-visited path) to the root "/"', () => {
            const state = getAdaptedStateFromPath('/Home', undefined);

            expect(getPathFromState(state)).toBe('/');
        });
    });

    describe('getPathFromState', () => {
        it('returns "/" for the unauthenticated TAB_NAVIGATOR root (SignInPage, no nested tab state)', () => {
            const state: PartialState<NavigationState> = {index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]};
            expect(getPathFromState(state)).toBe('/');
        });

        it('returns "/" for the authenticated root (TAB_NAVIGATOR with ReportsSplit focused — the empty-path inbox)', () => {
            const state: PartialState<NavigationState> = {
                index: 0,
                routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 1, routes: [{name: SCREENS.HOME}, {name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}]}}],
            };
            expect(getPathFromState(state)).toBe('/');
        });

        it('keeps "/home" for the authenticated Home tab nested in TAB_NAVIGATOR', () => {
            const state: PartialState<NavigationState> = {
                index: 0,
                routes: [{name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{name: SCREENS.HOME}]}}],
            };
            expect(getPathFromState(state)).toBe('/home');
        });
    });
});
