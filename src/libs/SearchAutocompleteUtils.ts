import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchAutocompleteResult} from '@components/Search/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists, RecentlyUsedCategories, RecentlyUsedTags} from '@src/types/onyx';
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
function getAutocompleteTags(allPoliciesTagsLists: OnyxCollection<PolicyTagLists>, policyID?: string) {
    const singlePolicyTagsList: PolicyTagLists | undefined = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    if (!singlePolicyTagsList) {
        const uniqueTagNames = new Set<string>();
        const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
        tagListsUnpacked
            .map(getTagNamesFromTagsLists)
            .flat()
            .forEach((tag) => uniqueTagNames.add(tag));
        return Array.from(uniqueTagNames);
    }
    return getTagNamesFromTagsLists(singlePolicyTagsList);
}

/**
 * Returns data for computing the recent tags autocomplete list.
 */
function getAutocompleteRecentTags(allRecentTags: OnyxCollection<RecentlyUsedTags>, policyID?: string) {
    const singlePolicyRecentTags: RecentlyUsedTags | undefined = allRecentTags?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`];
    if (!singlePolicyRecentTags) {
        const uniqueTagNames = new Set<string>();
        Object.values(allRecentTags ?? {})
            .map((recentTag) => Object.values(recentTag ?? {}))
            .flat(2)
            .forEach((tag) => uniqueTagNames.add(tag));
        return Array.from(uniqueTagNames);
    }
    return Object.values(singlePolicyRecentTags ?? {}).flat(2);
}

/**
 * Returns data for computing the `Category` filter autocomplete list.
 */
function getAutocompleteCategories(allPolicyCategories: OnyxCollection<PolicyCategories>, policyID?: string) {
    const singlePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    if (!singlePolicyCategories) {
        const uniqueCategoryNames = new Set<string>();
        Object.values(allPolicyCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
        return Array.from(uniqueCategoryNames);
    }
    return Object.values(singlePolicyCategories ?? {}).map((category) => category.name);
}

/**
 * Returns data for computing the recent categories autocomplete list.
 */
function getAutocompleteRecentCategories(allRecentCategories: OnyxCollection<RecentlyUsedCategories>, policyID?: string) {
    const singlePolicyRecentCategories = allRecentCategories?.[`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`];
    if (!singlePolicyRecentCategories) {
        const uniqueCategoryNames = new Set<string>();
        Object.values(allRecentCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category)));
        return Array.from(uniqueCategoryNames);
    }
    return Object.values(singlePolicyRecentCategories ?? {}).map((category) => category);
}

/**
 * Returns data for computing the `Tax` filter autocomplete list
 *
 * Please note: taxes are stored in a quite convoluted and non-obvious way, and there can be multiple taxes with the same id
 * because tax ids are generated based on a tax name, so they look like this: `id_My_Tax` and are not numeric.
 * That is why this function may seem a bit complex.
 */
function getAutocompleteTaxList(taxRates: Record<string, string[]>, policy?: OnyxEntry<Policy>) {
    if (policy) {
        const policyTaxes = policy?.taxRates?.taxes ?? {};

        return Object.keys(policyTaxes).map((taxID) => ({
            taxRateName: policyTaxes[taxID].name,
            taxRateIds: [taxID],
        }));
    }

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
 * Parses input string using the autocomplete parser and returns array of
 * markdown ranges that can be used by RNMarkdownTextInput.
 * It is simpler version of search parser that can be run on UI.
 */
function parseForLiveMarkdown(input: string, userLogin: string, userDisplayName: string) {
    'worklet';

    const parsedAutocomplete = parse(input) as SearchAutocompleteResult;
    const ranges = parsedAutocomplete.ranges;

    return ranges.map((range) => {
        let type = 'mention-user';

        if ((range.key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TO || CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM) && (range.value === userLogin || range.value === userDisplayName)) {
            type = 'mention-here';
        }

        return {...range, type};
    }) as MarkdownRange[];
}

export {
    parseForAutocomplete,
    getAutocompleteTags,
    getAutocompleteRecentTags,
    getAutocompleteCategories,
    getAutocompleteRecentCategories,
    getAutocompleteTaxList,
    getQueryWithoutAutocompletedPart,
    getAutocompleteQueryWithComma,
    parseForLiveMarkdown,
};
