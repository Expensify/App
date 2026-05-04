import {useDeferredValue} from 'react';
import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import type {BuildUserReadableQueryStringParams} from '@libs/SearchQueryUtils';
import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

type SavedSearchCollection = Record<string, SaveSearchItem>;

type SavedSearchTitlesHookParams = Omit<BuildUserReadableQueryStringParams, 'queryJSON' | 'autoCompleteWithSpace'> & {
    savedSearches: SavedSearchCollection | undefined;
    enabled?: boolean;
};

/** Returns a map of raw query string → human-readable title for saved searches that have no custom name. Heavy resolution is deferred to avoid blocking the UI. */
function useSavedSearchTitles({savedSearches, translate, enabled = true, ...rest}: SavedSearchTitlesHookParams): Map<string, string> {
    // `savedSearches` and `translate` are intentionally excluded from the deferred object.
    // `savedSearches` drives which items appear in the list — deferring it would cause a flash
    // `translate` is a stable function reference that never triggers heavy re-computation on its own.
    const deferredRest = useDeferredValue(rest);
    const {PersonalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID, feedKeysWithCards, reportAttributes} = deferredRest;

    const titles = new Map<string, string>();

    if (!savedSearches || !enabled) {
        return titles;
    }

    for (const item of Object.values(savedSearches)) {
        if (item.name !== item.query || titles.has(item.query)) {
            continue;
        }

        const itemJsonQuery = buildSearchQueryJSON(item.query);
        if (!itemJsonQuery) {
            continue;
        }

        const title = buildUserReadableQueryString({
            queryJSON: itemJsonQuery,
            PersonalDetails,
            reports,
            taxRates,
            cardList,
            cardFeeds,
            policies,
            currentUserAccountID,
            autoCompleteWithSpace: false,
            translate,
            feedKeysWithCards,
            reportAttributes,
        });
        titles.set(item.query, title);
    }

    return titles;
}

export default useSavedSearchTitles;
