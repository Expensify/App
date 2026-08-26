// The list renders at most MAX_AMOUNT_OF_SUGGESTIONS rows, so start from a small raw cap (100 leaves
// buffer for chats filtered out later) and let SearchAutocompleteList's loadAll effect expand it when
// needed. The batch stays large because createFilteredOptionList rebuilds its whole top-N slice each call.
const INITIAL_MAX_RECENT_REPORTS = 100;
const RECENT_REPORTS_BATCH_SIZE = 500;

// Shared by SearchAutocompleteList and SearchRouterOptionsWarmer: createFilteredOptionList keys its cache
// on these values, so the two call sites must not drift. Contacts can be deferred because the empty-query
// state shows none.
const SEARCH_ROUTER_OPTIONS_CONFIG = {
    enabled: true,
    includeP2P: true,
    deferContactsUntilSearch: true,
    maxRecentReports: INITIAL_MAX_RECENT_REPORTS,
    batchSize: RECENT_REPORTS_BATCH_SIZE,
} as const;

export default SEARCH_ROUTER_OPTIONS_CONFIG;
