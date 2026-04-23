import {renderHook} from '@testing-library/react-native';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@hooks/useRootNavigationState', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());
jest.mock('@src/ROUTES', () => ({
    default: {
        HOME: 'home',
    },
    DYNAMIC_ROUTES: {
        VERIFY_ACCOUNT: {path: 'verify-account'},
        CUSTOM_TEST_ROUTE: {path: 'custom-test-route'},
        ADDRESS_COUNTRY: {path: 'country'},
        FLAG_COMMENT: {path: 'flag/:reportID/:reportActionID'},
        MEMBER_DETAILS: {path: 'member-details/:accountID'},
    },
}));

const useRootNavigationStateMock = jest.requireMock<jest.Mock>('@hooks/useRootNavigationState');
const getPathFromStateMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/getPathFromState');

describe('useDynamicBackPath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRootNavigationStateMock.mockImplementation((selector: (state: unknown) => unknown) => selector({}));
    });

    it('should return HOME when path is null or undefined', () => {
        getPathFromStateMock.mockReturnValue(undefined);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe(ROUTES.HOME);
    });

    for (const {path} of Object.values(DYNAMIC_ROUTES)) {
        it(`should remove suffix ${path} when it is the last segment`, () => {
            const pathPrefix = 'settings/wallet';
            const fullPath = `${pathPrefix}/${path}`;
            getPathFromStateMock.mockReturnValue(fullPath);

            const {result} = renderHook(() => useDynamicBackPath(path));

            expect(result.current).toBe(pathPrefix);
        });
    }

    it('should NOT remove suffix if it is NOT the last segment', () => {
        const path = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;
        const fullPath = `settings/${path}/details`;
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath(path));

        expect(result.current).toBe(fullPath);
    });

    it('should remove suffix BUT preserve query parameters', () => {
        const path = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;
        const fullPath = `settings/wallet/${path}?tab=details`;
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath(path));

        expect(result.current).toBe('settings/wallet?tab=details');
    });

    it('should NOT remove suffix if it matches partially', () => {
        const path = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;
        const fullPath = `settings/wallet/${path}-page`;
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath(path));

        expect(result.current).toBe(fullPath);
    });

    it('should handle logic when normalizePath handles trailing slashes', () => {
        const path = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;
        const fullPath = `settings/wallet/${path}/`;
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath(path));

        expect(result.current).toBe('settings/wallet');
    });

    const FLAG_COMMENT_PATH = 'flag/:reportID/:reportActionID' as DynamicRouteSuffix;
    const MEMBER_DETAILS_PATH = 'member-details/:accountID' as DynamicRouteSuffix;

    it('should remove parametric suffix with single param', () => {
        getPathFromStateMock.mockReturnValue('r/123/members/member-details/456');

        const {result} = renderHook(() => useDynamicBackPath(MEMBER_DETAILS_PATH));

        expect(result.current).toBe('r/123/members');
    });

    it('should remove parametric suffix with multiple params', () => {
        getPathFromStateMock.mockReturnValue('r/123/flag/456/abc');

        const {result} = renderHook(() => useDynamicBackPath(FLAG_COMMENT_PATH));

        expect(result.current).toBe('r/123');
    });

    it('should NOT remove parametric suffix when segment values dont fill pattern', () => {
        getPathFromStateMock.mockReturnValue('r/123/flag/456');

        const {result} = renderHook(() => useDynamicBackPath(FLAG_COMMENT_PATH));

        expect(result.current).toBe('r/123/flag/456');
    });

    it('should preserve query params when removing parametric suffix', () => {
        getPathFromStateMock.mockReturnValue('r/123/flag/456/abc?tab=details');

        const {result} = renderHook(() => useDynamicBackPath(FLAG_COMMENT_PATH));

        expect(result.current).toBe('r/123?tab=details');
    });

    it('should NOT remove parametric suffix when static segment mismatches', () => {
        getPathFromStateMock.mockReturnValue('r/123/other/456/abc');

        const {result} = renderHook(() => useDynamicBackPath(FLAG_COMMENT_PATH));

        expect(result.current).toBe('r/123/other/456/abc');
    });
});
