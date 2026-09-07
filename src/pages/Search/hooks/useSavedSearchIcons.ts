import {getSavedSearchIconName} from '@libs/SearchUIUtils';

import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

import {useMemo} from 'react';

type SavedSearchCollection = Record<string, SaveSearchItem>;

/**
 * Resolves each saved search's icon name once per `savedSearches` change, keyed by its raw query string.
 * `getSavedSearchIconName` parses the query with `buildSearchQueryJSON`, whose small FIFO cache thrashes when
 * 50+ queries are parsed together in the same order, so memoizing here keeps the parser from re-running on
 * every unrelated Onyx update or state change in the frequently-rerendering menus that consume this.
 */
function useSavedSearchIcons(savedSearches: SavedSearchCollection | undefined): Map<string, ReturnType<typeof getSavedSearchIconName>> {
    return useMemo(() => {
        const iconNames = new Map<string, ReturnType<typeof getSavedSearchIconName>>();
        for (const item of Object.values(savedSearches ?? {})) {
            if (iconNames.has(item.query)) {
                continue;
            }
            iconNames.set(item.query, getSavedSearchIconName(item.query));
        }
        return iconNames;
    }, [savedSearches]);
}

export default useSavedSearchIcons;
