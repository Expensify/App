import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchResults} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

type SnapshotMap = Record<string, SearchResults>;

/**
 * Hook to subscribe to multiple search snapshots by their hashes.
 * Returns an object mapping each hash to its corresponding SearchResults.
 */
function useMultipleSnapshots(hashes: string[]): SnapshotMap {
    const selector = useMemo(() => {
        return (snapshots: OnyxCollection<SearchResults>): SnapshotMap => {
            if (!snapshots || hashes.length === 0) {
                return {};
            }

            const result: SnapshotMap = {};
            for (const hash of hashes) {
                const snapshot = snapshots[`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`];
                if (snapshot) {
                    result[hash] = snapshot;
                }
            }
            return result;
        };
    }, [hashes]);

    const [snapshotMap = getEmptyObject<SnapshotMap>()] = useOnyx(ONYXKEYS.COLLECTION.SNAPSHOT, {
        canBeMissing: true,
        selector,
    });

    return snapshotMap;
}

export type {SnapshotMap};

export default useMultipleSnapshots;
