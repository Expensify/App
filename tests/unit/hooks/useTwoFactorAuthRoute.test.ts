import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useTwoFactorAuthRoute from '@hooks/useTwoFactorAuthRoute';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({
    __esModule: true,
    default: jest.fn((suffix: string, backTo?: string) => `${backTo ?? 'active-route'}/${suffix}` as const),
}));

const mockUseOnyx = jest.mocked(useOnyx);

describe('useTwoFactorAuthRoute', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return SETTINGS_2FA_ENABLED when 2FA is enabled and forceSetup is not set', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: true, validated: true}, {status: 'loaded'}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());

        expect(result.current.getTwoFactorAuthRoute()).toBe(ROUTES.SETTINGS_2FA_ENABLED);
    });

    it('should return a setup route when 2FA is enabled but forceSetup is true', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: true, validated: true}, {status: 'loaded'}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());

        expect(result.current.getTwoFactorAuthRoute(ROUTES.SETTINGS_SECURITY, {forceSetup: true})).toBe(`${ROUTES.SETTINGS_SECURITY}/${DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path}`);
    });

    it('should return verify-account route for unvalidated accounts with forceSetup', () => {
        mockUseOnyx.mockReturnValue([{requiresTwoFactorAuth: true, validated: false}, {status: 'loaded'}]);

        const {result} = renderHook(() => useTwoFactorAuthRoute());

        expect(result.current.getTwoFactorAuthRoute(ROUTES.SETTINGS_SECURITY, {forceSetup: true})).toBe(`${ROUTES.SETTINGS_SECURITY}/${DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY_ACCOUNT.path}`);
    });
});
