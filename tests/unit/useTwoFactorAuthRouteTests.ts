import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import type {Route} from '@src/ROUTES';

import {renderHook} from '@testing-library/react-native';

const mockUseOnyx = jest.fn();
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: (...args: unknown[]) => mockUseOnyx(...args) as unknown,
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: (suffix: string, backTo?: string) => (backTo ? `${backTo}/${suffix}` : `current-path/${suffix}`),
}));

describe('useTwoFactorAuthRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns the static enabled route when 2FA is already enabled', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: true, validated: true}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute();

        expect(route).toBe('settings/security/two-factor-auth/enabled');
        expect(result.current.is2FAEnabled).toBe(true);
    });

    it('returns the dynamic verify-account route when user is not validated', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: false, validated: false}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute();

        expect(route).toBe('current-path/two-factor-auth/verify-account');
        expect(result.current.is2FAEnabled).toBe(false);
    });

    it('returns the dynamic setup route when user is validated and 2FA is not enabled', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: false, validated: true}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute();

        expect(route).toBe('current-path/two-factor-auth');
        expect(result.current.is2FAEnabled).toBe(false);
    });

    it('ignores backTo and returns enabled route when 2FA is already enabled', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: true, validated: true}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute('settings/wallet' as Route);

        expect(route).toBe('settings/security/two-factor-auth/enabled');
    });

    it('passes backTo through to createDynamicRoute for verify-account', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: false, validated: false}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute('settings/security' as Route);

        expect(route).toBe('settings/security/two-factor-auth/verify-account');
    });

    it('passes backTo through to createDynamicRoute for setup route', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: false, validated: true}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute('settings/security' as Route);

        expect(route).toBe('settings/security/two-factor-auth');
    });

    it('treats undefined account as not validated and 2FA not enabled', () => {
        mockUseOnyx.mockReturnValue([undefined]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());
        const route = result.current.getTwoFactorAuthRoute();

        expect(route).toBe('current-path/two-factor-auth/verify-account');
        expect(result.current.is2FAEnabled).toBe(false);
    });
});
