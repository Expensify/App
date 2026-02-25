import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
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

jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());

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

        (getPathFromState as jest.Mock).mockReturnValue('/settings/profile?backTo=settings');

        navigationRefMock.current.getCurrentRoute.mockReturnValue({name: 'test'});
        navigationRefMock.getRootState.mockReturnValue({});
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
