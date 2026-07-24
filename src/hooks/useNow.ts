import {getSnapshot, subscribe} from '@libs/NowStore';

import {useSyncExternalStore} from 'react';

function useNow(): Date {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export default useNow;
