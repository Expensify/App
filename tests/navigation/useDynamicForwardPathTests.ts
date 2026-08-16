import {renderHook} from '@testing-library/react-native';

import useDynamicForwardPath from '@hooks/useDynamicForwardPath';

import type {DynamicRouteSuffix} from '@src/ROUTES';

jest.mock('@hooks/useRootNavigationState', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getPathFromState', () => jest.fn());
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes', () => ({
    __esModule: true,
    default: jest.fn(),
    findMatchingDynamicSuffix: jest.fn(),
}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix', () => jest.fn());
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => jest.fn());
jest.mock('@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard', () => jest.fn());

const useRootNavigationStateMock = jest.requireMock<jest.Mock>('@hooks/useRootNavigationState');
const getPathFromStateMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/getPathFromState');
const findAllMatchingDynamicSuffixesMock: jest.Mock = jest.requireMock<{default: jest.Mock}>('@libs/Navigation/helpers/dynamicRoutesUtils/findAllMatchingDynamicSuffixes').default;
const getPathWithoutDynamicSuffixMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix');
const getStateFromPathMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/getStateFromPath');
const findFocusedRouteWithOnyxTabGuardMock: jest.Mock = jest.requireMock('@libs/Navigation/helpers/findFocusedRouteWithOnyxTabGuard');

const VERIFY_ACCOUNT_SUFFIX = 'verify-account' as DynamicRouteSuffix;
const SUCCESS_SUFFIX = 'two-factor-auth/success' as DynamicRouteSuffix;
const WALLET_SCREEN = 'Settings_Wallet';

describe('useDynamicForwardPath', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRootNavigationStateMock.mockImplementation((selector: (state: unknown) => unknown) => selector({}));
    });

    it('returns undefined when navigation state has no path', () => {
        getPathFromStateMock.mockReturnValue(undefined);

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when the matched suffix does not equal the expected dynamicRouteSuffix', () => {
        getPathFromStateMock.mockReturnValue('settings/wallet/two-factor-auth/success');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([{pattern: SUCCESS_SUFFIX, actualSuffix: 'two-factor-auth/success'}]);

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when no suffix match is found in the path', () => {
        getPathFromStateMock.mockReturnValue('settings/wallet');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([]);

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns the forward route when suffix, base state, and screen mapping all resolve', () => {
        getPathFromStateMock.mockReturnValue('settings/wallet/verify-account');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([{pattern: VERIFY_ACCOUNT_SUFFIX, actualSuffix: 'verify-account'}]);
        getPathWithoutDynamicSuffixMock.mockReturnValue('settings/wallet');
        getStateFromPathMock.mockReturnValue({routes: [{name: WALLET_SCREEN}]});
        findFocusedRouteWithOnyxTabGuardMock.mockReturnValue({name: WALLET_SCREEN});

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeDefined();
    });

    it('returns undefined when the focused screen has no mapping in FORWARD_TO_MAPPINGS', () => {
        getPathFromStateMock.mockReturnValue('settings/profile/verify-account');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([{pattern: VERIFY_ACCOUNT_SUFFIX, actualSuffix: 'verify-account'}]);
        getPathWithoutDynamicSuffixMock.mockReturnValue('settings/profile');
        getStateFromPathMock.mockReturnValue({routes: [{name: 'Settings_Profile'}]});
        findFocusedRouteWithOnyxTabGuardMock.mockReturnValue({name: 'Settings_Profile'});

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when getStateFromPath returns null for the base path', () => {
        getPathFromStateMock.mockReturnValue('settings/wallet/verify-account');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([{pattern: VERIFY_ACCOUNT_SUFFIX, actualSuffix: 'verify-account'}]);
        getPathWithoutDynamicSuffixMock.mockReturnValue('settings/wallet');
        getStateFromPathMock.mockReturnValue(null);

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });

    it('returns undefined when no focused route is found in the base state', () => {
        getPathFromStateMock.mockReturnValue('settings/wallet/verify-account');
        findAllMatchingDynamicSuffixesMock.mockReturnValue([{pattern: VERIFY_ACCOUNT_SUFFIX, actualSuffix: 'verify-account'}]);
        getPathWithoutDynamicSuffixMock.mockReturnValue('settings/wallet');
        getStateFromPathMock.mockReturnValue({routes: [{name: WALLET_SCREEN}]});
        findFocusedRouteWithOnyxTabGuardMock.mockReturnValue(null);

        const {result} = renderHook(() => useDynamicForwardPath(VERIFY_ACCOUNT_SUFFIX));

        expect(result.current).toBeUndefined();
    });
});
