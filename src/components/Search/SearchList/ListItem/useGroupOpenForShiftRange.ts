import {useSearchShiftRangeChildren} from '@components/Search/SearchContext';

import {useEffect} from 'react';

/** Keeps one group's children reachable by a shift+click range while it is open. For a row that owns its own expanded state, so the group closes with it. */
function useGroupOpenForShiftRange(groupKey: string, isOpen: boolean) {
    const {addGroupToRange, removeGroupFromRange} = useSearchShiftRangeChildren();
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        addGroupToRange(groupKey);
        return () => removeGroupFromRange(groupKey);
    }, [groupKey, isOpen, addGroupToRange, removeGroupFromRange]);
}

export default useGroupOpenForShiftRange;
