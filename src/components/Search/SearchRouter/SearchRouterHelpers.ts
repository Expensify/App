import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import StringUtils from '@libs/StringUtils';

type NavigationSuggestionSourceItem = SearchQueryItem & {
    action?: () => void;
    matchTerms?: string[];
};

function stripNavigationIntentPrefix(query: string) {
    const trimmedQuery = query.trim();
    if (/^go to\s+/i.test(trimmedQuery)) {
        return trimmedQuery.replace(/^go to\s+/i, '').trim();
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

export {stripNavigationIntentPrefix, isNavigationIntentOnlyQuery, matchesNavigationQuery, sortNavigationSuggestionItems, getGoToText};
export type {NavigationSuggestionSourceItem};
