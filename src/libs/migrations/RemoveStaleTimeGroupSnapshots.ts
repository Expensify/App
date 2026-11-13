/** Drops old time buckets once, without changing the hashes of equivalent Search and Insights queries. */
import type {SearchGroupBy} from '@components/Search/types';

import getSearchTimeGroupingDateKey from '@libs/getSearchTimeGroupingDateKey';
import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const TIME_GROUPS = [CONST.SEARCH.GROUP_BY.DAY, CONST.SEARCH.GROUP_BY.WEEK, CONST.SEARCH.GROUP_BY.MONTH, CONST.SEARCH.GROUP_BY.QUARTER, CONST.SEARCH.GROUP_BY.YEAR];
const TIME_GROUP_PREFIXES = TIME_GROUPS.map((group) => `${CONST.SEARCH.GROUP_PREFIX}${group}_`);
const TIME_GROUP_KEYS = new Set<SearchGroupBy>(TIME_GROUPS);

function isSnapshotKey(key: string): key is `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${string}` {
    return key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT);
}

async function RemoveStaleTimeGroupSnapshots(): Promise<void> {
    try {
        if (await readOnceOnyxValue(ONYXKEYS.SEARCH_TIME_GROUPING_MIGRATED)) {
            return;
        }
        const snapshots = await readOnceOnyxValue(ONYXKEYS.COLLECTION.SNAPSHOT);
        const updates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];
        for (const [key, snapshot] of Object.entries(snapshots ?? {})) {
            if (!isSnapshotKey(key)) {
                continue;
            }
            const query = snapshot?.search?.inputQuery ? buildSearchQueryJSON(snapshot.search.inputQuery) : undefined;
            const hasChangedGrouping =
                query?.type === CONST.SEARCH.DATA_TYPES.EXPENSE &&
                !!query.groupBy &&
                TIME_GROUP_KEYS.has(query.groupBy) &&
                getSearchTimeGroupingDateKey(query) !== CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE;
            // Older Insights snapshots have no query metadata, so their time buckets cannot be trusted after this change.
            const hasUnknownTimeGrouping = !query && Object.keys(snapshot?.data ?? {}).some((groupKey) => TIME_GROUP_PREFIXES.some((prefix) => groupKey.startsWith(prefix)));
            if (!hasChangedGrouping && !hasUnknownTimeGrouping) {
                continue;
            }
            updates.push({onyxMethod: Onyx.METHOD.SET, key, value: null});
        }
        await Onyx.update(updates);
        // Mark completion only after removal succeeds, so a failed cleanup retries on the next launch.
        // eslint-disable-next-line rulesdir/prefer-actions-set-data -- Startup migrations own their completion markers.
        await Onyx.set(ONYXKEYS.SEARCH_TIME_GROUPING_MIGRATED, true);
        Log.info('[Migrate Onyx] Removed stale time-group snapshots');
    } catch (error) {
        Log.warn('[Migrate Onyx] Could not remove stale time-group snapshots', {error});
    }
}

export default RemoveStaleTimeGroupSnapshots;
