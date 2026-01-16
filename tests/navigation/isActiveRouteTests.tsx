import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import type {getPathFromState as GetPathFromState} from '@react-navigation/native';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {Route} from '@src/ROUTES';

jest.mock('@libs/Navigation/navigationRef', () => {
    const navigationRefMock = {
        current: {getCurrentRoute: jest.fn()},
        getRootState: jest.fn(),
        isReady: jest.fn(),
    };

    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        default: navigationRefMock,
    };
});

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const actual = jest.requireActual('@react-navigation/native') as {getPathFromState: typeof GetPathFromState};
    return {
        ...actual,
        getPathFromState: jest.fn<typeof GetPathFromState>(() => '/settings/profile?backTo=settings'),
    };
});

describe('Navigation', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        const navigationRefMock = navigationRef as typeof navigationRef & {
            current: {getCurrentRoute: jest.Mock};
            getRootState: jest.Mock;
            isReady: jest.Mock;
        };

        navigationRefMock.current.getCurrentRoute.mockReturnValue({name: 'test'});
        navigationRefMock.getRootState.mockReturnValue({} as ReturnType<typeof navigationRef.getRootState>);
        navigationRefMock.isReady.mockReturnValue(true);
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
