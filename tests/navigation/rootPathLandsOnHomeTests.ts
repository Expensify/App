import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';

import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

function getFocusedScreenName(path: string): string | undefined {
    return findFocusedRoute(getAdaptedStateFromPath(path, undefined))?.name;
}

function roundTrip(path: string): string {
    return getPathFromState(getAdaptedStateFromPath(path, undefined));
}

describe('root path', () => {
    it('lands on Home, not on the Inbox', () => {
        expect(getFocusedScreenName('/')).toBe(SCREENS.HOME);
    });

    it('resolves the canonical /home path to Home as well', () => {
        expect(getFocusedScreenName('/home')).toBe(SCREENS.HOME);
    });

    it('redirects the legacy "/Home" and "/signin" aliases to Home', () => {
        expect(getFocusedScreenName('/Home')).toBe(SCREENS.HOME);
        expect(getFocusedScreenName('/signin')).toBe(SCREENS.HOME);
    });

    it('keeps the query params of a root URL', () => {
        const state = getAdaptedStateFromPath('/?delegatorEmail=delegator%40expensify.com', undefined);

        expect(findFocusedRoute(state)?.name).toBe(SCREENS.HOME);
        expect(findFocusedRoute(state)?.params).toEqual({delegatorEmail: 'delegator@expensify.com'});
    });

    it('serializes Home back to the canonical /home path', () => {
        expect(roundTrip('/')).toBe('/home');
    });

    it('keeps the Inbox reachable under its own paths', () => {
        expect(getFocusedScreenName('/inbox')).toBe(SCREENS.INBOX);
        expect(getFocusedScreenName('/r')).toBe(SCREENS.REPORT);
        expect(getFocusedScreenName('/r/123')).toBe(SCREENS.REPORT);
    });

    it('round trips the Inbox paths unchanged', () => {
        expect(roundTrip('/inbox')).toBe('/inbox');
        expect(roundTrip('/r/123')).toBe('/r/123');
    });
});
