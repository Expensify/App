/**
 * Helpers for matching, sorting, and building Search Router navigation suggestions.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

type NavigationSuggestionSourceItem = SearchQueryItem & {
    matchTerms?: string[];
};

const MAX_NAVIGATION_SUGGESTIONS = 8;
const MIN_NAVIGATION_QUERY_LENGTH = 3;

function stripNavigationIntentPrefix(query: string) {
    const trimmedQuery = query.trim();
    if (/^go\s+to\s+/i.test(trimmedQuery)) {
        return trimmedQuery.replace(/^go\s+to\s+/i, '').trim();
    }
    if (/^go\s+/i.test(trimmedQuery)) {
        return trimmedQuery.replace(/^go\s+/i, '').trim();
    }
    return trimmedQuery;
}

function isNavigationIntentOnlyQuery(query: string) {
    return /^go(?:\s+to)?$/i.test(query.trim());
}

function matchesNavigationQuery(query: string, ...values: Array<string | undefined>) {
    const normalizedQuery = StringUtils.normalizeAccents(query).toLowerCase();
    if (!normalizedQuery) {
        return false;
    }

    return values.some((value) =>
        StringUtils.normalizeAccents(value ?? '')
            .toLowerCase()
            .includes(normalizedQuery),
    );
}

function matchesNavigationQueryExactly(query: string, ...values: Array<string | undefined>) {
    const normalizedQuery = StringUtils.normalizeAccents(query).toLowerCase();
    return values.some((value) => StringUtils.normalizeAccents(value ?? '').toLowerCase() === normalizedQuery);
}

function sortNavigationSuggestionItems<T extends NavigationSuggestionSourceItem>(items: T[], localeCompare: LocaleContextProps['localeCompare']): T[] {
    return [...items].sort((firstItem, secondItem) => {
        const firstText = StringUtils.normalizeAccents(firstItem.text ?? '').toLowerCase();
        const secondText = StringUtils.normalizeAccents(secondItem.text ?? '').toLowerCase();
        const textComparison = localeCompare(firstText, secondText);
        if (textComparison !== 0) {
            return textComparison;
        }

        return localeCompare(firstItem.keyForList ?? '', secondItem.keyForList ?? '');
    });
}

function getGoToText(translate: LocaleContextProps['translate'], destination: string) {
    return translate('search.goTo', {destination});
}

function buildNavigationSuggestions(query: string, sources: NavigationSuggestionSourceItem[][], localeCompare: LocaleContextProps['localeCompare']): SearchQueryItem[] {
    const trimmedQuery = query.trim();
    const isNavigationIntentOnly = isNavigationIntentOnlyQuery(trimmedQuery);
    const matchQuery = stripNavigationIntentPrefix(trimmedQuery) || trimmedQuery;
    if (!matchQuery && !isNavigationIntentOnly) {
        return [];
    }

    const shouldMatchExactDestination = matchQuery.length < MIN_NAVIGATION_QUERY_LENGTH && !isNavigationIntentOnly;

    return sources
        .flatMap((source) => sortNavigationSuggestionItems(source, localeCompare))
        .filter(
            (item) =>
                // Bare intents show every destination, short localized labels require exact matches, and longer queries allow partial matches.
                isNavigationIntentOnly ||
                (shouldMatchExactDestination ? matchesNavigationQueryExactly(matchQuery, ...(item.matchTerms ?? [])) : matchesNavigationQuery(matchQuery, ...(item.matchTerms ?? []))),
        )
        .map((item) => ({
            ...item,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
        }))
        .slice(0, MAX_NAVIGATION_SUGGESTIONS);
}

export {stripNavigationIntentPrefix, isNavigationIntentOnlyQuery, matchesNavigationQuery, sortNavigationSuggestionItems, getGoToText, buildNavigationSuggestions, MAX_NAVIGATION_SUGGESTIONS};
export type {NavigationSuggestionSourceItem};
