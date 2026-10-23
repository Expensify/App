import {renderHook, waitFor} from '@testing-library/react-native';

import DateUtils from '@libs/DateUtils';

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
    it('returns shouldShowModal false when a negative response is recorded but the server NVP carries no lastPrompt', async () => {
        // This is the authoritative payload observed on the wire for #99564
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'negative'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });

    it('returns shouldShowModal false when a skip response is recorded but the server NVP carries no lastPrompt', async () => {
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'skip'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });

    it('returns shouldShowModal false when the server lastPrompt is stale but this client prompted recently (deploy blocker #94824 shape)', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'negative', lastPrompt: '2026-01-29 17:16:19.172'});
        await Onyx.set(ONYXKEYS.APP_REVIEW_LAST_PROMPT, {accountID: 1, lastPrompt: DateUtils.getDBTime()});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });

    it('re-prompts a negative responder once 30 days have passed since the local prompt record', async () => {
        const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'negative'});
        await Onyx.set(ONYXKEYS.APP_REVIEW_LAST_PROMPT, {accountID: 1, lastPrompt: DateUtils.getDBTime(thirtyOneDaysAgo.valueOf())});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(true);
        });
    });

    it('ignores a prompt record left behind by a different account on this device', async () => {
        const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 2});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', lastPrompt: DateUtils.getDBTime(fortyDaysAgo.valueOf())});
        // Account 1 answered on this device; account 2 is signed in now and must not inherit that record.
        await Onyx.set(ONYXKEYS.APP_REVIEW_LAST_PROMPT, {accountID: 1, lastPrompt: DateUtils.getDBTime()});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(true);
        });
    });

    it('stays closed on the next sign-in when the server lastPrompt is still the one that triggered the prompt (#99564)', async () => {
        // The exact account state reproduced on web: prompted and answered 40 days ago per the server,
        // answered again since, and the server copy never moved.
        const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1});
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'negative', lastPrompt: DateUtils.getDBTime(fortyDaysAgo.valueOf())});
        await Onyx.set(ONYXKEYS.APP_REVIEW_LAST_PROMPT, {accountID: 1, lastPrompt: DateUtils.getDBTime()});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });

    it('still re-prompts a positive responder never', async () => {
        await Onyx.merge(ONYXKEYS.NVP_APP_REVIEW, {trigger: 'submit', response: 'positive'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useProactiveAppReview());

        await waitFor(() => {
            expect(result.current.shouldShowModal).toBe(false);
        });
    });
});
