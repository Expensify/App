import {afterEach, beforeEach, describe, expect, it, jest} from '@jest/globals';

import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import Navigation from '@libs/Navigation/Navigation';

jest.mock('@libs/Navigation/navigationRef', () => {
    return {
        __esModule: true,
        default: {
            current: {getCurrentRoute: jest.fn(() => ({name: 'test'}))},
            getRootState: jest.fn(() => ({})),
            isReady: jest.fn(() => true),
        },
    };
});

jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());

describe('Navigation', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        jest.mocked(getPathFromState).mockReturnValue('/settings/profile?backTo=settings');
    });

    it('Should correctly identify active routes', () => {
        expect(Navigation.isActiveRoute('settings/profile')).toBe(true);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('settings/profile/')).toBe(true);
        // @ts-expect-error -- deliberately tests a runtime route query variant outside the Route union.
        expect(Navigation.isActiveRoute('settings/profile?param=1')).toBe(true);
        expect(Navigation.isActiveRoute('settings/profile/display-name')).toBe(false);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('settings/profile/display-name/')).toBe(false);
        expect(Navigation.isActiveRoute('settings/preferences')).toBe(false);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('settings/preferences/')).toBe(false);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('report')).toBe(false);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('report/123/')).toBe(false);
        // @ts-expect-error -- deliberately tests a runtime route variant outside the Route union.
        expect(Navigation.isActiveRoute('report/123')).toBe(false);
    });
});
