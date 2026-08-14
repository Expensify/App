import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {NO_OPEN_GROUPS} from '@components/Search/selectionBuilders';
import type {SearchShiftRangeChildrenActions} from '@components/Search/types';

import {getEmptyObject} from '@src/types/utils/EmptyObject';

import {deepEqual} from 'fast-equals';
import {useState} from 'react';

type GroupChildrenRegistry = {
    /** The rows each group has published, whether or not it is open */
    groupChildrenByKey: Record<string, TransactionListItemType[]>;

    /** The groups currently rendering their children as rows */
    openGroupKeys: ReadonlySet<string>;

    /** Handed to the rows and views that publish into the registry */
    shiftRangeChildrenActions: SearchShiftRangeChildrenActions;
};

/**
 * Where a group-by search keeps the children a shift+click range can span. Two facts with two owners: the rows publish
 * what they loaded, and whoever owns the expanded state publishes whether the group is open. Reading them together is
 * what makes "a closed group contributes nothing" true in one place instead of in every row.
 */
function useGroupChildrenRegistry(searchHash: number): GroupChildrenRegistry {
    const [groupChildrenByKey, setGroupChildrenByKey] = useState<Record<string, TransactionListItemType[]>>({});
    const [openGroupKeys, setOpenGroupKeys] = useState<ReadonlySet<string>>(NO_OPEN_GROUPS);

    // The registry belongs to one search, so a group left open across a query change cannot range over the previous results.
    const [registryHash, setRegistryHash] = useState(searchHash);
    if (registryHash !== searchHash) {
        setRegistryHash(searchHash);
        setGroupChildrenByKey(getEmptyObject<Record<string, TransactionListItemType[]>>());
        setOpenGroupKeys(NO_OPEN_GROUPS);
    }

    // Built once (by construction, not by React Compiler) so the register effect can't loop.
    const [methods] = useState<Omit<SearchShiftRangeChildrenActions, 'registryGeneration'>>(() => ({
        // Compared by value: an equal array must not re-register and re-render every row, but changed rows must replace the stale copy.
        registerGroupChildren: (groupKey, groupChildren) =>
            setGroupChildrenByKey((prev) => {
                // Whatever arrives is the truth: a group that has not loaded yet publishes nothing at all, so an empty list means its rows are gone.
                if (prev[groupKey] === groupChildren || deepEqual(prev[groupKey], groupChildren)) {
                    return prev;
                }
                return {...prev, [groupKey]: groupChildren};
            }),
        addGroupToRange: (groupKey) =>
            setOpenGroupKeys((prev) => {
                if (prev.has(groupKey)) {
                    return prev;
                }
                const next = new Set(prev);
                next.add(groupKey);
                return next;
            }),
        // Drops only openness, so reopening a group before its publisher re-renders still has its children.
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

    // Only the container changes when the registry is dropped; the methods keep their identity, so openness subscribers stay put.
    return {groupChildrenByKey, openGroupKeys, shiftRangeChildrenActions: {...methods, registryGeneration: registryHash}};
}

export default useGroupChildrenRegistry;
