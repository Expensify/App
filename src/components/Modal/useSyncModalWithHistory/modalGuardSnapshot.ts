import navigationRef from '@libs/Navigation/navigationRef';

// Slice of navigation state consumed by useSyncExternalStore to detect guard presence and route-count changes.
type ModalGuardSnapshot = {
    guardPresent: boolean;
    routesLength: number;
};

const EMPTY_MODAL_GUARD_SNAPSHOT: ModalGuardSnapshot = {
    guardPresent: false,
    routesLength: 0,
};

const EMPTY_MODAL_GUARD_SNAPSHOT_KEY = 'false:0';

function getModalGuardSnapshot(sentinel: string): ModalGuardSnapshot {
    if (!navigationRef.isReady()) {
        return EMPTY_MODAL_GUARD_SNAPSHOT;
    }

    const state = navigationRef.getRootState();
    return {
        guardPresent: !!state?.history?.includes(sentinel),
        routesLength: state?.routes?.length ?? 0,
    };
}

function serializeModalGuardSnapshot(snapshot: ModalGuardSnapshot): string {
    return `${snapshot.guardPresent}:${snapshot.routesLength}`;
}

function getModalGuardSnapshotKey(sentinel: string): string {
    return serializeModalGuardSnapshot(getModalGuardSnapshot(sentinel));
}

function parseModalGuardSnapshotKey(snapshotKey: string): ModalGuardSnapshot {
    const [guardPresent, routesLength] = snapshotKey.split(':');
    return {
        guardPresent: guardPresent === 'true',
        routesLength: Number(routesLength),
    };
}

export type {ModalGuardSnapshot};
export {EMPTY_MODAL_GUARD_SNAPSHOT_KEY, getModalGuardSnapshotKey, parseModalGuardSnapshotKey};
