import type {SearchListItem} from '@components/Search/SearchList/ListItem/types';
import type {SearchColumnType, SearchQueryJSON} from '@components/Search/types';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Public contract of the Search data layer (Slice S4, callstack-internal/expensify-issues#2546).
 *
 * Returns row identities plus list-level meta only. It never returns a React component,
 * a render function, or per-row pre-joined display data. Rows self-hydrate from their own
 * live Onyx subscriptions once the shell decomposition (S5/S6) consumes this hook.
 */
type SearchSnapshotResult = {
    /** Row identities only (keyForList + the id discriminant per variant). Never pre-joined display data. */
    data: SearchListItem[];
    /** Columns to render, derived from the snapshot. */
    columns: SearchColumnType[];
    /** Whether the snapshot is still loading from the server. */
    isLoading: boolean;
    /** Whether the server reports more results beyond the current page. */
    hasMore: boolean;
    /** Whether every transaction (including grouped sub-snapshots) has been loaded. */
    hasLoadedAllTransactions: boolean;
};

/**
 * Single data layer for the Search screen.
 *
 * SCOPE NOTE (S4 is shipping as a draft, do not consume in the render path yet):
 * - This v1 owns the narrow snapshot subscription and the snapshot-only meta (`isLoading`, `hasMore`).
 * - The sorted/grouped identity projection (`data`), `columns`, and `hasLoadedAllTransactions` are
 *   produced today by `getSections` + `getSortedSections` inside `<Search>`. Moving that projection
 *   in here depends on an OPEN contract decision on #2546: `getSections` is NOT snapshot-only post-S3
 *   (it still merges ~15 live Onyx inputs that S3 judged load-bearing), so the PRD's "single narrow
 *   subscription" goal is not achievable as written. The hook must instead OWN the snapshot plus the
 *   retained live subscriptions. That reframe needs sign-off before the projection lands here.
 * - The two-phase optimistic-row resilience (`useOptimisticSearchTracking` Phase 1 +
 *   `useStableOptimisticSortedData` Phase 2) is absorbed in follow-up commits and validated with
 *   unit tests covering injection and the 3s re-injection window. The legacy hooks are deleted in S5,
 *   not here, because legacy `<Search>` still renders through them during the transition.
 *
 * Serves both top-level snapshots (called with a `SearchQueryJSON`) and, once the projection lands,
 * group sub-snapshots (called with a `SnapshotHash`). One contract, two consumption sites.
 */
function useSearchSnapshot(queryJSON: Readonly<SearchQueryJSON>): SearchSnapshotResult {
    const {hash} = queryJSON;

    // `hash` is a required number, so the interpolated key can never collapse to a bare collection
    // key (C-1). The future group overload will accept a `SnapshotHash` that can be undefined, and
    // that path must use the conditional `hash ? key : undefined` form before subscribing.
    const [snapshot] = useOnyx(`${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`);

    const isLoading = !!snapshot?.search?.isLoading;
    const hasMore = !!snapshot?.search?.hasMoreResults;

    // TODO(#2546): produce sorted/grouped identities + columns + hasLoadedAllTransactions here once the
    // getSections-ownership contract is confirmed, then absorb optimistic Phase 1/2. Inert until then.
    return {
        data: [],
        columns: [],
        isLoading,
        hasMore,
        hasLoadedAllTransactions: !hasMore,
    };
}

export default useSearchSnapshot;
export type {SearchSnapshotResult};
