import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Tracks the number of Onyx writes to the agentZeroProcessingRequestIndicator NVP field
 * for each reportID. This is needed because Onyx batches merges within a single tick,
 * so a SET followed by CLEAR can be coalesced into a single notification with only
 * the final (empty) value. By counting raw writes via Onyx.connect (which fires before
 * batching), consumers can detect that the server processed a request even when the
 * rendered value jumps directly to empty.
 */

type VersionListener = (reportID: string, version: number) => void;

const versionMap = new Map<string, number>();
const connectionMap = new Map<string, number>();
const refCountMap = new Map<string, number>();
const listeners = new Set<VersionListener>();

function getVersion(reportID: string): number {
    return versionMap.get(reportID) ?? 0;
}

function subscribe(reportID: string): () => void {
    const currentRefCount = refCountMap.get(reportID) ?? 0;
    refCountMap.set(reportID, currentRefCount + 1);

    if (currentRefCount === 0) {
        const connection = Onyx.connect({
            key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`,
            callback: (value) => {
                const indicatorValue = value?.agentZeroProcessingRequestIndicator;
                if (indicatorValue !== undefined) {
                    const newVersion = (versionMap.get(reportID) ?? 0) + 1;
                    versionMap.set(reportID, newVersion);
                    for (const listener of listeners) {
                        listener(reportID, newVersion);
                    }
                }
            },
        });
        connectionMap.set(reportID, connection);
    }

    return () => {
        const count = refCountMap.get(reportID) ?? 1;
        if (count <= 1) {
            refCountMap.delete(reportID);
            const connection = connectionMap.get(reportID);
            if (connection !== undefined) {
                Onyx.disconnect(connection);
                connectionMap.delete(reportID);
            }
            versionMap.delete(reportID);
        } else {
            refCountMap.set(reportID, count - 1);
        }
    };
}

function addListener(listener: VersionListener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export default {
    getVersion,
    subscribe,
    addListener,
};
