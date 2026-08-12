import {SEARCH_ROUTER_OPTIONS_CONFIG} from '@components/Search/SearchAutocompleteList';

import useFilteredOptions from '@hooks/useFilteredOptions';

import {useEffect} from 'react';

type SearchRouterOptionsWarmerProps = {
    /** Called once the option list is cached, so the parent can unmount this component. */
    onDone: () => void;
};

/**
 * Builds the SearchRouter's empty-query option list so the first open of the session hits
 * `createFilteredOptionList`'s cache instead of building it on the critical path.
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
