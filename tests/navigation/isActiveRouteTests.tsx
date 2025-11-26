import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import type {Route} from '@src/ROUTES';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type * as ReactNavigationNative from '@react-navigation/native';

jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native') as ReactNavigationNative;
    return {
        ...actual,
        getPathFromState: jest.fn<ReturnType<ReactNavigationNative['getPathFromState']>, Parameters<ReactNavigationNative['getPathFromState']>>(
            () => '/settings/profile?backTo=settings',
        ),
    };
});

describe('Navigation', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        // Minimal stubs so getActiveRoute() can derive a path without rendering navigation containers.
        const ref = navigationRef as typeof navigationRef & {current: {getCurrentRoute: () => {name: string}} | null};
        ref.current = {getCurrentRoute: jest.fn().mockReturnValue({name: 'test'})};
        jest.spyOn(navigationRef, 'getRootState').mockReturnValue({} as unknown as ReturnType<typeof navigationRef.getRootState>);
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
