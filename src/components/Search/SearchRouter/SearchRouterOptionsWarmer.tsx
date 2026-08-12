import {SEARCH_ROUTER_OPTIONS_CONFIG} from '@components/Search/SearchAutocompleteList';

import useFilteredOptions from '@hooks/useFilteredOptions';

import {useEffect} from 'react';

type SearchRouterOptionsWarmerProps = {
    /** Called once the option list has been computed and cached; the parent unmounts this component then. */
    onDone: () => void;
};

/**
 * Computes the SearchRouter's empty-query option list ahead of time so the first open of the
 * session hits the module-level cache in `createFilteredOptionList` instead of building it on
 * the critical path. Reuses SEARCH_ROUTER_OPTIONS_CONFIG from SearchAutocompleteList (plus
 * `isSearching: false` for the empty-query state) so the cache key cannot drift between the two
 * call sites — the cache is keyed by it, and by the identity of the Onyx data these hooks read.
 */
function SearchRouterOptionsWarmer({onDone}: SearchRouterOptionsWarmerProps) {
    const {options} = useFilteredOptions({
        ...SEARCH_ROUTER_OPTIONS_CONFIG,
        isSearching: false,
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
