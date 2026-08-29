import AppStateMonitor from '@libs/AppStateMonitor';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OptimisticAgentAccountIDMappingCreatedAt} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * pruneStaleOptimisticAccountIDMappingEntries
 *
 * OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT is client-only bookkeeping for
 * OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING (the backend never writes it), so nothing else prunes stale entries for us.
 * This module watches the createdAt key directly and re-checks for staleness every time it changes — from
 * createAgent()'s own stamp, from the cross-device backfill, or from this prune's own writes — so no caller has
 * to trigger it explicitly. Onyx.connectWithoutView is used because this runs outside any component's render; no
 * UI subscribes to it.
 *
 * Staleness itself is just elapsed time (now - createdAt), which keeps growing on its own without any Onyx write
 * to notice it — so the callback above only catches an entry going stale at the exact moment something else
 * happens to write to this key. Two explicit re-checks cover the rest: openAgentsPage() (Agent.ts), since
 * visiting the agents list is the one moment this data is guaranteed relevant, and the AppState listener below,
 * since resuming from background is when the most time is likely to have silently passed. A plain interval timer
 * was considered instead, but this codebase already avoids that for periodic checks on mobile — see
 * checkForUpdates.ts, which is deliberately a no-op on native (platformSetup/index.native.ts).
 */

const OPTIMISTIC_ACCOUNT_ID_MAPPING_MAX_AGE_IN_DAYS = 7;
const OPTIMISTIC_ACCOUNT_ID_MAPPING_MAX_AGE_MS = OPTIMISTIC_ACCOUNT_ID_MAPPING_MAX_AGE_IN_DAYS * 24 * 60 * 60 * 1000;

let optimisticAccountIDMappingCreatedAt: OnyxEntry<OptimisticAgentAccountIDMappingCreatedAt>;
Onyx.connectWithoutView({
    key: ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT,
    callback: (value) => {
        optimisticAccountIDMappingCreatedAt = value;
        pruneStaleOptimisticAccountIDMappingEntries();
    },
});

AppStateMonitor.addBecameActiveListener(() => pruneStaleOptimisticAccountIDMappingEntries());

function pruneStaleOptimisticAccountIDMappingEntries() {
    const now = Date.now();
    const staleOptimisticAccountIDs = Object.entries(optimisticAccountIDMappingCreatedAt ?? {})
        .filter(([, createdAt]) => now - createdAt > OPTIMISTIC_ACCOUNT_ID_MAPPING_MAX_AGE_MS)
        .map(([staleOptimisticAccountID]) => staleOptimisticAccountID);

    if (staleOptimisticAccountIDs.length === 0) {
        return;
    }

    const staleEntries = Object.fromEntries(staleOptimisticAccountIDs.map((id) => [id, null]));
    Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, staleEntries);
    Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING_CREATED_AT, staleEntries);
}

export default pruneStaleOptimisticAccountIDMappingEntries;
