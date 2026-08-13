// The list shows at most MAX_AMOUNT_OF_SUGGESTIONS recent reports, so building full option data for the
// default 500-report list every time is unnecessary. Start from a smaller raw cap and only expand to the
// full set if that batch filters down below the visible cap (see the loadAll effect in SearchAutocompleteList);
// typing a query bypasses this cap entirely (isSearching drops the limit in createFilteredOptionList).
// 100 leaves buffer for hidden/muted chats getting filtered out after the raw-recency slice.
// The batch size stays at 500 (not smaller) because createFilteredOptionList rebuilds its whole
// top-N slice from scratch each call, so a small batch would mean repeated rebuilds.
const INITIAL_MAX_RECENT_REPORTS = 100;
const RECENT_REPORTS_BATCH_SIZE = 500;

// Shared by SearchAutocompleteList and SearchRouterOptionsWarmer: createFilteredOptionList keys its cache
// on these values, so the two call sites must not drift. Contacts can be deferred because the empty-query
// state shows none.
const SEARCH_ROUTER_OPTIONS_CONFIG = {
    enabled: true,
    deferContactsUntilSearch: true,
    maxRecentReports: INITIAL_MAX_RECENT_REPORTS,
    batchSize: RECENT_REPORTS_BATCH_SIZE,
} as const;

export default SEARCH_ROUTER_OPTIONS_CONFIG;
