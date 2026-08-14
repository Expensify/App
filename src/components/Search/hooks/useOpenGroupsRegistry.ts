import {NO_OPEN_GROUPS} from '@components/Search/selectionBuilders';
import type {SearchShiftRangeGroupsActions} from '@components/Search/types';

import {useState} from 'react';

type OpenGroupsRegistry = {
    /** The groups currently rendering their children as rows */
    openGroupKeys: ReadonlySet<string>;

    /** Handed to the views and rows that own a group's expanded state */
    shiftRangeGroupsActions: SearchShiftRangeGroupsActions;
};

/**
 * Which groups a shift+click range may reach into. A group's rows come from the list itself; the one thing the rows
 * cannot answer for the provider is whether the group is open, because whoever owns the expanded state owns that.
 * Scoped to one search, so a group left open across a query change cannot range over the previous results.
 */
function useOpenGroupsRegistry(searchHash: number): OpenGroupsRegistry {
    const [openGroupKeys, setOpenGroupKeys] = useState<ReadonlySet<string>>(NO_OPEN_GROUPS);

    const [registryHash, setRegistryHash] = useState(searchHash);
    if (registryHash !== searchHash) {
        setRegistryHash(searchHash);
        setOpenGroupKeys(NO_OPEN_GROUPS);
    }

    // Built once (by construction, not by React Compiler) so the subscribing effects can't loop.
    const [methods] = useState<Omit<SearchShiftRangeGroupsActions, 'registryGeneration'>>(() => ({
        addGroupToRange: (groupKey) =>
            setOpenGroupKeys((prev) => {
                if (prev.has(groupKey)) {
                    return prev;
                }
                const next = new Set(prev);
                next.add(groupKey);
                return next;
            }),
        removeGroupFromRange: (groupKey) =>
            setOpenGroupKeys((prev) => {
                if (!prev.has(groupKey)) {
                    return prev;
                }
                const next = new Set(prev);
                next.delete(groupKey);
                return next;
            }),
    }));

    // Only the container changes when the registry is dropped; the methods keep their identity, so subscribers stay put.
    return {openGroupKeys, shiftRangeGroupsActions: {...methods, registryGeneration: registryHash}};
}

export default useOpenGroupsRegistry;
