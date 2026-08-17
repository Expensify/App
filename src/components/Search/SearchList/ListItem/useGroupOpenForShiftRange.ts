import {useSearchShiftRangeGroups} from '@components/Search/SearchContext';

import {useEffect} from 'react';

/** Keeps one group's children reachable by a shift+click range while it is open. For a row that owns its own expanded state, so the group closes with it. */
function useGroupOpenForShiftRange(groupKey: string, isOpen: boolean) {
    const {addGroupToRange, removeGroupFromRange, registryGeneration} = useSearchShiftRangeGroups();
    // `registryGeneration` is a dependency and nothing else: the registry drops openness with the search, and this puts it back.
    useEffect(() => {
        if (!isOpen) {
            return;
        }
        addGroupToRange(groupKey);
        return () => removeGroupFromRange(groupKey);
    }, [groupKey, isOpen, addGroupToRange, removeGroupFromRange, registryGeneration]);
}

export default useGroupOpenForShiftRange;
