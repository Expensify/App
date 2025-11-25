import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {Route} from '@src/ROUTES';

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return Object.assign({}, actual, {
        getPathFromState: jest.fn().mockReturnValue('/settings/profile?backTo=settings'),
    });
});

describe('Navigation', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        // Minimal stubs so getActiveRoute() can derive a path without rendering navigation containers.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigationRef as any).getRootState = jest.fn().mockReturnValue({});
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (navigationRef as any).current = {getCurrentRoute: jest.fn().mockReturnValue({name: 'DUMMY'})};
        jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
    });

    it('Should correctly identify active routes', () => {
        expect(Navigation.isActiveRoute('settings/profile' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile/' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile?param=1' as Route)).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile/display-name' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/profile/display-name/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/preferences' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('settings/preferences/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report/123/' as Route)).toBe(false);
        expect(Navigation.isActiveRoute('report/123' as Route)).toBe(false);
    });
});
