/**
 * Tracks the last URL query signature synced into SEARCH_ADVANCED_FILTERS_FORM.
 *
 * This state intentionally lives outside the hook so it survives unmounts and
 * remounts of SearchAdvancedFiltersButton. The button is gated by
 * SearchActionsBarSwitch, which can remount it before the URL reflects a form
 * update. Resetting this state on every mount would sync values derived from
 * the old URL and overwrite concurrent Onyx.merge updates from Advanced
 * Filters.
 *
 * Because this state lives outside Onyx, useSearchFilterSync also checks that
 * the form still exists before treating a matching signature as synced.
 */
let lastSyncedQuerySignature: string | null = null;

function getLastSyncedQuerySignature() {
    return lastSyncedQuerySignature;
}

function setLastSyncedQuerySignature(querySignature: string | null) {
    lastSyncedQuerySignature = querySignature;
}

export {getLastSyncedQuerySignature, setLastSyncedQuerySignature};
