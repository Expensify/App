import {registerSessionCleanupCallback} from '@libs/SessionCleanup';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useOnyx from './useOnyx';

// Readonly because consumers receive a shared cached reference (see below) — a write would corrupt it for every other consumer.
type PrivateIsArchivedMap = Readonly<Record<string, boolean>>;

// Single-entry cache so the derived map keeps a stable reference across renders and remounts
// while the underlying REPORT_NAME_VALUE_PAIRS collection is referentially unchanged.
// Reference equality on the source is reliable: Onyx hands every subscriber the same frozen
// collection snapshot and rebuilds it only when a member changes (see OnyxCache.getCollectionData
// in react-native-onyx), and a changed reference only costs a map rebuild here.
// The initial `undefined` doubles as the "nothing cached yet" marker: it only matches an equally
// undefined (unloaded) collection, for which the correct result is the empty map anyway.
let cachedSource: OnyxCollection<ReportNameValuePairs>;
let cachedMap: PrivateIsArchivedMap = {};

// The cached collection belongs to the signed-in account, so release it on sign-out
// rather than holding it until the next subscriber mounts.
registerSessionCleanupCallback(() => {
    cachedSource = undefined;
    cachedMap = {};
});

function buildPrivateIsArchivedMap(allReportNVP: OnyxCollection<ReportNameValuePairs>): PrivateIsArchivedMap {
    if (allReportNVP === cachedSource) {
        return cachedMap;
    }

    const map: Record<string, boolean> = {};
    if (allReportNVP) {
        for (const [key, value] of Object.entries(allReportNVP)) {
            map[key] = !!value?.private_isArchived;
        }
    }

    cachedSource = allReportNVP;
    // Freezing in dev makes a write through a type cast throw instead of silently corrupting the shared cache.
    cachedMap = __DEV__ ? Object.freeze(map) : map;
    return cachedMap;
}

/**
 * Hook that returns a map of report IDs to their private_isArchived values.
 * The returned map is a shared cached reference — read-only by type, and frozen in dev.
 */
function usePrivateIsArchivedMap(): PrivateIsArchivedMap {
    const [allReportNVP] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    return buildPrivateIsArchivedMap(allReportNVP);
}

export default usePrivateIsArchivedMap;
export type {PrivateIsArchivedMap};
