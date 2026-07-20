import ActivityIndicator from '@components/ActivityIndicator';
import type {Filter, SearchFilterCommonProps} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {openSearchCategoryFiltersPage} from '@libs/actions/Search';
import {getDecodedCategoryName} from '@libs/CategoryUtils';
import {getAllPolicyValues, sortOptionsWithEmptyValue} from '@libs/SearchQueryUtils';
import type {SkeletonSpanReasonAttributes} from '@libs/telemetry/useSkeletonSpan';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyCategories} from '@src/types/onyx';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import MultiSelect from './MultiSelect';

type CategorySelectorProps = SearchFilterCommonProps<string[] | undefined> & {
    policyID: Filter | undefined;
};

function CategorySelector({value = [], policyID, selectionListTextInputStyle, selectionListStyle, autoFocus, footer, onChange}: CategorySelectorProps) {
    const {translate, localeCompare} = useLocalize();
    const {isOffline} = useNetwork();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [areCategoriesLoaded] = useOnyx(ONYXKEYS.IS_SEARCH_FILTERS_CATEGORY_DATA_LOADED);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        openSearchCategoryFiltersPage();
    }, [isOffline]);

    const selectedCategoriesItems = value.map((category) => {
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

    if (!areCategoriesLoaded && !isOffline) {
        const reasonAttributes: SkeletonSpanReasonAttributes = {context: 'SearchFiltersCategoryPage'};
        return (
            <View style={[styles.flex1, styles.flexColumn, styles.justifyContentCenter, styles.alignItemsCenter]}>
                <ActivityIndicator
                    color={theme.spinner}
                    size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                    style={[styles.pl3]}
                    reasonAttributes={reasonAttributes}
                />
            </View>
        );
    }

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
