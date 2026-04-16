type GustoSyncResultUser = {
    email: string;
    displayName?: string;
};

type GustoSyncSkippedResultUser = GustoSyncResultUser & {
    reason: string;
};

type GustoSyncResult = {
    added?: GustoSyncResultUser[];
    removed?: GustoSyncResultUser[];
    skipped?: GustoSyncSkippedResultUser[];
};

export type {GustoSyncResult, GustoSyncResultUser};
