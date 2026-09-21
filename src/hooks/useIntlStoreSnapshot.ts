import IntlStore from '@src/languages/IntlStore';

import {useSyncExternalStore} from 'react';

/**
 * Subscribes to the translation store.
 *
 * Returns the snapshot object rather than the locale string: a cold `en` start reads `en` both before and after its
 * table lands, so a string snapshot would compare equal and the update would be skipped.
 */
function useIntlStoreSnapshot() {
    return useSyncExternalStore(IntlStore.subscribe, IntlStore.getSnapshot, IntlStore.getSnapshot);
}

export default useIntlStoreSnapshot;
