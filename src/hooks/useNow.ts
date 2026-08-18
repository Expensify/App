import {getSnapshot, subscribe} from '@libs/NowStore';

import {useSyncExternalStore} from 'react';

/** SSR is unsupported. Server module-load time would diverge from the client's fresh `new Date()` at hydration; throwing surfaces the problem loudly. */
function getServerSnapshot(): Date {
    throw new Error('[NowStore] useNow is not SSR-safe; server and client snapshots would diverge on hydration.');
}

function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useNow;
