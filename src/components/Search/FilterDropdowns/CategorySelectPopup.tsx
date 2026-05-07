import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import MultiSelectFilterPopup from '@components/Search/SearchPageHeader/MultiSelectFilterPopup';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyCategories, PolicyCategory} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';
import type {MultiSelectItem} from './MultiSelectPopup';

type CategorySelectPopupProps = {
    closeOverlay: () => void;
    updateFilterForm: (values: Partial<SearchAdvancedFiltersForm>) => void;
};

function CategorySelectPopup({closeOverlay, updateFilterForm}: CategorySelectPopupProps) {
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const policyIDs = searchAdvancedFiltersForm?.policyID ?? [];

    const selectedCategoriesItems = searchAdvancedFiltersForm?.category?.map((category) => {
        if (category === CONST.SEARCH.CATEGORY_EMPTY_VALUE) {
            return {text: translate('search.noCategory'), value: category};
        }
        return {text: category, value: category};
    });

    const availableNonPersonalPolicyCategoriesSelector = (policyCategories: OnyxCollection<PolicyCategories>) =>
        Object.fromEntries(
            Object.entries(policyCategories ?? {}).filter(([key, categories]) => {
                if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${personalPolicyID}`) {
                    return false;
                }
                const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                return availableCategories.length > 0;
            }),
        );

    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(
        ONYXKEYS.COLLECTION.POLICY_CATEGORIES,
        {
            selector: availableNonPersonalPolicyCategoriesSelector,
        },
        [availableNonPersonalPolicyCategoriesSelector],
    );
    const selectedPoliciesCategories: PolicyCategory[] = Object.keys(allPolicyCategories ?? {})
        .filter((key) => policyIDs?.map((policyID) => `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${policyID}`)?.includes(key))
        .map((key) => Object.values(allPolicyCategories?.[key] ?? {}))
        .flat();

    const categoryItems = [{text: translate('search.noCategory'), value: CONST.SEARCH.CATEGORY_EMPTY_VALUE as string}];
    const uniqueCategoryNames = new Set<string>();
    if (policyIDs?.length === 0) {
        const categories = Object.values(allPolicyCategories ?? {}).flatMap((policyCategories) => Object.values(policyCategories ?? {}));
        for (const category of categories) {
            uniqueCategoryNames.add(category.name);
        }
    } else if (selectedPoliciesCategories.length > 0) {
        for (const category of selectedPoliciesCategories) {
            uniqueCategoryNames.add(category.name);
        }
    }
    categoryItems.push(
        ...Array.from(uniqueCategoryNames)
            .filter(Boolean)
            .map((categoryName) => {
                const decodedCategoryName = getDecodedCategoryName(categoryName);
                return {text: decodedCategoryName, value: categoryName};
            }),
    );

    const updateCategoryFilterForm = (items: Array<MultiSelectItem<string>>) => {
        updateFilterForm({category: items.map((item) => item.value)});
    };

    return (
        <MultiSelectFilterPopup
            closeOverlay={closeOverlay}
            translationKey="common.category"
            items={categoryItems}
            value={selectedCategoriesItems ?? []}
            isSearchable={categoryItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            onChangeCallback={updateCategoryFilterForm}
        />
    );
}

export default CategorySelectPopup;
