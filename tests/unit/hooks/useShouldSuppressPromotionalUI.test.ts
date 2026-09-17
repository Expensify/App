import {renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';

import ONYXKEYS from '@src/ONYXKEYS';

import type {UseOnyxResult} from 'react-native-onyx';

// The SESSION/ACCOUNT selector mapping is covered by tests/unit/selectors/SessionTest.ts and AccountTest.ts,
// so here we mock useOnyx to exercise the hook's own logic: combining the two booleans and failing closed while loading.
jest.mock('@hooks/useOnyx', () => jest.fn());

const mockedUseOnyx = jest.mocked(useOnyx);

type MockedResult = UseOnyxResult<boolean>;

function mockUseOnyx(session: MockedResult, account: MockedResult) {
    mockedUseOnyx.mockImplementation((key) => (key === ONYXKEYS.SESSION ? session : account));
}

describe('useShouldSuppressPromotionalUI', () => {
    afterEach(() => {
        mockedUseOnyx.mockReset();
    });

    it('fails closed (returns true) while SESSION is still loading', () => {
        mockUseOnyx([false, {status: 'loading'}], [false, {status: 'loaded'}]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });

    it('fails closed (returns true) while ACCOUNT is still loading', () => {
        mockUseOnyx([false, {status: 'loaded'}], [false, {status: 'loading'}]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });

    it('returns false for a loaded regular (non-supportal, non-copilot) session', () => {
        mockUseOnyx([false, {status: 'loaded'}], [false, {status: 'loaded'}]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(false);
    });

    it('returns true for a supportal session', () => {
        mockUseOnyx([true, {status: 'loaded'}], [false, {status: 'loaded'}]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });

    it('returns true when acting as a copilot', () => {
        mockUseOnyx([false, {status: 'loaded'}], [true, {status: 'loaded'}]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });
});
