/**
 * Which groups a shift+click range may reach into. Whoever owns a group's expanded state owns that answer, which is
 * the one thing the rows cannot tell the provider. Scoped to one search, so a group left open across a query change
 * cannot range over the previous results.
 */
import type {SearchShiftRangeGroupsActions} from '@components/Search/types';

import {useState} from 'react';

const NO_OPEN_GROUPS: ReadonlySet<string> = new Set();

type OpenGroupsRegistry = {
    /** The groups currently rendering their children as rows */
    openGroupKeys: ReadonlySet<string>;

    shiftRangeGroupsActions: SearchShiftRangeGroupsActions;
};

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

    // Only the container changes when the registry is dropped. The methods keep their identity, so subscribers stay put.
    return {openGroupKeys, shiftRangeGroupsActions: {...methods, registryGeneration: registryHash}};
}

export default useOpenGroupsRegistry;
export {NO_OPEN_GROUPS};
