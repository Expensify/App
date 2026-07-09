import type {Policy, SearchResults} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

// Snapshot patching only needs `search` aggregates, not the large `data` blob.
type SnapshotSearch = SearchResults['search'];

/** Onyx data the Your spend snapshot builders need, supplied by the triggering component. */
type YourSpendPatchData = {
    // Paid-group workspaces only
    paidPolicies: OnyxCollection<Policy>;
    snapshotSearches: Record<string, SnapshotSearch | undefined>;
};

const EMPTY_YOUR_SPEND_PATCH_DATA: YourSpendPatchData = {paidPolicies: {}, snapshotSearches: {}};

export {EMPTY_YOUR_SPEND_PATCH_DATA};
export type {YourSpendPatchData};
