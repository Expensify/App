import {renderHook, waitFor} from '@testing-library/react-native';

import useResolvedAgentAccountID from '@hooks/useResolvedAgentAccountID';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

describe('useResolvedAgentAccountID', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('returns the route accountID when there is no mapping entry', async () => {
        const {result} = renderHook(() => useResolvedAgentAccountID(111));

        await waitFor(() => {
            expect(result.current).toEqual([111, true]);
        });
    });

    it('resolves to the real accountID when a mapping entry exists', async () => {
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {111: 222});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useResolvedAgentAccountID(111));

        await waitFor(() => {
            expect(result.current).toEqual([222, true]);
        });
    });

    it('does not resolve when the mapping has entries for other accountIDs only', async () => {
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {999: 888});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useResolvedAgentAccountID(111));

        await waitFor(() => {
            expect(result.current).toEqual([111, true]);
        });
    });

    it('updates reactively once the mapping arrives after the hook has already mounted', async () => {
        const {result} = renderHook(() => useResolvedAgentAccountID(111));

        await waitFor(() => {
            expect(result.current).toEqual([111, true]);
        });

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {111: 222});
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual([222, true]);
        });
    });
});
