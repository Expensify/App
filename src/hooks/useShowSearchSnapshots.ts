import {showSearchSnapshots} from '@libs/actions/SearchSnapshotCache';

import {useEffect} from 'react';

/** Keeps the snapshots a view shows from being evicted while it is mounted, so they're still cached when the user comes back to it */
function useShowSearchSnapshots(hashes: number[] | undefined, isPinned = false) {
    // Joined so a new array with the same hashes doesn't hide and show them again
    const hashList = hashes?.join(',') ?? '';

    useEffect(() => {
        if (!hashList) {
            return;
        }
        return showSearchSnapshots(hashList.split(',').map(Number), isPinned);
    }, [hashList, isPinned]);
}

export default useShowSearchSnapshots;
