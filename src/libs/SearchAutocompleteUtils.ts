import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {SearchAutocompleteResult} from '@components/Search/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import {getTagNamesFromTagsLists} from './PolicyUtils';
import * as autocompleteParser from './SearchParser/autocompleteParser';

function parseForAutocomplete(text: string) {
    try {
        const parsedAutocomplete = autocompleteParser.parse(text) as SearchAutocompleteResult;
        return parsedAutocomplete;
    } catch (e) {
        console.error(`Error when parsing autocopmlete}"`, e);
    }
}

function getAutoCompleteTagsList(allPoliciesTagsLists: OnyxCollection<PolicyTagLists>, policyID?: string) {
    const singlePolicyTagsList: PolicyTagLists | undefined = allPoliciesTagsLists?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`];
    if (!singlePolicyTagsList) {
        const uniqueTagNames = new Set<string>();
        const tagListsUnpacked = Object.values(allPoliciesTagsLists ?? {}).filter((item) => !!item) as PolicyTagLists[];
        tagListsUnpacked
            .map((policyTagLists) => {
                return getTagNamesFromTagsLists(policyTagLists);
            })
            .flat()
            .forEach((tag) => uniqueTagNames.add(tag));
        return Array.from(uniqueTagNames);
    }
    return getTagNamesFromTagsLists(singlePolicyTagsList);
}

function getAutocompleteCategoriesList(allPolicyCategories: OnyxCollection<PolicyCategories>, policyID?: string) {
    const singlePolicyCategories = allPolicyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`];
    if (!singlePolicyCategories) {
        const uniqueCategoryNames = new Set<string>();
        Object.values(allPolicyCategories ?? {}).map((policyCategories) => Object.values(policyCategories ?? {}).forEach((category) => uniqueCategoryNames.add(category.name)));
        return Array.from(uniqueCategoryNames);
    }
    return Object.values(singlePolicyCategories ?? {}).map((category) => category.name);
}

function getAutocompleteTaxList(allTaxRates: Record<string, string[]>, policy?: OnyxEntry<Policy>) {
    if (policy) {
        return Object.keys(policy?.taxRates?.taxes ?? {}).map((taxRateName) => taxRateName);
    }
    return Object.keys(allTaxRates).map((taxRateName) => taxRateName);
}

// eslint-disable-next-line import/prefer-default-export
export {parseForAutocomplete, getAutoCompleteTagsList, getAutocompleteCategoriesList, getAutocompleteTaxList};
