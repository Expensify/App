import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';

import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type NavigationSuggestionSourceItem = SearchQueryItem & {
    action?: () => void;
    matchTerms?: string[];
};

type MenuDataItem = {
    translationKey: TranslationPaths;
    icon: unknown;
    action: () => void;
};

const MAX_NAVIGATION_SUGGESTIONS = 8;
const MIN_NAVIGATION_QUERY_LENGTH = 3;

const EXCLUDED_SETTINGS_ITEMS = new Set<string>(['initialSettingsPage.whatIsNew', 'sidebarScreen.saveTheWorld', 'initialSettingsPage.signOut', 'initialSettingsPage.restoreStashed']);

const ACCOUNT_NAVIGATION_KEYWORDS = new Map<TranslationPaths, string[]>([['initialSettingsPage.security', ['password', '2fa', 'two factor', 'two-factor']]]);

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

function buildAccountSourceItems(
    accountMenuItems: MenuDataItem[],
    generalMenuItems: MenuDataItem[],
    translate: LocaleContextProps['translate'],
    accountContext: React.ReactNode,
): NavigationSuggestionSourceItem[] {
    return [...accountMenuItems, ...generalMenuItems]
        .filter((item) => !EXCLUDED_SETTINGS_ITEMS.has(item.translationKey))
        .map((item) => {
            const itemText = translate(item.translationKey);
            return {
                text: getGoToText(translate, itemText),
                singleIcon: item.icon,
                action: item.action,
                keyForList: `account_${item.translationKey}`,
                rightElement: accountContext,
                matchTerms: [itemText, ...(ACCOUNT_NAVIGATION_KEYWORDS.get(item.translationKey) ?? [])],
            };
        });
}

function buildNavigationSuggestions(query: string, sources: NavigationSuggestionSourceItem[][], localeCompare: LocaleContextProps['localeCompare']): SearchQueryItem[] {
    const trimmedQuery = query.trim();
    const isNavigationIntentOnly = isNavigationIntentOnlyQuery(trimmedQuery);
    const matchQuery = stripNavigationIntentPrefix(trimmedQuery) || trimmedQuery;
    // Allow "hr" as a short query since it's a common workspace feature search term
    const isAllowedShortQuery = /^hr$/i.test(matchQuery);
    if (matchQuery.length < MIN_NAVIGATION_QUERY_LENGTH && !isNavigationIntentOnly && !isAllowedShortQuery) {
        return [];
    }

    const buildItem = (item: NavigationSuggestionSourceItem): SearchQueryItem | null => {
        if (!isNavigationIntentOnly && !matchesNavigationQuery(matchQuery, item.text, ...(item.matchTerms ?? []))) {
            return null;
        }

        return {
            ...item,
            searchItemType: CONST.SEARCH.SEARCH_ROUTER_ITEM_TYPE.NAVIGATE,
        };
    };

    return sources
        .flatMap((source) => sortNavigationSuggestionItems(source, localeCompare))
        .map(buildItem)
        .filter((item): item is SearchQueryItem => !!item)
        .slice(0, MAX_NAVIGATION_SUGGESTIONS);
}

export {
    stripNavigationIntentPrefix,
    isNavigationIntentOnlyQuery,
    matchesNavigationQuery,
    sortNavigationSuggestionItems,
    getGoToText,
    buildNavigationSuggestions,
    buildAccountSourceItems,
    EXCLUDED_SETTINGS_ITEMS,
    ACCOUNT_NAVIGATION_KEYWORDS,
    MAX_NAVIGATION_SUGGESTIONS,
};
