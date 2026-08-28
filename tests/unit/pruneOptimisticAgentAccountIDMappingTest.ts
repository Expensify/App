import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import OnyxUtils from 'react-native-onyx/dist/OnyxUtils';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Registers the connectWithoutView subscription under test — nothing else in this file calls into the module
// directly, since the whole point is that pruning happens reactively without any caller invoking it.
import '@libs/actions/pruneOptimisticAgentAccountIDMapping';

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
});
