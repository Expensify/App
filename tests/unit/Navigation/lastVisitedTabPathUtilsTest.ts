import type * as LastVisitedTabPathUtils from '@libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts';

import CONST from '@src/CONST';

// The React Native preset resolves index.native.ts first, so the web implementation is loaded by its path
const {clearSessionStorage} = jest.requireActual<typeof LastVisitedTabPathUtils>('@libs/Navigation/helpers/lastVisitedTabPathUtils/index.ts');

describe('lastVisitedTabPathUtils', () => {
    beforeEach(() => {
        window.sessionStorage.clear();
    });

    describe('clearSessionStorage', () => {
        it('clears the session storage but keeps the Classic sign-in openings', () => {
            // Given a tab with stored data and recorded Classic sign-in openings
            window.sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB, '/settings/profile');
            window.sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.CLASSIC_SIGN_IN_OPENED_AT, '1000,2000');

            // When the session storage is cleared
            clearSessionStorage();

            // Then only the openings stay, so a sign-in loop that passes through a sign out still reaches its limit
            expect(window.sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB)).toBeNull();
            expect(window.sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.CLASSIC_SIGN_IN_OPENED_AT)).toBe('1000,2000');
            expect(window.sessionStorage).toHaveLength(1);
        });

        it('clears everything when no Classic sign-in page opened', () => {
            // Given a tab with stored data and no Classic sign-in openings
            window.sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB, '/settings/profile');

            // When the session storage is cleared
            clearSessionStorage();

            // Then nothing is left
            expect(window.sessionStorage).toHaveLength(0);
        });
    });
});
