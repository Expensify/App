import {getSnapshot, subscribe} from '@libs/NowStore';

import {useSyncExternalStore} from 'react';

/** No `getServerSnapshot`: React also calls it on the client during hydration, so a throwing one would not stay confined to SSR. */
function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export default useNow;
