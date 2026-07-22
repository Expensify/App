import {renderHook, waitFor} from '@testing-library/react-native';

import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useShouldSuppressPromotionalUI', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns false for a regular session', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, email: 'user@example.com'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it('returns true when the session uses a support auth token', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('returns true mid-transition when isSupportAuthTokenUsed is set', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {isSupportAuthTokenUsed: true});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it('returns true when acting as a copilot', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@expensify.com'}});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
