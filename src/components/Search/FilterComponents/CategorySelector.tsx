import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getAllPolicyValues, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React from 'react';

import MultiSelect from './MultiSelect';

type CategorySelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function CategorySelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: CategorySelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);

    const selectedCategoriesItems = value.map((category) => {
        if (category === CONST.SEARCH.CATEGORY_EMPTY_VALUE) {
            return {text: translate('search.noCategory'), value: category};
        }
        return {text: category, value: category};
    });

    const [allPolicyCategories = getEmptyObject<NonNullable<OnyxCollection<PolicyCategories>>>()] = useOnyx(ONYXKEYS.COLLECTION.POLICY_CATEGORIES, {
        selector: (policyCategories: OnyxCollection<PolicyCategories>) =>
            Object.fromEntries(
                Object.entries(policyCategories ?? {}).filter(([key, categories]) => {
                    if (key === `${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${personalPolicyID}`) {
                        return false;
                    }
                    const availableCategories = Object.values(categories ?? {}).filter((category) => category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
                    return availableCategories.length > 0;
                }),
            ),
    });

    const categoryItems = [{text: translate('search.noCategory'), value: CONST.SEARCH.CATEGORY_EMPTY_VALUE as string}];
    const uniqueCategoryNames = new Set<string>(
        getAllPolicyValues(policyID, ONYXKEYS.COLLECTION.POLICY_CATEGORIES, allPolicyCategories).flatMap((policyCategories) =>
            Object.values(policyCategories ?? {}).map((category) => category.name),
        ),
    );
    categoryItems.push(
        ...Array.from(uniqueCategoryNames)
            .filter(Boolean)
            .map((categoryName) => {
                const decodedCategoryName = getDecodedCategoryName(categoryName);
                return {text: decodedCategoryName, value: categoryName};
            })
            .toSorted((a, b) => sortOptionsWithEmptyValue(a.text.toString(), b.text.toString(), localeCompare)),
    );

    return (
        <MultiSelect
            value={selectedCategoriesItems}
            items={categoryItems}
            isSearchable={categoryItems.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
            autoFocus={autoFocus}
            selectionListTextInputStyle={selectionListTextInputStyle}
            selectionListStyle={selectionListStyle}
            footer={footer}
            onChange={(categories) => onChange(categories.map((category) => category.value))}
        />
    );
}

export default CategorySelector;
