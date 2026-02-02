import {filterCardsHiddenFromSearch} from '@selectors/Card';
import {emailSelector} from '@selectors/Session';
import type {OnyxCollection} from 'react-native-onyx';
import {getAllTaxRates, getTagNamesFromTagsLists, isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';
import {getEmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';
import useWorkspaceList from './useWorkspaceList';

/**
 * typeFiltersKeys is stored as an object keyed by the different search types.
 * Each value is then an array of arrays where each inner array is a separate section in the UI.
 */
const typeFiltersKeys = {
    [CONST.SEARCH.DATA_TYPES.EXPENSE]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
            CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
            CONST.SEARCH.SYNTAX_ROOT_KEYS.LIMIT,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.BILLABLE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
        ],
    ],
    [CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD,
        ],
    ],
    [CONST.SEARCH.DATA_TYPES.INVOICE]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
        ],
    ],
    [CONST.SEARCH.DATA_TYPES.TRIP]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            CONST.SEARCH.SYNTAX_ROOT_KEYS.GROUP_BY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_AMOUNT,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PURCHASE_CURRENCY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE,
        ],
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TOTAL,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.SUBMITTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.APPROVED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PAID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
        ],
    ],
    [CONST.SEARCH.DATA_TYPES.CHAT]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.KEYWORD,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
        ],
    ],
    [CONST.SEARCH.DATA_TYPES.TASK]: [
        [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TITLE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DESCRIPTION,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
        ],
    ],
};

function shouldDisplayFilter(numberOfFilters: number, isFeatureEnabled: boolean, singlePolicyCondition = false): boolean {
    return (numberOfFilters !== 0 || singlePolicyCondition) && isFeatureEnabled;
}

function isFeatureEnabledInPolicies(policies: OnyxCollection<Policy>, featureName: PolicyFeatureName) {
    if (isEmptyObject(policies)) {
        return false;
    }
    return Object.values(policies).some((policy) => isPolicyFeatureEnabled(policy, featureName));
}

const availablePolicyCategoriesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
    Object.fromEntries(
        Object.entries(policyCategories ?? {}).filter(([, categories]) => {
            const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
            return availableCategories.length > 0;
        }),
    );

function useAdvancedSearchFilters() {
    const {localeCompare} = useLocalize();
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const policyID = searchAdvancedFilters.policyID;
    const [searchCards] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {canBeMissing: true, selector: filterCardsHiddenFromSearch});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        canBeMissing: false,
        selector: availablePolicyCategoriesSelector,
    });
    const taxRates = getAllTaxRates(policies);
    const selectedPolicyCategories = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_CATEGORIES, allPolicyCategories);
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {canBeMissing: false});
    const selectedPolicyTagLists = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_TAGS, allPolicyTagLists);
    const tagListsUnpacked = Object.values(allPolicyTagLists ?? {})
        .filter((item): item is NonNullable<PolicyTagLists> => !!item)
        .map(getTagNamesFromTagsLists)
        .flat();

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false, selector: emailSelector});

    const {sections: workspaces} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    // When looking if a user has any categories to display, we want to ignore the policies that are of type PERSONAL
    const nonPersonalPolicyCategoryIds = new Set(
        Object.values(policies)
            .filter((policy): policy is NonNullable<Policy> => !!(policy && policy.type !== CONST.POLICY.TYPE.PERSONAL))
            .map((policy) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policy.id}`),
    );
    const nonPersonalPolicyCategoryCount = Object.keys(allPolicyCategories).filter((policyCategoryId) => nonPersonalPolicyCategoryIds.has(policyCategoryId)).length;

    const areCategoriesEnabled = isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED);
    const areTagsEnabled = isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED);
    const areCardsEnabled =
        isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED) ||
        isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED);
    const areTaxEnabled = isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED);
    const shouldDisplayAttendeeFilter = isFeatureEnabledInPolicies(policies, CONST.POLICY.MORE_FEATURES.IS_ATTENDEE_TRACKING_ENABLED);
    const shouldDisplayCategoryFilter = shouldDisplayFilter(nonPersonalPolicyCategoryCount, areCategoriesEnabled, selectedPolicyCategories?.length > 0);
    const shouldDisplayTagFilter = shouldDisplayFilter(tagListsUnpacked.length, areTagsEnabled, !!selectedPolicyTagLists);
    const shouldDisplayCardFilter = shouldDisplayFilter(Object.keys(searchCards ?? {}).length, areCardsEnabled);
    const shouldDisplayTaxFilter = shouldDisplayFilter(Object.keys(taxRates).length, areTaxEnabled);
    const shouldDisplayWorkspaceFilter = workspaces.some((section) => section.data.length > 1);
    const shouldDisplayGroupCurrencyFilter = !!searchAdvancedFilters.groupBy;
    const shouldDisplayViewFilter = !!searchAdvancedFilters.groupBy;
    const shouldDisplayReportFieldFilter = Object.values(policies).some((policy): policy is NonNullable<Policy> => {
        return Object.values(policy?.fieldList ?? {}).some((val) => val.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE);
    });

    let currentType = searchAdvancedFilters?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    if (!(currentType in typeFiltersKeys)) {
        currentType = CONST.SEARCH.DATA_TYPES.EXPENSE;
    }

    return {
        currentType,
        typeFiltersKeys: typeFiltersKeys[currentType]
            .map((section) =>
                section
                    .map((key) => {
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY && !shouldDisplayCategoryFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG && !shouldDisplayTagFilter) {
                            return;
                        }
                        if ((key === CONST.SEARCH.SYNTAX_FILTER_KEYS.CARD_ID || key === CONST.SEARCH.SYNTAX_FILTER_KEYS.POSTED) && !shouldDisplayCardFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE && !shouldDisplayTaxFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID && !shouldDisplayWorkspaceFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.GROUP_CURRENCY && !shouldDisplayGroupCurrencyFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_ROOT_KEYS.VIEW && !shouldDisplayViewFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE && !shouldDisplayAttendeeFilter) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD && !shouldDisplayReportFieldFilter) {
                            return;
                        }
                        return key;
                    })
                    .filter((filter): filter is NonNullable<typeof filter> => !!filter),
            )
            .filter((section) => !!section.length),
    };
}

export default useAdvancedSearchFilters;
