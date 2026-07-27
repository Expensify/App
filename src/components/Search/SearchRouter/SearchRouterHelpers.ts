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
const GO_TO_PREFIX = /^go\s+to\s+/i;
const GO_PREFIX = /^go\s+/i;

function stripNavigationIntentPrefix(query: string) {
    const trimmedQuery = query.trim();
    if (GO_TO_PREFIX.test(trimmedQuery)) {
        return trimmedQuery.replace(GO_TO_PREFIX, '').trim();
    }
    if (GO_PREFIX.test(trimmedQuery)) {
        return trimmedQuery.replace(GO_PREFIX, '').trim();
    }
    return trimmedQuery;
}

function isNavigationIntentOnlyQuery(query: string) {
    return /^go(?:\s+to)?$/i.test(query.trim());
}

function normalizeNavigationText(value: string) {
    return StringUtils.normalizeAccents(value).toLowerCase().replaceAll(/\s+/g, ' ').trim();
}

function matchesNavigationQuery(query: string, ...values: Array<string | undefined>) {
    const normalizedQuery = normalizeNavigationText(query);
    if (!normalizedQuery) {
        return false;
    }

    return values.some((value) => normalizeNavigationText(value ?? '').includes(normalizedQuery));
}

function matchesNavigationQueryExactly(query: string, ...values: Array<string | undefined>) {
    const normalizedQuery = normalizeNavigationText(query);
    return values.some((value) => normalizeNavigationText(value ?? '') === normalizedQuery);
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
    const matchQuery = stripNavigationIntentPrefix(trimmedQuery);
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
        .map(({matchTerms, ...item}) => ({
            ...item,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
        }))
        .slice(0, MAX_NAVIGATION_SUGGESTIONS);
}

export {stripNavigationIntentPrefix, isNavigationIntentOnlyQuery, matchesNavigationQuery, sortNavigationSuggestionItems, getGoToText, buildNavigationSuggestions, MAX_NAVIGATION_SUGGESTIONS};
export type {NavigationSuggestionSourceItem};
