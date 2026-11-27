/** When a cached Search snapshot was last used */
type SearchSnapshotAccessEntry = {
    /** Timestamp of the last time the snapshot's query was opened or searched */
    lastAccessed: number;

    /** Whether the snapshot belongs to a saved or suggested search, which is never evicted */
    isPinned: boolean;
};

/** Access records of cached Search snapshots, keyed by query hash */
type SearchSnapshotAccess = Record<string, SearchSnapshotAccessEntry>;

export default SearchSnapshotAccess;
