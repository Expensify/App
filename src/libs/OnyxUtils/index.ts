import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxKey, OnyxValue} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

function isSnapshotCompatibleKey(key: OnyxKey): boolean {
    return !key.startsWith(ONYXKEYS.COLLECTION.SNAPSHOT) && CONST.SEARCH.SNAPSHOT_ONYX_KEYS.some((snapshotKey) => key.startsWith(snapshotKey));
}

/**
 * Reads an Onyx key once. Throws for the Search snapshot keys, which `src/hooks/useOnyx.ts` redirects
 * to `snapshot_<hash>` in a way `Onyx.get` cannot see.
 */
function get<TKey extends OnyxKey>(key: TKey): Promise<OnyxValue<TKey>> {
    if (isSnapshotCompatibleKey(key)) {
        throw new Error(`Onyx.get is not allowed for Search snapshot keys such as ${String(key)}. Use useOnyx instead.`);
    }

    return Onyx.get(key);
}

export {isSnapshotCompatibleKey};

export default {
    get,
};
