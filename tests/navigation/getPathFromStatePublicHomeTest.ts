import type {NavigationState, PartialState} from '@react-navigation/routers';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Regression test for the unauthenticated sign-in page URL.
 *
 * PublicScreens registers the SignInPage under NAVIGATORS.TAB_NAVIGATOR (mirroring the authenticated
 * top-level navigator) instead of SCREENS.HOME. TAB_NAVIGATOR has no path of its own, so the
 * logged-out URL resolves to the root "/" instead of "/Home". The authenticated Home tab is the HOME
 * route *nested inside* TAB_NAVIGATOR and still resolves to "/home".
 *
 * Before the fix, SignInPage was registered as the top-level SCREENS.HOME with no root-level path
 * mapping, so React Navigation derived "/Home" from the screen name and the logged-out address bar
 * showed "/Home".
 */
describe('getPathFromState - sign-in page (public TAB_NAVIGATOR)', () => {
    it('returns "/" for the unauthenticated TAB_NAVIGATOR root (SignInPage, no nested tab state)', () => {
        const state: PartialState<NavigationState> = {index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]};
        expect(getPathFromState(state)).toBe('/');
    });

    it('returns "/" when "/" synthesizes TAB_NAVIGATOR with ReportsSplit focused (empty path)', () => {
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
