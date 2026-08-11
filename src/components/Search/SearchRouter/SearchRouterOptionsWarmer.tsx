import {INITIAL_MAX_RECENT_REPORTS, RECENT_REPORTS_BATCH_SIZE} from '@components/Search/SearchAutocompleteList';

import useFilteredOptions from '@hooks/useFilteredOptions';

import {useEffect} from 'react';

type SearchRouterOptionsWarmerProps = {
    /** Called once the option list has been computed and cached; the parent unmounts this component then. */
    onDone: () => void;
};

/**
 * Computes the SearchRouter's empty-query option list ahead of time so the first open of the
 * session hits the module-level cache in `createFilteredOptionList` instead of building it on
 * the critical path. The config must stay identical to the `useFilteredOptions` call in
 * SearchAutocompleteList — the cache is keyed by it (and by the input references, which these
 * hooks resolve from the same Onyx sources).
 */
function SearchRouterOptionsWarmer({onDone}: SearchRouterOptionsWarmerProps) {
    const {options} = useFilteredOptions({
        enabled: true,
        isSearching: false,
        deferContactsUntilSearch: true,
        maxRecentReports: INITIAL_MAX_RECENT_REPORTS,
        batchSize: RECENT_REPORTS_BATCH_SIZE,
    });

    useEffect(() => {
        if (!options) {
            return;
        }
        onDone();
    }, [options, onDone]);

    return null;
}

SearchRouterOptionsWarmer.displayName = 'SearchRouterOptionsWarmer';

export default SearchRouterOptionsWarmer;
