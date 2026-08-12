import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';
import {NO_OPEN_GROUPS} from '@components/Search/selectionBuilders';

import {useEffect, useRef} from 'react';

/** Keeps a set of groups' children reachable by a shift+click range while they are open. For a view that owns the expanded state on behalf of rows it may recycle. */
function useOpenGroupsForShiftRange(openGroupKeys: ReadonlySet<string>) {
    const {addGroupToRange, removeGroupFromRange} = useSearchShiftRangeChildren();

    // The keys this hook opened, so expanding one group does not close and reopen every other one.
    const openedKeysRef = useRef<ReadonlySet<string>>(NO_OPEN_GROUPS);
    useEffect(() => {
        for (const key of openedKeysRef.current) {
            if (!openGroupKeys.has(key)) {
                removeGroupFromRange(key);
            }
        }
        for (const key of openGroupKeys) {
            if (!openedKeysRef.current.has(key)) {
                addGroupToRange(key);
            }
        }
        openedKeysRef.current = openGroupKeys;
    }, [openGroupKeys, addGroupToRange, removeGroupFromRange]);

    useEffect(
        () => () => {
            for (const key of openedKeysRef.current) {
                removeGroupFromRange(key);
            }
            openedKeysRef.current = NO_OPEN_GROUPS;
        },
        [removeGroupFromRange],
    );
}

export default useOpenGroupsForShiftRange;
