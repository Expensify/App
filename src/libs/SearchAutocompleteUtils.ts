import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import type {OnyxCollection} from 'react-native-onyx';
import type {SharedValue} from 'react-native-reanimated/lib/typescript/commonTypes';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SearchAutocompleteQueryRange, SearchAutocompleteResult} from '@components/Search/types';
import CONST from '@src/CONST';
import type {PolicyCategories, PolicyTagLists, RecentlyUsedCategories, RecentlyUsedTags} from '@src/types/onyx';
import {getTagNamesFromTagsLists} from './PolicyUtils';
import {parse} from './SearchParser/autocompleteParser';

/**
 * Parses given query using the autocomplete parser.
 * This is a smaller and simpler version of search parser used for autocomplete displaying logic.
 */
function parseForAutocomplete(text: string) {
    try {
        const parsedAutocomplete = parse(text) as SearchAutocompleteResult;
        return parsedAutocomplete;
    } catch (e) {
        console.error(`Error when parsing autocomplete query"`, e);
    }
}

/**
 * Returns data for computing the `Tag` filter autocomplete list.
 */
function getAutocompleteTags(allPoliciesTagsLists: OnyxCollection<PolicyTagLists>) {
    const uniqueTagNames = new Set<string>();
    const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
    tagListsUnpacked
        .map(getTagNamesFromTagsLists)
        .flat()
        .forEach((tag) => uniqueTagNames.add(tag));
    return Array.from(uniqueTagNames);
}

/**
 * Returns data for computing the recent tags autocomplete list.
 */
function getAutocompleteRecentTags(allRecentTags: OnyxCollection<RecentlyUsedTags>) {
    const uniqueTagNames = new Set<string>();
    Object.values(allRecentTags ?? {})
        .map((recentTag) => Object.values(recentTag ?? {}))
        .flat(2)
        .forEach((tag) => uniqueTagNames.add(tag));
    return Array.from(uniqueTagNames);
}

/**
 * Returns data for computing the `Category` filter autocomplete list.
 */
function getAutocompleteCategories(allPolicyCategories: OnyxCollection<PolicyCategories>) {
    const uniqueCategoryNames = new Set<string>();
    Object.values(allPolicyCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
    return Array.from(uniqueCategoryNames);
}

/**
 * Returns data for computing the recent categories autocomplete list.
 */
function getAutocompleteRecentCategories(allRecentCategories: OnyxCollection<RecentlyUsedCategories>) {
    const uniqueCategoryNames = new Set<string>();
    Object.values(allRecentCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category)));
    return Array.from(uniqueCategoryNames);
}

/**
 * Returns data for computing the `Tax` filter autocomplete list
 *
 * Please note: taxes are stored in a quite convoluted and non-obvious way, and there can be multiple taxes with the same id
 * because tax ids are generated based on a tax name, so they look like this: `id_My_Tax` and are not numeric.
 * That is why this function may seem a bit complex.
 */
function getAutocompleteTaxList(taxRates: Record<string, string[]>) {
    return Object.keys(taxRates).map((taxName) => ({
        taxRateName: taxName,
        taxRateIds: taxRates[taxName].map((id) => taxRates[id] ?? id).flat(),
    }));
}

/**
 * Given a query string, this function parses it with the autocomplete parser
 * and returns only the part of the string before autocomplete.
 *
 * Ex: "test from:john@doe" -> "test from:"
 */
function getQueryWithoutAutocompletedPart(searchQuery: string) {
    const parsedQuery = parseForAutocomplete(searchQuery);
    if (!parsedQuery?.autocomplete) {
        return searchQuery;
    }

    const sliceEnd = parsedQuery.autocomplete.start;
    return searchQuery.slice(0, sliceEnd);
}

/**
 * Returns updated search query string with special case of comma after autocomplete handled.
 * If prev query value had autocomplete, and the last thing user typed is a comma
 * then we allow to continue autocompleting the next value by omitting the whitespace
 */
function getAutocompleteQueryWithComma(prevQuery: string, newQuery: string) {
    const prevParsedQuery = parseForAutocomplete(prevQuery);

    if (prevParsedQuery?.autocomplete && newQuery.endsWith(',')) {
        return `${newQuery.slice(0, newQuery.length - 1).trim()},`;
    }

    return newQuery;
}

/**
 * @private
 */
function filterOutRangesWithCorrectValue(
    range: SearchAutocompleteQueryRange,
    substitutionMap: SubstitutionMap,
    userLogins: SharedValue<string[]>,
    currencyList: SharedValue<string[]>,
    categoryList: SharedValue<string[]>,
    tagList: SharedValue<string[]>,
) {
    'worklet';

    const typeList = Object.values(CONST.SEARCH.DATA_TYPES) as string[];
    const expenseTypeList = Object.values(CONST.SEARCH.TRANSACTION_TYPE) as string[];
    const statusList = Object.values({
        ...CONST.SEARCH.STATUS.EXPENSE,
        ...CONST.SEARCH.STATUS.INVOICE,
        ...CONST.SEARCH.STATUS.CHAT,
        ...CONST.SEARCH.STATUS.TRIP,
        ...CONST.SEARCH.STATUS.TASK,
    }) as string[];
    const groupByList = Object.values(CONST.SEARCH.GROUP_BY) as string[];
    const booleanList = Object.values(CONST.SEARCH.BOOLEAN) as string[];

    switch (range.key) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IN:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FEED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID:
            return substitutionMap[`${range.key}:${range.value}`] !== undefined;

        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER:
            return substitutionMap[`${range.key}:${range.value}`] !== undefined || userLogins.get().includes(range.value);

        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
            return currencyList.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE:
            return typeList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
            return expenseTypeList.includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS:
            return statusList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY:
            return categoryList.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG:
            return tagList.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            return groupByList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
            return booleanList.includes(range.value);
        default:
            return false;
    }
}

/**
 * Parses input string using the autocomplete parser and returns array of markdown ranges that can be used by RNMarkdownTextInput.
 * It is a simpler version of search parser that can be run on UI thread.
 */
function parseForLiveMarkdown(
    input: string,
    currentUserName: string,
    map: SubstitutionMap,
    userLogins: SharedValue<string[]>,
    currencyList: SharedValue<string[]>,
    categoryList: SharedValue<string[]>,
    tagList: SharedValue<string[]>,
): MarkdownRange[] {
    'worklet';

    const parsedAutocomplete = parse(input) as SearchAutocompleteResult;
    const ranges = parsedAutocomplete.ranges;
    return ranges
        .filter((range) => filterOutRangesWithCorrectValue(range, map, userLogins, currencyList, categoryList, tagList))
        .map((range) => {
            const isCurrentUserMention = userLogins.get().includes(range.value) || range.value === currentUserName;
            const type = isCurrentUserMention ? 'mention-here' : 'mention-user';

            return {start: range.start, type, length: range.length};
        });
}

export {
    getAutocompleteCategories,
    getAutocompleteQueryWithComma,
    getAutocompleteRecentCategories,
    getAutocompleteRecentTags,
    getAutocompleteTags,
    getAutocompleteTaxList,
    getQueryWithoutAutocompletedPart,
    parseForAutocomplete,
    parseForLiveMarkdown,
};
