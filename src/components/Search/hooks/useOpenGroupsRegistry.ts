/**
 * Which groups a shift+click range may reach into. Whoever owns a group's expanded state owns that answer, which is
 * the one thing the rows cannot tell the provider. Scoped to one search, so a group left open across a query change
 * cannot range over the previous results.
 */
import type {SearchShiftRangeGroupsActions} from '@components/Search/types';

import {useState} from 'react';

const NO_OPEN_GROUPS: ReadonlySet<string> = new Set();
const NO_OPEN_GROUP_COUNTS: ReadonlyMap<string, number> = new Map();

/** Whatever can answer that a group is open: a set of keys going in, the registry's counts coming back out */
type OpenGroupKeys = Pick<ReadonlySet<string>, 'has'>;

type OpenGroupsRegistry = {
    /** The groups currently rendering their children as rows */
    openGroupKeys: OpenGroupKeys;

    shiftRangeGroupsActions: SearchShiftRangeGroupsActions;
};

function useOpenGroupsRegistry(searchHash: number): OpenGroupsRegistry {
    // Counted, so the first of two owners to clean up does not close the group for the other.
    const [openGroupCounts, setOpenGroupCounts] = useState<ReadonlyMap<string, number>>(NO_OPEN_GROUP_COUNTS);

    const [registryHash, setRegistryHash] = useState(searchHash);
    if (registryHash !== searchHash) {
        setRegistryHash(searchHash);
        setOpenGroupCounts(NO_OPEN_GROUP_COUNTS);
    }

    // Built once (by construction, not by React Compiler) so the subscribing effects can't loop.
    const [methods] = useState<Omit<SearchShiftRangeGroupsActions, 'registryGeneration'>>(() => ({
        addGroupToRange: (groupKey) =>
            setOpenGroupCounts((prev) => {
                const next = new Map(prev);
                next.set(groupKey, (prev.get(groupKey) ?? 0) + 1);
                return next;
            }),
        removeGroupFromRange: (groupKey) =>
            setOpenGroupCounts((prev) => {
                const count = prev.get(groupKey);
                if (count === undefined) {
                    return prev;
                }
                const next = new Map(prev);
                if (count > 1) {
                    next.set(groupKey, count - 1);
                } else {
                    next.delete(groupKey);
                }
                return next;
            }),
    }));

    // Only the container changes when the registry is dropped. The methods keep their identity, so subscribers stay put.
    return {openGroupKeys: openGroupCounts, shiftRangeGroupsActions: {...methods, registryGeneration: registryHash}};
}

export default useOpenGroupsRegistry;
export {NO_OPEN_GROUPS};
export type {OpenGroupKeys};
