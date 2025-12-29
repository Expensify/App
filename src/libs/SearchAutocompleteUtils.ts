import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import type {OnyxCollection} from 'react-native-onyx';
import type {SharedValue} from 'react-native-reanimated/lib/typescript/commonTypes';
import type {ValueOf} from 'type-fest';
import type {SubstitutionMap} from '@components/Search/SearchRouter/getQueryWithSubstitutions';
import type {SearchAutocompleteQueryRange, SearchAutocompleteResult} from '@components/Search/types';
import CONST from '@src/CONST';
import type {PolicyCategories, PolicyTagLists, RecentlyUsedCategories, RecentlyUsedTags} from '@src/types/onyx';
import {getTagNamesFromTagsLists} from './PolicyUtils';
import {parse} from './SearchParser/autocompleteParser';
import {getUserFriendlyValue} from './SearchQueryUtils';

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
    for (const tagList of Object.values(allPoliciesTagsLists ?? {})) {
        if (!tagList) {
            continue;
        }
        const tagNamesFromTagsLists = getTagNamesFromTagsLists(tagList);
        for (const tag of tagNamesFromTagsLists) {
            uniqueTagNames.add(tag);
        }
    }
    return Array.from(uniqueTagNames);
}

/**
 * Returns data for computing the recent tags autocomplete list.
 */
function getAutocompleteRecentTags(allRecentTags: OnyxCollection<RecentlyUsedTags>) {
    const uniqueTagNames = new Set<string>();
    for (const recentTagsForPolicy of Object.values(allRecentTags ?? {})) {
        for (const recentTags of Object.values(recentTagsForPolicy ?? {})) {
            for (const tag of recentTags) {
                uniqueTagNames.add(tag);
            }
        }
    }
    return Array.from(uniqueTagNames);
}

/**
 * Returns data for computing the `Category` filter autocomplete list.
 */
function getAutocompleteCategories(allPolicyCategories: OnyxCollection<PolicyCategories>) {
    const uniqueCategoryNames = new Set<string>();
    for (const policyCategories of Object.values(allPolicyCategories ?? {})) {
        for (const category of Object.values(policyCategories ?? {})) {
            uniqueCategoryNames.add(category.name);
        }
    }
    return Array.from(uniqueCategoryNames);
}

/**
 * Returns data for computing the recent categories autocomplete list.
 */
function getAutocompleteRecentCategories(allRecentCategories: OnyxCollection<RecentlyUsedCategories>) {
    const uniqueCategoryNames = new Set<string>();
    for (const recentCategories of Object.values(allRecentCategories ?? {})) {
        for (const category of Object.values(recentCategories ?? {})) {
            uniqueCategoryNames.add(category);
        }
    }
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

const userFriendlyExpenseTypeList = Object.values(CONST.SEARCH.TRANSACTION_TYPE).map((value) => getUserFriendlyValue(value));
const userFriendlyGroupByList = Object.values(CONST.SEARCH.GROUP_BY).map((value) => getUserFriendlyValue(value));
const userFriendlyStatusList = Object.values({
    ...CONST.SEARCH.STATUS.EXPENSE,
    ...CONST.SEARCH.STATUS.INVOICE,
    ...CONST.SEARCH.STATUS.TRIP,
    ...CONST.SEARCH.STATUS.TASK,
}).map((value) => getUserFriendlyValue(value));

/**
 * @private
 * Determines if a specific value in the search syntax can/should be highlighted as valid or not
 */
function filterOutRangesWithCorrectValue(
    range: SearchAutocompleteQueryRange,
    substitutionMap: SubstitutionMap,
    userLogins: SharedValue<string[]>,
    currencyList: SharedValue<string[]>,
    categoryList: SharedValue<string[]>,
    tagList: SharedValue<string[]>,
    currentType: string,
) {
    'worklet';

    const typeList = Object.values(CONST.SEARCH.DATA_TYPES) as string[];
    const expenseTypeList = userFriendlyExpenseTypeList;
    const withdrawalTypeList = Object.values(CONST.SEARCH.WITHDRAWAL_TYPE) as string[];
    const statusList = userFriendlyStatusList;
    const groupByList = userFriendlyGroupByList;
    const booleanList = Object.values(CONST.SEARCH.BOOLEAN) as string[];
    const actionList = Object.values(CONST.SEARCH.ACTION_FILTERS) as string[];
    const datePresetList = Object.values(CONST.SEARCH.DATE_PRESETS) as string[];
    const hasList = Object.values(CONST.SEARCH.HAS_VALUES) as string[];
    const isList = Object.values(CONST.SEARCH.IS_VALUES) as string[];

    if (range.key.startsWith(CONST.SEARCH.REPORT_FIELD.GLOBAL_PREFIX)) {
        return range.value.length > 0;
    }

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
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE:
            return substitutionMap[`${range.key}:${range.value}`] !== undefined || userLogins.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY:
            return currencyList.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE:
            return typeList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE:
            return expenseTypeList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE:
            return withdrawalTypeList.includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS:
            return statusList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.ACTION:
            return actionList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY:
            return categoryList.get().includes(range.value) || range.value === CONST.SEARCH.CATEGORY_EMPTY_VALUE;
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG:
            return tagList.get().includes(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY:
            if (currentType !== CONST.SEARCH.DATA_TYPES.EXPENSE && currentType !== CONST.SEARCH.DATA_TYPES.INVOICE && currentType !== CONST.SEARCH.DATA_TYPES.TRIP) {
                return false;
            }
            return groupByList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE:
            return booleanList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED:
            return datePresetList.includes(range.value) || /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS:
            return hasList.includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE:
            return range.value.length > 0;
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID:
            return !['', 'null', 'undefined', '0', '-1'].includes(range.value);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT:
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT:
            // This uses the same regex as the AmountWithoutCurrencyInput component (allowing for 3 digit decimals as some currencies support that)
            return /^-?(?!.*[.,].*[.,])\d{0,8}(?:[.,]\d{0,2})?$/.test(range.value);
        case CONST.SEARCH.SYNTAX_ROOT_KEYS.COLUMNS:
            return Object.values(CONST.SEARCH.TYPE_CUSTOM_COLUMNS).includes(range.value as ValueOf<typeof CONST.SEARCH.TYPE_CUSTOM_COLUMNS>);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.IS:
            return isList.includes(range.value);
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
    const typeRange = ranges.find((range) => range.key === CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE);
    const currentType = typeRange?.value ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    return ranges
        .filter((range) => filterOutRangesWithCorrectValue(range, map, userLogins, currencyList, categoryList, tagList, currentType))
        .map((range) => {
            const isCurrentUserMention = userLogins.get().includes(range.value) || range.value === currentUserName || range.value === CONST.SEARCH.ME;
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
