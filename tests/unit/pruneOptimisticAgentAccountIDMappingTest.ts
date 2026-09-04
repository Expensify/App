import type AppStateMonitorType from '@libs/AppStateMonitor';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Registers the connectWithoutView subscription and the AppStateMonitor listener under test — nothing else in
// this file calls into the module directly, since the whole point is that pruning happens automatically without
// any caller invoking it.
import '@libs/actions/pruneOptimisticAgentAccountIDMapping';

jest.mock('@libs/AppStateMonitor', () => ({
    __esModule: true,
    default: {
        addBecameActiveListener: jest.fn(() => jest.fn()),
    },
}));

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- extracting callback captured during module load
const AppStateMonitor: typeof AppStateMonitorType = require('@libs/AppStateMonitor').default;

const becameActiveCall = jest.mocked(AppStateMonitor.addBecameActiveListener).mock.calls.at(-1);
if (!becameActiveCall) {
    throw new Error('AppStateMonitor.addBecameActiveListener was not called during pruneOptimisticAgentAccountIDMapping.ts module load');
}
const becameActiveCallback: () => void = becameActiveCall[0];

const STALE_OPTIMISTIC_ACCOUNT_ID = 111;
const FRESH_OPTIMISTIC_ACCOUNT_ID = 222;

describe('pruneStaleOptimisticAccountIDMappingEntries (reactive)', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, null);
        await Onyx.set(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT, null);
        await waitForBatchedUpdates();
    });

    it('prunes a stale entry automatically as soon as any write touches the createdAt key, without createAgent() or openAgentsPage()', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[STALE_OPTIMISTIC_ACCOUNT_ID]: 555, [FRESH_OPTIMISTIC_ACCOUNT_ID]: 666},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT]: {[STALE_OPTIMISTIC_ACCOUNT_ID]: Date.now() - 8 * 24 * 60 * 60 * 1000},
        });
        await waitForBatchedUpdates();

        // No call to createAgent()/openAgentsPage() at all — this write alone should trigger the prune.
        await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT, {[FRESH_OPTIMISTIC_ACCOUNT_ID]: Date.now()});
        await waitForBatchedUpdates();

        const mapping = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        const timestamps = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT);

        expect(mapping?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeUndefined();
        expect(mapping?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBe(666);
        expect(timestamps?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeUndefined();
        expect(timestamps?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBeDefined();
    });

    it('prunes an entry that only became stale after it was written, when the app becomes active', async () => {
        const writeTime = Date.now();
        jest.useFakeTimers();
        jest.setSystemTime(writeTime);

        // FRESH is written 7 days after STALE, so once time jumps 8 days past STALE, STALE is 8 days old
        // (past the 7-day window) while FRESH is only 1 day old (still within it). Both are fresh at write
        // time, so this write alone doesn't trigger the reactive callback to prune anything yet.
        const freshWriteTime = writeTime + 7 * 24 * 60 * 60 * 1000;
        await Onyx.multiSet({
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[STALE_OPTIMISTIC_ACCOUNT_ID]: 555, [FRESH_OPTIMISTIC_ACCOUNT_ID]: 666},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT]: {[STALE_OPTIMISTIC_ACCOUNT_ID]: writeTime, [FRESH_OPTIMISTIC_ACCOUNT_ID]: freshWriteTime},
        });
        await waitForBatchedUpdates();

        // Advance time past the retention window with no further write, then simulate the app resuming
        // from background — no call to createAgent()/openAgentsPage() at all.
        jest.setSystemTime(writeTime + 8 * 24 * 60 * 60 * 1000);
        becameActiveCallback();
        await waitForBatchedUpdates();
        jest.useRealTimers();

        const mapping = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        const timestamps = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT);

        expect(mapping?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeUndefined();
        expect(mapping?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBe(666);
        expect(timestamps?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeUndefined();
        expect(timestamps?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBe(freshWriteTime);
    });

    it('backfills a createdAt for a mapping entry that arrived with none, without disturbing one that already has a createdAt', async () => {
        const existingCreatedAt = Date.now() - 24 * 60 * 60 * 1000;

        // Simulates an entry synced in from another device (mapping written, no createdAt of its own) landing
        // alongside one that already has its own createdAt — the mapping-key write alone must not trigger
        // anything reactively, so nothing should be backfilled or pruned until becameActiveCallback() runs.
        await Onyx.multiSet({
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[STALE_OPTIMISTIC_ACCOUNT_ID]: 555, [FRESH_OPTIMISTIC_ACCOUNT_ID]: 666},
            [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT]: {[FRESH_OPTIMISTIC_ACCOUNT_ID]: existingCreatedAt},
        });
        await waitForBatchedUpdates();

        let timestamps = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT);
        expect(timestamps?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeUndefined();

        const before = Date.now();
        becameActiveCallback();
        await waitForBatchedUpdates();
        const after = Date.now();

        const mapping = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
        timestamps = await OnyxUtils.get(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT);

        // The entry with no createdAt gets one stamped now, so it's eligible for pruning next time.
        expect(mapping?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBe(555);
        expect(timestamps?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeGreaterThanOrEqual(before);
        expect(timestamps?.[STALE_OPTIMISTIC_ACCOUNT_ID]).toBeLessThanOrEqual(after);

        // The entry that already had a createdAt keeps it untouched.
        expect(mapping?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBe(666);
        expect(timestamps?.[FRESH_OPTIMISTIC_ACCOUNT_ID]).toBe(existingCreatedAt);
    });
});
