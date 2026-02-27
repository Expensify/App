import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import type {SearchQueryJSON} from '@components/Search/types';
import {mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {getAllTaxRates} from '@libs/PolicyUtils';
import {buildFilterFormValuesFromQuery} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Policy, PolicyCategories, PolicyTagLists, Report} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import {useCurrencyListState} from './useCurrencyList';
import useExportedToFilterOptions from './useExportedToFilterOptions';
import useOnyx from './useOnyx';

function policiesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {taxRates: policy.taxRates} as Policy;
    }
    return result;
}

function reportsSelector(reports: OnyxCollection<Report>): OnyxCollection<Report> {
    if (!reports) {
        return reports;
    }
    const result: OnyxCollection<Report> = {};
    for (const [key, report] of Object.entries(reports)) {
        if (!report) {
            continue;
        }
        result[key] = {reportID: report.reportID} as Report;
    }
    return result;
}

function policyCategoriesSelector(categories: OnyxCollection<PolicyCategories>): OnyxCollection<PolicyCategories> {
    if (!categories) {
        return categories;
    }
    const result: OnyxCollection<PolicyCategories> = {};
    for (const [collectionKey, policyCategories] of Object.entries(categories)) {
        if (!policyCategories) {
            continue;
        }
        const minimalCategories: PolicyCategories = {};
        for (const [catKey, category] of Object.entries(policyCategories)) {
            if (!category) {
                continue;
            }
            minimalCategories[catKey] = {name: category.name} as PolicyCategories[string];
        }
        result[collectionKey] = minimalCategories;
    }
    return result;
}

function policyTagsSelector(tags: OnyxCollection<PolicyTagLists>): OnyxCollection<PolicyTagLists> {
    if (!tags) {
        return tags;
    }
    const result: OnyxCollection<PolicyTagLists> = {};
    for (const [collectionKey, policyTagLists] of Object.entries(tags)) {
        if (!policyTagLists) {
            continue;
        }
        const minimalTagLists: PolicyTagLists = {};
        for (const [listKey, tagList] of Object.entries(policyTagLists)) {
            if (!tagList) {
                continue;
            }
            const minimalTags: Record<string, {name: string}> = {};
            for (const [tagKey, tag] of Object.entries(tagList.tags ?? {})) {
                if (!tag) {
                    continue;
                }
                minimalTags[tagKey] = {name: tag.name};
            }
            minimalTagLists[listKey] = {tags: minimalTags} as PolicyTagLists[string];
        }
        result[collectionKey] = minimalTagLists;
    }
    return result;
}

const useFilterFormValues = (queryJSON?: SearchQueryJSON) => {
    const personalDetails = usePersonalDetails();
    const {currencyList} = useCurrencyListState();

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: reportsSelector});
    const [policyTagsLists] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: policyTagsSelector});
    const [policyCategories] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {selector: policyCategoriesSelector});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST);

    // Helps to avoid unnecessary recalculations when user open report details screen. React Compiler does not provide same result.
    const taxRates = useMemo(() => getAllTaxRates(policies), [policies]);
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [workspaceCardFeeds, userCardList]);
    const {exportedToFilterOptions} = useExportedToFilterOptions();

    const formValues = queryJSON
        ? buildFilterFormValuesFromQuery(queryJSON, policyCategories, policyTagsLists, currencyList, personalDetails, allCards, allReports, taxRates, exportedToFilterOptions)
        : getEmptyObject<Partial<SearchAdvancedFiltersForm>>();

    return formValues;
};

export default useFilterFormValues;
export {policiesSelector, reportsSelector, policyCategoriesSelector, policyTagsSelector};
