import {filterCardsHiddenFromSearch} from '@selectors/Card';
import passthroughPolicyTagListSelector from '@selectors/PolicyTagList';
import {emailSelector} from '@selectors/Session';
import type {OnyxCollection} from 'react-native-onyx';
import {getAllTaxRates, isPolicyFeatureEnabled} from '@libs/PolicyUtils';
import {getAllPolicyValues} from '@libs/SearchQueryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {Policy, PolicyCategories, PolicyTagLists} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
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
            CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
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
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO,
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
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO,
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
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTED_TO,
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

const availablePolicyCategoriesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
    Object.fromEntries(
        Object.entries(policyCategories ?? {}).filter(([, categories]) =>
            Object.values(categories ?? {}).some((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        ),
    );

/**
 * Selector that pre-computes all policy-derived flags in a single pass.
 * Returns a small object so Onyx's deepEqual comparison is trivially cheap,
 * preventing re-renders when policy data changes but derived values don't.
 */
const policyDerivedSelector = (policies: OnyxCollection<Policy>) => {
    let areCategoriesEnabled = false;
    let areTagsEnabled = false;
    let areTaxEnabled = false;
    let isAttendeeTrackingEnabled = false;
    let hasReportFields = false;
    let hasAnyTaxRates = false;
    let hasNonPersonalPolicies = false;

    for (const policy of Object.values(policies ?? {})) {
        if (!policy) {
            continue;
        }
        if (!hasNonPersonalPolicies && policy.type !== CONST.POLICY.TYPE.PERSONAL) {
            hasNonPersonalPolicies = true;
        }
        if (!areCategoriesEnabled) {
            areCategoriesEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED);
        }
        if (!areTagsEnabled) {
            areTagsEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED);
        }
        if (!areTaxEnabled) {
            areTaxEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED);
        }
        if (!isAttendeeTrackingEnabled) {
            isAttendeeTrackingEnabled = isPolicyFeatureEnabled(policy, CONST.POLICY.MORE_FEATURES.IS_ATTENDEE_TRACKING_ENABLED);
        }
        if (!hasReportFields) {
            hasReportFields = Object.values(policy.fieldList ?? {}).some((val) => val.type !== CONST.POLICY.DEFAULT_FIELD_LIST_TYPE);
        }
        if (!hasAnyTaxRates && policy.taxRates?.taxes && Object.keys(policy.taxRates.taxes).length > 0) {
            hasAnyTaxRates = true;
        }
    }

    return {areCategoriesEnabled, areTagsEnabled, areTaxEnabled, isAttendeeTrackingEnabled, hasReportFields, hasAnyTaxRates, hasNonPersonalPolicies};
};

/**
 * Extracts only the fields needed for advanced search filter visibility checks.
 * Strips heavyweight fields like connections, customUnits, rules, exportLayouts, etc.
 */
function advancedSearchPoliciesSelector(policies: OnyxCollection<Policy>): OnyxCollection<Policy> {
    if (!policies) {
        return policies;
    }
    const result: OnyxCollection<Policy> = {};
    for (const [key, policy] of Object.entries(policies)) {
        if (!policy) {
            continue;
        }
        result[key] = {
            id: policy.id,
            name: policy.name,
            type: policy.type,
            role: policy.role,
            employeeList: policy.employeeList,
            owner: policy.owner,
            avatarURL: policy.avatarURL,
            isJoinRequestPending: policy.isJoinRequestPending,
            pendingAction: policy.pendingAction,
            errors: policy.errors,
            taxRates: policy.taxRates,
            tax: policy.tax,
            areCategoriesEnabled: policy.areCategoriesEnabled,
            areTagsEnabled: policy.areTagsEnabled,
            areInvoicesEnabled: policy.areInvoicesEnabled,
            isAttendeeTrackingEnabled: policy.isAttendeeTrackingEnabled,
            fieldList: policy.fieldList,
        } as Policy;
    }
    return result;
}

/**
 * Selector that checks if any tags exist across all policy tag lists.
 * Returns a boolean with early exit on first tag found.
 */
const hasTagsSelector = (allPolicyTagLists: OnyxCollection<PolicyTagLists>) => {
    for (const policyTagList of Object.values(allPolicyTagLists ?? {})) {
        if (!policyTagList) {
            continue;
        }
        for (const tagList of Object.values(policyTagList)) {
            if (Object.keys(tagList.tags ?? {}).length > 0) {
                return true;
            }
        }
    }
    return false;
};

function useAdvancedSearchFilters() {
    const {localeCompare} = useLocalize();
    const [searchAdvancedFilters = getEmptyObject<SearchAdvancedFiltersForm>()] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const policyID = searchAdvancedFilters.policyID;
    const [searchCards] = useOnyx(ONYXKEYS.DERIVED.PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: filterCardsHiddenFromSearch});
    const [policies = getEmptyObject<NonNullable<OnyxCollection<Policy>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: advancedSearchPoliciesSelector});
    const [policyDerived] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policyDerivedSelector});
    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        selector: availablePolicyCategoriesSelector,
    });
    const taxRates = getAllTaxRates(policies);
    const selectedPolicyCategories = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_CATEGORIES, allPolicyCategories);
    const [allPolicyTagLists = getEmptyObject<NonNullable<OnyxCollection<PolicyTagLists>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: passthroughPolicyTagListSelector});
    const selectedPolicyTagLists = getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_TAGS, allPolicyTagLists);
    const [hasTags] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {selector: hasTagsSelector});

    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector});

    const {sections: workspaces, shouldShowSearchInput: shouldShowWorkspaceSearchInput} = useWorkspaceList({
        policies,
        currentUserLogin,
        shouldShowPendingDeletePolicy: false,
        selectedPolicyIDs: undefined,
        searchTerm: '',
        localeCompare,
    });

    // When looking if a user has any categories to display, we want to ignore the policies that are of type PERSONAL
    const hasNonPersonalPolicyCategories = Object.keys(allPolicyCategories).some((policyCategoryId) => {
        const categoryPolicyID = policyCategoryId.replace(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, '');
        const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${categoryPolicyID}`];
        return !!policy && policy.type !== CONST.POLICY.TYPE.PERSONAL;
    });

    const shouldDisplayCategoryFilter = shouldDisplayFilter(hasNonPersonalPolicyCategories ? 1 : 0, policyDerived?.areCategoriesEnabled ?? false, selectedPolicyCategories?.length > 0);
    const shouldDisplayTagFilter = shouldDisplayFilter(hasTags ? 1 : 0, policyDerived?.areTagsEnabled ?? false, !!selectedPolicyTagLists);
    const shouldDisplayCardFilter = shouldDisplayFilter(Object.keys(searchCards ?? {}).length, true);
    const shouldDisplayTaxFilter = shouldDisplayFilter(policyDerived?.hasAnyTaxRates ? 1 : 0, policyDerived?.areTaxEnabled ?? false);
    const shouldDisplayWorkspaceFilter = workspaces.some((section) => section.data.length > 1);

    let currentType = searchAdvancedFilters?.type ?? CONST.SEARCH.DATA_TYPES.EXPENSE;

    if (!(currentType in typeFiltersKeys)) {
        currentType = CONST.SEARCH.DATA_TYPES.EXPENSE;
    }

    return {
        currentType,
        workspaces,
        shouldShowWorkspaceSearchInput,
        taxRates,
        searchCards,
        policies,
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
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE && !(policyDerived?.isAttendeeTrackingEnabled ?? true)) {
                            return;
                        }
                        if (key === CONST.SEARCH.SYNTAX_FILTER_KEYS.REPORT_FIELD && !(policyDerived?.hasReportFields ?? false)) {
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
export {advancedSearchPoliciesSelector};
