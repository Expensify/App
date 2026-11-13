import {buildSearchQueryJSON, buildUserReadableQueryString} from '@libs/SearchQueryUtils';
import type {BuildUserReadableQueryStringParams} from '@libs/SearchQueryUtils';

import type {SaveSearchItem} from '@src/types/onyx/SaveSearch';

import {useDeferredValue, useState} from 'react';

type SavedSearchCollection = Record<string, SaveSearchItem>;

function areTitlesEqual(previousTitles: Map<string, string>, titles: Map<string, string>): boolean {
    if (previousTitles.size !== titles.size) {
        return false;
    }
    for (const [query, title] of titles) {
        if (previousTitles.get(query) !== title) {
            return false;
        }
    }
    return true;
}

type SavedSearchTitlesHookParams = Omit<BuildUserReadableQueryStringParams, 'queryJSON' | 'autoCompleteWithSpace'> & {
    savedSearches: SavedSearchCollection | undefined;
    enabled?: boolean;
};

/** Returns a map of raw query string → human-readable title for saved searches that have no custom name. Heavy resolution is deferred to avoid blocking the UI. */
function useSavedSearchTitles({savedSearches, translate, formatPhoneNumber, enabled = true, ...rest}: SavedSearchTitlesHookParams): Map<string, string> {
    // `savedSearches`, `translate` and `formatPhoneNumber` are intentionally excluded from the deferred object.
    // `savedSearches` drives which items appear in the list — deferring it would cause a flash
    // `translate` and `formatPhoneNumber` are stable function references that never trigger heavy re-computation on their own.
    const deferredRest = useDeferredValue(rest);
    const {PersonalDetails, reports, taxRates, cardList, cardFeeds, policies, currentUserAccountID, feedKeysWithCards, reportAttributes, bankAccountList} = deferredRest;

    const titles = new Map<string, string>();

    for (const item of savedSearches && enabled ? Object.values(savedSearches) : []) {
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
            formatPhoneNumber,
            feedKeysWithCards,
            reportAttributes,
            bankAccountList,
        });
        titles.set(item.query, title);
    }

    // Inputs like report attributes are replaced on every expense write, even when no title changes. Returning the
    // previous map while the titles are the same keeps every tab built from it from rendering again.
    const [previousTitles, setPreviousTitles] = useState(titles);
    if (areTitlesEqual(previousTitles, titles)) {
        return previousTitles;
    }
    setPreviousTitles(titles);
    return titles;
}

export default useSavedSearchTitles;
