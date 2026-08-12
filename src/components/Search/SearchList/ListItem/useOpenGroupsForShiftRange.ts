import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

/** Keeps a set of groups' children reachable by a shift+click range while they are open. For a view that owns the expanded state on behalf of rows it may recycle. */
function useOpenGroupsForShiftRange(openGroupKeys: ReadonlySet<string>) {
    const {addGroupToRange, removeGroupFromRange} = useSearchShiftRangeChildren();
    useEffect(() => {
        for (const key of openGroupKeys) {
            addGroupToRange(key);
        }
        return () => {
            for (const key of openGroupKeys) {
                removeGroupFromRange(key);
            }
        };
    }, [openGroupKeys, addGroupToRange, removeGroupFromRange]);
}

export default useOpenGroupsForShiftRange;
