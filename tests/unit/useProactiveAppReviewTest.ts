import {renderHook, waitFor} from '@testing-library/react-native';

import CONST from '@src/CONST';
import useProactiveAppReview from '@src/hooks/useProactiveAppReview';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useProactiveAppReview', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        Onyx.clear();
        return waitForBatchedUpdates();
    });

    it('returns shouldShowModal true when a trigger is set for a normal session', async () => {
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(true);
        });
    });

    it('returns shouldShowModal false during a supportal session even when a trigger is set', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.SUPPORT});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });

    it('returns shouldShowModal false when acting as a copilot even when a trigger is set', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess: {delegate: 'copilot@expensify.com'}});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });
});
