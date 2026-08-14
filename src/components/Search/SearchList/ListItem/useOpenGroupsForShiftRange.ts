import {useSearchShiftRangeGroups} from '@components/Search/SearchContext';
import {NO_OPEN_GROUPS} from '@components/Search/selectionBuilders';

import {useEffect, useRef} from 'react';

/** Keeps a set of groups' children reachable by a shift+click range while they are open. For a view that owns the expanded state on behalf of rows it may recycle. */
function useOpenGroupsForShiftRange(openGroupKeys: ReadonlySet<string>) {
    const {addGroupToRange, removeGroupFromRange, registryGeneration} = useSearchShiftRangeGroups();

    // The keys this hook opened, so expanding one group does not close and reopen every other one.
    const openedKeysRef = useRef<ReadonlySet<string>>(NO_OPEN_GROUPS);
    const seenGenerationRef = useRef(registryGeneration);

    useEffect(() => {
        // The registry drops openness with the search, so anything opened under the previous one is already gone and the diff below reopens it.
        const opened = seenGenerationRef.current === registryGeneration ? openedKeysRef.current : NO_OPEN_GROUPS;
        seenGenerationRef.current = registryGeneration;

        for (const key of opened) {
            if (!openGroupKeys.has(key)) {
                removeGroupFromRange(key);
            }
        }
        for (const key of openGroupKeys) {
            if (!opened.has(key)) {
                addGroupToRange(key);
            }
        }
        openedKeysRef.current = openGroupKeys;
    }, [openGroupKeys, addGroupToRange, removeGroupFromRange, registryGeneration]);

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
