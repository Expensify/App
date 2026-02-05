import {renderHook} from '@testing-library/react-native';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import ROUTES from '@src/ROUTES';

jest.mock('@react-navigation/native', () => ({
    useNavigationState: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());

const {useNavigationState} = jest.requireMock<{useNavigationState: jest.Mock}>('@react-navigation/native');
const getPathFromStateMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/getPathFromState');

describe('useDynamicBackPath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useNavigationState.mockImplementation((selector: (state: unknown) => unknown) => selector({}));
    });

    it('should return HOME when path is null or undefined', () => {
        getPathFromStateMock.mockReturnValue(undefined);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe(ROUTES.HOME);
    });

    it('should remove suffix when it is the last segment', () => {
        const fullPath = 'settings/wallet/verify-account';
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe('settings/wallet');
    });

    it('should remove suffix BUT preserve query parameters', () => {
        const fullPath = 'settings/wallet/verify-account?tab=details';
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe('settings/wallet?tab=details');
    });

    it('should NOT remove suffix if it is NOT the last segment', () => {
        const fullPath = 'settings/verify-account/details';
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe(fullPath);
    });

    it('should NOT remove suffix if it matches partially', () => {
        const fullPath = 'settings/wallet/verify-account-page';
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe(fullPath);
    });

    it('should handle logic when normalizePath handles trailing slashes', () => {
        const fullPath = 'settings/wallet/verify-account/';
        getPathFromStateMock.mockReturnValue(fullPath);

        const {result} = renderHook(() => useDynamicBackPath('verify-account'));

        expect(result.current).toBe('settings/wallet');
    });
});
