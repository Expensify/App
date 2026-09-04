import {renderHook, waitFor} from '@testing-library/react-native';

import useResolvedAgentAccountID from '@hooks/useResolvedAgentAccountID';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const OPTIMISTIC_ACCOUNT_ID = 111;
const REAL_ACCOUNT_ID = 222;
const OTHER_OPTIMISTIC_ACCOUNT_ID = 999;
const OTHER_REAL_ACCOUNT_ID = 888;

function getMappingCreatedAt(): Promise<Record<string, number> | undefined> {
    return OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT);
}

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
        const {result} = renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));

        await waitFor(() => {
            expect(result.current).toEqual([OPTIMISTIC_ACCOUNT_ID, true]);
        });
    });

    it('resolves to the real accountID when a mapping entry exists', async () => {
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[OPTIMISTIC_ACCOUNT_ID]: REAL_ACCOUNT_ID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));

        await waitFor(() => {
            expect(result.current).toEqual([REAL_ACCOUNT_ID, true]);
        });
    });

    it('does not resolve when the mapping has entries for other accountIDs only', async () => {
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[OTHER_OPTIMISTIC_ACCOUNT_ID]: OTHER_REAL_ACCOUNT_ID});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));

        await waitFor(() => {
            expect(result.current).toEqual([OPTIMISTIC_ACCOUNT_ID, true]);
        });
    });

    it('updates reactively once the mapping arrives after the hook has already mounted', async () => {
        const {result} = renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));

        await waitFor(() => {
            expect(result.current).toEqual([OPTIMISTIC_ACCOUNT_ID, true]);
        });

        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[OPTIMISTIC_ACCOUNT_ID]: REAL_ACCOUNT_ID});
        await waitForBatchedUpdates();

        await waitFor(() => {
            expect(result.current).toEqual([REAL_ACCOUNT_ID, true]);
        });
    });

    it('backfills a createdAt timestamp when a mapping entry has none, so it stays eligible for pruning', async () => {
        const before = Date.now();
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[OPTIMISTIC_ACCOUNT_ID]: REAL_ACCOUNT_ID});
        await waitForBatchedUpdates();

        renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));
        await waitForBatchedUpdates();
        const after = Date.now();

        const createdAtMapping = await getMappingCreatedAt();
        const createdAtValue = createdAtMapping?.[OPTIMISTIC_ACCOUNT_ID];
        expect(createdAtValue).toBeGreaterThanOrEqual(before);
        expect(createdAtValue).toBeLessThanOrEqual(after);
    });

    it('does not overwrite an existing createdAt timestamp', async () => {
        const originalCreatedAt = Date.now() - 24 * 60 * 60 * 1000;
        await Onyx.multiSet({
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[OPTIMISTIC_ACCOUNT_ID]: REAL_ACCOUNT_ID},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT]: {[OPTIMISTIC_ACCOUNT_ID]: originalCreatedAt},
        });
        await waitForBatchedUpdates();

        renderHook(() => useResolvedAgentAccountID(OPTIMISTIC_ACCOUNT_ID));
        await waitForBatchedUpdates();

        const createdAtMapping = await getMappingCreatedAt();
        expect(createdAtMapping?.[OPTIMISTIC_ACCOUNT_ID]).toBe(originalCreatedAt);
    });
});
